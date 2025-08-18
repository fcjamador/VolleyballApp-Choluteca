// Ruta: d:/VolleyballApp/VolleyballApp-Choluteca/frontend/src/components/ManageTournamentTeams.js

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import tournamentService from '../services/tournamentService';
import teamService from '../services/teamService';
import { FaUsersCog, FaArrowLeft, FaPlus, FaTrash } from 'react-icons/fa';

function ManageTournamentTeams() {
    const { tournamentId } = useParams();
    const { user } = useSelector((state) => state.auth);

    const [tournament, setTournament] = useState(null);
    const [enrolledTeams, setEnrolledTeams] = useState([]);
    const [availableTeams, setAvailableTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!user || !tournamentId) return;
        setLoading(true);
        try {
            // Cargar todo en paralelo para mejorar el rendimiento
            const [tournamentData, allTeamsData] = await Promise.all([
                tournamentService.getTournamentById(tournamentId, user.token),
                teamService.getTeams(user.token)
            ]);

            setTournament(tournamentData);
            const enrolled = tournamentData.Teams || [];
            setEnrolledTeams(enrolled);

            // Calcular equipos disponibles que no están inscritos
            const enrolledIds = new Set(enrolled.map(t => t.id));
            const available = allTeamsData.filter(t => !enrolledIds.has(t.id));
            setAvailableTeams(available);

        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Error desconocido';
            toast.error(`Error al cargar datos: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    }, [tournamentId, user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddTeam = async (e) => {
        e.preventDefault();
        if (!selectedTeam) {
            toast.warn('Por favor, selecciona un equipo para añadir.');
            return;
        }
        try {
            await tournamentService.addTeamToTournament(tournamentId, selectedTeam, user.token);
            toast.success('Equipo añadido al torneo exitosamente.');
            setSelectedTeam(''); // Resetear el selector
            fetchData(); // Recargar los datos
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Error desconocido';
            toast.error(`Error al añadir equipo: ${errorMessage}`);
        }
    };

    const handleRemoveTeam = async (teamId) => {
        if (!window.confirm('¿Estás seguro de que quieres quitar este equipo del torneo?')) {
            return;
        }
        try {
            await tournamentService.removeTeamFromTournament(tournamentId, teamId, user.token);
            toast.success('Equipo quitado del torneo exitosamente.');
            fetchData(); // Recargar los datos
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Error desconocido';
            toast.error(`Error al quitar equipo: ${errorMessage}`);
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
                    <FaUsersCog className="mr-3 text-teal-600" />
                    Gestionar Equipos en: {tournament?.name || 'Torneo'}
                </h2>
                <Link to="/tournaments" className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 flex items-center">
                    <FaArrowLeft className="mr-2" /> Volver a Torneos
                </Link>
            </div>

            {/* Formulario para añadir equipos */}
            <div className="mb-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-xl font-semibold mb-3">Añadir Equipo al Torneo</h3>
                <form onSubmit={handleAddTeam} className="flex items-end space-x-4">
                    <div className="flex-grow">
                        <label htmlFor="team-select" className="block text-sm font-medium text-gray-700">Equipos Disponibles</label>
                        <select id="team-select" value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500">
                            <option value="">-- Selecciona un equipo --</option>
                            {availableTeams.map(team => (<option key={team.id} value={team.id}>{team.name}</option>))}
                        </select>
                    </div>
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md shadow-md flex items-center">
                        <FaPlus className="mr-2" /> Añadir
                    </button>
                </form>
                {availableTeams.length === 0 && <p className="text-sm text-gray-500 mt-2">No hay más equipos disponibles para añadir.</p>}
            </div>

            {/* Lista de equipos inscritos */}
            <div>
                <h3 className="text-xl font-semibold mb-3">Equipos Inscritos ({enrolledTeams.length})</h3>
                {enrolledTeams.length === 0 ? (
                    <p className="text-center text-gray-600 py-10">Aún no hay equipos inscritos en este torneo.</p>
                ) : (
                    <ul className="space-y-2">
                        {enrolledTeams.map(team => (
                            <li key={team.id} className="flex justify-between items-center bg-gray-100 p-3 rounded-md">
                                <span className="font-medium text-gray-800">{team.name}</span>
                                <button
                                    onClick={() => handleRemoveTeam(team.id)}
                                    className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded-md transition duration-200 flex items-center text-xs"
                                >
                                    <FaTrash className="mr-1" /> Quitar
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default ManageTournamentTeams;
