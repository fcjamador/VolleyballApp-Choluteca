import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import tournamentService from '../services/tournamentService';
import { toast } from 'react-toastify';

const TournamentForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        startDate: '',
        endDate: '',
        location: '',
        status: 'Programado',
        type: 'League', // Campo para el tipo de torneo
    });
    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState(null);

    const { name, startDate, endDate, location, status, type } = formData;

    const navigate = useNavigate();
    const { id } = useParams(); // Para obtener el ID si estamos editando
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (!user || user.role !== 'Admin') {
            toast.error('No autorizado para acceder a esta página.');
            navigate('/');
        }

        if (id) { // Si hay un ID, estamos en modo edición
            const fetchTournament = async () => {
                try {
                    const tournament = await tournamentService.getTournamentById(id, user.token);
                    setFormData({
                        name: tournament.name,
                        startDate: tournament.startDate.split('T')[0], // Formatear para input date
                        endDate: tournament.endDate.split('T')[0],     // Formatear para input date
                        location: tournament.location,
                        status: tournament.status,
                        type: tournament.type || 'League',
                    });
                } catch (error) {
                    toast.error('Error al cargar el torneo para editar.');
                    console.error('Error fetching tournament for edit:', error);
                    navigate('/tournaments'); // Volver a la lista si no se encuentra
                }
            };
            fetchTournament();
        }
    }, [id, user, navigate]);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
        if (formError) {
            setFormError(null);
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        setIsLoading(true);

        // Validaciones adicionales
        if (new Date(startDate) > new Date(endDate)) {
            toast.error('La fecha de inicio no puede ser posterior a la fecha de fin.');
            setIsLoading(false);
            return;
        }

        try {
            if (id) {
                // Actualizar torneo existente
                await tournamentService.updateTournament(id, formData, user.token);
                toast.success('Torneo actualizado exitosamente.');
            } else {
                // Crear nuevo torneo
                await tournamentService.createTournament(formData, user.token);
                toast.success('Torneo creado exitosamente.');
            }
            navigate('/tournaments'); // Redirigir a la lista de torneos
        } catch (err) {
            let message = 'Ocurrió un error inesperado.';
            if (err.response && err.response.data) {
                // Si el backend envía un array de errores específicos, los unimos.
                if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
                    message = err.response.data.errors.join(' ');
                } else {
                    // Si no, usamos el mensaje principal.
                    message = err.response.data.message || err.message;
                }
            } else {
                message = err.message || err.toString();
            }
            setFormError(message); // Mostrar el error en el formulario
            console.error('Error submitting tournament form:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Objeto con las explicaciones para cada tipo de torneo
    const tournamentTypeExplanations = {
        'League': {
            title: 'Formato de Liga (Todos contra todos)',
            description: 'En este formato, cada equipo juega contra todos los demás equipos del torneo una o varias veces. El ganador se determina por la tabla de posiciones al final de todos los partidos, usualmente basado en puntos.',
            phases: 'Fase única: Todos los partidos cuentan para una sola tabla de posiciones.'
        },
        'Knockout': {
            title: 'Formato de Eliminatoria Directa',
            description: 'Este es un formato de eliminación. El equipo que pierde un partido queda eliminado del torneo. Los ganadores avanzan a la siguiente ronda (octavos, cuartos, semifinal, final) hasta que solo queda un campeón.',
            phases: 'Rondas sucesivas: Cuartos de Final -> Semifinal -> Final.'
        },
        'Group Stage': {
            title: 'Formato de Fase de Grupos',
            description: 'Los equipos se dividen en varios grupos. Dentro de cada grupo, juegan en un formato de liga (todos contra todos). Los mejores equipos de cada grupo (usualmente los dos primeros) avanzan a una fase de eliminación directa.',
            phases: 'Fase 1: Partidos de grupo. Fase 2: Rondas de eliminación (cuartos, semifinal, etc.) con los clasificados.'
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-3xl font-bold text-center mb-6">
                {id ? 'Editar Torneo' : 'Crear Nuevo Torneo'}
            </h2>
            <form onSubmit={onSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
                <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
                        Nombre del Torneo:
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={name}
                        onChange={onChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="startDate" className="block text-gray-700 text-sm font-bold mb-2">
                        Fecha de Inicio:
                    </label>
                    <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={startDate}
                        onChange={onChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="endDate" className="block text-gray-700 text-sm font-bold mb-2">
                        Fecha de Fin:
                    </label>
                    <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={endDate}
                        onChange={onChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="location" className="block text-gray-700 text-sm font-bold mb-2">
                        Ubicación:
                    </label>
                    <input
                        type="text"
                        id="location"
                        name="location"
                        value={location}
                        onChange={onChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="type" className="block text-gray-700 text-sm font-bold mb-2">
                        Tipo de Torneo:
                    </label>
                    <select
                        id="type"
                        name="type"
                        value={type}
                        onChange={onChange}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    >
                        <option value="League">Liga (Todos contra todos)</option>
                        <option value="Knockout">Eliminatoria Directa</option>
                        <option value="Group Stage">Fase de Grupos</option>
                    </select>
                    {/* --- NUEVO: Cuadro de explicación dinámico --- */}
                    {type && tournamentTypeExplanations[type] && (
                        <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800 rounded-r-lg">
                            <h4 className="font-bold">{tournamentTypeExplanations[type].title}</h4>
                            <p className="text-sm mt-1">{tournamentTypeExplanations[type].description}</p>
                            <p className="text-sm mt-2">
                                <strong className="font-semibold">Fases Típicas:</strong> {tournamentTypeExplanations[type].phases}
                            </p>
                        </div>
                    )}
                </div>
                <div className="mb-4">
                    <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">
                        Estado:
                    </label>
                    <select
                        id="status"
                        name="status"
                        value={status}
                        onChange={onChange}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                        <option value="Programado">Programado</option>
                        <option value="Activo">Activo</option>
                        <option value="Completado">Completado</option>
                        <option value="Cancelado">Cancelado</option>
                    </select>
                </div>

                {formError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{formError}</span>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full mr-2 disabled:bg-blue-300"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Guardando...' : (id ? 'Actualizar Torneo' : 'Crear Torneo')}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/tournaments')}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full ml-2"
                        disabled={isLoading}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TournamentForm;