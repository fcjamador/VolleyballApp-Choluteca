import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import userService from '../../services/userService';
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';

function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [editedUser, setEditedUser] = useState({});

    const { user: loggedInUser } = useSelector((state) => state.auth);

    const fetchUsersAndRoles = useCallback(async () => {
        try {
            setLoading(true);
            const fetchedUsers = await userService.getAllUsers(loggedInUser.token);
            const fetchedRoles = await userService.getRoles(loggedInUser.token);
            setUsers(fetchedUsers);
            setRoles(fetchedRoles);
        } catch (error) {
            toast.error('Error al cargar datos: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    }, [loggedInUser.token]);

    useEffect(() => {
        fetchUsersAndRoles();
    }, [fetchUsersAndRoles]);

    const openEditModal = (userToEdit) => {
        setCurrentUser(userToEdit);
        setEditedUser({
            username: userToEdit.username,
            email: userToEdit.email,
            roleName: userToEdit.role.name,
            isActive: userToEdit.isActive,
        });
        setIsModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedUser(prev => ({ ...prev, [name]: value }));
    };

    const handleToggleChange = () => {
        setEditedUser(prev => ({ ...prev, isActive: !prev.isActive }));
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            await userService.updateUser(currentUser.id, editedUser, loggedInUser.token);
            toast.success('Usuario actualizado correctamente.');
            setIsModalOpen(false);
            fetchUsersAndRoles(); // Recargar la lista de usuarios
        } catch (error) {
            toast.error('Error al actualizar: ' + (error.response?.data?.message || error.message));
        }
    };

    const openDeleteModal = (user) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setUserToDelete(null);
        setIsDeleteModalOpen(false);
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        try {
            await userService.deleteUser(userToDelete.id, loggedInUser.token);
            toast.success('Usuario eliminado correctamente.');
            closeDeleteModal();
            fetchUsersAndRoles(); // Vuelve a cargar la lista actualizada desde el servidor
        } catch (error) {
            toast.error('Error al eliminar el usuario: ' + (error.response?.data?.message || error.message));
            closeDeleteModal();
        }
    };

    if (loading) {
        return <div className="text-center py-10">Cargando usuarios...</div>;
    }

    return (
        <div className="management-container bg-white p-6 rounded-lg shadow-xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Gestión de Usuarios</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Username</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Email</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Rol</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Estado</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {users.map((user) => (
                            <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-4">{user.username}</td>
                                <td className="py-3 px-4">{user.email}</td>
                                <td className="py-3 px-4">
                                    <span className={`px-2 py-1 font-semibold leading-tight rounded-full ${
                                        user.role.name === 'Superadmin' ? 'bg-red-200 text-red-900' :
                                        user.role.name === 'Admin' ? 'bg-yellow-200 text-yellow-900' :
                                        'bg-green-200 text-green-900'
                                    }`}>
                                        {user.role.name}
                                    </span>
                                </td>
                                <td className="py-3 px-4">
                                    {user.isActive ? (
                                        <span className="text-green-500 font-bold">Activo</span>
                                    ) : (
                                        <span className="text-red-500 font-bold">Inactivo</span>
                                    )}
                                </td>
                                <td className="py-3 px-4">
                                    <button onClick={() => openEditModal(user)} className="text-blue-500 hover:text-blue-700 mr-4">
                                        <FaEdit size={20} />
                                    </button>
                                    <button
                                        onClick={() => openDeleteModal(user)}
                                        className="text-red-500 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                                        disabled={loggedInUser.id === user.id}
                                    >
                                        <FaTrash size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal para Editar Usuario */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                        <h3 className="text-2xl font-bold mb-6">Editar Usuario: {currentUser.username}</h3>
                        <form onSubmit={handleUpdateUser}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    id="username"
                                    value={editedUser.username}
                                    onChange={handleInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={editedUser.email}
                                    onChange={handleInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                            {/* Solo Superadmin puede editar el rol */}
                            {loggedInUser.role === 'Superadmin' && (
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="roleName">
                                        Rol
                                    </label>
                                    <select
                                        name="roleName"
                                        id="roleName"
                                        value={editedUser.roleName}
                                        onChange={handleInputChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        disabled={loggedInUser.id === currentUser.id} // No permitir que un superadmin se cambie su propio rol
                                    >
                                        {roles.map(role => (
                                            <option key={role.id} value={role.name}>{role.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="mb-6 flex items-center">
                                <label className="block text-gray-700 text-sm font-bold mr-4" htmlFor="isActive">
                                    Estado
                                </label>
                                <button type="button" onClick={handleToggleChange} className="focus:outline-none">
                                    {editedUser.isActive ? <FaToggleOn size={30} className="text-green-500" /> : <FaToggleOff size={30} className="text-gray-500" />}
                                </button>
                                <span className="ml-2">{editedUser.isActive ? 'Activo' : 'Inactivo'}</span>
                            </div>

                            <div className="flex items-center justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para Confirmar Eliminación */}
            {isDeleteModalOpen && userToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                        <h3 className="text-2xl font-bold mb-4">Confirmar Eliminación</h3>
                        <p className="text-gray-700 mb-6">
                            ¿Estás seguro de que quieres eliminar al usuario <strong>{userToDelete.username}</strong>? Esta acción no se puede deshacer.
                        </p>
                        <div className="flex items-center justify-end">
                            <button
                                onClick={closeDeleteModal}
                                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserManagementPage;
//