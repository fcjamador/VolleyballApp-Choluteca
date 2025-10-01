// Ruta: d:/VolleyballApp/VolleyballApp-Choluteca/backend/controllers/tournamentController.js

const asyncHandler = require('express-async-handler');
const { Tournament, Team, Match, TournamentGroup, sequelize } = require('../models');

// @desc    Crear un nuevo torneo
// @route   POST /api/tournaments
// @access  Private/Admin
const createTournament = asyncHandler(async (req, res) => {
    const tournament = await Tournament.create(req.body);
    res.status(201).json(tournament);
});

// @desc    Obtener todos los torneos
// @route   GET /api/tournaments
// @access  Private
const getAllTournaments = asyncHandler(async (req, res) => {
    const tournaments = await Tournament.findAll({
        include: [{ model: Team, as: 'Teams', attributes: ['id', 'name'] }]
    });
    res.status(200).json(tournaments);
});

// @desc    Obtener un torneo por ID
// @route   GET /api/tournaments/:id
// @access  Private
const getTournamentById = asyncHandler(async (req, res) => {
    const tournament = await Tournament.findByPk(req.params.id, {
        include: [
            { model: Team, as: 'Teams', attributes: ['id', 'name'] },
            { model: Match, as: 'matches', include: ['localTeam', 'visitorTeam'] }
        ]
    });
    if (!tournament) {
        res.status(404);
        throw new Error('Torneo no encontrado');
    }
    res.status(200).json(tournament);
});

// @desc    Actualizar un torneo
// @route   PUT /api/tournaments/:id
// @access  Private/Admin
const updateTournament = asyncHandler(async (req, res) => {
    const [updated] = await Tournament.update(req.body, { where: { id: req.params.id } });
    if (updated) {
        const updatedTournament = await Tournament.findByPk(req.params.id);
        res.status(200).json(updatedTournament);
    } else {
        res.status(404);
        throw new Error('Torneo no encontrado');
    }
});

// @desc    Eliminar un torneo
// @route   DELETE /api/tournaments/:id
// @access  Private/Admin
const deleteTournament = asyncHandler(async (req, res) => {
    const deleted = await Tournament.destroy({ where: { id: req.params.id } });
    if (deleted) {
        res.status(204).send();
    } else {
        res.status(404);
        throw new Error('Torneo no encontrado');
    }
});

// @desc    Generar partidos para un torneo
// @route   POST /api/tournaments/:id/generate-matches
// @access  Private/Admin
const generateMatches = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { numberOfGroups } = req.body;

    const transaction = await sequelize.transaction();
    try {
        const tournament = await Tournament.findByPk(id, { include: ['Teams'], transaction });

        if (!tournament) {
            await transaction.rollback();
            res.status(404);
            throw new Error('Torneo no encontrado');
        }

        // Limpiar partidos y grupos existentes
        await Match.destroy({ where: { tournamentId: id }, transaction });
        await TournamentGroup.destroy({ where: { tournamentId: id }, transaction });

        if (tournament.type === 'Group Stage') {
            if (!numberOfGroups || numberOfGroups < 1) {
                await transaction.rollback();
                res.status(400);
                throw new Error('Se requiere un número válido de grupos.');
            }

            const teams = tournament.Teams;
            if (teams.length < numberOfGroups * 2) {
                await transaction.rollback();
                res.status(400);
                throw new Error('No hay suficientes equipos para formar la cantidad de grupos especificada.');
            }

            const shuffledTeams = [...teams].sort(() => 0.5 - Math.random());
            const groups = Array.from({ length: numberOfGroups }, () => []);
            
            shuffledTeams.forEach((team, index) => {
                groups[index % numberOfGroups].push(team);
            });

            const allMatches = [];
            for (let i = 0; i < groups.length; i++) {
                const groupTeams = groups[i];
                const groupName = `Grupo ${String.fromCharCode(65 + i)}`;

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
            res.status(201).json({ message: `${allMatches.length} partidos de fase de grupos generados exitosamente.` });

        } else if (tournament.type === 'League') {
            const teams = tournament.Teams;
            if (teams.length < 2) {
                await transaction.rollback();
                res.status(400);
                throw new Error('Se necesitan al menos 2 equipos para generar partidos.');
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
            res.status(201).json({ message: `${matchesToCreate.length} partidos de liga generados exitosamente.` });

        } else {
            await transaction.rollback();
            res.status(400);
            throw new Error(`El tipo de torneo '${tournament.type}' no admite la generación automática de partidos en esta fase.`);
        }

    } catch (error) {
        await transaction.rollback();
        // asyncHandler se encargará de pasar el error al middleware
        throw new Error(`Error interno del servidor al generar partidos: ${error.message}`);
    }
});

// @desc    Añadir un equipo a un torneo
// @route   POST /api/tournaments/:tournamentId/teams
// @access  Private/Admin
const addTeamToTournament = asyncHandler(async (req, res) => {
    const { tournamentId } = req.params;
    const { teamId } = req.body;
    const tournament = await Tournament.findByPk(tournamentId);
    if (!tournament) {
        res.status(404);
        throw new Error('Torneo no encontrado');
    }
    const team = await Team.findByPk(teamId);
    if (!team) {
        res.status(404);
        throw new Error('Equipo no encontrado');
    }
    await tournament.addTeam(team);
    res.status(200).json({ message: 'Equipo añadido al torneo' });
});

// @desc    Quitar un equipo de un torneo
// @route   DELETE /api/tournaments/:tournamentId/teams/:teamId
// @access  Private/Admin
const removeTeamFromTournament = asyncHandler(async (req, res) => {
    const { tournamentId, teamId } = req.params;
    const tournament = await Tournament.findByPk(tournamentId);
    if (!tournament) {
        res.status(404);
        throw new Error('Torneo no encontrado');
    }
    const team = await Team.findByPk(teamId);
    if (!team) {
        res.status(404);
        throw new Error('Equipo no encontrado');
    }
    await tournament.removeTeam(team);
    res.status(200).json({ message: 'Equipo eliminado del torneo' });
});

// @desc    Obtener los equipos de un torneo
// @route   GET /api/tournaments/:tournamentId/teams
// @access  Private
const getTeamsInTournament = asyncHandler(async (req, res) => {
    const { tournamentId } = req.params;
    const tournament = await Tournament.findByPk(tournamentId, {
        include: [{ model: Team, as: 'Teams', attributes: ['id', 'name'] }]
    });
    if (!tournament) {
        res.status(404);
        throw new Error('Torneo no encontrado');
    }
    res.status(200).json(tournament.Teams);
});

module.exports = {
    createTournament,
    getAllTournaments,
    getTournamentById,
    updateTournament,
    deleteTournament,
    generateMatches,
    addTeamToTournament,
    removeTeamFromTournament,
    getTeamsInTournament,
};
