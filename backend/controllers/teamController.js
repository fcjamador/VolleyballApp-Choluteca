const db = require('../models');
const asyncHandler = require('express-async-handler');
const Team = db.Team;
const Player = db.Player; // Para incluir jugadores con los equipos
const Log = db.Log; // Para los logs de auditoría
const fs = require('fs'); // Para manejar archivos

// @desc    Obtener todos los equipos
// @route   GET /api/teams
// @access  Private
const getTeams = asyncHandler(async (req, res) => {
    const teams = await Team.findAll({
        include: [{
            model: Player,
            as: 'players',
            attributes: ['id', 'firstName', 'lastName', 'jerseyNumber', 'position']
        }]
    });
    res.json(teams);
});

// @desc    Obtener un equipo por ID
// @route   GET /api/teams/:id
// @access  Private
const getTeamById = asyncHandler(async (req, res) => {
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
        res.status(404);
        throw new Error('Equipo no encontrado.');
    }
});

// @desc    Crear un nuevo equipo (Solo Admin/Superadmin)
// @route   POST /api/teams
// @access  Private/Admin, Superadmin
const createTeam = asyncHandler(async (req, res) => {
    const { name, coachName } = req.body;

    if (!name) {
        res.status(400);
        throw new Error('El nombre del equipo es requerido.');
    }

    const teamExists = await Team.findOne({ where: { name } });
    if (teamExists) {
        res.status(400);
        throw new Error('Ya existe un equipo con este nombre.');
    }

    const logoUrl = req.file ? `/uploads/logos/${req.file.filename}` : null;

    const team = await Team.create({
        name,
        coachName,
        logoUrl
    });

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
});

// @desc    Actualizar un equipo (Solo Admin/Superadmin)
// @route   PUT /api/teams/:id
// @access  Private/Admin, Superadmin
const updateTeam = asyncHandler(async (req, res) => {
    const { name, coachName } = req.body;

    const team = await Team.findByPk(req.params.id);
    if (!team) {
        res.status(404);
        throw new Error('Equipo no encontrado.');
    }

    const oldData = team.toJSON(); // Guardar datos anteriores para el log

    // Si se sube un nuevo logo, eliminar el anterior si existe
    if (req.file) {
        if (team.logoUrl) {
            // Eliminar el archivo antiguo del servidor
            const oldLogoPath = `uploads/logos/${team.logoUrl.split('/').pop()}`;
            if (fs.existsSync(oldLogoPath)) {
                fs.unlinkSync(oldLogoPath);
            }
        }
        team.logoUrl = `/uploads/logos/${req.file.filename}`;
    }

    if (name) team.name = name;
    if (coachName !== undefined) team.coachName = coachName;

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
});

// @desc    Eliminar un equipo (Solo Admin/Superadmin)
// @route   DELETE /api/teams/:id
// @access  Private/Admin, Superadmin
const deleteTeam = asyncHandler(async (req, res) => {
    const team = await Team.findByPk(req.params.id);
    if (!team) {
        res.status(404);
        throw new Error('Equipo no encontrado.');
    }

    const oldData = team.toJSON(); // Guardar datos antes de eliminar

    // Eliminar el logo asociado si existe
    if (team.logoUrl) {
        const logoPath = `uploads/logos/${team.logoUrl.split('/').pop()}`;
        if (fs.existsSync(logoPath)) {
            fs.unlinkSync(logoPath);
        }
    }

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
});

module.exports = {
    getTeams,
    getTeamById,
    createTeam,
    updateTeam,
    deleteTeam,
};