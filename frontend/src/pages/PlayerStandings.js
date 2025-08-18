import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import playerService from '../services/playerService';
import { toast } from 'react-toastify';
import { FaTrophy, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const PlayerStandings = () => {
    const [standings, setStandings] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useSelector((state) => state.auth);

    const fetchStandings = useCallback(async () => {
        if (!user?.token) return;
        setLoading(true);
        try {
            const data = await playerService.getPlayerStandings(user.token);
            setStandings(data);
        } catch (error) {
            toast.error('Error al cargar la tabla de posiciones de jugadores.');
            console.error('Error fetching player standings:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.token]);

    useEffect(() => {
        fetchStandings();
    }, [fetchStandings]);

    return (
        <div className="management-container bg-white p-6 rounded-lg shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                    <FaTrophy className="mr-3 text-yellow-500" />
                    Tabla de Puntos por Jugador
                </h2>
                <Link to="/players" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md transition duration-300 flex items-center">
                    <FaArrowLeft className="mr-2" /> Volver a Jugadores
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-10">Cargando tabla de posiciones...</div>
            ) : standings.length === 0 ? (
                <p className="text-center text-gray-600 py-10">No hay jugadores para mostrar posiciones.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-4 border-b text-center text-sm font-semibold text-gray-600">Pos</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Jugador</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Equipo</th>
                                <th className="py-3 px-4 border-b text-center text-sm font-semibold text-gray-600">Puntos</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {standings.map((player, index) => (
                                <tr key={player.id} className={`border-b border-gray-200 hover:bg-gray-50 ${index < 3 ? 'bg-yellow-50' : ''}`}>
                                    <td className="py-3 px-4 text-center font-bold">{index + 1}</td>
                                    <td className="py-3 px-4 font-semibold">{`${player.firstName} ${player.lastName}`}</td>
                                    <td className="py-3 px-4">{player.team?.name || 'Sin equipo'}</td>
                                    <td className="py-3 px-4 text-center font-bold text-lg">{player.points}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PlayerStandings;
