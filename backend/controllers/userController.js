const db = require('../models');
const User = db.User;
const Role = db.Role;
const Log = db.Log; // Para los logs de auditoría
const asyncHandler = require('express-async-handler');

// @desc    Obtener todos los usuarios (Solo para Admin)
// @route   GET /api/users
// @access  Private/Admin, Superadmin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.findAll({
        attributes: { exclude: ['password'] }, // No enviar contraseñas
        include: [{ model: Role, as: 'role' }] // Incluir el rol de cada usuario
    });
    res.json(users);
});

// @desc    Obtener un usuario por ID (Solo para Admin)
// @route   GET /api/users/:id
// @access  Private/Admin, Superadmin
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.params.id, {
        attributes: { exclude: ['password'] },
        include: [{ model: Role, as: 'role' }]
    });
    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('Usuario no encontrado.');
    }
});

// @desc    Obtener todos los roles disponibles
// @route   GET /api/users/roles (ahora /api/auth/roles)
// @access  Private/Admin, Superadmin
const getRoles = asyncHandler(async (req, res) => {
    const roles = await Role.findAll({ attributes: ['id', 'name'] });
    res.json(roles);
});



// @desc    Actualizar un usuario (Solo Admin)
// @route   PUT /api/users/:id
// @access  Private/Admin, Superadmin
const updateUser = asyncHandler(async (req, res) => {
    const { username, email, roleName, isActive } = req.body; // Cambiado de roleId a roleName
    const targetUserId = req.params.id; // El ID del usuario a actualizar

    const user = await User.findByPk(targetUserId, { include: [{ model: Role, as: 'role' }] });
    if (!user) {
        res.status(404);
        throw new Error('Usuario no encontrado.');
    }

    // Un Admin no puede cambiar su propio rol
    if (req.user.id == targetUserId && roleName && roleName !== 'Admin') {
        res.status(403);
        throw new Error('Un Administrador no puede cambiar su propio rol a uno inferior.');
    }

    // Guardar datos anteriores para el log
    const oldData = { ...user.get({ plain: true }) }; // Copia los datos actuales

    // Solo Admin puede cambiar el rol
    if (roleName !== undefined) {
        const newRole = await Role.findOne({ where: { name: roleName } });
        if (!newRole) {
            res.status(400);
            throw new Error('El rol especificado no existe.');
        }
        user.roleId = newRole.id;
    }

    // Solo un Admin puede cambiar el estado activo, pero no el suyo propio
    if (isActive !== undefined && req.user.id != targetUserId) {
        user.isActive = isActive;
    } else if (isActive !== undefined && req.user.id == targetUserId) {
        res.status(403);
        throw new Error('Un Administrador no puede desactivar su propia cuenta.');
    }

    if (username) user.username = username;
    if (email) user.email = email;

    await user.save();

    // Registrar en el log de auditoría
    const newData = { ...user.get({ plain: true }) };
    await Log.create({
        userId: req.user.id,
        action: 'UPDATE',
        entityType: 'User',
        entityId: user.id,
        oldData: oldData,
        newData: newData
    });

    res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: (await user.getRole()).name, // Obtener el nombre del rol actualizado
        isActive: user.isActive
    });
});

// @desc    Eliminar un usuario (Solo Admin)
// @route   DELETE /api/users/:id
// @access  Private/Superadmin
const deleteUser = asyncHandler(async (req, res) => {
    const targetUserId = req.params.id;

    // Un admin no puede eliminarse a sí mismo
    if (req.user.id == targetUserId) {
        res.status(403);
        throw new Error('Un Administrador no puede eliminarse a sí mismo.');
    }

    const user = await User.findByPk(targetUserId, { include: [{ model: Role, as: 'role' }] });
    if (!user) {
        res.status(404);
        throw new Error('Usuario no encontrado.');
    }

    // Registrar en el log antes de eliminar
    const oldData = { ...user.get({ plain: true }) };
    await Log.create({
        userId: req.user.id,
        action: 'DELETE',
        entityType: 'User',
        entityId: user.id,
        oldData: oldData,
        newData: null // No hay nuevos datos después de eliminar
    });

    await user.destroy();
    res.json({ message: 'Usuario eliminado exitosamente.' });
});

// @desc    Crear un nuevo usuario (Solo Admin)
// @route   POST /api/users
// @access  Private/Admin, Superadmin
const createUserByAdmin = asyncHandler(async (req, res) => {
    const { username, email, password, roleName = 'User', isActive = true } = req.body;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
        res.status(400);
        throw new Error('El usuario con este email ya existe.');
    }

    const userRole = await Role.findOne({ where: { name: roleName } });
    if (!userRole) {
        res.status(400);
        throw new Error('Rol especificado no existe.');
    }

    const user = await User.create({
        username,
        email,
        password: password, // Guardar la contraseña en texto plano
        roleId: userRole.id,
        isActive
    });

    // Registrar en el log de auditoría
    await Log.create({
        userId: req.user.id,
        action: 'CREATE',
        entityType: 'User',
        entityId: user.id,
        oldData: null,
        newData: { ...user.get({ plain: true }), password: '[REDACTED]' } // No guardar password en logs
    });

    res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: userRole.name,
        isActive: user.isActive
    });
});


module.exports = {
    getUsers,
    getUserById,
    getRoles,
    updateUser,
    deleteUser,
    createUserByAdmin
};