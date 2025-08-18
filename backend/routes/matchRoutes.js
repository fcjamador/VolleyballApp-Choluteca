const express = require('express');
const router = express.Router();
const {
    getMatches,
    getMatchById,
    createMatch,
    updateMatch,
    deleteMatch,
    requestTimeout,
    endTimeout
} = require('../controllers/matchController');
const { protect, authorize } = require('../middleware/authMiddleware');

// ✅ NUEVA RUTA PÚBLICA PARA VISTA EN VIVO
router.get('/public/:id', getMatchById); // 👈 sin autenticación

// Rutas existentes
router.route('/')
    .get(protect, getMatches)
    .post(protect, authorize('Admin', 'Superadmin'), createMatch);

// Rutas para tiempos fuera
router.route('/:id/timeout').post(protect, authorize('Admin', 'Superadmin'), requestTimeout);
router.route('/:id/end-timeout').post(protect, authorize('Admin', 'Superadmin'), endTimeout);

// Rutas protegidas
router.route('/:id')
    .get(protect, getMatchById)
    .put(protect, authorize('Admin', 'Superadmin'), updateMatch)
    .delete(protect, authorize('Admin', 'Superadmin'), deleteMatch);

module.exports = router;
