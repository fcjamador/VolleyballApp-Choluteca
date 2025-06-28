import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Management.css'; // CSS general para las páginas de gestión

function UserManagement() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]); // Para cargar los roles disponibles

  useEffect(() => {
    if (!user || user.role !== 'Superadmin') {
      navigate('/'); // Redirige si no es Superadmin
    } else {
      fetchUsers();
      fetchRoles();
    }
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const response = await axios.get('http://localhost:5000/api/users', config);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error.response?.data?.message || error.message);
    }
  };

  const fetchRoles = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      // Necesitarías una ruta en tu backend para obtener roles.
      // Por ahora, lo simulamos o asumimos que ya las sabes.
      // OJO: Esta ruta `api/roles` no existe aún, la implementaremos después si es necesario.
      // Por ahora, puedes simularlo:
      setRoles([
          { id: 1, name: 'Superadmin' },
          { id: 2, name: 'Admin' },
          { id: 3, name: 'Normal' }
      ]);

    } catch (error) {
      console.error('Error fetching roles:', error.response?.data?.message || error.message);
    }
  };

  const handleRoleChange = async (userId, newRoleId) => {
    if (!window.confirm('¿Estás seguro de que quieres cambiar el rol de este usuario?')) {
        return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      };
      await axios.put(`http://localhost:5000/api/users/${userId}`, { roleId: newRoleId }, config);
      fetchUsers(); // Refrescar la lista de usuarios
      alert('Rol actualizado exitosamente.');
    } catch (error) {
      console.error('Error updating user role:', error.response?.data?.message || error.message);
      alert('Error al actualizar rol: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    if (!window.confirm(`¿Estás seguro de que quieres ${currentStatus ? 'desactivar' : 'activar'} este usuario?`)) {
        return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      };
      await axios.put(`http://localhost:5000/api/users/${userId}`, { isActive: !currentStatus }, config);
      fetchUsers();
      alert('Estado del usuario actualizado.');
    } catch (error) {
      console.error('Error toggling user status:', error.response?.data?.message || error.message);
      alert('Error al actualizar estado: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('¿Estás seguro de que quieres ELIMINAR este usuario? Esta acción es irreversible.')) {
        return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.delete(`http://localhost:5000/api/users/${userId}`, config);
      fetchUsers();
      alert('Usuario eliminado exitosamente.');
    } catch (error) {
      console.error('Error deleting user:', error.response?.data?.message || error.message);
      alert('Error al eliminar usuario: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="management-container">
      <h2>Gestión de Usuarios</h2>
      {users.length > 0 ? (
        <table className="management-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>
                  {user.role === 'Superadmin' ? ( // Solo Superadmin puede cambiar el rol
                    <select
                      value={u.roleId}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    >
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    u.role ? u.role.name : 'N/A' // Muestra el nombre del rol
                  )}
                </td>
                <td>{u.isActive ? 'Sí' : 'No'}</td>
                <td className="actions-column">
                  {(user.role === 'Admin' || user.role === 'Superadmin') && u.id !== user.id && ( // Admins pueden cambiar activo, Superadmin también. No se puede desactivar/eliminar a sí mismo
                    <button
                      onClick={() => handleToggleActive(u.id, u.isActive)}
                      className={`btn ${u.isActive ? 'btn-danger' : 'btn-success'}`}
                    >
                      {u.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                  )}
                   {user.role === 'Superadmin' && u.id !== user.id && ( // Solo Superadmin puede eliminar
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="btn btn-danger"
                      style={{ marginLeft: '10px' }}
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay usuarios registrados.</p>
      )}
    </div>
  );
}

export default UserManagement;