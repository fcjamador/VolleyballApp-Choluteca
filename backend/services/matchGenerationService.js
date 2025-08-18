const db = require('../models');
const { Tournament, Team, Match, Sequelize } = db;
const { Op } = Sequelize;

/**
 * Genera un calendario de partidos "todos contra todos" (round-robin) para un torneo.
 * Elimina los partidos existentes antes de generar los nuevos.
 * @param {number} tournamentId - El ID del torneo.
 * @returns {Promise<object>} - Un objeto con un mensaje y los partidos creados.
 */
const generateRoundRobinMatches = async (tournamentId) => {
    // Usaremos una transacción para asegurar que todas las operaciones se completen o ninguna lo haga.
    const transaction = await db.sequelize.transaction();
    try {
        // 1. Verificar si el torneo existe y obtener los equipos asociados.
        const tournament = await Tournament.findByPk(tournamentId, {
            include: [{
                model: Team,
                as: 'Teams',
                through: { attributes: [] }
            }],
            transaction
        });

        if (!tournament) {
            const error = new Error('Torneo no encontrado');
            error.statusCode = 404;
            throw error;
        }

        if (!tournament.Teams || tournament.Teams.length < 2) {
            const error = new Error('Se necesitan al menos 2 equipos inscritos para generar partidos.');
            error.statusCode = 400;
            throw error;
        }

        let teams = [...tournament.Teams];

        // 2. Manejar número impar de equipos añadiendo un "descanso" (bye)
        if (teams.length % 2 !== 0) {
            teams.push({ id: null, name: 'BYE' }); // Equipo fantasma para el descanso
        }

        // 3. Eliminar partidos existentes para este torneo para evitar duplicados.
        await Match.destroy({ where: { tournamentId: tournamentId }, transaction });

        // 4. Generar la lista de partidos a crear.
        const matchesToCreate = [];
        const numTeams = teams.length;
        const numRounds = numTeams - 1;
        const halfNumTeams = numTeams / 2;

        const teamIds = teams.map(t => t.id);

        for (let round = 0; round < numRounds; round++) {
            for (let i = 0; i < halfNumTeams; i++) {
                const team1Id = teamIds[i];
                const team2Id = teamIds[numTeams - 1 - i];

                // No crear partidos si uno de los equipos es el de descanso
                if (team1Id !== null && team2Id !== null) {
                    matchesToCreate.push({
                        tournamentId: tournament.id,
                        localTeamId: team1Id,
                        visitorTeamId: team2Id,
                        phase: `Jornada ${round + 1}`,
                        status: 'Programado',
                        numberOfSets: 3, // Establecer explícitamente el valor por defecto
                    });
                }
            }

            // Rotar los equipos para la siguiente jornada, manteniendo el primero fijo
            const lastTeam = teamIds.pop();
            teamIds.splice(1, 0, lastTeam);
        }

        // 5. Distribuir las fechas de los partidos
        distributeMatchDates(matchesToCreate, tournament.startDate, tournament.endDate, numRounds);

        // 6. Guardar los nuevos partidos en la base de datos.
        const createdMatches = await Match.bulkCreate(matchesToCreate, { transaction });

        // Si todo fue bien, confirmamos la transacción
        await transaction.commit();

        return {
            message: `Partidos generados exitosamente para ${tournament.name}`,
            matchesCreated: createdMatches.length,
        };
    } catch (error) {
        // Si algo falló, revertimos todos los cambios
        await transaction.rollback();
        console.error("Error al generar partidos:", error);
        throw new Error(error.message || 'Error en el servidor al generar los partidos.');
    }
};

/**
 * Distribuye las fechas de los partidos de manera uniforme entre la fecha de inicio y fin del torneo.
 * @param {Array<object>} matches - El array de partidos a modificar.
 * @param {Date} startDate - Fecha de inicio del torneo.
 * @param {Date} endDate - Fecha de fin del torneo.
 * @param {number} numRounds - El número de jornadas.
 */
function distributeMatchDates(matches, startDate, endDate, numRounds) {
    if (!startDate || !endDate || numRounds <= 0 || matches.length === 0) {
        return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
        matches.forEach(match => {
            match.matchDate = new Date(start);
        });
        return;
    }

    const durationDays = Math.max(0, (end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    const interval = numRounds > 1 ? durationDays / (numRounds - 1) : 0;

    const matchesByRound = {};
    matches.forEach(match => {
        const roundNumber = parseInt(match.phase.split(' ')[1], 10);
        if (!matchesByRound[roundNumber]) {
            matchesByRound[roundNumber] = [];
        }
        matchesByRound[roundNumber].push(match);
    });

    Object.keys(matchesByRound).forEach(roundNumberStr => {
        const roundNumber = parseInt(roundNumberStr, 10);
        const roundDate = new Date(start);
        const dayOffset = Math.round((roundNumber - 1) * interval);
        roundDate.setDate(roundDate.getDate() + dayOffset);

        matchesByRound[roundNumber].forEach(match => (match.matchDate = roundDate));
    });
}

module.exports = {
    generateRoundRobinMatches,
};
