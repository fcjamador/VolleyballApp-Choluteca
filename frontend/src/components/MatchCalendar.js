// frontend/src/components/MatchCalendar.js
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import matchService from '../services/matchService';
import teamService from '../services/teamService';
import tournamentService from '../services/tournamentService';
import { toast } from 'react-toastify';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'moment/locale/es'; // Importar locale español

// Configura el localizador de Moment.js para React Big Calendar
const localizer = momentLocalizer(moment);
// Habilita la funcionalidad de arrastrar y soltar
const DnDCalendar = withDragAndDrop(Calendar);

// --- MEJORA 1: Objeto de colores para los estados de los partidos ---
const statusColors = {
    Programado: '#3174ad', // Azul
    Activo: '#f0ad4e',     // Naranja
    Completado: '#5cb85c', // Verde
    Cancelado: '#d9534f',  // Rojo
};

// --- MEJORA 2: Componente personalizado para mostrar el evento ---
const CustomEvent = ({ event }) => (
    <div>
        <strong>{event.title}</strong>
        <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>{event.resource.tournament}</p>
    </div>
);


function MatchCalendar() {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    // Función para obtener todos los partidos, equipos y torneos
    const fetchAllData = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);

            // Cargar todos los datos en paralelo
            const [fetchedMatches, fetchedTeams, fetchedTournaments] = await Promise.all([
                matchService.getMatches(user.token),
                teamService.getTeams(user.token),
                tournamentService.getTournaments(user.token)
            ]);

            // Crear mapas para búsqueda rápida de nombres
            const teamMap = fetchedTeams.reduce((acc, team) => {
                acc[team.id] = team.name;
                return acc;
            }, {});

            const tournamentMap = fetchedTournaments.reduce((acc, tournament) => {
                acc[tournament.id] = tournament.name;
                return acc;
            }, {});

            // Formatear partidos para el calendario
            const formattedMatches = fetchedMatches.map(match => ({
                id: match.id,
                title: `${teamMap[match.localTeamId] || 'N/A'} vs ${teamMap[match.visitorTeamId] || 'N/A'}`,
                start: new Date(`${match.matchDate}T${match.matchTime || '00:00:00'}`),
                end: moment(`${match.matchDate}T${match.matchTime || '00:00:00'}`).add(90, 'minutes').toDate(),
                allDay: !match.matchTime,
                resource: { // Guardamos datos extra aquí
                    tournament: tournamentMap[match.tournamentId] || 'Torneo Desconocido',
                    status: match.status
                }
            }));
            setMatches(formattedMatches);

        } catch (error) {
            toast.error('Error al cargar datos del calendario: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!user || (user.role !== 'Admin' && user.role !== 'Superadmin')) {
            toast.error('No autorizado. Acceso solo para administradores.');
            navigate('/login');
        } else {
            fetchAllData();
        }
    }, [user, navigate, fetchAllData]);

    // --- MEJORA 3: Función para aplicar estilos dinámicos a los eventos ---
    const eventStyleGetter = (event, start, end, isSelected) => {
        const backgroundColor = statusColors[event.resource.status] || '#808080'; // Gris por defecto
        const style = {
            backgroundColor,
            borderRadius: '5px',
            opacity: 0.8,
            color: 'white',
            border: '0px',
            display: 'block'
        };
        return { style };
    };

    // Función para manejar el arrastre y soltado de eventos
    const onEventDrop = useCallback(async ({ event, start }) => {
        try {
            const updatedMatchData = {
                matchDate: moment(start).format('YYYY-MM-DD'),
                matchTime: moment(start).format('HH:mm:ss'),
            };
            await matchService.updateMatch(event.id, updatedMatchData, user.token);
            toast.success('Partido reprogramado exitosamente.');
            fetchAllData(); // Recargar para consistencia
        } catch (error) {
            toast.error('Error al reprogramar el partido.');
            fetchAllData(); // Revertir el cambio visual recargando
        }
    }, [user, fetchAllData]);

    // Configuración de la vista del calendario
    const { defaultDate, formats, messages } = useMemo(
        () => ({
            defaultDate: new Date(),
            formats: {
                eventTimeRangeFormat: ({ start, end }, culture, local) =>
                    `${local.format(start, 'HH:mm')} - ${local.format(end, 'HH:mm')}`,
            },
            messages: {
                allDay: 'Todo el día', previous: 'Anterior', next: 'Siguiente',
                today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día',
                agenda: 'Agenda', date: 'Fecha', time: 'Hora', event: 'Evento',
                noEventsInRange: 'No hay eventos en este rango.',
                showMore: total => `+ ${total} más`
            },
        }),
        []
    );

    if (loading) {
        return <div className="text-center py-10">Cargando calendario...</div>;
    }

    return (
        <div className="management-container bg-white p-6 rounded-lg shadow-xl min-h-[700px]">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Calendario de Partidos</h2>
            <DnDCalendar
                localizer={localizer}
                events={matches}
                onEventDrop={onEventDrop}
                onEventResize={onEventDrop} // Reutilizamos la misma lógica para redimensionar
                eventPropGetter={eventStyleGetter} // <-- MEJORA 3 APLICADA
                components={{
                    event: CustomEvent, // <-- MEJORA 2 APLICADA
                }}
                resizable
                selectable
                onSelectEvent={event => navigate(`/matches/edit/${event.id}`)}
                draggableAccessor={() => true}
                defaultView="month"
                defaultDate={defaultDate}
                formats={formats}
                messages={messages}
                style={{ height: 'calc(100vh - 250px)' }}
                culture="es"
            />
        </div>
    );
}

export default MatchCalendar;
