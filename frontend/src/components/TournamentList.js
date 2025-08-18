// Ruta: d:/VolleyballApp/VolleyballApp-Choluteca/frontend/src/components/TournamentList.js

import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import tournamentService from '../services/tournamentService';
import { toast } from 'react-toastify';
import { FaTrophy, FaPlus, FaEdit, FaTrash, FaCalendarPlus, FaUsersCog, FaListOl } from 'react-icons/fa';

function TournamentList() {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    // --- NUEVOS ESTADOS PARA EL MODAL ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [generatingTournament, setGeneratingTournament] = useState(null);
    const [numberOfGroups, setNumberOfGroups] = useState(2);

    const fetchTournaments = useCallback(async () => {
        setLoading(true);
        try {
            const data = await tournamentService.getTournaments(user.token);
            setTournaments(data);
        } catch (error) {
            toast.error('Error al cargar los torneos: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    }, [user.token]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchTournaments();
    }, [user, navigate, fetchTournaments]);

    const handleDeleteTournament = async (tournamentId) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este torneo?')) {
            return;
        }
        try {
            await tournamentService.deleteTournament(tournamentId, user.token);
            toast.success('Torneo eliminado exitosamente.');
            fetchTournaments();
        } catch (error) {
            toast.error('Error al eliminar torneo: ' + (error.response?.data?.message || error.message));
        }
    };

    // --- FUNCIÓN MODIFICADA PARA ABRIR EL MODAL ---
    const handleGenerateMatchesClick = (tournament) => {
        if (tournament.type === 'Group Stage') {
            setGeneratingTournament(tournament);
            setIsModalOpen(true);
        } else {
            if (!window.confirm(`¿Estás seguro de que quieres generar los partidos para el torneo "${tournament.name}"? Esto eliminará los partidos existentes.`)) {
                return;
            }
            callGenerateMatchesService(tournament.id, {});
        }
    };

    // --- NUEVA FUNCIÓN PARA CONFIRMAR DESDE EL MODAL ---
    const confirmAndGenerateMatches = async () => {
        if (!generatingTournament) return;
        if (numberOfGroups < 1) {
            toast.error("El número de grupos debe ser al menos 1.");
            return;
        }
        
        setIsModalOpen(false);
        callGenerateMatchesService(generatingTournament.id, { numberOfGroups: parseInt(numberOfGroups, 10) });
    };

    // --- NUEVA FUNCIÓN AUXILIAR PARA LLAMAR AL SERVICIO ---
    const callGenerateMatchesService = async (tournamentId, data) => {
        try {
            const response = await tournamentService.generateMatches(tournamentId, data, user.token);
            toast.success(response.message || 'Partidos generados exitosamente.');
            navigate('/matches', { state: { tournamentId: tournamentId } });
        } catch (error) {
            toast.error('Error al generar partidos: ' + (error.response?.data?.message || error.message));
        } finally {
            setGeneratingTournament(null);
            setNumberOfGroups(2);
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
        <>
            <div className="management-container bg-white p-6 rounded-lg shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                        <FaTrophy className="mr-3 text-blue-600" /> Gestión de Torneos
                    </h2>
                    <Link
                        to="/tournaments/new"
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 flex items-center"
                    >
                        <FaPlus className="mr-2" /> Crear Nuevo Torneo
                    </Link>
                </div>

                {tournaments.length === 0 ? (
                    <p className="text-center text-gray-600 py-10">No hay torneos registrados.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Nombre</th>
                                    <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Tipo</th>
                                    <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Equipos</th>
                                    <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tournaments.map((tournament) => (
                                    <tr key={tournament.id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm text-gray-800 font-semibold">{tournament.name}</td>
                                        <td className="py-3 px-4 text-sm text-gray-800">{tournament.type}</td>
                                        <td className="py-3 px-4 text-sm text-gray-800">{tournament.Teams.length}</td>
                                        <td className="py-3 px-4 text-sm text-gray-800">
                                            <div className="flex flex-wrap gap-2">
                                                <Link to={`/tournaments/edit/${tournament.id}`} className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded-md transition duration-200 flex items-center text-xs">
                                                    <FaEdit className="mr-1" /> Editar
                                                </Link>
                                                <Link to={`/tournaments/${tournament.id}/teams`} className="bg-teal-500 hover:bg-teal-600 text-white py-1 px-2 rounded-md transition duration-200 flex items-center text-xs">
                                                    <FaUsersCog className="mr-1" /> Equipos
                                                </Link>
                                                <Link to={`/tournaments/${tournament.id}/standings`} className="bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded-md transition duration-200 flex items-center text-xs">
                                                    <FaListOl className="mr-1" /> Posiciones
                                                </Link>
                                                <button onClick={() => handleGenerateMatchesClick(tournament)} className="bg-purple-500 hover:bg-purple-600 text-white py-1 px-2 rounded-md transition duration-200 flex items-center text-xs">
                                                    <FaCalendarPlus className="mr-1" /> Generar Partidos
                                                </button>
                                                <button onClick={() => handleDeleteTournament(tournament.id)} className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded-md transition duration-200 flex items-center text-xs">
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

            {/* --- NUEVO MODAL PARA PEDIR EL NÚMERO DE GRUPOS --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Generar Partidos para "{generatingTournament?.name}"</h3>
                        <p className="mb-4 text-sm text-gray-600">Este es un torneo de Fase de Grupos. Por favor, especifica cuántos grupos deseas crear.</p>
                        <label htmlFor="numberOfGroups" className="block text-sm font-medium text-gray-700">Número de Grupos:</label>
                        <input
                            type="number"
                            id="numberOfGroups"
                            value={numberOfGroups}
                            onChange={(e) => setNumberOfGroups(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                            min="1"
                        />
                        <div className="mt-6 flex justify-end space-x-4">
                            <button onClick={() => setIsModalOpen(false)} className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded-md">Cancelar</button>
                            <button onClick={confirmAndGenerateMatches} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md">Confirmar y Generar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default TournamentList;
