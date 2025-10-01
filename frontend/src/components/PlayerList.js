import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import playerService from '../services/playerService';
import { toast } from 'react-toastify';
import { FaUserPlus, FaUsers, FaFileUpload, FaTrophy, FaEdit, FaTrash } from 'react-icons/fa';

const PlayerList = () => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const fetchPlayers = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await playerService.getPlayers(user.token);
            setPlayers(data);
        } catch (error) {
            toast.error('Error al cargar los jugadores.');
            console.error('Error fetching players:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!user || user.role !== 'Admin') {
            toast.error('No autorizado para acceder a esta página.');
            navigate('/dashboard');
        } else {
            fetchPlayers();
        }
    }, [user, navigate, fetchPlayers]);

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este jugador?')) {
            try {
                await playerService.deletePlayer(id, user.token);
                toast.success('Jugador eliminado exitosamente.');
                fetchPlayers(); // Refresh the list
            } catch (error) {
                toast.error('Error al eliminar el jugador.');
                console.error('Error deleting player:', error);
            }
        }
    };

    if (loading) {
        return <div className="text-center py-10">Cargando jugadores...</div>;
    }

    return (
        <div className="management-container bg-white p-6 rounded-lg shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                    <FaUsers className="mr-3 text-blue-600" /> Gestión de Jugadores
                </h2>
                <div className="flex space-x-2">
                    <Link to="/players/standings" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 flex items-center">
                        <FaTrophy className="mr-2" /> Ver Posiciones
                    </Link>
                    <Link to="/players/upload-points" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 flex items-center">
                        <FaFileUpload className="mr-2" /> Cargar Puntos
                    </Link>
                    <Link to="/players/new" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 flex items-center">
                        <FaUserPlus className="mr-2" /> Crear Jugador
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
                        <tbody className="text-gray-700">
                            {players.map((player) => (
                                <tr key={player.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="py-3 px-4 text-sm">{player.id}</td>
                                    <td className="py-3 px-4 text-sm">{player.firstName}</td>
                                    <td className="py-3 px-4 text-sm">{player.lastName}</td>
                                    <td className="py-3 px-4 text-sm font-mono">{player.nationalId || 'N/A'}</td>
                                    <td className="py-3 px-4 text-sm">{player.jerseyNumber || 'N/A'}</td>
                                    <td className="py-3 px-4 text-sm">{player.position || 'N/A'}</td>
                                    <td className="py-3 px-4 text-sm">{player.team ? player.team.name : 'Sin equipo'}</td>
                                    <td className="py-3 px-4 text-sm">
                                        <div className="flex space-x-2">
                                            <Link to={`/players/edit/${player.id}`} className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded-md transition duration-200 flex items-center text-xs">
                                                <FaEdit className="mr-1" /> Editar
                                            </Link>
                                            <button onClick={() => handleDelete(player.id)} className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded-md transition duration-200 flex items-center text-xs">
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
};

export default PlayerList;
