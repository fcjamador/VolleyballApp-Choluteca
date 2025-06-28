const express = require('express');
const { getPlayers, getPlayerById, createPlayer, updatePlayer, deletePlayer } = require('../controllers/playerController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Todas las rutas de jugadores requieren autenticación
router.use(protect);

// Rutas accesibles para todos los usuarios logueados
router.get('/', getPlayers);
router.get('/:id', getPlayerById);

// Rutas que requieren rol de Admin o Superadmin
router.post('/', authorizeRoles('Admin', 'Superadmin'), createPlayer);
router.put('/:id', authorizeRoles('Admin', 'Superadmin'), updatePlayer);
router.delete('/:id', authorizeRoles('Admin', 'Superadmin'), deletePlayer); // Puedes restringir DELETE solo a Superadmin si lo prefieres

module.exports = router;