require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { connectDB, sequelize } = require('./config/database');
const db = require('./models');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json()); // Para parsear el body de las peticiones JSON

// Rutas
app.get('/', (req, res) => {
    res.send('API de Ligas de Voleibol en funcionamiento!');
});
app.use('/api/auth', authRoutes); // Rutas de autenticación
app.use('/api/users', userRoutes); // Rutas de gestión de usuarios

/**
 * Inserta los roles iniciales en la base de datos si no existen.
 */
const seedInitialRoles = async () => {
    const [superadminRole] = await db.Role.findOrCreate({ where: { name: 'Superadmin' } });
    const [adminRole] = await db.Role.findOrCreate({ where: { name: 'Admin' } });
    const [normalRole] = await db.Role.findOrCreate({ where: { name: 'Normal' } });
    console.log("Roles iniciales insertados o ya existen.");
    return { superadminRole, adminRole, normalRole };
};

/**
 * Crea un usuario Superadmin por defecto si no existe.
 * @param {object} superadminRole - El objeto del rol de Superadmin.
 */
const createDefaultSuperadmin = async (superadminRole) => {
    const superadminExists = await db.User.findOne({ where: { email: 'superadmin@example.com' } });
    if (!superadminExists) {
        const hashedPassword = await bcrypt.hash(process.env.DEFAULT_SUPERADMIN_PASSWORD, 10); // Contraseña segura para superadmin inicial
        await db.User.create({
            username: 'SuperAdminMaster',
            email: 'superadmin@example.com',
            password: hashedPassword,
            roleId: superadminRole.id,
            isActive: true,
        });
        console.log("Usuario Superadmin por defecto creado.");
    }
};

// Inicia el servidor y la conexión a la base de datos
const startServer = async () => {
    await connectDB();
    // ¡PRECAUCIÓN! `force: true` borra las tablas. Ideal solo para desarrollo.
    await db.sequelize.sync({ force: true });
    console.log("¡Todas las tablas han sido creadas/sincronizadas!");

    const { superadminRole } = await seedInitialRoles();
    await createDefaultSuperadmin(superadminRole);
    
    app.listen(PORT, () => {
        console.log(`Servidor backend corriendo en el puerto ${PORT}`);
        console.log(`Accede a http://localhost:${PORT}`);
    });
};
startServer();