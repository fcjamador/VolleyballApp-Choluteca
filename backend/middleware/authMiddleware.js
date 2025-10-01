// Ruta: backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const db = require('../models');
const User = db.User;
const Role = db.Role;

// Middleware para proteger rutas verificando el token JWT
const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Obtener el token del header 'Authorization: Bearer <token>'
            token = req.headers.authorization.split(' ')[1];

            // Verificar el token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Obtener el usuario desde la BD usando el ID del token y adjuntarlo al request
            // Excluimos la contraseña del objeto de usuario
            req.user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] },
                include: [{ model: Role, as: 'role' }] // Incluimos el rol del usuario
            });

            if (!req.user || !req.user.isActive) {
                res.status(401);
                throw new Error('No autorizado, usuario inactivo o no encontrado.');
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('No autorizado, token falló.');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('No autorizado, no se proporcionó un token.');
    }
});

// Middleware para autorizar basado en roles de usuario
const authorize = (...roles) => {
    return (req, res, next) => {
        // req.user y req.user.role son establecidos por el middleware 'protect'
        if (!req.user || !req.user.role || !roles.includes(req.user.role.name)) {
            res.status(403); // 403 Forbidden
            throw new Error(`Acceso denegado. Rol '${req.user.role.name}' no tiene permiso para acceder a este recurso.`);
        }
        next();
    };
};

module.exports = { protect, authorize };
