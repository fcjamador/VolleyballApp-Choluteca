// Ruta: d:/VolleyballApp/VolleyballApp-Choluteca/frontend/src/services/tournamentService.js

import axios from 'axios';
import { BASE_API_URL } from '../config';

const API_URL = `${BASE_API_URL}/tournaments`;

// Obtener todos los torneos
const getTournaments = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(API_URL, config);
    return response.data;
};

// Obtener un torneo por ID
const getTournamentById = async (id, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(`${API_URL}/${id}`, config);
    return response.data;
};

// Crear un nuevo torneo
const createTournament = async (tournamentData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    };
    const response = await axios.post(API_URL, tournamentData, config);
    return response.data;
};

// Actualizar un torneo
const updateTournament = async (id, tournamentData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    };
    const response = await axios.put(`${API_URL}/${id}`, tournamentData, config);
    return response.data;
};

// Eliminar un torneo
const deleteTournament = async (id, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.delete(`${API_URL}/${id}`, config);
    return response.data;
};

// --- FUNCIÓN MODIFICADA ---
// Generar partidos para un torneo
const generateMatches = async (tournamentId, data, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    };
    const response = await axios.post(`${API_URL}/${tournamentId}/generate-matches`, data, config);
    return response.data;
};

// Añadir un equipo a un torneo
const addTeamToTournament = async (tournamentId, teamId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(`${API_URL}/${tournamentId}/teams`, { teamId }, config);
    return response.data;
};

// Quitar un equipo de un torneo
const removeTeamFromTournament = async (tournamentId, teamId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.delete(`${API_URL}/${tournamentId}/teams/${teamId}`, config);
    return response.data;
};

// Obtener los equipos inscritos en un torneo
const getTeamsInTournament = async (tournamentId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(`${API_URL}/${tournamentId}/teams`, config);
    return response.data;
};

// Obtener la tabla de posiciones de un torneo
const getTournamentStandings = async (tournamentId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(`${API_URL}/${tournamentId}/standings`, config);
    return response.data;
};

const tournamentService = {
    createTournament,
    getTournaments,
    getTournamentById,
    updateTournament,
    deleteTournament,
    generateMatches,
    addTeamToTournament,
    removeTeamFromTournament,
    getTeamsInTournament,
    getTournamentStandings,
};

export default tournamentService;
