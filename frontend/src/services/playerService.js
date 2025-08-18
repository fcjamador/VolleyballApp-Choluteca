import axios from 'axios';
import { BASE_API_URL } from '../config';

const API_URL = `${BASE_API_URL}/players`;

// Get all players
const getPlayers = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(API_URL, config);
    return response.data;
};

// Get a player by ID
const getPlayerById = async (id, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(`${API_URL}/${id}`, config);
    return response.data;
};

// Create a new player
const createPlayer = async (playerData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    };
    const response = await axios.post(API_URL, playerData, config);
    return response.data;
};

// Update a player
const updatePlayer = async (id, playerData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    };
    const response = await axios.put(`${API_URL}/${id}`, playerData, config);
    return response.data;
};

// Delete a player
const deletePlayer = async (id, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.delete(`${API_URL}/${id}`, config);
    return response.data;
};

// Subir archivo de puntos de jugadores
const uploadPointsFile = async (file, token) => {
    const formData = new FormData();
    // 'pointsFile' debe coincidir con el nombre del campo esperado en el backend
    formData.append('pointsFile', file);

    const config = {
        headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await axios.post(`${API_URL}/upload-points`, formData, config);
    return response.data;
};

// Obtener la tabla de posiciones de jugadores
const getPlayerStandings = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(`${API_URL}/standings`, config);
    return response.data;
};

const playerService = {
    getPlayers,
    getPlayerById,
    createPlayer,
    updatePlayer,
    deletePlayer,
    uploadPointsFile,
    getPlayerStandings,
};

export default playerService;
