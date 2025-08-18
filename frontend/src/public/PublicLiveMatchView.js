import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import matchService from '../services/matchService';
import { FaClock, FaTrophy } from 'react-icons/fa';

const socket = io();

const PublicLiveMatchView = () => {
    const { id } = useParams();
    const [match, setMatch] = useState(null);

    const fetchMatch = async () => {
        try {
            const data = await matchService.getMatchPublic(id);
            setMatch(data);
        } catch (err) {
            console.error("Error cargando partido:", err);
        }
    };

    useEffect(() => {
        fetchMatch();

        const interval = setInterval(fetchMatch, 5000); // Actualizar cada 5 segundos

        socket.on('matchUpdated', (updatedMatch) => {
            if (updatedMatch.id === parseInt(id)) {
                setMatch(updatedMatch);
            }
        });

        socket.on('timeoutRequested', (updatedMatch) => {
            if (updatedMatch.id === parseInt(id)) {
                setMatch(updatedMatch);
            }
        });

        socket.on('timeoutEnded', (updatedMatch) => {
            if (updatedMatch.id === parseInt(id)) {
                setMatch(updatedMatch);
            }
        });

        return () => {
            clearInterval(interval);
            socket.off('matchUpdated');
            socket.off('timeoutRequested');
            socket.off('timeoutEnded');
        };
    }, [id]);

    if (!match) return <div className="text-center py-10 text-gray-600 text-xl">Cargando partido en vivo...</div>;

    const {
        localTeam,
        visitorTeam,
        team1Score,
        team2Score,
        setScores = [],
        status,
        timeoutActive,
        timeoutTeamId,
        winner,
    } = match;

    return (
        <div className="h-screen bg-black text-white flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold mb-6 text-yellow-300">Partido en Vivo</h1>

            <div className="flex justify-between w-2/3 text-3xl font-bold mb-4">
                <div className="text-blue-400 text-left">{localTeam?.name}</div>
                <div className="text-right text-red-400">{visitorTeam?.name}</div>
            </div>

            <div className="flex justify-center text-6xl font-extrabold mb-4 gap-16">
                <span className="text-blue-500">{team1Score ?? 0}</span>
                <span>-</span>
                <span className="text-red-500">{team2Score ?? 0}</span>
            </div>

            <div className="text-md text-gray-300 mb-6">
                {setScores.map((s, i) => (
                    <span key={i} className="mx-2 px-3 py-1 bg-gray-800 rounded-full inline-block">
                        Set {s.setNumber}: {s.team1Score} - {s.team2Score}
                    </span>
                ))}
            </div>

            {timeoutActive && (
                <div className="text-yellow-500 text-xl font-semibold flex items-center gap-2 mb-6">
                    <FaClock /> Tiempo fuera de: {timeoutTeamId === localTeam?.id ? localTeam.name : visitorTeam?.name}
                </div>
            )}

            <div className="text-sm text-white px-4 py-1 rounded-full mb-2 bg-gray-600">
                Estado: {status}
            </div>

            {status === 'Completado' && winner && (
                <div className="mt-4 text-green-400 font-bold text-xl flex items-center gap-2">
                    <FaTrophy /> Ganador: {winner.name}
                </div>
            )}
        </div>
    );
};

export default PublicLiveMatchView;
