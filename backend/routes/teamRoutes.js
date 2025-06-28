const express = require('express');
const { getTeams, getTeamById, createTeam, updateTeam, deleteTeam } = require('../controllers/teamController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Todas las rutas de equipos requieren autenticación
router.use(protect);

// Rutas accesibles para todos los usuarios logueados
router.get('/', getTeams);
router.get('/:id', getTeamById);

// Rutas que requieren rol de Admin o Superadmin
router.post('/', authorizeRoles('Admin', 'Superadmin'), createTeam);
router.put('/:id', authorizeRoles('Admin', 'Superadmin'), updateTeam);
router.delete('/:id', authorizeRoles('Admin', 'Superadmin'), deleteTeam); // Puedes restringir DELETE solo a Superadmin si lo prefieres

module.exports = router;