const db = require('../models');
const Player = db.Player;
const Team = db.Team; // Para la asociación
const Log = db.Log; // Para los logs de auditoría

// @desc    Obtener todos los jugadores (pueden ser de todos los equipos)
// @route   GET /api/players
// @access  Private
const getPlayers = async (req, res) => {
    try {
        const players = await Player.findAll({
            include: [{
                model: Team,
                as: 'team',
                attributes: ['id', 'name'] // Solo el ID y nombre del equipo
            }]
        });
        res.json(players);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener jugadores.' });
    }
};

// @desc    Obtener un jugador por ID
// @route   GET /api/players/:id
// @access  Private
const getPlayerById = async (req, res) => {
    try {
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
            res.status(404).json({ message: 'Jugador no encontrado.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el jugador.' });
    }
};

// @desc    Crear un nuevo jugador y asignarlo a un equipo (Solo Admin/Superadmin)
// @route   POST /api/players
// @access  Private/Admin, Superadmin
const createPlayer = async (req, res) => {
    const { firstName, lastName, jerseyNumber, position, teamId } = req.body;

    if (!firstName || !lastName || !teamId) {
        return res.status(400).json({ message: 'Nombre, apellido y ID de equipo son requeridos.' });
    }

    try {
        const team = await Team.findByPk(teamId);
        if (!team) {
            return res.status(404).json({ message: 'El equipo especificado no existe.' });
        }

        const player = await Player.create({
            firstName,
            lastName,
            jerseyNumber,
            position,
            teamId
        });

        // Registrar en el log de auditoría
        await Log.create({
            userId: req.user.id,
            action: 'CREATE',
            entityType: 'Player',
            entityId: player.id,
            oldData: null,
            newData: player.toJSON()
        });

        res.status(201).json(player);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear el jugador.' });
    }
};

// @desc    Actualizar un jugador (Solo Admin/Superadmin)
// @route   PUT /api/players/:id
// @access  Private/Admin, Superadmin
const updatePlayer = async (req, res) => {
    const { firstName, lastName, jerseyNumber, position, teamId } = req.body;

    try {
        const player = await Player.findByPk(req.params.id);
        if (!player) {
            return res.status(404).json({ message: 'Jugador no encontrado.' });
        }

        const oldData = player.toJSON(); // Guardar datos anteriores para el log

        if (firstName) player.firstName = firstName;
        if (lastName) player.lastName = lastName;
        if (jerseyNumber !== undefined) player.jerseyNumber = jerseyNumber;
        if (position !== undefined) player.position = position;
        if (teamId) {
            const team = await Team.findByPk(teamId);
            if (!team) {
                return res.status(404).json({ message: 'El nuevo equipo especificado no existe.' });
            }
            player.teamId = teamId;
        }

        await player.save();

        // Registrar en el log de auditoría
        await Log.create({
            userId: req.user.id,
            action: 'UPDATE',
            entityType: 'Player',
            entityId: player.id,
            oldData: oldData,
            newData: player.toJSON()
        });

        res.json(player);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el jugador.' });
    }
};

// @desc    Eliminar un jugador (Solo Admin/Superadmin)
// @route   DELETE /api/players/:id
// @access  Private/Admin, Superadmin
const deletePlayer = async (req, res) => {
    try {
        const player = await Player.findByPk(req.params.id);
        if (!player) {
            return res.status(404).json({ message: 'Jugador no encontrado.' });
        }

        const oldData = player.toJSON(); // Guardar datos antes de eliminar

        await player.destroy();

        // Registrar en el log de auditoría
        await Log.create({
            userId: req.user.id,
            action: 'DELETE',
            entityType: 'Player',
            entityId: player.id,
            oldData: oldData,
            newData: null
        });

        res.json({ message: 'Jugador eliminado exitosamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar jugador.' });
    }
};

module.exports = {
    getPlayers,
    getPlayerById,
    createPlayer,
    updatePlayer,
    deletePlayer,
};