const db = require('../models');
const User = db.User;
const Role = db.Role;
const Log = db.Log; // Para los logs de auditoría
const bcrypt = require('bcryptjs');

// @desc    Obtener todos los usuarios (Solo para Admin/Superadmin)
// @route   GET /api/users
// @access  Private/Admin, Superadmin
const getUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }, // No enviar contraseñas
            include: [{ model: Role, as: 'role' }] // Incluir el rol de cada usuario
        });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener usuarios.' });
    }
};

// @desc    Obtener un usuario por ID (Solo para Admin/Superadmin)
// @route   GET /api/users/:id
// @access  Private/Admin, Superadmin
const getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] },
            include: [{ model: Role, as: 'role' }]
        });
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'Usuario no encontrado.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el usuario.' });
    }
};


// @desc    Actualizar un usuario (Solo Superadmin para roles, Admin para isActive)
// @route   PUT /api/users/:id
// @access  Private/Admin, Superadmin
const updateUser = async (req, res) => {
    const { username, email, roleId, isActive } = req.body;
    const targetUserId = req.params.id; // El ID del usuario a actualizar

    try {
        const user = await User.findByPk(targetUserId, { include: [{ model: Role, as: 'role' }] });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // Guardar datos anteriores para el log
        const oldData = { ...user.get({ plain: true }) }; // Copia los datos actuales

        // Solo Superadmin puede cambiar el rol
        if (roleId !== undefined && req.user.role.name === 'Superadmin') {
            const newRole = await Role.findByPk(roleId);
            if (!newRole) {
                return res.status(400).json({ message: 'Rol inválido.' });
            }
            user.roleId = roleId;
        } else if (roleId !== undefined && req.user.role.name !== 'Superadmin') {
            return res.status(403).json({ message: 'Acceso denegado. Solo Superadmin puede cambiar roles.' });
        }

        // Admin y Superadmin pueden cambiar el estado activo
        if (isActive !== undefined && (req.user.role.name === 'Admin' || req.user.role.name === 'Superadmin')) {
            user.isActive = isActive;
        } else if (isActive !== undefined) {
            return res.status(403).json({ message: 'Acceso denegado. Solo Admin o Superadmin pueden cambiar el estado activo.' });
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

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar usuario.' });
    }
};

// @desc    Eliminar un usuario (Solo Superadmin)
// @route   DELETE /api/users/:id
// @access  Private/Superadmin
const deleteUser = async (req, res) => {
    const targetUserId = req.params.id;

    // Un superadmin no puede eliminarse a sí mismo
    if (req.user.id == targetUserId && req.user.role.name === 'Superadmin') {
        return res.status(403).json({ message: 'Un Superadmin no puede eliminarse a sí mismo.' });
    }

    try {
        const user = await User.findByPk(targetUserId, { include: [{ model: Role, as: 'role' }] });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
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

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar usuario.' });
    }
};

// @desc    Crear un nuevo usuario (Solo Admin/Superadmin)
// @route   POST /api/users
// @access  Private/Admin, Superadmin
const createUserByAdmin = async (req, res) => {
    const { username, email, password, roleName = 'Normal', isActive = true } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Por favor, ingrese todos los campos requeridos.' });
    }

    // Solo Superadmin puede crear Admin/Superadmin
    if (req.user.role.name !== 'Superadmin' && (roleName === 'Admin' || roleName === 'Superadmin')) {
        return res.status(403).json({ message: 'Acceso denegado. Solo Superadmin puede crear usuarios Administradores o Superadmins.' });
    }

    try {
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'El usuario con este email ya existe.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userRole = await Role.findOne({ where: { name: roleName } });
        if (!userRole) {
            return res.status(400).json({ message: 'Rol especificado no existe.' });
        }

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            roleId: userRole.id,
            isActive
        });

        if (user) {
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
        } else {
            res.status(400).json({ message: 'Datos de usuario inválidos.' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor al crear el usuario.' });
    }
};


module.exports = {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    createUserByAdmin
};