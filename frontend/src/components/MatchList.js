import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import matchService from '../services/matchService';
import tournamentService from '../services/tournamentService';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaPlus, FaEdit, FaTrash, FaFilter } from 'react-icons/fa';
import { io } from 'socket.io-client'; // ✅ NUEVO

const socket = io(); // Se conecta automáticamente al mismo host

const MatchList = () => {
    const [matches, setMatches] = useState([]);
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);

    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const location = useLocation();

    const preselectedTournamentId = location.state?.tournamentId;
    const [selectedTournament, setSelectedTournament] = useState(preselectedTournamentId || '');

    useEffect(() => {
        const fetchTournamentsForFilter = async () => {
            try {
                const data = await tournamentService.getTournaments(user.token);
                setTournaments(data);
            } catch (error) {
                toast.error('Error al cargar la lista de torneos para el filtro.');
            }
        };
        if (user) {
            fetchTournamentsForFilter();
        }
    }, [user]);

    const fetchMatches = useCallback(async () => {
        setLoading(true);
        try {
            const data = await matchService.getMatches(user.token, selectedTournament);
            setMatches(data);
        } catch (error) {
            toast.error('Error al cargar los partidos.');
        } finally {
            setLoading(false);
        }
    }, [user.token, selectedTournament]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchMatches();
    }, [user, navigate, fetchMatches]);

    // ✅ ESCUCHA DE EVENTOS EN TIEMPO REAL
    useEffect(() => {
        socket.on('matchUpdated', (match) => {
            toast.info(`Partido actualizado: ${match.localTeam?.name} vs ${match.visitorTeam?.name}`);
            fetchMatches();
        });

        socket.on('timeoutRequested', (match) => {
            const team = match.localTeamId === match.timeoutTeamId ? 'Local' : 'Visitante';
            toast.warn(`Tiempo fuera solicitado por el equipo ${team}`);
            fetchMatches();
        });

        socket.on('timeoutEnded', (match) => {
            toast.success(`Tiempo fuera finalizado en el partido: ${match.localTeamId} vs ${match.visitorTeamId}`);
            fetchMatches();
        });

        return () => {
            socket.off('matchUpdated');
            socket.off('timeoutRequested');
            socket.off('timeoutEnded');
        };
    }, [fetchMatches]);

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este partido?')) {
            try {
                await matchService.deleteMatch(id, user.token);
                toast.success('Partido eliminado exitosamente.');
                fetchMatches();
            } catch (error) {
                toast.error('Error al eliminar el partido.');
            }
        }
    };

    const formatDateTime = (dateString, timeString) => {
        if (!dateString) return 'Fecha no definida';
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000).toLocaleDateString('es-HN', options);
        return `${formattedDate} ${timeString ? timeString.substring(0, 5) : ''}`;
    };

    return (
        <div className="management-container bg-white p-6 rounded-lg shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                    <FaCalendarAlt className="mr-3 text-blue-600" /> Gestión de Partidos
                </h2>
                <Link to="/matches/new" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 flex items-center">
                    <FaPlus className="mr-2" /> Crear Partido
                </Link>
            </div>

            {/* Filtro por Torneo */}
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                <label htmlFor="tournamentFilter" className="block text-gray-700 text-sm font-bold mb-2 flex items-center">
                    <FaFilter className="mr-2" /> Filtrar por Torneo:
                </label>
                <select
                    id="tournamentFilter"
                    value={selectedTournament}
                    onChange={(e) => setSelectedTournament(e.target.value)}
                    className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="">-- Mostrar todos los torneos --</option>
                    {tournaments.map((t) => (
                        <option key={t.id} value={t.id}>
                            {t.name}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="text-center py-10">Cargando partidos...</div>
            ) : matches.length === 0 ? (
                <p className="text-center text-gray-600 py-10">No hay partidos para el filtro seleccionado.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Torneo</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Jornada</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Fecha y Hora</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Encuentro</th>
                                <th className="py-3 px-4 border-b text-center text-sm font-semibold text-gray-600">Marcador (Sets)</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Estado</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {matches.map((match) => (
                                <tr key={match.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="py-3 px-4 text-xs">{match.tournament?.name || 'N/A'}</td>
                                    <td className="py-3 px-4">{match.phase || 'N/A'}</td>
                                    <td className="py-3 px-4">{formatDateTime(match.matchDate, match.matchTime)}</td>
                                    <td className="py-3 px-4 font-semibold">
                                        {match.localTeam?.name || 'N/A'} vs {match.visitorTeam?.name || 'N/A'}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <div className="font-bold text-lg">
                                            {match.status === 'Completado' ? `${match.team1Score || 0} - ${match.team2Score || 0}` : '-'}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {match.setScores && match.setScores.length > 0 &&
                                                `(${match.setScores.map(s => `${s.team1Score}-${s.team2Score}`).join(', ')})`
                                            }
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                            ${match.status === 'Programado' ? 'bg-blue-200 text-blue-800' : ''}
                                            ${match.status === 'Completado' ? 'bg-green-200 text-green-800' : ''}
                                            ${match.status === 'Cancelado' ? 'bg-red-200 text-red-800' : ''}
                                            ${match.status === 'Activo' ? 'bg-yellow-200 text-yellow-800' : ''}
                                        `}>
                                            {match.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 flex space-x-2">
                                        <Link to={`/matches/edit/${match.id}`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm">
                                            <FaEdit />
                                        </Link>
                                        <button onClick={() => handleDelete(match.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm">
                                            <FaTrash />
                                        </button>
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

export default MatchList;
