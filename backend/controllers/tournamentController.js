// Ruta: backend/controllers/tournamentController.js

const { Tournament, Team, Match, TournamentGroup, SetScore, sequelize } = require('../models');

// Crear un nuevo torneo
exports.createTournament = async (req, res) => {
    try {
        const tournament = await Tournament.create(req.body);
        res.status(201).json(tournament);
    } catch (error) {
        res.status(400).json({ message: 'Error al crear el torneo', error: error.message });
    }
};

// Obtener todos los torneos
exports.getAllTournaments = async (req, res) => {
    try {
        const tournaments = await Tournament.findAll({
            include: [{ model: Team, as: 'Teams', attributes: ['id', 'name'] }]
        });
        res.status(200).json(tournaments);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los torneos', error: error.message });
    }
};

// Obtener un torneo por ID
exports.getTournamentById = async (req, res) => {
    try {
        const tournament = await Tournament.findByPk(req.params.id, {
            include: [
                { model: Team, as: 'Teams', attributes: ['id', 'name'] },
                { model: Match, as: 'matches', include: ['localTeam', 'visitorTeam'] }
            ]
        });
        if (!tournament) {
            return res.status(404).json({ message: 'Torneo no encontrado' });
        }
        res.status(200).json(tournament);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el torneo', error: error.message });
    }
};

// Actualizar un torneo
exports.updateTournament = async (req, res) => {
    try {
        const [updated] = await Tournament.update(req.body, { where: { id: req.params.id } });
        if (updated) {
            const updatedTournament = await Tournament.findByPk(req.params.id);
            res.status(200).json(updatedTournament);
        } else {
            res.status(404).json({ message: 'Torneo no encontrado' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar el torneo', error: error.message });
    }
};

// Eliminar un torneo
exports.deleteTournament = async (req, res) => {
    try {
        const deleted = await Tournament.destroy({ where: { id: req.params.id } });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Torneo no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el torneo', error: error.message });
    }
};

// --- FUNCIÓN MODIFICADA PARA GENERAR PARTIDOS ---
exports.generateMatches = async (req, res) => {
    const { id } = req.params;
    const { numberOfGroups } = req.body; // Nuevo parámetro que vendrá del frontend

    const transaction = await sequelize.transaction();
    try {
        const tournament = await Tournament.findByPk(id, { include: ['Teams'], transaction });

        if (!tournament) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Torneo no encontrado' });
        }

        // Limpiar partidos y grupos existentes para este torneo antes de generar nuevos
        await Match.destroy({ where: { tournamentId: id }, transaction });
        await TournamentGroup.destroy({ where: { tournamentId: id }, transaction });

        if (tournament.type === 'Group Stage') {
            if (!numberOfGroups || numberOfGroups < 1) {
                await transaction.rollback();
                return res.status(400).json({ message: 'Se requiere un número válido de grupos.' });
            }

            const teams = tournament.Teams;
            if (teams.length < numberOfGroups * 2) {
                await transaction.rollback();
                return res.status(400).json({ message: 'No hay suficientes equipos para formar la cantidad de grupos especificada.' });
            }

            const shuffledTeams = [...teams].sort(() => 0.5 - Math.random());
            const groups = Array.from({ length: numberOfGroups }, () => []);
            
            shuffledTeams.forEach((team, index) => {
                groups[index % numberOfGroups].push(team);
            });

            const allMatches = [];
            for (let i = 0; i < groups.length; i++) {
                const groupTeams = groups[i];
                const groupName = `Grupo ${String.fromCharCode(65 + i)}`; // Grupo A, B, C...

                const newGroup = await TournamentGroup.create({
                    tournamentId: id,
                    name: groupName,
                }, { transaction });

                for (let j = 0; j < groupTeams.length; j++) {
                    for (let k = j + 1; k < groupTeams.length; k++) {
                        allMatches.push({
                            tournamentId: id,
                            localTeamId: groupTeams[j].id,
                            visitorTeamId: groupTeams[k].id,
                            status: 'Programado',
                            phase: 'Fase de Grupos',
                            groupId: newGroup.id,
                        });
                    }
                }
            }

            await Match.bulkCreate(allMatches, { transaction });
            await transaction.commit();
            return res.status(201).json({ message: `${allMatches.length} partidos de fase de grupos generados exitosamente.` });

        } else if (tournament.type === 'League') {
            const teams = tournament.Teams;
            if (teams.length < 2) {
                await transaction.rollback();
                return res.status(400).json({ message: 'Se necesitan al menos 2 equipos para generar partidos.' });
            }

            const matchesToCreate = [];
            for (let i = 0; i < teams.length; i++) {
                for (let j = i + 1; j < teams.length; j++) {
                    matchesToCreate.push({
                        tournamentId: id,
                        localTeamId: teams[i].id,
                        visitorTeamId: teams[j].id,
                        status: 'Programado',
                        phase: 'Liga',
                    });
                }
            }

            await Match.bulkCreate(matchesToCreate, { transaction });
            await transaction.commit();
            return res.status(201).json({ message: `${matchesToCreate.length} partidos de liga generados exitosamente.` });

        } else {
            await transaction.rollback();
            return res.status(400).json({ message: `El tipo de torneo '${tournament.type}' no admite la generación automática de partidos en esta fase.` });
        }

    } catch (error) {
        await transaction.rollback();
        console.error('Error al generar partidos:', error);
        return res.status(500).json({ message: 'Error interno del servidor al generar partidos.', error: error.message });
    }
};

// --- OTRAS FUNCIONES DE GESTIÓN (Añadir/quitar equipos, posiciones, etc.) ---

exports.addTeamToTournament = async (req, res) => {
    try {
        const { tournamentId } = req.params;
        const { teamId } = req.body;
        const tournament = await Tournament.findByPk(tournamentId);
        if (!tournament) return res.status(404).json({ message: 'Torneo no encontrado' });
        const team = await Team.findByPk(teamId);
        if (!team) return res.status(404).json({ message: 'Equipo no encontrado' });
        await tournament.addTeam(team);
        res.status(200).json({ message: 'Equipo añadido al torneo' });
    } catch (error) {
        res.status(500).json({ message: 'Error al añadir equipo al torneo', error: error.message });
    }
};

exports.removeTeamFromTournament = async (req, res) => {
    try {
        const { tournamentId, teamId } = req.params;
        const tournament = await Tournament.findByPk(tournamentId);
        if (!tournament) return res.status(404).json({ message: 'Torneo no encontrado' });
        const team = await Team.findByPk(teamId);
        if (!team) return res.status(404).json({ message: 'Equipo no encontrado' });
        await tournament.removeTeam(team);
        res.status(200).json({ message: 'Equipo eliminado del torneo' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar equipo del torneo', error: error.message });
    }
};

exports.getTeamsInTournament = async (req, res) => {
    try {
        const { tournamentId } = req.params;
        const tournament = await Tournament.findByPk(tournamentId, {
            include: [{ model: Team, as: 'Teams', attributes: ['id', 'name'] }]
        });
        if (!tournament) return res.status(404).json({ message: 'Torneo no encontrado' });
        res.status(200).json(tournament.Teams);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los equipos del torneo', error: error.message });
    }
};

exports.getStandings = async (req, res) => {
    try {
        const { id } = req.params;
        const tournament = await Tournament.findByPk(id, {
            include: [
                { model: Team, as: 'Teams', attributes: ['id', 'name'] },
                {
                    model: Match,
                    as: 'matches',
                    where: { status: 'Completado' },
                    required: false,
                    include: [{ model: SetScore, as: 'setScores' }]
                }
            ]
        });

        if (!tournament) {
            return res.status(404).json({ message: 'Torneo no encontrado' });
        }

        const standings = tournament.Teams.map(team => {
            let played = 0, won = 0, lost = 0, points = 0, setsFor = 0, setsAgainst = 0;

            tournament.matches.forEach(match => {
                if (match.localTeamId === team.id || match.visitorTeamId === team.id) {
                    played++;
                    const isLocal = match.localTeamId === team.id;
                    const teamSets = isLocal ? match.team1Score : match.team2Score;
                    const opponentSets = isLocal ? match.team2Score : match.team1Score;

                    setsFor += teamSets;
                    setsAgainst += opponentSets;

                    if (match.winnerId === team.id) {
                        won++;
                        points += (teamSets === 3 && opponentSets < 2) ? 3 : 2;
                    } else {
                        lost++;
                        points += (teamSets === 2 && opponentSets === 3) ? 1 : 0;
                    }
                }
            });

            const setDifference = setsFor - setsAgainst;
            const setRatio = setsAgainst === 0 ? Infinity : setsFor / setsAgainst;

            return {
                teamId: team.id,
                teamName: team.name,
                played,
                won,
                lost,
                points,
                setsFor,
                setsAgainst,
                setDifference,
                setRatio
            };
        });

        standings.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.won !== a.won) return b.won - a.won;
            if (b.setDifference !== a.setDifference) return b.setDifference - a.setDifference;
            if (b.setRatio !== a.setRatio) return b.setRatio - a.setRatio;
            return 0;
        });

        res.status(200).json({ tournamentName: tournament.name, standings });
    } catch (error) {
        res.status(500).json({ message: 'Error al calcular la tabla de posiciones', error: error.message });
    }
};
