import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import playerService from '../services/playerService';
import { toast } from 'react-toastify';
import { FaUser, FaPlus, FaEdit, FaTrash, FaUpload, FaTrophy } from 'react-icons/fa'; // Importar FaTrophy

function PlayerList() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await playerService.getPlayers(user.token);
      setPlayers(data);
    } catch (error) {
      toast.error('Error al cargar los jugadores: ' + (error.response?.data?.message || error.message));
      console.error('Error fetching players:', error);
    } finally {
        setLoading(false);
    }
  }, [user.token]);

  useEffect(() => {
    if (!user || (user.role !== 'Admin' && user.role !== 'Superadmin')) {
      toast.error('No autorizado para acceder a la gestión de jugadores.');
      navigate('/dashboard');
      return;
    }
    fetchPlayers();
  }, [user, navigate, fetchPlayers]);

  const handleDeletePlayer = async (playerId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este jugador?')) {
      return;
    }
    try {
      await playerService.deletePlayer(playerId, user.token);
      toast.success('Jugador eliminado exitosamente.');
      fetchPlayers();
    } catch (error) {
      toast.error('Error al eliminar jugador: ' + (error.response?.data?.message || error.message));
      console.error('Error deleting player:', error);
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
          <FaUser className="mr-3 text-blue-600" /> Gestión de Jugadores
        </h2>
        <div className="flex space-x-2">
            <Link
              to="/players/standings"
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 flex items-center"
            >
              <FaTrophy className="mr-2" /> Ver Posiciones
            </Link>
            <Link
              to="/players/upload-points"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 flex items-center"
            >
              <FaUpload className="mr-2" /> Cargar Puntos
            </Link>
            <Link
              to="/players/new"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 flex items-center"
            >
              <FaPlus className="mr-2" /> Crear Jugador
            </Link>
        </div>
      </div>

      {players.length === 0 ? (
        <p className="text-center text-gray-600 py-10">No hay jugadores registrados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">ID</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Nombre</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Apellido</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">DNI / ID</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">No. Camiseta</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Posición</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Equipo</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => (
                <tr key={player.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-800">{player.id}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{player.firstName}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{player.lastName}</td>
                  <td className="py-3 px-4 text-sm text-gray-800 font-mono">{player.nationalId || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{player.jerseyNumber || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{player.position || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{player.team ? player.team.name : 'Sin equipo'}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">
                    <div className="flex space-x-2">
                      <Link
                        to={`/players/edit/${player.id}`}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded-md transition duration-200 flex items-center text-xs"
                      >
                        <FaEdit className="mr-1" /> Editar
                      </Link>
                      <button
                        onClick={() => handleDeletePlayer(player.id)}
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

export default PlayerList;
