import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import tournamentService from '../services/tournamentService';
import teamService from '../services/teamService';
import { FaUsers, FaPlus, FaTrash } from 'react-icons/fa';

function TournamentTeamManagement() {
    const { id: tournamentId } = useParams();
    const { user } = useSelector((state) => state.auth);

    const [tournament, setTournament] = useState(null);
    const [allTeams, setAllTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchTournamentData = useCallback(async () => {
        try {
            setLoading(true);
            // Hacemos las dos llamadas a la API al mismo tiempo para más eficiencia
            const [tournamentData, allTeamsData] = await Promise.all([
                tournamentService.getTournamentById(tournamentId, user.token),
                teamService.getTeams(user.token)
            ]);
            setTournament(tournamentData);
            setAllTeams(allTeamsData);
        } catch (error) {
            toast.error('Error al cargar los datos del torneo y equipos.');
        } finally {
            setLoading(false);
        }
    }, [tournamentId, user.token]);

    useEffect(() => {
        fetchTournamentData();
    }, [fetchTournamentData]);

    const handleAddTeam = async (e) => {
        e.preventDefault();
        if (!selectedTeam) {
            toast.warn('Por favor, selecciona un equipo para añadir.');
            return;
        }
        try {
            await tournamentService.addTeamToTournament(tournamentId, selectedTeam, user.token);
            toast.success('Equipo añadido al torneo exitosamente.');
            setSelectedTeam('');
            fetchTournamentData(); // Recargar datos para ver el cambio
        } catch (error) {
            const message = error.response?.data?.message || 'Error al añadir el equipo.';
            toast.error(message);
        }
    };

    const handleRemoveTeam = async (teamId) => {
        if (window.confirm('¿Estás seguro de que quieres quitar este equipo del torneo?')) {
            try {
                await tournamentService.removeTeamFromTournament(tournamentId, teamId, user.token);
                toast.success('Equipo quitado del torneo.');
                fetchTournamentData(); // Recargar datos para ver el cambio
            } catch (error) {
                toast.error('Error al quitar el equipo.');
            }
        }
    };

    if (loading) return <div className="text-center py-10">Cargando gestión de equipos...</div>;
    if (!tournament) return <div className="text-center py-10">Torneo no encontrado.</div>;

    // Filtramos los equipos que ya están en el torneo para no mostrarlos en el selector
    const associatedTeamIds = new Set(tournament.Teams.map(t => t.id));
    const availableTeams = allTeams.filter(t => !associatedTeamIds.has(t.id));

    return (
        <div className="management-container bg-white p-6 rounded-lg shadow-xl max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center">
                <FaUsers className="mr-3 text-teal-600" />
                Gestionar Equipos en: {tournament.name}
            </h2>

            {/* Formulario para añadir equipos */}
            <form onSubmit={handleAddTeam} className="mb-8 p-4 border rounded-lg bg-gray-50">
                <h3 className="text-xl font-semibold mb-2">Añadir Equipo al Torneo</h3>
                <div className="flex items-center space-x-4">
                    <select
                        value={selectedTeam}
                        onChange={(e) => setSelectedTeam(e.target.value)}
                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    >
                        <option value="">-- Selecciona un equipo --</option>
                        {availableTeams.map(team => (
                            <option key={team.id} value={team.id}>{team.name}</option>
                        ))}
                    </select>
                    <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md flex items-center shrink-0">
                        <FaPlus className="mr-2" /> Añadir
                    </button>
                </div>
            </form>

            {/* Lista de equipos inscritos */}
            <div>
                <h3 className="text-xl font-semibold mb-4">Equipos Inscritos ({tournament.Teams.length})</h3>
                <ul className="space-y-2">
                    {tournament.Teams.map(team => (
                        <li key={team.id} className="flex justify-between items-center p-3 bg-gray-100 rounded-md">
                            <span className="font-medium">{team.name}</span>
                            <button onClick={() => handleRemoveTeam(team.id)} className="text-red-500 hover:text-red-700">
                                <FaTrash />
                            </button>
                        </li>
                    ))}
                    {tournament.Teams.length === 0 && <p className="text-gray-500">Aún no hay equipos inscritos en este torneo.</p>}
                </ul>
            </div>
             <Link to="/tournaments" className="text-blue-600 hover:underline mt-6 inline-block">
                &larr; Volver a la lista de torneos
            </Link>
        </div>
    );
}

export default TournamentTeamManagement;