// Ruta: backend/controllers/standingsController.js

const asyncHandler = require('express-async-handler');
const db = require('../models');
const Tournament = db.Tournament;
const Team = db.Team;
const Match = db.Match;

/**
 * Calcula los puntos para un partido de voleibol basado en el resultado.
 * - Victoria por barrida (2-0, 3-0, 3-1): 3 puntos para el ganador, 0 para el perdedor.
 * - Victoria en set decisivo (2-1, 3-2): 2 puntos para el ganador, 1 punto para el perdedor.
 * @param {number} setsWinner - Sets ganados por el equipo ganador.
 * @param {number} setsLoser - Sets ganados por el equipo perdedor.
 * @param {number} numberOfSets - El formato del partido (3 o 5).
 * @returns {{winnerPoints: number, loserPoints: number}}
 */
const getPointsFromScore = (setsWinner, setsLoser, numberOfSets) => {
    const setsToWin = Math.ceil(numberOfSets / 2); // 2 para "al mejor de 3", 3 para "al mejor de 5"
    const maxLoserSets = setsToWin - 1;

    // Validar que el ganador realmente ganó los sets necesarios
    if (setsWinner !== setsToWin) {
        return { winnerPoints: 0, loserPoints: 0 }; // Partido no completado según las reglas
    }

    // Si el perdedor ganó el máximo de sets posibles para una derrota (llegaron al set decisivo)
    if (setsLoser === maxLoserSets) {
        return { winnerPoints: 2, loserPoints: 1 }; // Resultado 2-1 o 3-2
    } else {
        return { winnerPoints: 3, loserPoints: 0 }; // Victoria sin llegar al set decisivo (e.g., 2-0, 3-0, 3-1)
    }
};

// @desc    Obtener la tabla de posiciones de un torneo
// @route   GET /api/tournaments/:id/standings
// @access  Private
const getStandings = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const tournament = await Tournament.findByPk(id, {
        include: [
            {
                model: Team,
                as: 'Teams',
                attributes: ['id', 'name', 'logoUrl'],
                through: { attributes: [] }
            },
            {
                model: Match,
                as: 'matches',
                where: { status: 'Completado' },
                required: false, // LEFT JOIN para incluir torneos sin partidos finalizados
                // Optimización: solo traer los campos necesarios del partido
                attributes: ['localTeamId', 'visitorTeamId', 'winnerId', 'team1Score', 'team2Score', 'numberOfSets']
            }
        ]
    });

    if (!tournament) {
        res.status(404);
        throw new Error('Torneo no encontrado');
    }

    // 1. Inicializar las estadísticas para cada equipo del torneo
    const standings = {};
    tournament.Teams.forEach(team => {
        standings[team.id] = {
            teamId: team.id,
            teamName: team.name,
            teamLogo: team.logoUrl, // Añadir la URL del logo
            played: 0,
            won: 0,
            lost: 0,
            points: 0,
            setsFor: 0,
            setsAgainst: 0,
        };
    });

    // 2. Procesar cada partido finalizado para calcular estadísticas
    tournament.matches.forEach(match => {
        const local = standings[match.localTeamId];
        const visitor = standings[match.visitorTeamId];

        if (!local || !visitor) return; // Omitir si un equipo ya no está en el torneo

        local.played += 1;
        visitor.played += 1;
        local.setsFor += match.team1Score;
        local.setsAgainst += match.team2Score;
        visitor.setsFor += match.team2Score;
        visitor.setsAgainst += match.team1Score;

        if (match.winnerId === match.localTeamId) { // Gana el equipo local
            local.won += 1;
            visitor.lost += 1;
            const { winnerPoints, loserPoints } = getPointsFromScore(match.team1Score, match.team2Score, match.numberOfSets);
            local.points += winnerPoints;
            visitor.points += loserPoints;
        } else if (match.winnerId === match.visitorTeamId) { // Gana el equipo visitante
            visitor.won += 1;
            local.lost += 1;
            const { winnerPoints, loserPoints } = getPointsFromScore(match.team2Score, match.team1Score, match.numberOfSets);
            visitor.points += winnerPoints;
            local.points += loserPoints;
        }
    });

    // 3. Convertir el objeto a un array y calcular campos derivados para el desempate
    let standingsArray = Object.values(standings).map(team => ({
        ...team,
        setDifference: team.setsFor - team.setsAgainst,
        // El ratio de sets es un criterio de desempate clave en voleibol
        setRatio: team.setsAgainst > 0 ? (team.setsFor / team.setsAgainst) : (team.setsFor > 0 ? Infinity : 0),
    }));

    // 4. Ordenar la tabla de posiciones con múltiples criterios de desempate
    standingsArray.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points; // 1. Por Puntos
        if (b.won !== a.won) return b.won - a.won; // 2. Por Victorias
        if (b.setRatio !== a.setRatio) return b.setRatio - a.setRatio; // 3. Por Ratio de Sets
        if (b.setDifference !== a.setDifference) return b.setDifference - a.setDifference; // 4. Por Diferencia de Sets
        return a.teamName.localeCompare(b.teamName); // 5. Por Nombre (alfabético)
    });

    res.json({
        tournamentName: tournament.name,
        standings: standingsArray,
    });
});

module.exports = { getStandings };
