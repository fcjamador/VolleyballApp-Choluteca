const jwt = require('jsonwebtoken');
const db = require('../models'); // Importa tus modelos
const User = db.User; // Accede al modelo User

// Middleware para verificar si el usuario está autenticado
const protect = async (req, res, next) => {
    let token;

    // Verifica si el token está en los headers de la petición (Bearer Token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extrae el token
            token = req.headers.authorization.split(' ')[1];

            // Verifica el token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Busca el usuario por ID y lo adjunta al objeto de la petición (req.user)
            // Excluye la contraseña para seguridad
            req.user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] },
                include: [{ model: db.Role, as: 'role' }] // Incluye el rol del usuario
            });

            if (!req.user) {
                return res.status(401).json({ message: 'No autorizado, usuario no encontrado' });
            }

            next(); // Pasa al siguiente middleware o a la ruta
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'No autorizado, token fallido' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'No autorizado, no hay token' });
    }
};

// Middleware para verificar roles (autorización)
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role || !roles.includes(req.user.role.name)) {
            return res.status(403).json({ message: `Acceso denegado. Se requieren los roles: ${roles.join(', ')}` });
        }
        next();
    };
};

module.exports = { protect, authorizeRoles };