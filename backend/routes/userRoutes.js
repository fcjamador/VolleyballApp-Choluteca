const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUserById,
    getRoles,
    updateUser,
    deleteUser,
    createUserByAdmin
} = require('../controllers/userController');

// Importar middlewares
const { protect, authorize } = require('../middleware/authMiddleware');

// Definir rutas y protegerlas con roles
router.route('/')
    .get(protect, authorize('Admin', 'Superadmin'), getUsers)
    .post(protect, authorize('Admin', 'Superadmin'), createUserByAdmin);

router.get('/roles', protect, authorize('Admin', 'Superadmin'), getRoles);

router.route('/:id')
    .get(protect, authorize('Admin', 'Superadmin'), getUserById)
    .put(protect, authorize('Admin', 'Superadmin'), updateUser)
    .delete(protect, authorize('Superadmin'), deleteUser);

module.exports = router;