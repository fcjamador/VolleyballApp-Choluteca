const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models'); // Importa todos tus modelos
const User = db.User;
const Role = db.Role;

// Función auxiliar para generar un JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1d', // El token expirará en 1 día
    });
};

// @desc    Registrar un nuevo usuario
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { username, email, password, roleName = 'Normal' } = req.body; // Por defecto, el rol es 'Normal'

    // Validaciones básicas
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Por favor, ingrese todos los campos requeridos.' });
    }

    try {
        // Verificar si el usuario ya existe
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'El usuario con este email ya existe.' });
        }

        // Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Obtener el ID del rol
        const userRole = await Role.findOne({ where: { name: roleName } });
        if (!userRole) {
            return res.status(400).json({ message: 'Rol especificado no existe.' });
        }

        // Crear el usuario
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
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
            res.status(400).json({ message: 'Datos de usuario inválidos.' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor al registrar el usuario.' });
    }
};

// @desc    Autenticar un usuario y obtener token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Validaciones básicas
    if (!email || !password) {
        return res.status(400).json({ message: 'Por favor, ingrese email y contraseña.' });
    }

    try {
        // Verificar si el usuario existe por email
        const user = await User.findOne({
            where: { email },
            include: [{ model: Role, as: 'role' }] // Incluye el rol del usuario
        });

        // Si el usuario existe y la contraseña es correcta
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role.name, // El nombre del rol
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: 'Credenciales inválidas.' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor al iniciar sesión.' });
    }
};

// @desc    Obtener datos del usuario actual (ruta protegida)
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    // req.user viene del middleware 'protect'
    if (req.user) {
        res.json({
            id: req.user.id,
            username: req.user.username,
            email: req.user.email,
            role: req.user.role.name
        });
    } else {
        res.status(404).json({ message: 'Usuario no encontrado.' });
    }
};


module.exports = {
    registerUser,
    loginUser,
    getMe,
};