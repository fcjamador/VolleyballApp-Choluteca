// frontend/src/services/userService.js
import axios from 'axios';
import { BASE_API_URL } from '../config';

const API_URL = `${BASE_API_URL}/users`;

// Obtener todos los usuarios
const getUsers = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(API_URL, config);
    return response.data;
};

// Obtener un usuario por ID
const getUserById = async (userId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(`${API_URL}/${userId}`, config);
    return response.data;
};

// Crear un nuevo usuario (por Admin/Superadmin)
const createUserByAdmin = async (userData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    };
    const response = await axios.post(API_URL, userData, config);
    return response.data;
};

// Actualizar un usuario (por Admin/Superadmin)
const updateUser = async (userId, userData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    };
    const response = await axios.put(`${API_URL}/${userId}`, userData, config);
    return response.data;
};

// Eliminar un usuario (por Superadmin)
const deleteUser = async (userId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.delete(`${API_URL}/${userId}`, config);
    return response.data;
};

// Obtener roles disponibles desde el backend
const getRoles = async (token) => {
    const config = { 
        headers: { Authorization: `Bearer ${token}` } 
    };
    // Llama a la ruta real del backend para obtener los roles
    const response = await axios.get(`${API_URL}/roles`, config);
    return response.data;
};


const userService = {
    getUsers,
    getUserById,
    createUserByAdmin,
    updateUser,
    deleteUser,
    getRoles,
};

export default userService;