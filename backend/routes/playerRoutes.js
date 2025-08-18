const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getPlayers,
    getPlayerById,
    createPlayer,
    updatePlayer,
    deletePlayer,
    uploadPlayerPoints,
    getPlayerStandings, // Importar la nueva función
} = require('../controllers/playerController');
const multer = require('multer');

// Configurar multer para manejar la subida de archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Proteger todas las rutas de jugadores
router.use(protect);

// Nueva ruta para la tabla de posiciones de jugadores (accesible a todos los logueados)
router.route('/standings').get(getPlayerStandings);

// Rutas CRUD para jugadores
router.route('/')
    .get(getPlayers)
    .post(authorize('Admin', 'Superadmin'), createPlayer);

router.route('/:id')
    .get(getPlayerById)
    .put(authorize('Admin', 'Superadmin'), updatePlayer)
    .delete(authorize('Admin', 'Superadmin'), deletePlayer);

// Nueva ruta para subir el archivo de puntos
// 'pointsFile' debe coincidir con el nombre del campo en el formulario del frontend
router.post(
    '/upload-points',
    authorize('Admin', 'Superadmin'),
    upload.single('pointsFile'),
    uploadPlayerPoints
);

module.exports = router;
