import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Management.css'; // CSS general para las páginas de gestión

function PlayerManagement() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]); // Para la lista de equipos disponibles
  const [newPlayer, setNewPlayer] = useState({ firstName: '', lastName: '', jerseyNumber: '', position: '', teamId: '' });
  const [editingPlayer, setEditingPlayer] = useState(null); // Para el jugador que se está editando

  useEffect(() => {
    if (!user || (user.role !== 'Admin' && user.role !== 'Superadmin')) {
      navigate('/');
    } else {
      fetchPlayers();
      fetchTeams(); // Obtener lista de equipos para el selector
    }
  }, [user, navigate]);

  const fetchPlayers = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const response = await axios.get('http://localhost:5000/api/players', config);
      setPlayers(response.data);
    } catch (error) {
      console.error('Error fetching players:', error.response?.data?.message || error.message);
    }
  };

  const fetchTeams = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const response = await axios.get('http://localhost:5000/api/teams', config);
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error.response?.data?.message || error.message);
    }
  };

  const handleCreateChange = (e) => {
    setNewPlayer({ ...newPlayer, [e.target.name]: e.target.value });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      };
      await axios.post('http://localhost:5000/api/players', newPlayer, config);
      setNewPlayer({ firstName: '', lastName: '', jerseyNumber: '', position: '', teamId: '' });
      fetchPlayers();
      alert('Jugador creado exitosamente.');
    } catch (error) {
      console.error('Error creating player:', error.response?.data?.message || error.message);
      alert('Error al crear jugador: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditClick = (player) => {
    setEditingPlayer({ ...player, teamId: player.team ? player.team.id : '' }); // Copiar y asegurar teamId
  };

  const handleEditChange = (e) => {
    setEditingPlayer({ ...editingPlayer, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      };
      await axios.put(`http://localhost:5000/api/players/${editingPlayer.id}`, editingPlayer, config);
      setEditingPlayer(null);
      fetchPlayers();
      alert('Jugador actualizado exitosamente.');
    } catch (error) {
      console.error('Error updating player:', error.response?.data?.message || error.message);
      alert('Error al actualizar jugador: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeletePlayer = async (playerId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este jugador?')) {
      return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.delete(`http://localhost:5000/api/players/${playerId}`, config);
      fetchPlayers();
      alert('Jugador eliminado exitosamente.');
    } catch (error) {
      console.error('Error deleting player:', error.response?.data?.message || error.message);
      alert('Error al eliminar jugador: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="management-container">
      <h2>Gestión de Jugadores</h2>

      {/* Formulario para crear/editar jugador */}
      <form onSubmit={editingPlayer ? handleEditSubmit : handleCreateSubmit} className="management-form">
        <h3>{editingPlayer ? 'Editar Jugador' : 'Crear Nuevo Jugador'}</h3>
        <input
          type="text"
          name="firstName"
          value={editingPlayer ? editingPlayer.firstName : newPlayer.firstName}
          onChange={editingPlayer ? handleEditChange : handleCreateChange}
          placeholder="Nombre"
          required
        />
        <input
          type="text"
          name="lastName"
          value={editingPlayer ? editingPlayer.lastName : newPlayer.lastName}
          onChange={editingPlayer ? handleEditChange : handleCreateChange}
          placeholder="Apellido"
          required
        />
        <input
          type="number"
          name="jerseyNumber"
          value={editingPlayer ? (editingPlayer.jerseyNumber || '') : (newPlayer.jerseyNumber || '')}
          onChange={editingPlayer ? handleEditChange : handleCreateChange}
          placeholder="Número de Camiseta (opcional)"
        />
        <input
          type="text"
          name="position"
          value={editingPlayer ? (editingPlayer.position || '') : (newPlayer.position || '')}
          onChange={editingPlayer ? handleEditChange : handleCreateChange}
          placeholder="Posición (ej. Armador)"
        />
        <select
          name="teamId"
          value={editingPlayer ? editingPlayer.teamId : newPlayer.teamId}
          onChange={editingPlayer ? handleEditChange : handleCreateChange}
          required
        >
          <option value="">-- Seleccione Equipo --</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary">
          {editingPlayer ? 'Guardar Cambios' : 'Crear Jugador'}
        </button>
        {editingPlayer && (
          <button type="button" className="btn btn-secondary" onClick={() => setEditingPlayer(null)}>
            Cancelar
          </button>
        )}
      </form>

      {/* Lista de Jugadores */}
      <h3>Listado de Jugadores</h3>
      {players.length > 0 ? (
        <table className="management-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>No. Camiseta</th>
              <th>Posición</th>
              <th>Equipo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.id}>
                <td>{player.id}</td>
                <td>{player.firstName}</td>
                <td>{player.lastName}</td>
                <td>{player.jerseyNumber || 'N/A'}</td>
                <td>{player.position || 'N/A'}</td>
                <td>{player.team ? player.team.name : 'Sin equipo'}</td>
                <td className="actions-column">
                  <button onClick={() => handleEditClick(player)} className="btn btn-edit">Editar</button>
                  <button onClick={() => handleDeletePlayer(player.id)} className="btn btn-danger">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay jugadores registrados.</p>
      )}
    </div>
  );
}

export default PlayerManagement;