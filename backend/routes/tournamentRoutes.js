// Ruta: d:/VolleyballApp/VolleyballApp-Choluteca/backend/routes/tournamentRoutes.js

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// Importaciones de controladores
const tournamentController = require('../controllers/tournamentController');
const standingsController = require('../controllers/standingsController'); // Controlador correcto para standings

// --- Rutas de Torneos ---
router.route('/')
    .get(protect, tournamentController.getAllTournaments)
    .post(protect, authorize('Admin', 'Superadmin'), tournamentController.createTournament);

router.route('/:id')
    .get(protect, tournamentController.getTournamentById)
    .put(protect, authorize('Admin', 'Superadmin'), tournamentController.updateTournament)
    .delete(protect, authorize('Admin', 'Superadmin'), tournamentController.deleteTournament);

// --- Rutas de Equipos en Torneo ---
router.route('/:tournamentId/teams')
    .get(protect, tournamentController.getTeamsInTournament)
    .post(protect, authorize('Admin', 'Superadmin'), tournamentController.addTeamToTournament);

router.route('/:tournamentId/teams/:teamId')
    .delete(protect, authorize('Admin', 'Superadmin'), tournamentController.removeTeamFromTournament);

// --- Ruta para Generar Partidos ---
router.route('/:id/generate-matches')
    .post(protect, authorize('Admin', 'Superadmin'), tournamentController.generateMatches);

// --- RUTA CORREGIDA para Tabla de Posiciones ---
// Esta ruta ahora usa el controlador correcto: standingsController
router.route('/:id/standings')
    .get(protect, standingsController.getStandings);

module.exports = router;
