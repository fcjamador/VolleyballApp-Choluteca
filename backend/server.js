require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { sequelize } = require('./config/database');
const db = require('./models');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const teamRoutes = require('./routes/teamRoutes');
const tournamentRoutes = require('./routes/tournamentRoutes');
const playerRoutes = require('./routes/playerRoutes');
const matchRoutes = require('./routes/matchRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas base
app.get('/', (req, res) => {
    res.send('API de Ligas de Voleibol en funcionamiento!');
});
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/matches', matchRoutes);

// Middleware de manejo de errores
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  res.status(statusCode);
  console.error(err.stack);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
app.use(errorHandler);

// Inicialización de roles y superadmin
const initializeDatabase = async () => {
    try {
        const roles = ['User', 'Admin', 'Superadmin'];
        for (const roleName of roles) {
            await db.Role.findOrCreate({
                where: { name: roleName },
                defaults: { name: roleName }
            });
        }
        console.log('Roles verificados/creados en la base de datos.');

        const userCount = await db.User.count();
        if (userCount === 0) {
            const superadminRole = await db.Role.findOne({ where: { name: 'Superadmin' } });
            if (!superadminRole) {
                console.error('El rol de Superadmin no se encontró. No se puede crear el superadmin.');
                return;
            }

            const hashedPassword = await bcrypt.hash(process.env.DEFAULT_SUPERADMIN_PASSWORD, 10);

            await db.User.create({
                username: 'superadmin',
                email: 'superadmin@volleyball.com',
                password: hashedPassword,
                roleId: superadminRole.id,
                isActive: true
            });

            console.log('>>> Cuenta de Superadmin creada. Email: superadmin@volleyball.com');
        }
    } catch (error) {
        console.error('Error durante la inicialización de la base de datos:', error);
    }
};

// 🔌 Socket.IO setup
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { origin: '*' }
});
app.set('io', io); // Esto lo usarás en los controladores para emitir eventos

// Iniciar servidor
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida exitosamente.');
        await initializeDatabase();
        server.listen(PORT, () => {
            console.log(`Servidor backend corriendo en el puerto ${PORT}`);
        });
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    }
};

startServer();
