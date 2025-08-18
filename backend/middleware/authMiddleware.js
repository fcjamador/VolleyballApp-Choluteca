const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const db = require('../models');
const User = db.User;
const Role = db.Role;

// Middleware para proteger rutas, verifica el token JWT
const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Obtener el token del header 'Bearer <token>'
            token = req.headers.authorization.split(' ')[1];

            // Verificar el token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Obtener el usuario del token (sin la contraseña) y con su rol
            req.user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] },
                include: [{ model: Role, as: 'role' }]
            });

            if (!req.user) {
                res.status(401);
                throw new Error('No autorizado, usuario no encontrado');
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('No autorizado, token inválido');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('No autorizado, no se encontró token');
    }
});

// Middleware para autorizar basado en roles de usuario
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role || !allowedRoles.includes(req.user.role.name)) {
            res.status(403); // 403 Forbidden
            throw new Error(`Acceso denegado. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`);
        }
        next(); // El usuario tiene el rol correcto, continuar
    };
};

module.exports = { protect, authorize };