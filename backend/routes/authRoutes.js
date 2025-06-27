const express = require('express');
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser); // Ruta pública para registrar usuarios (por defecto 'Normal')
router.post('/login', loginUser);       // Ruta pública para iniciar sesión
router.get('/me', protect, getMe);      // Ruta protegida para obtener datos del usuario logueado

module.exports = router;