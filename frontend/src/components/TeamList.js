import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import teamService from '../services/teamService';
import { toast } from 'react-toastify';
import { FaVolleyballBall, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

function TeamList() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const data = await teamService.getTeams(user.token);
      setTeams(data);
    } catch (error) {
      toast.error('Error al cargar los equipos: ' + (error.response?.data?.message || error.message));
      console.error('Error fetching teams:', error);
    } finally {
        setLoading(false);
    }
  }, [user.token]);

  useEffect(() => {
    if (!user || (user.role !== 'Admin' && user.role !== 'Superadmin')) {
      toast.error('No autorizado para acceder a la gestión de equipos.');
      navigate('/dashboard');
      return;
    }
    fetchTeams();
  }, [user, navigate, fetchTeams]);

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este equipo?')) {
      return;
    }
    try {
      await teamService.deleteTeam(teamId, user.token);
      toast.success('Equipo eliminado exitosamente.');
      fetchTeams();
    } catch (error) {
      toast.error('Error al eliminar equipo: ' + (error.response?.data?.message || error.message));
      console.error('Error deleting team:', error);
    }
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        </div>
    );
  }

  return (
    <div className="management-container bg-white p-6 rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center">
          <FaVolleyballBall className="mr-3 text-blue-600" /> Gestión de Equipos
        </h2>
        <Link
          to="/teams/new"
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 flex items-center"
        >
          <FaPlus className="mr-2" /> Crear Nuevo Equipo
        </Link>
      </div>

      {teams.length === 0 ? (
        <p className="text-center text-gray-600 py-10">No hay equipos registrados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">ID</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Nombre</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Entrenador</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Jugadores</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-800">{team.id}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{team.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{team.coachName || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">
                    {team.players && team.players.length > 0
                        ? team.players.map(p => p.firstName).join(', ')
                        : 'Ninguno'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800">
                    <div className="flex space-x-2">
                      <Link
                        to={`/teams/edit/${team.id}`}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded-md transition duration-200 flex items-center text-xs"
                      >
                        <FaEdit className="mr-1" /> Editar
                      </Link>
                      <button
                        onClick={() => handleDeleteTeam(team.id)}
                        className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded-md transition duration-200 flex items-center text-xs"
                      >
                        <FaTrash className="mr-1" /> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TeamList;