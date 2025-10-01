import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import playerService from '../services/playerService';
import teamService from '../services/teamService'; // Para cargar equipos
import { toast } from 'react-toastify';
import { FaUser, FaSave, FaBan } from 'react-icons/fa';

function PlayerForm() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        nationalId: '', // Nuevo campo para el DNI
        jerseyNumber: '',
        position: '',
        teamId: '',
    });
    const [teams, setTeams] = useState([]); // Para la lista de equipos disponibles

    const { firstName, lastName, nationalId, jerseyNumber, position, teamId } = formData;

    const navigate = useNavigate();
    const { id } = useParams(); // Para obtener el ID si estamos editando
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (!user || user.role !== 'Admin') {
            toast.error('No autorizado para acceder a esta página.');
            navigate('/dashboard');
            return;
        }

        const fetchDependencies = async () => {
            try {
                const fetchedTeams = await teamService.getTeams(user.token);
                setTeams(fetchedTeams);
            } catch (error) {
                toast.error('Error al cargar los equipos: ' + (error.response?.data?.message || error.message));
                console.error('Error fetching teams for player form:', error);
            }
        };

        fetchDependencies();

        if (id) { // Si hay un ID, estamos en modo edición
            const fetchPlayer = async () => {
                try {
                    const player = await playerService.getPlayerById(id, user.token);
                    setFormData({
                        firstName: player.firstName,
                        lastName: player.lastName,
                        nationalId: player.nationalId || '',
                        jerseyNumber: player.jerseyNumber || '',
                        position: player.position || '',
                        teamId: player.teamId || '',
                    });
                } catch (error) {
                    toast.error('Error al cargar el jugador para editar: ' + (error.response?.data?.message || error.message));
                    console.error('Error fetching player for edit:', error);
                    navigate('/players'); // Volver a la lista si no se encuentra
                }
            };
            fetchPlayer();
        }
    }, [id, user, navigate]);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        try {
            if (id) {
                // Actualizar jugador existente
                await playerService.updatePlayer(id, formData, user.token);
                toast.success('Jugador actualizado exitosamente.');
            } else {
                // Crear nuevo jugador
                await playerService.createPlayer(formData, user.token);
                toast.success('Jugador creado exitosamente.');
            }
            navigate('/players'); // Redirigir a la lista de jugadores
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            toast.error(message);
            console.error('Error submitting player form:', error);
        }
    };

    const pageTitle = id ? 'Editar Jugador' : 'Crear Nuevo Jugador';
    const buttonText = id ? 'Actualizar Jugador' : 'Crear Jugador';

    return (
        <div className="flex justify-center items-center py-10 bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
                <section className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center">
                        <FaUser className="mr-3 text-blue-600" /> {pageTitle}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {id ? 'Modifica los detalles del jugador' : 'Añade un nuevo jugador a un equipo'}
                    </p>
                </section>

                <form onSubmit={onSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="firstName" className="block text-gray-700 text-sm font-bold mb-2">Nombre:</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            id="firstName"
                            name="firstName"
                            value={firstName}
                            onChange={onChange}
                            placeholder="Nombre"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block text-gray-700 text-sm font-bold mb-2">Apellido:</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            id="lastName"
                            name="lastName"
                            value={lastName}
                            onChange={onChange}
                            placeholder="Apellido"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="nationalId" className="block text-gray-700 text-sm font-bold mb-2">DNI / ID Único:</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            id="nationalId"
                            name="nationalId"
                            value={nationalId}
                            onChange={onChange}
                            placeholder="Número de Identidad del jugador"
                            required
                            minLength="13"
                            maxLength="13"
                        />
                    </div>
                    <div>
                        <label htmlFor="jerseyNumber" className="block text-gray-700 text-sm font-bold mb-2">Número de Camiseta:</label>
                        <input
                            type="number"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            id="jerseyNumber"
                            name="jerseyNumber"
                            value={jerseyNumber}
                            onChange={onChange}
                            placeholder="Número de Camiseta (opcional)"
                        />
                    </div>
                    <div>
                        <label htmlFor="position" className="block text-gray-700 text-sm font-bold mb-2">Posición:</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            id="position"
                            name="position"
                            value={position}
                            onChange={onChange}
                            placeholder="Posición (ej. Armador)"
                        />
                    </div>
                    <div>
                        <label htmlFor="teamId" className="block text-gray-700 text-sm font-bold mb-2">Equipo:</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            id="teamId"
                            name="teamId"
                            value={teamId}
                            onChange={onChange}
                            required
                        >
                            <option value="">-- Selecciona Equipo --</option>
                            {teams.map((team) => (
                                <option key={team.id} value={team.id}>
                                    {team.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center justify-between mt-6">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 transition duration-300 shadow-lg flex-grow mr-2"
                        >
                            <FaSave className="inline-block mr-2" /> {buttonText}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/players')}
                            className="bg-gray-500 text-white py-2 px-4 rounded-md font-semibold hover:bg-gray-600 transition duration-300 shadow-lg flex-grow ml-2"
                        >
                            <FaBan className="inline-block mr-2" /> Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PlayerForm;