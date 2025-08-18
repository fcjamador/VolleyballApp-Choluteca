// c:\Users\Jimmy Sanchez\Documents\VolleyballApp\VolleyballApp-Choluteca\frontend\src\components\TeamForm.js

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import teamService from '../services/teamService';
import { toast } from 'react-toastify';
import { FaVolleyballBall } from 'react-icons/fa'; // <-- Ícono importado

function TeamForm() {
    const [formData, setFormData] = useState({
        name: '',
        coachName: '',
    });

    const { name, coachName } = formData;

    const navigate = useNavigate();
    const { id } = useParams(); // Para obtener el ID si estamos editando
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (!user || (user.role !== 'Admin' && user.role !== 'Superadmin')) {
            toast.error('No autorizado para acceder a esta página.');
            navigate('/dashboard');
            return;
        }

        if (id) { // Si hay un ID, estamos en modo edición
            const fetchTeam = async () => {
                try {
                    const team = await teamService.getTeamById(id, user.token);
                    setFormData({
                        name: team.name,
                        coachName: team.coachName || '',
                    });
                } catch (error) {
                    const message = (error.response?.data?.message || error.message || error.toString());
                    toast.error('Error al cargar el equipo: ' + message);
                    console.error('Error fetching team for edit:', error);
                    navigate('/teams'); // Volver a la lista si no se encuentra
                }
            };
            fetchTeam();
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
                // Actualizar equipo existente
                await teamService.updateTeam(id, formData, user.token);
                toast.success('Equipo actualizado exitosamente.');
            } else {
                // Crear nuevo equipo
                await teamService.createTeam(formData, user.token);
                toast.success('Equipo creado exitosamente.');
            }
            navigate('/teams'); // Redirigir a la lista de equipos
        } catch (error) {
            const message = (error.response?.data?.message || error.message || error.toString());
            toast.error(message);
            console.error('Error submitting team form:', error);
        }
    };

    const pageTitle = id ? 'Editar Equipo' : 'Crear Nuevo Equipo';
    const buttonText = id ? 'Actualizar Equipo' : 'Crear Equipo';

    return (
        <div className="flex justify-center items-center py-10 bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
                <section className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center">
                        <FaVolleyballBall className="mr-3 text-blue-600" /> {pageTitle}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {id ? 'Modifica los detalles del equipo' : 'Crea un nuevo equipo para tus torneos'}
                    </p>
                </section>

                <form onSubmit={onSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Nombre del Equipo:</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            id="name"
                            name="name"
                            value={name}
                            onChange={onChange}
                            placeholder="Nombre del Equipo"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="coachName" className="block text-gray-700 text-sm font-bold mb-2">Nombre del Entrenador:</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            id="coachName"
                            name="coachName"
                            value={coachName}
                            onChange={onChange}
                            placeholder="Nombre del Entrenador (opcional)"
                        />
                    </div>
                    <div className="flex items-center justify-between mt-6">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 transition duration-300 shadow-lg flex-grow mr-2"
                        >
                            {buttonText}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/teams')}
                            className="bg-gray-500 text-white py-2 px-4 rounded-md font-semibold hover:bg-gray-600 transition duration-300 shadow-lg flex-grow ml-2"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default TeamForm;
