import axios from 'axios';
import { BASE_API_URL } from '../config';

const API_URL = `${BASE_API_URL}/matches/`;

// Obtener todos los partidos (opcionalmente filtrados por torneo)
const getMatches = async (token, tournamentId = '') => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params: {}
    };
    if (tournamentId) {
        config.params.tournamentId = tournamentId;
    }
    const response = await axios.get(API_URL, config);
    return response.data;
};

// Obtener un partido por ID
const getMatchById = async (matchId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(API_URL + matchId, config);
    return response.data;
};

// ✅ FUNCIÓN CORREGIDA: Obtener partido público sin autenticación
const getMatchPublic = async (matchId) => {
    const response = await axios.get(API_URL + `public/${matchId}`);
    return response.data;
};

// Crear un nuevo partido
const createMatch = async (matchData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.post(API_URL, matchData, config);
    return response.data;
};

// Actualizar un partido
const updateMatch = async (matchId, matchData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.put(API_URL + matchId, matchData, config);
    return response.data;
};

// Eliminar un partido
const deleteMatch = async (matchId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.delete(API_URL + matchId, config);
    return response.data;
};

// --- Solicitar tiempo fuera ---
const requestTimeout = async (matchId, teamId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.post(API_URL + `${matchId}/timeout`, { teamId }, config);
    return response.data;
};

// --- Finalizar tiempo fuera ---
const endTimeout = async (matchId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.post(API_URL + `${matchId}/end-timeout`, {}, config);
    return response.data;
};

const matchService = {
    getMatches,
    getMatchById,
    getMatchPublic, // 👈 Ya corregido
    createMatch,
    updateMatch,
    deleteMatch,
    requestTimeout,
    endTimeout,
};

export default matchService;
