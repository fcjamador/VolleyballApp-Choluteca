import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Management.css'; // CSS general para las páginas de gestión

function TeamManagement() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [teams, setTeams] = useState([]);
  const [newTeam, setNewTeam] = useState({ name: '', coachName: '' });
  const [editingTeam, setEditingTeam] = useState(null); // Para el equipo que se está editando

  useEffect(() => {
    // Redirige si el usuario no está logueado o no es Admin/Superadmin
    if (!user || (user.role !== 'Admin' && user.role !== 'Superadmin')) {
      navigate('/');
    } else {
      fetchTeams();
    }
  }, [user, navigate]);

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
    setNewTeam({ ...newTeam, [e.target.name]: e.target.value });
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
      await axios.post('http://localhost:5000/api/teams', newTeam, config);
      setNewTeam({ name: '', coachName: '' }); // Limpiar formulario
      fetchTeams(); // Refrescar la lista
      alert('Equipo creado exitosamente.');
    } catch (error) {
      console.error('Error creating team:', error.response?.data?.message || error.message);
      alert('Error al crear equipo: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditClick = (team) => {
    setEditingTeam({ ...team }); // Copiar el equipo para edición
  };

  const handleEditChange = (e) => {
    setEditingTeam({ ...editingTeam, [e.target.name]: e.target.value });
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
      await axios.put(`http://localhost:5000/api/teams/${editingTeam.id}`, editingTeam, config);
      setEditingTeam(null); // Salir del modo edición
      fetchTeams(); // Refrescar la lista
      alert('Equipo actualizado exitosamente.');
    } catch (error) {
      console.error('Error updating team:', error.response?.data?.message || error.message);
      alert('Error al actualizar equipo: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este equipo?')) {
      return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.delete(`http://localhost:5000/api/teams/${teamId}`, config);
      fetchTeams(); // Refrescar la lista
      alert('Equipo eliminado exitosamente.');
    } catch (error) {
      console.error('Error deleting team:', error.response?.data?.message || error.message);
      alert('Error al eliminar equipo: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="management-container">
      <h2>Gestión de Equipos</h2>

      {/* Formulario para crear/editar equipo */}
      <form onSubmit={editingTeam ? handleEditSubmit : handleCreateSubmit} className="management-form">
        <h3>{editingTeam ? 'Editar Equipo' : 'Crear Nuevo Equipo'}</h3>
        <input
          type="text"
          name="name"
          value={editingTeam ? editingTeam.name : newTeam.name}
          onChange={editingTeam ? handleEditChange : handleCreateChange}
          placeholder="Nombre del Equipo"
          required
        />
        <input
          type="text"
          name="coachName"
          value={editingTeam ? editingTeam.coachName : newTeam.coachName}
          onChange={editingTeam ? handleEditChange : handleCreateChange}
          placeholder="Nombre del Entrenador (opcional)"
        />
        <button type="submit" className="btn btn-primary">
          {editingTeam ? 'Guardar Cambios' : 'Crear Equipo'}
        </button>
        {editingTeam && (
          <button type="button" className="btn btn-secondary" onClick={() => setEditingTeam(null)}>
            Cancelar
          </button>
        )}
      </form>

      {/* Lista de Equipos */}
      <h3>Listado de Equipos</h3>
      {teams.length > 0 ? (
        <table className="management-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Entrenador</th>
              <th>Jugadores</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => (
              <tr key={team.id}>
                <td>{team.id}</td>
                <td>{team.name}</td>
                <td>{team.coachName || 'N/A'}</td>
                <td>{team.players.map(p => p.firstName + ' ' + p.lastName).join(', ') || 'Ninguno'}</td>
                <td className="actions-column">
                  <button onClick={() => handleEditClick(team)} className="btn btn-edit">Editar</button>
                  <button onClick={() => handleDeleteTeam(team.id)} className="btn btn-danger">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay equipos registrados.</p>
      )}
    </div>
  );
}

export default TeamManagement;