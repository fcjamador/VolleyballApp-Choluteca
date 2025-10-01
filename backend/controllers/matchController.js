const asyncHandler = require('express-async-handler');
const db = require('../models');
const Match = db.Match;
const Tournament = db.Tournament;
const Team = db.Team;
const Log = db.Log;
const SetScore = db.SetScore;

const getMatches = asyncHandler(async (req, res) => {
    const { tournamentId } = req.query;
    const whereClause = {};
    if (tournamentId) {
        whereClause.tournamentId = tournamentId;
    }
    const matches = await Match.findAll({
        where: whereClause,
        include: [
            { model: Tournament, as: 'tournament' },
            { model: Team, as: 'localTeam' },
            { model: Team, as: 'visitorTeam' },
            { model: Team, as: 'winner' },
            { model: SetScore, as: 'setScores', order: [['setNumber', 'ASC']] }
        ],
        order: [['matchDate', 'ASC'], ['matchTime', 'ASC']]
    });
    res.status(200).json(matches);
});

const getMatchById = asyncHandler(async (req, res) => {
    const match = await Match.findByPk(req.params.id, {
        include: [
            { model: Tournament, as: 'tournament' },
            { model: Team, as: 'localTeam' },
            { model: Team, as: 'visitorTeam' },
            { model: Team, as: 'winner' },
            { model: SetScore, as: 'setScores', order: [['setNumber', 'ASC']] }
        ]
    });
    if (match) {
        res.status(200).json(match);
    } else {
        res.status(404);
        throw new Error('Partido no encontrado');
    }
});

const createMatch = asyncHandler(async (req, res) => {
    const { tournamentId, localTeamId, visitorTeamId, matchDate } = req.body;
    if (!tournamentId || !localTeamId || !visitorTeamId || !matchDate) {
        res.status(400);
        throw new Error('Torneo, equipos y fecha son requeridos.');
    }
    if (localTeamId === visitorTeamId) {
        res.status(400);
        throw new Error('Un equipo no puede jugar contra sí mismo.');
    }
    const match = await Match.create({ ...req.body });
    await Log.create({
        userId: req.user.id, action: 'CREATE', entityType: 'Match',
        entityId: match.id, newData: match.toJSON()
    });
    res.status(201).json(match);
});

const updateMatch = asyncHandler(async (req, res) => {
    const matchId = req.params.id;
    const { setScores, ...matchData } = req.body;
    const t = await db.sequelize.transaction();
    try {
        const match = await Match.findByPk(matchId, { transaction: t });
        if (!match) {
            await t.rollback();
            res.status(404);
            throw new Error('Partido no encontrado');
        }
        const oldData = match.toJSON();

        // --- MEJORA: Automatización de Estado del Torneo ---
        // Si el estado del partido cambia a 'Activo' y el torneo estaba 'Programado',
        // actualizamos el torneo a 'Activo'.
        if (matchData.status === 'Activo' && match.status === 'Programado') {
            const tournament = await Tournament.findByPk(match.tournamentId, { transaction: t });
            if (tournament && tournament.status === 'Programado') {
                await tournament.update({ status: 'Activo' }, { transaction: t });
                // Opcional: registrar este cambio en el log
                console.log(`Torneo ${tournament.name} actualizado a 'Activo' automáticamente.`);
            }
        }
        // --- Fin de la mejora ---

        await match.update(matchData, { transaction: t });

        if (setScores && Array.isArray(setScores)) {
            const scoresToUpsert = setScores.map(score => ({ ...score, matchId: match.id }));
            await SetScore.bulkCreate(scoresToUpsert, {
                updateOnDuplicate: ['team1Score', 'team2Score'],
                transaction: t,
            });

            let team1SetsWon = 0;
            let team2SetsWon = 0;
            const updatedScores = await SetScore.findAll({ where: { matchId: match.id }, transaction: t });

            for (const score of updatedScores) {
                const team1Score = score.team1Score || 0;
                const team2Score = score.team2Score || 0;
                const pointsToWin = score.setNumber === match.numberOfSets ? 15 : 25;

                const isSetFinished =
                    (team1Score >= pointsToWin && team1Score >= team2Score + 2) ||
                    (team2Score >= pointsToWin && team2Score >= team1Score + 2);

                if (isSetFinished) {
                    if (team1Score > team2Score) team1SetsWon++;
                    else team2SetsWon++;
                }
            }

            match.team1Score = team1SetsWon;
            match.team2Score = team2SetsWon;

            const setsToWin = Math.ceil(match.numberOfSets / 2);
            if (team1SetsWon >= setsToWin) {
                match.winnerId = match.localTeamId;
                match.status = 'Completado';
            } else if (team2SetsWon >= setsToWin) {
                match.winnerId = match.visitorTeamId;
                match.status = 'Completado';
            } else {
                if (match.status === 'Completado') {
                    match.status = 'Activo';
                }
                match.winnerId = null;
            }
            await match.save({ transaction: t });
        }

        await t.commit();

        const finalUpdatedMatch = await Match.findByPk(matchId, {
            include: [{ model: SetScore, as: 'setScores', order: [['setNumber', 'ASC']] }]
        });

        await Log.create({
            userId: req.user.id, action: 'UPDATE', entityType: 'Match',
            entityId: finalUpdatedMatch.id, oldData: oldData, newData: finalUpdatedMatch.toJSON()
        });

        // 🔔 Emitir evento de actualización en tiempo real
        const io = req.app.get('io');
        io.emit('matchUpdated', finalUpdatedMatch);

        res.status(200).json(finalUpdatedMatch);
    } catch (error) {
        await t.rollback();
        console.error("Error updating match:", error);
        throw new Error('Error al actualizar el partido.');
    }
});

const deleteMatch = asyncHandler(async (req, res) => {
    const match = await Match.findByPk(req.params.id);
    if (!match) {
        res.status(404);
        throw new Error('Partido no encontrado.');
    }
    const oldData = match.toJSON();
    await match.destroy();
    await Log.create({
        userId: req.user.id, action: 'DELETE', entityType: 'Match',
        entityId: req.params.id, oldData: oldData
    });
    res.status(200).json({ message: 'Partido eliminado exitosamente.' });
});

const requestTimeout = asyncHandler(async (req, res) => {
    const { teamId } = req.body;
    const matchId = req.params.id;

    const match = await Match.findByPk(matchId);

    if (!match) {
        res.status(404);
        throw new Error('Partido no encontrado.');
    }

    if (match.status !== 'Activo') {
        res.status(400);
        throw new Error('Solo se pueden pedir tiempos fuera en partidos activos.');
    }

    if (match.timeoutActive) {
        res.status(400);
        throw new Error('Ya hay un tiempo fuera activo.');
    }

    const isLocalTeam = match.localTeamId == teamId;
    const isVisitorTeam = match.visitorTeamId == teamId;

    if (!isLocalTeam && !isVisitorTeam) {
        res.status(400);
        throw new Error('El equipo especificado no participa en este partido.');
    }

    if (isLocalTeam && match.localTeamTimeouts <= 0) {
        res.status(400);
        throw new Error('El equipo local no tiene más tiempos fuera disponibles.');
    }

    if (isVisitorTeam && match.visitorTeamTimeouts <= 0) {
        res.status(400);
        throw new Error('El equipo visitante no tiene más tiempos fuera disponibles.');
    }

    if (isLocalTeam) {
        match.localTeamTimeouts -= 1;
    } else {
        match.visitorTeamTimeouts -= 1;
    }

    match.timeoutActive = true;
    match.timeoutTeamId = teamId;
    match.timeoutStartTime = new Date();

    await match.save();

    // 🔔 Emitir evento de tiempo fuera solicitado
    const io = req.app.get('io');
    io.emit('timeoutRequested', match);

    res.status(200).json(match);
});

const endTimeout = asyncHandler(async (req, res) => {
    const matchId = req.params.id;
    const match = await Match.findByPk(matchId);

    if (!match) {
        res.status(404);
        throw new Error('Partido no encontrado.');
    }

    if (!match.timeoutActive) {
        res.status(400);
        throw new Error('No hay un tiempo fuera activo para finalizar.');
    }

    match.timeoutActive = false;
    match.timeoutTeamId = null;
    match.timeoutStartTime = null;

    await match.save();

    // 🔔 Emitir evento de finalización de tiempo fuera
    const io = req.app.get('io');
    io.emit('timeoutEnded', match);

    res.status(200).json(match);
});

/**
 * Manejador para eventos de Socket.IO que actualiza el marcador en tiempo real.
 * NO guarda en la base de datos, solo retransmite la información a los clientes.
 * Esta función se debe registrar en la configuración del servidor de Socket.IO.
 * @param {object} io - La instancia del servidor de Socket.IO.
 * @param {object} socket - La conexión del socket del cliente que emite el evento.
 */
const handleLiveScoreUpdate = (io, socket) => {
    // Escuchamos un evento que el cliente del admin emitirá
    socket.on('live:score:update', (data) => {
        // Verificación de seguridad: solo los administradores pueden emitir este evento.
        // Asumimos que un middleware de autenticación ha añadido 'user' con su 'role' al socket.
        if (!socket.user || socket.user.role.name !== 'Admin') {
            // Opcional: podrías emitir un evento de error de vuelta al cliente que lo envió.
            // socket.emit('error:unauthorized', { message: 'No tienes permiso para realizar esta acción.' });
            return; // Ignorar silenciosamente el evento si no es un admin.
        }

        const { matchId, ...updateData } = data;

        if (!matchId) {
            // No hacer nada si no hay ID de partido
            return;
        }

        // Retransmitir los datos del cambio a todos los demás clientes
        // que están en la "sala" de este partido, excepto al que lo envió.
        socket.to(`match-${matchId}`).emit('live:score:update', updateData);
    });
};

module.exports = {
    getMatches,
    getMatchById,
    createMatch,
    updateMatch,
    deleteMatch,
    requestTimeout,
    endTimeout,
    handleLiveScoreUpdate // Exportamos el nuevo manejador
};
