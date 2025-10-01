const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const db = require('../models'); // Importa todos tus modelos
const User = db.User;
const Role = db.Role;

// Función auxiliar para generar un JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d', // Usa la variable de entorno
    });
};

// @desc    Registrar un nuevo usuario
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, roleName = 'User' } = req.body; // Por defecto, el rol es 'User'

    // Validaciones básicas
    if (!username || !email || !password) {
        res.status(400);
        throw new Error('Por favor, ingrese todos los campos requeridos.');
    }

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
        res.status(400);
        throw new Error('El usuario con este email ya existe.');
    }

    // El hasheo de contraseña se hace automáticamente con el hook de Sequelize en el modelo User.js

    // Obtener el ID del rol
    const userRole = await Role.findOne({ where: { name: roleName } });
    if (!userRole) {
        res.status(400);
        throw new Error('Rol especificado no existe.');
    }

    // Crear el usuario
    const user = await User.create({
        username,
        email,
        password: password, // Pasamos la contraseña en texto plano, el hook se encarga del hash
        roleId: userRole.id
    });

    if (user) {
        res.status(201).json({
            id: user.id,
            username: user.username,
            email: user.email,
            role: userRole.name,
            token: generateToken(user.id),
        });
    } else {
        res.status(400);
        throw new Error('Datos de usuario inválidos.');
    }
});

// @desc    Autenticar un usuario y obtener token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validaciones básicas
    if (!email || !password) {
        res.status(400);
        throw new Error('Por favor, ingrese email y contraseña.');
    }

    // Verificar si el usuario existe por email
    const user = await User.findOne({
        where: { email },
        include: [{ model: Role, as: 'role' }] // Incluye el rol del usuario
    });

    // Si el usuario existe y la contraseña coincide directamente (SIN HASH)
    if (user && user.password === password) {
        // Verificar si el usuario está activo
        if (!user.isActive) {
            res.status(403); // 403 Forbidden
            throw new Error('Tu cuenta está desactivada. Contacta a un administrador.');
        }

        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role.name, // El nombre del rol
            token: generateToken(user.id),
        });
    } else {
        res.status(401);
        throw new Error('Credenciales inválidas.');
    }
});

// @desc    Obtener datos del usuario actual (ruta protegida)
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    // req.user viene del middleware 'protect'
    if (req.user) {
        res.json({
            id: req.user.id,
            username: req.user.username,
            email: req.user.email,
            role: req.user.role.name
        });
    } else {
        res.status(404);
        throw new Error('Usuario no encontrado.');
    }
});

module.exports = {
    registerUser,
    loginUser,
    getMe,
};