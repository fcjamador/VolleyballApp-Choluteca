import axios from 'axios';
import { BASE_API_URL } from '../config';

const API_URL = `${BASE_API_URL}/teams`;

// Crear un equipo nuevo
const createTeam = async (teamData, token) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.post(API_URL, teamData, config);
  return response.data;
};

// Obtener todos los equipos
const getTeams = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(API_URL, config);
  return response.data;
};

// Obtener un equipo por su ID
const getTeamById = async (teamId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/${teamId}`, config);
  return response.data;
};

// Actualizar un equipo
const updateTeam = async (teamId, teamData, token) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.put(`${API_URL}/${teamId}`, teamData, config);
  return response.data;
};

// Eliminar un equipo
const deleteTeam = async (teamId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.delete(`${API_URL}/${teamId}`, config);
  return response.data;
};

const teamService = {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
};

export default teamService;