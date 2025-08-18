import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import tournamentService from '../services/tournamentService';
import { toast } from 'react-toastify';
import { FaListOl, FaArrowLeft } from 'react-icons/fa';

const TournamentStandings = () => {
    const { id: tournamentId } = useParams();
    const { user } = useSelector((state) => state.auth);

    const [standings, setStandings] = useState([]);
    const [tournamentName, setTournamentName] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchStandings = useCallback(async () => {
        if (!tournamentId || !user?.token) return;
        setLoading(true);
        try {
            // Pedimos los datos de la tabla y los detalles del torneo al mismo tiempo
            const [standingsData, tournamentData] = await Promise.all([
                tournamentService.getTournamentStandings(tournamentId, user.token),
                tournamentService.getTournamentById(tournamentId, user.token)
            ]);
            setStandings(standingsData);
            setTournamentName(tournamentData.name);
        } catch (error) {
            toast.error('Error al cargar la tabla de posiciones.');
            console.error('Error fetching standings:', error);
        } finally {
            setLoading(false);
        }
    }, [tournamentId, user?.token]);

    useEffect(() => {
        fetchStandings();
    }, [fetchStandings]);

    return (
        <div className="management-container bg-white p-6 rounded-lg shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                    <FaListOl className="mr-3 text-green-600" />
                    Tabla de Posiciones: {tournamentName}
                </h2>
                <Link to="/tournaments" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md transition duration-300 flex items-center">
                    <FaArrowLeft className="mr-2" /> Volver a Torneos
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-10">Cargando tabla de posiciones...</div>
            ) : standings.length === 0 ? (
                <p className="text-center text-gray-600 py-10">No hay partidos completados para mostrar posiciones.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-4 border-b text-center text-sm font-semibold text-gray-600">Pos</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Equipo</th>
                                <th className="py-3 px-4 border-b text-center text-sm font-semibold text-gray-600" title="Partidos Jugados">PJ</th>
                                <th className="py-3 px-4 border-b text-center text-sm font-semibold text-gray-600" title="Partidos Ganados">PG</th>
                                <th className="py-3 px-4 border-b text-center text-sm font-semibold text-gray-600" title="Partidos Perdidos">PP</th>
                                <th className="py-3 px-4 border-b text-center text-sm font-semibold text-gray-600" title="Sets a Favor">SF</th>
                                <th className="py-3 px-4 border-b text-center text-sm font-semibold text-gray-600" title="Sets en Contra">SC</th>
                                <th className="py-3 px-4 border-b text-center text-sm font-semibold text-gray-600" title="Diferencia de Sets">DS</th>
                                <th className="py-3 px-4 border-b text-center text-sm font-semibold text-gray-600">Puntos</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {standings.map((team, index) => (
                                <tr key={team.teamId} className={`border-b border-gray-200 hover:bg-gray-50 ${index < 4 ? 'bg-green-50' : ''}`}>
                                    <td className="py-3 px-4 text-center font-bold">{index + 1}</td>
                                    <td className="py-3 px-4 font-semibold">{team.teamName}</td>
                                    <td className="py-3 px-4 text-center">{team.played}</td>
                                    <td className="py-3 px-4 text-center">{team.wins}</td>
                                    <td className="py-3 px-4 text-center">{team.losses}</td>
                                    <td className="py-3 px-4 text-center">{team.setsWon}</td>
                                    <td className="py-3 px-4 text-center">{team.setsLost}</td>
                                    <td className="py-3 px-4 text-center font-medium">{team.setsWon - team.setsLost}</td>
                                    <td className="py-3 px-4 text-center font-bold text-lg">{team.points}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="mt-4 text-sm text-gray-600">
                        <p><span className="font-bold">Criterios de desempate:</span> 1. Puntos, 2. Partidos Ganados, 3. Diferencia de Sets, 4. Sets a Favor.</p>
                        <p><span className="inline-block w-4 h-4 bg-green-200 mr-2 border border-green-300"></span>Indica zona de clasificación (primeros 4 equipos).</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TournamentStandings;
