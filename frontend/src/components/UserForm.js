import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import userService from '../services/userService';
import { toast } from 'react-toastify';

function UserForm() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '', // Para confirmar contraseña
        roleId: '', // Para asignar el rol
        isActive: true,
    });
    const [roles, setRoles] = useState([]); // Para la lista de roles disponibles

    const { username, email, password, password2, roleId, isActive } = formData;

    const navigate = useNavigate();
    const { id } = useParams(); // Para obtener el ID si estamos editando
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        // Redirige si el usuario no tiene permisos
        if (!user || user.role !== 'Admin') {
            toast.error('No tienes permiso para acceder a esta página.');
            navigate('/');
            return;
        }

        const fetchInitialData = async () => {
            try {
                // Cargar roles
                const fetchedRoles = await userService.getRoles(user.token);
                setRoles(fetchedRoles);

                if (id) { // Si hay un ID, estamos en modo edición
                    const userData = await userService.getUserById(id, user.token);
                    setFormData({
                        username: userData.username,
                        email: userData.email,
                        password: '', // No precargar contraseñas por seguridad
                        password2: '',
                        roleId: userData.role.id, // Corregir para acceder al ID del rol anidado
                        isActive: userData.isActive,
                    });
                }
            } catch (error) {
                toast.error('Error al cargar datos iniciales: ' + (error.response?.data?.message || error.message));
                console.error('Error fetching initial data for UserForm:', error);
                if (id) navigate('/users'); // Si falló al editar, volver a la lista
            }
        };

        fetchInitialData();
    }, [id, user, navigate]);

    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        // Validaciones para creación y edición
        if (!username || !email || !roleId) {
            toast.error('Por favor, complete todos los campos obligatorios.');
            return;
        }

        if (!id && (!password || password !== password2)) {
            toast.error('Las contraseñas no coinciden o no han sido ingresadas.');
            return;
        }
         // Validar que un Admin no pueda asignar rol de Superadmin
        if (user.role === 'Admin' && roles.find(r => r.id === parseInt(roleId))?.name === 'Superadmin') {
            toast.error('Un administrador no puede asignar el rol de Superadmin.');
            return;
        }

        // Encontrar el nombre del rol basado en el roleId seleccionado
        const selectedRole = roles.find(r => r.id === parseInt(roleId));
        if (!selectedRole) {
            toast.error('Por favor, selecciona un rol válido.');
            return;
        }

        // Crear objeto de datos a enviar, usando roleName
        const userDataToSubmit = {
            username,
            email,
            roleName: selectedRole.name, // Enviar el nombre del rol
            isActive,
        };

        // Añadir contraseña si es un usuario nuevo o si se ha introducido una nueva contraseña al editar
        if (!id || password) {
            userDataToSubmit.password = password;
        }

        try {
            if (id) {
                await userService.updateUser(id, userDataToSubmit, user.token);
                toast.success('Usuario actualizado exitosamente.');
            } else {
                // Asegúrate que la función en tu servicio se llame así
                await userService.createUserByAdmin(userDataToSubmit, user.token);
                toast.success('Usuario creado exitosamente.');
            }
            navigate('/users'); // Redirigir a la lista de usuarios
        } catch (error) {
            const errorMessage = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            toast.error(errorMessage);
            console.error('Error submitting user form:', error);
        }
    };

    const pageTitle = id ? 'Editar Usuario' : 'Crear Nuevo Usuario';
    const buttonText = id ? 'Actualizar Usuario' : 'Crear Usuario';

    return (
        <div className="flex justify-center items-center py-10 bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
                <section className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center">
                        {pageTitle}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {id ? 'Modifica los detalles del usuario' : 'Crea una nueva cuenta de usuario con rol específico'}
                    </p>
                </section>

                <form onSubmit={onSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">Nombre de Usuario:</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            id="username"
                            name="username"
                            value={username}
                            onChange={onChange}
                            placeholder="Nombre de usuario"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            id="email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            placeholder="Correo electrónico"
                            required
                        />
                    </div>
                    {/* Mostrar campos de contraseña solo si es nueva creación o se desea cambiar */}
                    {!id && (
                        <>
                            <div>
                                <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Contraseña:</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    id="password"
                                    name="password"
                                    value={password}
                                    onChange={onChange}
                                    placeholder="Contraseña"
                                    required={!id} // Requerido solo si es nueva creación
                                />
                            </div>
                            <div>
                                <label htmlFor="password2" className="block text-gray-700 text-sm font-bold mb-2">Confirmar Contraseña:</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    id="password2"
                                    name="password2"
                                    value={password2}
                                    onChange={onChange}
                                    placeholder="Confirme la contraseña"
                                    required={!id}
                                />
                            </div>
                        </>
                    )}
                    {id && ( // Para edición, si se quiere cambiar contraseña
                        <div className="mb-4">
                            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Nueva Contraseña (dejar vacío para no cambiar):</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={password}
                                onChange={onChange}
                                placeholder="Nueva Contraseña"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                    )}

                    <div>
                        <label htmlFor="roleId" className="block text-gray-700 text-sm font-bold mb-2">Rol:</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            id="roleId"
                            name="roleId"
                            value={roleId}
                            onChange={onChange}
                            required
                            // Un admin no puede cambiar su propio rol
                            disabled={id && parseInt(id) === user.id}
                        >
                            <option value="">Selecciona un rol</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id} disabled={role.name === 'Admin' && user.role !== 'Admin'}>
                                    {role.name}
                                </option>
                            ))}
                        </select>                        
                        {id && parseInt(id) === user.id && <p className="text-sm text-gray-500 mt-1">No puedes cambiar tu propio rol.</p>}
                    </div>
                    <div className="flex items-center mb-4">
                        <input
                            type="checkbox"
                            id="isActive"
                            name="isActive"
                            checked={isActive}
                            onChange={onChange}
                            className="form-checkbox h-5 w-5 text-blue-600 rounded"
                            // No se puede desactivar a sí mismo
                            disabled={id && parseInt(id) === user.id}
                        />
                        <label htmlFor="isActive" className="ml-2 text-gray-700 text-sm font-bold">Activo</label>
                        {id && parseInt(id) === user.id && <p className="text-sm text-gray-500 ml-2">No puedes desactivarte a ti mismo.</p>}
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
                            onClick={() => navigate('/users')}
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

export default UserForm;