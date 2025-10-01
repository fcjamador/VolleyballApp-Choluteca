require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path'); // Importar el módulo 'path'
const jwt = require('jsonwebtoken');
const db = require('./models');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const teamRoutes = require('./routes/teamRoutes');
const tournamentRoutes = require('./routes/tournamentRoutes');
const playerRoutes = require('./routes/playerRoutes');
const matchRoutes = require('./routes/matchRoutes');

// Importar manejador de sockets
const { handleLiveScoreUpdate } = require('./controllers/matchController');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde la carpeta 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// Inicialización de roles y admin
const initializeDatabase = async () => {
    try {
        const roles = ['User', 'Admin'];
        for (const roleName of roles) {
            await db.Role.findOrCreate({
                where: { name: roleName },
                defaults: { name: roleName }
            });
        }
        console.log('Roles verificados/creados en la base de datos.');

        const userCount = await db.User.count();
        if (userCount === 0) {
            const adminRole = await db.Role.findOne({ where: { name: 'Admin' } });
            if (!adminRole) {
                console.error('El rol de Admin no se encontró. No se puede crear el admin inicial.');
                return;
            }

            await db.User.create({
                username: 'admin',
                email: 'admin@volleyball.com',
                password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123', // Usamos una nueva variable de entorno
                roleId: adminRole.id,
                isActive: true
            });

            console.log('>>> Cuenta de Administrador creada. Email: admin@volleyball.com');
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
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000", // IMPORTANTE: Cambia esto por la URL de tu frontend
    methods: ["GET", "POST"]
  }
});

// Middleware de autenticación para Socket.IO
io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error: Token no proporcionado.'));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await db.User.findByPk(decoded.id, {
            include: [{ model: db.Role, as: 'role' }]
        });
        if (!user || !user.isActive) {
            return next(new Error('Authentication error: Usuario no válido o inactivo.'));
        }
        socket.user = user; // Adjuntamos el usuario y su rol al objeto socket.
        next();
    } catch (err) {
        return next(new Error('Authentication error: Token inválido.'));
    }
});

// Lógica principal de conexión de Socket.IO
io.on('connection', (socket) => {
    console.log(`Cliente conectado: ${socket.id} (Usuario: ${socket.user.username}, Rol: ${socket.user.role.name})`);

    socket.on('join:match:room', (matchId) => {
        socket.join(`match-${matchId}`);
        console.log(`Socket ${socket.id} se unió a la sala match-${matchId}`);
    });

    socket.on('leave:match:room', (matchId) => {
        socket.leave(`match-${matchId}`);
        console.log(`Socket ${socket.id} abandonó la sala match-${matchId}`);
    });

    handleLiveScoreUpdate(io, socket);

    socket.on('disconnect', () => {
        console.log(`Cliente desconectado: ${socket.id}`);
    });
});

app.set('io', io); // Esto lo usarás en los controladores para emitir eventos

// Iniciar servidor
const startServer = async () => {
    try {
        await db.sequelize.authenticate();
        console.log('Conexión a la base de datos establecida exitosamente.');

        // Sincroniza los modelos con la base de datos, creando las tablas si no existen.
        await db.sequelize.sync({ force: false }); // force: false para no borrar datos existentes.
        console.log('Modelos sincronizados con la base de datos.');

        await initializeDatabase();
        server.listen(PORT, () => {
            console.log(`Servidor backend corriendo en el puerto ${PORT}`);
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
    }
};

startServer();
