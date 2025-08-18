import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import userService from '../services/userService';
import { toast } from 'react-toastify';
import { FaUsers, FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';

function UserList() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // Nuevo estado de carga

  const fetchUsers = useCallback(async () => {
    setLoading(true); // Iniciar carga
    try {
      const data = await userService.getUsers(user.token);
      // Filtrar el propio Superadmin de la lista si queremos evitar que se edite/elimine a sí mismo desde aquí
      // O simplemente deshabilitar botones en la UI
      setUsers(data);
    } catch (error) {
      toast.error('Error al cargar los usuarios: ' + (error.response?.data?.message || error.message));
      console.error('Error fetching users:', error);
    } finally {
        setLoading(false); // Finalizar carga
    }
  }, [user.token]);

  useEffect(() => {
    // Protección de ruta: Solo Superadmin puede ver la lista de usuarios
    if (!user || user.role !== 'Superadmin') {
      toast.error('No autorizado para acceder a la gestión de usuarios.');
      navigate('/dashboard'); // Redirige al dashboard o inicio
      return;
    }
    fetchUsers();
  }, [user, navigate, fetchUsers]);

  const handleToggleActive = async (userId, currentStatus) => {
    if (user.id === userId) {
        toast.error('No puedes cambiar tu propio estado de actividad.');
        return;
    }
    if (!window.confirm(`¿Estás seguro de que quieres ${currentStatus ? 'desactivar' : 'activar'} este usuario?`)) {
        return;
    }
    try {
      await userService.updateUser(userId, { isActive: !currentStatus }, user.token);
      toast.success('Estado del usuario actualizado.');
      fetchUsers(); // Refrescar la lista de usuarios
    } catch (error) {
      toast.error('Error al actualizar estado: ' + (error.response?.data?.message || error.message));
      console.error('Error toggling user status:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (user.id === userId) {
        toast.error('No puedes eliminar tu propia cuenta de Superadmin.');
        return;
    }
    if (!window.confirm('¿Estás seguro de que quieres ELIMINAR este usuario? Esta acción es irreversible.')) {
        return;
    }
    try {
      await userService.deleteUser(userId, user.token);
      toast.success('Usuario eliminado exitosamente.');
      fetchUsers();
    } catch (error) {
      toast.error('Error al eliminar usuario: ' + (error.response?.data?.message || error.message));
      console.error('Error deleting user:', error);
    }
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        </div>
    );
  }

  return (
    <div className="management-container bg-white p-6 rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center">
          <FaUsers className="mr-3 text-blue-600" /> Gestión de Usuarios
        </h2>
        <Link
          to="/users/new"
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 flex items-center"
        >
          <FaPlus className="mr-2" /> Crear Nuevo Usuario
        </Link>
      </div>

      {users.length === 0 ? (
        <p className="text-center text-gray-600 py-10">No hay usuarios registrados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">ID</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Usuario</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Email</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Rol</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Activo</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-800">{u.id}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{u.username}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{u.email}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${u.role?.name === 'Superadmin' ? 'bg-purple-200 text-purple-800' : ''}
                        ${u.role?.name === 'Admin' ? 'bg-blue-200 text-blue-800' : ''}
                        ${u.role?.name === 'Normal' ? 'bg-green-200 text-green-800' : ''}
                    `}>
                        {u.role ? u.role.name : 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800">
                    {u.isActive ? (
                        <span className="text-green-500 font-semibold flex items-center"><FaToggleOn className="mr-1" /> Sí</span>
                    ) : (
                        <span className="text-red-500 font-semibold flex items-center"><FaToggleOff className="mr-1" /> No</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800">
                    <div className="flex space-x-2">
                      {/* Botón de Editar (solo Superadmin puede editar) */}
                      {user.role === 'Superadmin' && (
                        <Link
                          to={`/users/edit/${u.id}`}
                          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded-md transition duration-200 flex items-center text-xs"
                        >
                          <FaEdit className="mr-1" /> Editar
                        </Link>
                      )}
                      {/* Botón de Activar/Desactivar (Admin y Superadmin pueden) */}
                      {(user.role === 'Admin' || user.role === 'Superadmin') && u.id !== user.id && (
                        <button
                          onClick={() => handleToggleActive(u.id, u.isActive)}
                          className={`${u.isActive ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white py-1 px-2 rounded-md transition duration-200 flex items-center text-xs`}
                        >
                          {u.isActive ? <FaToggleOff className="mr-1" /> : <FaToggleOn className="mr-1" />} {u.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                      )}
                      {/* Botón de Eliminar (solo Superadmin puede eliminar, y no a sí mismo) */}
                      {user.role === 'Superadmin' && u.id !== user.id && (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded-md transition duration-200 flex items-center text-xs"
                        >
                          <FaTrash className="mr-1" /> Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default UserList;