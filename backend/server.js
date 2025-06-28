require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // Necesario para el hash del superadmin inicial
const { connectDB, sequelize } = require('./config/database');
const db = require('./models');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const teamRoutes = require('./routes/teamRoutes'); // Nueva
const playerRoutes = require('./routes/playerRoutes'); // Nueva

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.get('/', (req, res) => {
    res.send('API de Ligas de Voleibol en funcionamiento!');
});
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes); // Nueva ruta para equipos
app.use('/api/players', playerRoutes); // Nueva ruta para jugadores


// Inicia el servidor y la conexión a la base de datos
const startServer = async () => {
    await connectDB();
    // Sincroniza los modelos con la base de datos.
    // `force: true` borrará las tablas existentes y las recreará.
    // ¡Úsalo con precaución solo en desarrollo! En producción, usarías migraciones.
    await db.sequelize.sync({ force: true });
    console.log("¡Todas las tablas han sido creadas/sincronizadas!");

    // Opcional: Insertar roles iniciales si no existen (asegurando IDs específicos)
    const [superadminRole] = await db.Role.findOrCreate({ where: { name: 'Superadmin' } });
    const [adminRole] = await db.Role.findOrCreate({ where: { name: 'Admin' } });
    const [normalRole] = await db.Role.findOrCreate({ where: { name: 'Normal' } });
    console.log("Roles iniciales insertados o ya existen.");

    // Crear un usuario Superadmin por defecto si no existe (solo para desarrollo inicial)
    const superadminExists = await db.User.findOne({ where: { email: 'superadmin@example.com' } });
    if (!superadminExists) {
        const hashedPassword = await bcrypt.hash('supersecret123', 10);
        await db.User.create({
            username: 'SuperAdminMaster',
            email: 'superadmin@example.com',
            password: hashedPassword,
            roleId: superadminRole.id,
            isActive: true
        });
        console.log("Usuario Superadmin por defecto creado.");
    }


    app.listen(PORT, () => {
        console.log(`Servidor backend corriendo en el puerto ${PORT}`);
        console.log(`Accede a http://localhost:${PORT}`);
    });
};

startServer();