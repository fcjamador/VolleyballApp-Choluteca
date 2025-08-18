// Ruta: d:/VolleyballApp/VolleyballApp-Choluteca/frontend/src/components/TournamentStandings.js

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import tournamentService from '../services/tournamentService';
import { FaListOl, FaArrowLeft } from 'react-icons/fa';

function TournamentStandings() {
    const { tournamentId } = useParams();
    const { user } = useSelector((state) => state.auth);

    const [standings, setStandings] = useState([]);
    const [tournamentName, setTournamentName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStandings = useCallback(async () => {
        if (!user || !tournamentId) return;

        setLoading(true);
        try {
            // Usamos la función que ya existe en tu servicio
            const data = await tournamentService.getTournamentStandings(tournamentId, user.token);
            setStandings(data.standings);
            setTournamentName(data.tournamentName);
            setError(null);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Error desconocido';
            const fullError = `Error al cargar la tabla de posiciones: ${errorMessage}`;
            setError(fullError);
            toast.error(fullError);
        } finally {
            setLoading(false);
        }
    }, [tournamentId, user]);

    useEffect(() => {
        fetchStandings();
    }, [fetchStandings]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="management-container bg-white p-6 rounded-lg shadow-xl text-center">
                <p className="text-red-500 bg-red-100 p-4 rounded-lg">{error}</p>
                <Link to="/tournaments" className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Volver a Torneos
                </Link>
            </div>
        );
    }

    return (
        <div className="management-container bg-white p-6 rounded-lg shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                    <FaListOl className="mr-3 text-blue-600" />
                    Tabla de Posiciones: {tournamentName}
                </h2>
                <Link to="/tournaments" className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 flex items-center">
                    <FaArrowLeft className="mr-2" /> Volver a Torneos
                </Link>
            </div>

            {standings.length === 0 ? (
                <p className="text-center text-gray-600 py-10">Aún no hay datos de posiciones para este torneo. Es posible que no se hayan jugado partidos o que no haya equipos inscritos.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pos</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipo</th>
                                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Puntos">Pts</th>
                                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Partidos Jugados">PJ</th>
                                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Partidos Ganados">PG</th>
                                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Partidos Perdidos">PP</th>
                                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Sets a Favor">SF</th>
                                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Sets en Contra">SC</th>
                                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Diferencia de Sets">Dif</th>
                                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Ratio de Sets">Ratio</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {standings.map((team, index) => (
                                <tr key={team.teamId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{team.teamName}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-bold text-blue-600">{team.points}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">{team.played}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">{team.won}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">{team.lost}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">{team.setsFor}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">{team.setsAgainst}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">{team.setDifference > 0 ? `+${team.setDifference}` : team.setDifference}</td>
                                    {/* --- LÍNEA CORREGIDA --- */}
                                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">{team.setRatio !== null && isFinite(team.setRatio) ? team.setRatio.toFixed(3) : '∞'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default TournamentStandings;
