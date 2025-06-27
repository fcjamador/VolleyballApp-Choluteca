const express = require('express');
const { getUsers, getUserById, updateUser, deleteUser, createUserByAdmin } = require('../controllers/userController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Rutas de gestión de usuarios (solo para Admin y Superadmin)
// Para obtener todos los usuarios
router.get('/', protect, authorizeRoles('Admin', 'Superadmin'), getUsers);
// Para crear un nuevo usuario por un Admin/Superadmin
router.post('/', protect, authorizeRoles('Admin', 'Superadmin'), createUserByAdmin);
// Para obtener, actualizar o eliminar un usuario específico
router.route('/:id')
    .get(protect, authorizeRoles('Admin', 'Superadmin'), getUserById)
    .put(protect, authorizeRoles('Admin', 'Superadmin'), updateUser) // Admin puede cambiar isActive, Superadmin también el rol
    .delete(protect, authorizeRoles('Superadmin'), deleteUser); // Solo Superadmin puede eliminar

module.exports = router;