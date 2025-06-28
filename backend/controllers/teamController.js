const db = require('../models');
const Team = db.Team;
const Player = db.Player; // Para incluir jugadores con los equipos
const Log = db.Log; // Para los logs de auditoría

// @desc    Obtener todos los equipos
// @route   GET /api/teams
// @access  Private (Cualquier usuario logueado puede verlos)
const getTeams = async (req, res) => {
    try {
        const teams = await Team.findAll({
            include: [{
                model: Player,
                as: 'players',
                attributes: ['id', 'firstName', 'lastName', 'jerseyNumber', 'position']
            }]
        });
        res.json(teams);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener equipos.' });
    }
};

// @desc    Obtener un equipo por ID
// @route   GET /api/teams/:id
// @access  Private
const getTeamById = async (req, res) => {
    try {
        const team = await Team.findByPk(req.params.id, {
            include: [{
                model: Player,
                as: 'players',
                attributes: ['id', 'firstName', 'lastName', 'jerseyNumber', 'position']
            }]
        });
        if (team) {
            res.json(team);
        } else {
            res.status(404).json({ message: 'Equipo no encontrado.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el equipo.' });
    }
};

// @desc    Crear un nuevo equipo (Solo Admin/Superadmin)
// @route   POST /api/teams
// @access  Private/Admin, Superadmin
const createTeam = async (req, res) => {
    const { name, coachName } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'El nombre del equipo es requerido.' });
    }

    try {
        const teamExists = await Team.findOne({ where: { name } });
        if (teamExists) {
            return res.status(400).json({ message: 'Ya existe un equipo con este nombre.' });
        }

        const team = await Team.create({ name, coachName });

        // Registrar en el log de auditoría
        await Log.create({
            userId: req.user.id,
            action: 'CREATE',
            entityType: 'Team',
            entityId: team.id,
            oldData: null,
            newData: team.toJSON()
        });

        res.status(201).json(team);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear el equipo.' });
    }
};

// @desc    Actualizar un equipo (Solo Admin/Superadmin)
// @route   PUT /api/teams/:id
// @access  Private/Admin, Superadmin
const updateTeam = async (req, res) => {
    const { name, coachName } = req.body;

    try {
        const team = await Team.findByPk(req.params.id);
        if (!team) {
            return res.status(404).json({ message: 'Equipo no encontrado.' });
        }

        const oldData = team.toJSON(); // Guardar datos anteriores para el log

        if (name) team.name = name;
        if (coachName !== undefined) team.coachName = coachName; // Permite setear a null

        await team.save();

        // Registrar en el log de auditoría
        await Log.create({
            userId: req.user.id,
            action: 'UPDATE',
            entityType: 'Team',
            entityId: team.id,
            oldData: oldData,
            newData: team.toJSON()
        });

        res.json(team);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el equipo.' });
    }
};

// @desc    Eliminar un equipo (Solo Admin/Superadmin)
// @route   DELETE /api/teams/:id
// @access  Private/Admin, Superadmin
const deleteTeam = async (req, res) => {
    try {
        const team = await Team.findByPk(req.params.id);
        if (!team) {
            return res.status(404).json({ message: 'Equipo no encontrado.' });
        }

        const oldData = team.toJSON(); // Guardar datos antes de eliminar

        // Opcional: Considerar qué hacer con los jugadores y partidos asociados.
        // Por simplicidad, Sequelize podría manejarlo con `onDelete: 'CASCADE'` en la FK
        // O podrías eliminar jugadores/partidos manualmente aquí.
        // Para este ejemplo, asumimos que si se elimina un equipo, sus jugadores asociados también se "desasocian" o eliminan.
        // Para asegurar que los jugadores se eliminen en cascada con el equipo,
        // ve al modelo `Player.js` y en `Player.belongsTo(models.Team, ...)`
        // añade `{ onDelete: 'CASCADE', hooks: true }` a la configuración.
        // Sin embargo, es más seguro desvincular o marcar como inactivo si hay datos históricos.
        // Por ahora, solo eliminaremos el equipo.

        await team.destroy();

        // Registrar en el log de auditoría
        await Log.create({
            userId: req.user.id,
            action: 'DELETE',
            entityType: 'Team',
            entityId: team.id,
            oldData: oldData,
            newData: null
        });

        res.json({ message: 'Equipo eliminado exitosamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar equipo.' });
    }
};

module.exports = {
    getTeams,
    getTeamById,
    createTeam,
    updateTeam,
    deleteTeam,
};