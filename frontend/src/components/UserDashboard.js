import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import matchService from '../services/matchService';
import teamService from '../services/teamService';
import tournamentService from '../services/tournamentService';
import moment from 'moment';
import 'moment/locale/es'; // Importar el locale español para fechas
import { FaRegClock, FaPlayCircle, FaCheckCircle, FaHourglassStart } from 'react-icons/fa';

// --- NUEVO COMPONENTE: Temporizador para el Tiempo Fuera ---
const TimeoutTimer = ({ startTime }) => {
    const TIMEOUT_DURATION = 30; // Duración estándar de un tiempo fuera en segundos
    const [remainingTime, setRemainingTime] = useState(TIMEOUT_DURATION);

    useEffect(() => {
        const calculateRemaining = () => {
            const start = moment(startTime);
            const now = moment();
            const elapsed = now.diff(start, 'seconds');
            const remaining = Math.max(0, TIMEOUT_DURATION - elapsed);
            setRemainingTime(remaining);
        };

        calculateRemaining(); // Calcular inmediatamente al montar el componente

        const timerId = setInterval(calculateRemaining, 1000); // Actualizar cada segundo

        // Limpiar el intervalo cuando el componente se desmonte para evitar fugas de memoria
        return () => clearInterval(timerId);
    }, [startTime]);

    return (
        <div className="text-center font-mono text-2xl text-red-600 animate-pulse">
            {remainingTime}s
        </div>
    );
};


const UserDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const [matches, setMatches] = useState([]);
    const [teams, setTeams] = useState({});
    const [tournaments, setTournaments] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async (isInitialLoad = false) => {
        if (!user) return;
        if (isInitialLoad) setLoading(true);
        try {
            const [fetchedMatches, fetchedTeams, fetchedTournaments] = await Promise.all([
                matchService.getMatches(user.token),
                teamService.getTeams(user.token),
                tournamentService.getTournaments(user.token),
            ]);

            const tournamentMap = fetchedTournaments.reduce((acc, tournament) => {
                acc[tournament.id] = tournament.name;
                return acc;
            }, {});

            setMatches(fetchedMatches);
            setTeams(fetchedTeams); // Guardar la lista completa de equipos
            setTournaments(tournamentMap);

        } catch (error) {
            toast.error('No se pudieron cargar los datos del dashboard.');
            console.error("Error fetching dashboard data:", error);
        } finally {
            if (isInitialLoad) setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        moment.locale('es');
        fetchData(true); // Carga inicial

        // --- MEJORA: Actualización automática cada 10 segundos ---
        const intervalId = setInterval(() => {
            fetchData(false); 
        }, 10000); // 10000 ms = 10 segundos

        return () => clearInterval(intervalId);
    }, [fetchData]);

    const { activeMatches, upcomingMatches, completedMatches } = useMemo(() => {
        const now = new Date();
        const createDate = (match) => new Date(`${match.matchDate}T${match.matchTime || '00:00:00'}`);

        const active = matches.filter(m => m.status === 'Activo').sort((a, b) => createDate(a) - createDate(b));
        const upcoming = matches.filter(m => m.status === 'Programado' && createDate(m) >= now).sort((a, b) => createDate(a) - createDate(b));
        const completed = matches.filter(m => m.status === 'Completado').sort((a, b) => createDate(b) - createDate(a));

        return { activeMatches: active, upcomingMatches: upcoming, completedMatches: completed };
    }, [matches]);

    if (loading) {
        return <div className="text-center py-10 text-gray-500">Cargando información...</div>;
    }

    // Sub-componente para renderizar cada tarjeta de partido
    const MatchCard = ({ match, cardType }) => {
        const cardStyles = {
            active: { icon: <FaPlayCircle />, borderColor: 'border-yellow-500', titleColor: 'text-yellow-600' },
            upcoming: { icon: <FaRegClock />, borderColor: 'border-blue-500', titleColor: 'text-blue-600' },
            completed: { icon: <FaCheckCircle />, borderColor: 'border-green-500', titleColor: 'text-green-600' },
        };
        const style = cardStyles[cardType];

        const calculateActiveSets = (setScores, numberOfSets) => {
            // Si el partido está completado, usamos los scores finales guardados en el partido
            if (match.status === 'Completado') {
                return {
                    team1SetsWon: match.team1Score || 0,
                    team2SetsWon: match.team2Score || 0
                };
            }

            // Si no, calculamos en tiempo real para partidos activos
            if (!setScores || setScores.length === 0) { 
                return { team1SetsWon: 0, team2SetsWon: 0 };
            }

            let team1SetsWon = 0;
            let team2SetsWon = 0;

            for (const score of setScores) {
                const team1Score = score.team1Score || 0;
                const team2Score = score.team2Score || 0;
                const pointsToWin = score.setNumber === numberOfSets ? 15 : 25;

                const isSetFinished =
                    (team1Score >= pointsToWin && team1Score >= team2Score + 2) ||
                    (team2Score >= pointsToWin && team2Score >= team1Score + 2);

                if (isSetFinished) {
                    if (team1Score > team2Score) {
                        team1SetsWon++;
                    } else {
                        team2SetsWon++;
                    }
                }
            }
            return { team1SetsWon, team2SetsWon };
        };

        const setsWon = calculateActiveSets(match.setScores, match.numberOfSets);
        const localTeam = teams.find(t => t.id === match.localTeamId);
        const visitorTeam = teams.find(t => t.id === match.visitorTeamId);
        const timeoutTeam = teams.find(t => t.id === match.timeoutTeamId);

        return (
            <div className={`bg-white p-4 rounded-lg shadow-md border-l-4 ${style.borderColor} mb-4 transition hover:shadow-lg`}>
                <p className="text-sm text-gray-500 font-medium">{tournaments[match.tournamentId] || 'Torneo'}</p>
                <div className="flex justify-around items-center my-2">
                    <div className="text-center w-2/5">
                        <img src={localTeam?.logoUrl ? `http://localhost:5000${localTeam.logoUrl}` : 'https://via.placeholder.com/50'} alt={localTeam?.name} className="h-12 w-12 mx-auto object-contain rounded-full mb-1" />
                        <p className="font-semibold text-sm text-gray-800 truncate">{localTeam?.name || 'Local'}</p>
                    </div>
                    <div className="text-2xl font-bold text-gray-400">VS</div>
                    <div className="text-center w-2/5">
                        <img src={visitorTeam?.logoUrl ? `http://localhost:5000${visitorTeam.logoUrl}` : 'https://via.placeholder.com/50'} alt={visitorTeam?.name} className="h-12 w-12 mx-auto object-contain rounded-full mb-1" />
                        <p className="font-semibold text-sm text-gray-800 truncate">{visitorTeam?.name || 'Visitante'}</p>
                    </div>
                </div>
                
                {/* --- MEJORA: Lógica para mostrar el tiempo fuera --- */}
                {match.timeoutActive && match.timeoutStartTime ? (
                    <div className="my-2">
                        <p className="text-sm font-bold text-red-600 flex items-center justify-center">
                            <FaHourglassStart className="mr-2" /> TIEMPO FUERA
                        </p>
                        <p className="text-xs text-gray-500 text-center">Solicitado por: {timeoutTeam?.name || 'Equipo'}</p>
                        <TimeoutTimer startTime={match.timeoutStartTime} />
                    </div>
                ) : match.status === 'Completado' ? (
                    <p className="text-3xl font-extrabold text-gray-700 text-center">
                        {setsWon.team1SetsWon} - {setsWon.team2SetsWon}
                    </p>
                ) : match.status === 'Activo' ? (
                    <div className="text-center">
                        <p className="text-3xl font-extrabold text-yellow-700">
                            {setsWon.team1SetsWon} - {setsWon.team2SetsWon}
                            <span className="text-sm font-normal text-gray-500 ml-2">(Sets)</span>
                        </p>
                        <div className="text-xs text-gray-500 mt-1">
                            {match.setScores && match.setScores.length > 0 ?
                                `Parciales: (${match.setScores.map(s => `${s.team1Score}-${s.team2Score}`).join(', ')})`
                                : 'Esperando marcador...'
                            }
                        </div>
                    </div>
                ) : (
                    <p className="text-md text-gray-600">
                        {moment(`${match.matchDate}T${match.matchTime || '00:00:00'}`).format('dddd, D [de] MMMM, h:mm a')}
                    </p>
                )}
            </div>
        );
    };

    return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-[calc(100vh-80px)]">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Bienvenido, {user?.username || 'Usuario'}</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Columna: Partidos en Juego */}
                <div>
                    <h2 className="text-2xl font-semibold text-yellow-600 mb-4 flex items-center"><FaPlayCircle className="mr-2"/>En Juego</h2>
                    {activeMatches.length > 0 ? (
                        activeMatches.map(match => <MatchCard key={match.id} match={match} cardType="active" />)
                    ) : (
                        <p className="text-gray-500 bg-white p-4 rounded-lg shadow-sm">No hay partidos activos en este momento.</p>
                    )}
                </div>
                {/* Columna: Próximos Partidos */}
                <div>
                    <h2 className="text-2xl font-semibold text-blue-600 mb-4 flex items-center"><FaRegClock className="mr-2"/>Próximos</h2>
                    {upcomingMatches.length > 0 ? (
                        upcomingMatches.map(match => <MatchCard key={match.id} match={match} cardType="upcoming" />)
                    ) : (
                        <p className="text-gray-500 bg-white p-4 rounded-lg shadow-sm">No hay más partidos programados.</p>
                    )}
                </div>
                {/* Columna: Resultados Recientes */}
                <div>
                    <h2 className="text-2xl font-semibold text-green-600 mb-4 flex items-center"><FaCheckCircle className="mr-2"/>Resultados</h2>
                    {completedMatches.length > 0 ? (
                        completedMatches.map(match => <MatchCard key={match.id} match={match} cardType="completed" />)
                    ) : (
                        <p className="text-gray-500 bg-white p-4 rounded-lg shadow-sm">Aún no hay resultados de partidos.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
