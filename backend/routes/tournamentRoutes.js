// Ruta: backend/routes/tournamentRoutes.js

const express = require('express');
const router = express.Router();
const {
    getTournaments,
    getTournamentById,
    createTournament,
    updateTournament,
    deleteTournament,
    generateMatchesForTournament,
    addTeamToTournament,
    removeTeamFromTournament,
} = require('../controllers/tournamentController');

// Importamos nuestro nuevo controlador de posiciones
const { getStandings } = require('../controllers/standingsController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Rutas para torneos
router.route('/')
    .get(protect, getTournaments)
    .post(protect, authorize('Admin', 'Superadmin'), createTournament);

router.route('/:id')
    .get(protect, getTournamentById)
    .put(protect, authorize('Admin', 'Superadmin'), updateTournament)
    .delete(protect, authorize('Admin', 'Superadmin'), deleteTournament);

// Ruta para generar partidos
router.route('/:id/generate-matches')
    .post(protect, authorize('Admin', 'Superadmin'), generateMatchesForTournament);

// Rutas para gestionar equipos en un torneo
router.route('/:id/teams')
    .post(protect, authorize('Admin', 'Superadmin'), addTeamToTournament);

router.route('/:id/teams/:teamId')
    .delete(protect, authorize('Admin', 'Superadmin'), removeTeamFromTournament);

// RUTA PARA LA TABLA DE POSICIONES (Ahora apunta a nuestro nuevo controlador)
router.route('/:id/standings')
    .get(protect, getStandings);

module.exports = router;
