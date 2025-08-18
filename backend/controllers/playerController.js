const db = require('../models');
const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const Player = db.Player;
const Team = db.Team;
const Tournament = db.Tournament;
const Log = db.Log;
const xlsx = require('xlsx'); // Para leer archivos Excel

// @desc    Obtener todos los jugadores
// @route   GET /api/players
// @access  Private
const getPlayers = asyncHandler(async (req, res) => {
    const players = await Player.findAll({
        include: [{
            model: Team,
            as: 'team',
            attributes: ['id', 'name']
        }]
    });
    res.json(players);
});

// @desc    Obtener un jugador por ID
// @route   GET /api/players/:id
// @access  Private
const getPlayerById = asyncHandler(async (req, res) => {
    const player = await Player.findByPk(req.params.id, {
        include: [{
            model: Team,
            as: 'team',
            attributes: ['id', 'name']
        }]
    });
    if (player) {
        res.json(player);
    } else {
        res.status(404);
        throw new Error('Jugador no encontrado.');
    }
});

// @desc    Crear un nuevo jugador
// @route   POST /api/players
// @access  Private/Admin, Superadmin
const createPlayer = asyncHandler(async (req, res) => {
    const { firstName, lastName, nationalId, jerseyNumber, position, teamId } = req.body;

    if (!firstName || !lastName || !nationalId || !teamId) {
        res.status(400);
        throw new Error('Nombre, apellido, DNI/ID y equipo son requeridos.');
    }

    const team = await Team.findByPk(teamId);
    if (!team) {
        res.status(404);
        throw new Error('El equipo especificado no existe.');
    }

    // --- VALIDACIÓN 1: El DNI/ID del jugador debe ser único en todo el sistema ---
    const playerExists = await Player.findOne({ where: { nationalId } });
    if (playerExists) {
        res.status(400);
        throw new Error(`Un jugador con el DNI/ID '${nationalId}' ya existe en el sistema.`);
    }

    // --- VALIDACIÓN 2: Número de camiseta único por equipo ---
    if (jerseyNumber) {
        const existingPlayer = await Player.findOne({ where: { teamId, jerseyNumber } });
        if (existingPlayer) {
            res.status(400);
            throw new Error(`El número de camiseta ${jerseyNumber} ya está en uso en este equipo.`);
        }
    }

    const player = await Player.create({
        firstName,
        lastName,
        nationalId,
        jerseyNumber,
        position,
        teamId
    });

    await Log.create({
        userId: req.user.id,
        action: 'CREATE',
        entityType: 'Player',
        entityId: player.id,
        newData: player.toJSON()
    });

    res.status(201).json(player);
});

// @desc    Actualizar un jugador
// @route   PUT /api/players/:id
// @access  Private/Admin, Superadmin
const updatePlayer = asyncHandler(async (req, res) => {
    const { firstName, lastName, nationalId, jerseyNumber, position, teamId } = req.body;

    const player = await Player.findByPk(req.params.id);
    if (!player) {
        res.status(404);
        throw new Error('Jugador no encontrado.');
    }

    // --- VALIDACIÓN DE REGLAS DE NEGOCIO ---
    if (teamId && player.teamId !== parseInt(teamId)) {
        const activeTournament = await Tournament.findOne({
            where: { status: 'Activo' },
            include: [{
                model: Team,
                as: 'Teams',
                where: { id: player.teamId },
                attributes: []
            }]
        });

        if (activeTournament) {
            res.status(400);
            throw new Error(`No se puede mover al jugador. Su equipo actual participa en el torneo activo: "${activeTournament.name}".`);
        }
    }

    // Validar unicidad de DNI/ID si se está cambiando
    if (nationalId && nationalId !== player.nationalId) {
        const playerExists = await Player.findOne({
            where: { nationalId, id: { [Op.ne]: req.params.id } }
        });
        if (playerExists) {
            res.status(400);
            throw new Error(`El DNI/ID '${nationalId}' ya está en uso por otro jugador.`);
        }
    }

    // Validar unicidad de número de camiseta por equipo
    const targetTeamId = teamId ? parseInt(teamId) : player.teamId;
    if (jerseyNumber && (String(jerseyNumber) !== String(player.jerseyNumber) || targetTeamId !== player.teamId)) {
        const existingPlayerWithJersey = await Player.findOne({
            where: {
                teamId: targetTeamId,
                jerseyNumber: jerseyNumber,
                id: { [Op.ne]: req.params.id } // Excluir al propio jugador
            }
        });
        if (existingPlayerWithJersey) {
            res.status(400);
            throw new Error(`El número de camiseta ${jerseyNumber} ya está en uso en el equipo de destino.`);
        }
    }

    const oldData = player.toJSON();

    // Actualizar los datos
    const updatedPlayer = await player.update(req.body);

    await Log.create({
        userId: req.user.id,
        action: 'UPDATE',
        entityType: 'Player',
        entityId: player.id,
        oldData: oldData,
        newData: updatedPlayer.toJSON()
    });

    res.json(updatedPlayer);
});

// @desc    Eliminar un jugador
// @route   DELETE /api/players/:id
// @access  Private/Admin, Superadmin
const deletePlayer = asyncHandler(async (req, res) => {
    const player = await Player.findByPk(req.params.id);
    if (!player) {
        res.status(404);
        throw new Error('Jugador no encontrado.');
    }

    const oldData = player.toJSON();

    await player.destroy();

    await Log.create({
        userId: req.user.id,
        action: 'DELETE',
        entityType: 'Player',
        entityId: req.params.id, // Usar req.params.id porque player.id ya no existe
        oldData: oldData,
    });

    res.json({ message: 'Jugador eliminado exitosamente.' });
});

// @desc    Subir y procesar un archivo Excel con puntos de jugadores
// @route   POST /api/players/upload-points
// @access  Private/Admin, Superadmin
// @desc    Subir y procesar un archivo Excel con puntos de jugadores
// @route   POST /api/players/upload-points
// @access  Private/Admin, Superadmin
const uploadPlayerPoints = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('No se ha subido ningún archivo.');
    }

    const t = await db.sequelize.transaction();

    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
            await t.rollback();
            res.status(400);
            throw new Error('El archivo Excel está vacío o tiene un formato incorrecto.');
        }

        let updatedCount = 0;
        const errors = [];

        for (const row of data) {
            const playerId = row['ID_Jugador'];
            const points = row['Puntos'];

            if (playerId === undefined || points === undefined) {
                errors.push(`Fila inválida, faltan las columnas 'ID_Jugador' o 'Puntos': ${JSON.stringify(row)}`);
                continue;
            }

            const player = await Player.findByPk(playerId, { transaction: t });

            if (player) {
                player.points = (player.points || 0) + (parseInt(points, 10) || 0);
                await player.save({ transaction: t });
                updatedCount++;
            } else {
                errors.push(`Jugador con ID ${playerId} no encontrado.`);
            }
        }

        if (errors.length > 0) {
            await t.rollback();
            res.status(400).json({
                message: 'Se encontraron errores al procesar el archivo. No se guardó ningún cambio.',
                errors: errors,
            });
            return;
        }

        await t.commit();

        // 🔔 Emitir notificación en tiempo real
        const io = req.app.get('io');
        io.emit('playerPointsUpdated', {
            updatedCount,
            errors
        });

        res.status(200).json({
            message: `Puntos actualizados exitosamente para ${updatedCount} jugadores.`,
        });

    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500);
        throw new Error('Error en el servidor al procesar el archivo.');
    }
});


// @desc    Obtener la tabla de posiciones de jugadores
// @route   GET /api/players/standings
// @access  Private
const getPlayerStandings = asyncHandler(async (req, res) => {
    const players = await Player.findAll({
        include: [{
            model: Team,
            as: 'team',
            attributes: ['id', 'name']
        }],
        order: [['points', 'DESC']], // Ordenar por puntos de mayor a menor
    });
    res.json(players);
});

module.exports = {
    getPlayers,
    getPlayerById,
    createPlayer,
    updatePlayer,
    deletePlayer,
    uploadPlayerPoints,
    getPlayerStandings,
};
