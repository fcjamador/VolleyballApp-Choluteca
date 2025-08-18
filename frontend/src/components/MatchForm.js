import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import matchService from '../services/matchService';
import tournamentService from '../services/tournamentService';
import teamService from '../services/teamService';
import { FaSave, FaArrowLeft, FaPlus, FaMinus, FaHourglassHalf } from 'react-icons/fa';
import moment from 'moment';

// --- FUNCIONES DE UTILIDAD ---

// Valida si un marcador de set es válido según las reglas del voleibol.
const isSetScoreValid = (team1Score, team2Score, setNumber, numberOfSets) => {
    const pointsToWin = setNumber === numberOfSets ? 15 : 25;
    const score1 = parseInt(team1Score, 10) || 0;
    const score2 = parseInt(team2Score, 10) || 0;

    // Si los marcadores están empatados en 24-24 o más (o 14-14 en el set final), es válido.
    if (score1 === score2 && score1 >= pointsToWin - 1) {
        return true;
    }

    // Verifica si un equipo ha ganado el set.
    const team1Wins = score1 >= pointsToWin && score1 >= score2 + 2;
    const team2Wins = score2 >= pointsToWin && score2 >= score1 + 2;

    // Si un equipo ha ganado, el marcador es válido.
    if (team1Wins || team2Wins) {
        return true;
    }

    // Si nadie ha ganado, pero al menos un equipo ha alcanzado los puntos para ganar,
    // la diferencia debe ser de 1 punto (partido en "deuce").
    if (score1 >= pointsToWin || score2 >= pointsToWin) {
        return Math.abs(score1 - score2) < 2;
    }

    // Si nadie ha alcanzado los puntos para ganar, cualquier marcador es válido.
    return true;
};

// Calcula los sets ganados basándose en las reglas correctas.
const calculateSetsWon = (setScores, numberOfSets) => {
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

// Verifica si un set ya ha concluido según las reglas.
const isSetConcluded = (team1Score, team2Score, setNumber, numberOfSets) => {
    const pointsToWin = setNumber === numberOfSets ? 15 : 25;
    const score1 = parseInt(team1Score, 10) || 0;
    const score2 = parseInt(team2Score, 10) || 0;

    const team1Wins = score1 >= pointsToWin && score1 >= score2 + 2;
    const team2Wins = score2 >= pointsToWin && score2 >= score1 + 2;

    return team1Wins || team2Wins;
};


const MatchForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        tournamentId: '',
        localTeamId: '',
        visitorTeamId: '',
        matchDate: '',
        matchTime: '',
        location: '',
        status: 'Programado',
        phase: '',
        numberOfSets: 3,
        localTeamTimeouts: 2,
        visitorTeamTimeouts: 2,
        timeoutActive: false,
        timeoutTeamId: null,
        timeoutStartTime: null,
    });
    const [setScores, setSetScores] = useState([]);
    const [tournaments, setTournaments] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeoutCountdown, setTimeoutCountdown] = useState(30);

    const initializeSetScores = (numSets, existingScores = []) => {
        const scores = [];
        for (let i = 1; i <= numSets; i++) {
            const existing = existingScores.find(s => s.setNumber === i);
            scores.push({
                setNumber: i,
                team1Score: existing?.team1Score || 0,
                team2Score: existing?.team2Score || 0,
            });
        }
        setSetScores(scores);
    };

    const fetchDependencies = useCallback(async () => {
        try {
            if (loading) setLoading(true);
            
            const [tournamentsData, teamsData] = await Promise.all([
                tournamentService.getTournaments(user.token),
                teamService.getTeams(user.token),
            ]);
            setTournaments(tournamentsData);
            setTeams(teamsData);

            if (id) {
                const matchData = await matchService.getMatchById(id, user.token);
                setFormData(prev => ({ ...prev, ...matchData, matchDate: matchData.matchDate ? matchData.matchDate.split('T')[0] : '' }));
                initializeSetScores(matchData.numberOfSets, matchData.setScores);
            } else {
                initializeSetScores(3);
            }
        } catch (error) {
            toast.error('Error al cargar los datos necesarios.');
        } finally {
            if (loading) setLoading(false);
        }
    }, [id, user.token, loading]);

    useEffect(() => {
        fetchDependencies();
    }, [id, user.token]);

    const handleEndTimeout = useCallback(async () => {
        if (!id) return;
        try {
            const updatedMatch = await matchService.endTimeout(id, user.token);
            setFormData(prev => ({ ...prev, ...updatedMatch }));
            toast.info('El juego se ha reanudado automáticamente.');
        } catch (error) {
            if (error.response?.status !== 404) {
                 toast.error(error.response?.data?.message || 'Error al finalizar el tiempo fuera.');
            }
        }
    }, [id, user.token]);

    useEffect(() => {
        if (formData.timeoutActive && formData.timeoutStartTime) {
            const TIMEOUT_DURATION = 30;
            
            const updateCountdown = () => {
                const start = moment(formData.timeoutStartTime);
                const now = moment();
                const elapsed = now.diff(start, 'seconds');
                const remaining = Math.max(0, TIMEOUT_DURATION - elapsed);
                setTimeoutCountdown(remaining);
            };

            const countdownInterval = setInterval(updateCountdown, 1000);
            const endTimeoutTimer = setTimeout(handleEndTimeout, TIMEOUT_DURATION * 1000);

            return () => {
                clearInterval(countdownInterval);
                clearTimeout(endTimeoutTimer);
            };
        }
    }, [formData.timeoutActive, formData.timeoutStartTime, handleEndTimeout]);

    const isSetDisabled = (setIndex) => {
        const setsToWin = Math.ceil(formData.numberOfSets / 2);
        const { team1SetsWon, team2SetsWon } = calculateSetsWon(setScores.slice(0, setIndex), formData.numberOfSets);
        return team1SetsWon >= setsToWin || team2SetsWon >= setsToWin;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'numberOfSets') {
            initializeSetScores(parseInt(value, 10), setScores);
        }
    };

    const handleSetScoreChange = (index, field, value) => {
        const newValue = parseInt(value, 10) || 0;

        if (formData.status === 'Programado' && newValue > 0) {
            setFormData(prev => ({ ...prev, status: 'Activo' }));
            toast.info('El partido ha comenzado. Estado cambiado a "Activo".');
        }

        if (isSetDisabled(index)) {
            toast.info('El partido ya ha finalizado, no se pueden modificar más sets.');
            return;
        }

        const newScores = [...setScores];
        const currentSet = newScores[index];
        const originalValue = currentSet[field] || 0;

        if (isSetConcluded(currentSet.team1Score, currentSet.team2Score, currentSet.setNumber, formData.numberOfSets)) {
            if (newValue > originalValue) {
                toast.info(`El Set ${currentSet.setNumber} ya ha finalizado. No se puede aumentar el marcador.`);
                return;
            }
        }
        
        const tempScore = { ...currentSet, [field]: newValue };

        if (!isSetScoreValid(tempScore.team1Score, tempScore.team2Score, currentSet.setNumber, formData.numberOfSets)) {
            toast.error('Marcador inválido. Un set se gana con 25 (o 15) puntos y una diferencia de 2.');
            return;
        }

        newScores[index][field] = newValue;
        setSetScores(newScores);

        const { team1SetsWon, team2SetsWon } = calculateSetsWon(newScores, formData.numberOfSets);
        const setsToWin = Math.ceil(formData.numberOfSets / 2);

        if (team1SetsWon >= setsToWin || team2SetsWon >= setsToWin) {
            if (formData.status !== 'Completado') {
                setFormData(prev => ({ ...prev, status: 'Completado' }));
                toast.info('¡Partido finalizado! El estado se ha cambiado a "Completado".');
            }
        } else {
            if (formData.status === 'Completado') {
                 setFormData(prev => ({ ...prev, status: 'Activo' }));
            }
        }
    };

    const handleScoreButtonClick = (index, field, increment) => {
        const newScores = [...setScores];
        const currentValue = newScores[index][field] || 0;
        const newValue = Math.max(0, currentValue + increment);
        handleSetScoreChange(index, field, newValue);
    };

    const handleRequestTimeout = async (teamId) => {
        if (!id) return;
        try {
            const updatedMatch = await matchService.requestTimeout(id, teamId, user.token);
            setFormData(prev => ({ ...prev, ...updatedMatch }));
            toast.success('Tiempo fuera solicitado.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al solicitar tiempo fuera.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.localTeamId === formData.visitorTeamId && formData.localTeamId !== '') {
            toast.error('Un equipo no puede jugar contra sí mismo.');
            return;
        }

        const submissionData = { ...formData, setScores };

        try {
            if (id) {
                await matchService.updateMatch(id, submissionData, user.token);
                toast.success('Partido actualizado exitosamente.');
            } else {
                await matchService.createMatch(submissionData, user.token);
                toast.success('Partido creado exitosamente.');
            }
            navigate('/matches');
        } catch (error) {
            toast.error('Error al guardar el partido: ' + (error.response?.data?.message || error.message));
        }
    };

    if (loading) return <div>Cargando formulario...</div>;

    return (
        <div className="management-container bg-white p-6 rounded-lg shadow-xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">{id ? 'Editar Partido' : 'Crear Partido'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Datos Generales del Partido */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Columna Izquierda */}
                    <div>
                        <div>
                            <label htmlFor="tournamentId" className="block text-sm font-medium text-gray-700">Torneo</label>
                            <select id="tournamentId" name="tournamentId" value={formData.tournamentId} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
                                <option value="">Seleccione un torneo</option>
                                {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div className="mt-4">
                            <label htmlFor="localTeamId" className="block text-sm font-medium text-gray-700">Equipo Local</label>
                            <select id="localTeamId" name="localTeamId" value={formData.localTeamId} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
                                <option value="">Seleccione un equipo</option>
                                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div className="mt-4">
                            <label htmlFor="visitorTeamId" className="block text-sm font-medium text-gray-700">Equipo Visitante</label>
                            <select id="visitorTeamId" name="visitorTeamId" value={formData.visitorTeamId} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
                                <option value="">Seleccione un equipo</option>
                                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div className="mt-4">
                            <label htmlFor="phase" className="block text-sm font-medium text-gray-700">Fase / Jornada</label>
                            <input type="text" id="phase" name="phase" value={formData.phase} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                    </div>
                    {/* Columna Derecha */}
                    <div>
                        <div>
                            <label htmlFor="matchDate" className="block text-sm font-medium text-gray-700">Fecha del Partido</label>
                            <input type="date" id="matchDate" name="matchDate" value={formData.matchDate} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div className="mt-4">
                            <label htmlFor="matchTime" className="block text-sm font-medium text-gray-700">Hora del Partido</label>
                            <input type="time" id="matchTime" name="matchTime" value={formData.matchTime} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div className="mt-4">
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Lugar</label>
                            <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div className="mt-4">
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estado</label>
                            <select id="status" name="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
                                <option value="Programado">Programado</option>
                                <option value="Activo">Activo</option>
                                <option value="Completado">Completado</option>
                                <option value="Cancelado">Cancelado</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Sección de Marcadores por Set */}
                <div className="pt-6 border-t">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Marcadores del Partido</h3>
                    <div className="mb-4">
                        <label htmlFor="numberOfSets" className="block text-sm font-medium text-gray-700">Formato del Partido (Número de Sets)</label>
                        <select id="numberOfSets" name="numberOfSets" value={formData.numberOfSets} onChange={handleChange} className="mt-1 block w-1/4 p-2 border border-gray-300 rounded-md shadow-sm">
                            <option value={3}>Al mejor de 3</option>
                            <option value={5}>Al mejor de 5</option>
                        </select>
                    </div>

                    <div className="space-y-4">
                        {setScores.map((score, index) => (
                            <div key={index} className={`grid grid-cols-3 items-center gap-4 p-3 rounded-md transition-colors ${isSetDisabled(index) ? 'bg-gray-200 opacity-60' : 'bg-gray-50'}`}>
                                <span className="font-semibold text-gray-700">Set {score.setNumber}</span>
                                
                                <div className="flex items-center justify-center gap-2">
                                    <button type="button" onClick={() => handleScoreButtonClick(index, 'team1Score', -1)} disabled={isSetDisabled(index)} className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"><FaMinus /></button>
                                    <input
                                        type="number"
                                        id={`team1-set-${index}`}
                                        value={score.team1Score}
                                        onChange={(e) => handleSetScoreChange(index, 'team1Score', e.target.value)}
                                        className="w-16 p-2 text-center border border-gray-300 rounded-md"
                                        min="0"
                                        disabled={isSetDisabled(index)}
                                    />
                                    <button type="button" onClick={() => handleScoreButtonClick(index, 'team1Score', 1)} disabled={isSetDisabled(index)} className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"><FaPlus /></button>
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                    <button type="button" onClick={() => handleScoreButtonClick(index, 'team2Score', -1)} disabled={isSetDisabled(index)} className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"><FaMinus /></button>
                                    <input
                                        type="number"
                                        id={`team2-set-${index}`}
                                        value={score.team2Score}
                                        onChange={(e) => handleSetScoreChange(index, 'team2Score', e.target.value)}
                                        className="w-16 p-2 text-center border border-gray-300 rounded-md"
                                        min="0"
                                        disabled={isSetDisabled(index)}
                                    />
                                    <button type="button" onClick={() => handleScoreButtonClick(index, 'team2Score', 1)} disabled={isSetDisabled(index)} className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"><FaPlus /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- SECCIÓN DE TIEMPO FUERA AUTOMATIZADA --- */}
                {id && (
                    <div className="pt-6 border-t">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Control de Tiempos Fuera</h3>
                        {formData.timeoutActive ? (
                            <div className="text-center p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
                                <p className="font-bold flex items-center justify-center"><FaHourglassHalf className="mr-2" /> ¡TIEMPO FUERA ACTIVO!</p>
                                <p>Solicitado por: {teams.find(t => t.id === formData.timeoutTeamId)?.name || 'Equipo'}</p>
                                <div className="mt-2">
                                    <p className="text-lg font-mono">{timeoutCountdown}s</p>
                                    <p className="text-xs">Reanudando juego automáticamente...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => handleRequestTimeout(formData.localTeamId)}
                                    disabled={formData.status !== 'Activo' || formData.localTeamTimeouts <= 0}
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-md flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    <FaHourglassHalf className="mr-2" />
                                    Tiempo Fuera {teams.find(t => t.id === formData.localTeamId)?.name || 'Local'} ({formData.localTeamTimeouts} restantes)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleRequestTimeout(formData.visitorTeamId)}
                                    disabled={formData.status !== 'Activo' || formData.visitorTeamTimeouts <= 0}
                                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md shadow-md flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    <FaHourglassHalf className="mr-2" />
                                    Tiempo Fuera {teams.find(t => t.id === formData.visitorTeamId)?.name || 'Visitante'} ({formData.visitorTeamTimeouts} restantes)
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Botones de Acción */}
                <div className="flex justify-end space-x-4 pt-6">
                    <Link to="/matches" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md transition duration-300 flex items-center">
                        <FaArrowLeft className="mr-2" /> Cancelar
                    </Link>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 flex items-center">
                        <FaSave className="mr-2" /> {id ? 'Actualizar Partido' : 'Guardar Partido'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MatchForm;
