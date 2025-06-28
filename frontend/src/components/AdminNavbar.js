import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './AdminNavbar.css'; // Crearemos este CSS

function AdminNavbar() {
  const { user } = useSelector((state) => state.auth);

  // Solo mostrar la barra de navegación si el usuario es Admin o Superadmin
  if (!user || (user.role !== 'Admin' && user.role !== 'Superadmin')) {
    return null; // No renderizar nada si no es admin
  }

  return (
    <nav className="admin-navbar">
      <ul>
        {user.role === 'Superadmin' && ( // Solo Superadmin puede gestionar usuarios
          <li>
            <Link to="/admin/users">Gestionar Usuarios</Link>
          </li>
        )}
        <li>
          <Link to="/admin/teams">Gestionar Equipos</Link>
        </li>
        <li>
          <Link to="/admin/players">Gestionar Jugadores</Link>
        </li>
        {/* Puedes añadir más enlaces aquí para torneos, partidos, etc. */}
      </ul>
    </nav>
  );
}

export default AdminNavbar;