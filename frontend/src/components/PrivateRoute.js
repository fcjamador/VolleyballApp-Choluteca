import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children, allowedRoles }) => {
    const { user, isLoading } = useSelector((state) => state.auth);

    // Si está cargando, puedes mostrar un spinner o null
    if (isLoading) {
        return <div className="text-center py-10">Cargando...</div>; // O un spinner más elaborado
    }

    // Si el usuario no está logueado, redirige al login
    if (!user) {
        return <Navigate to="/login" />;
    }

    // Extraemos el nombre del rol directamente de la propiedad 'role'
    const userRole = user ? user.role : null;

    // Si se especifican roles y el usuario no tiene uno de los roles permitidos
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/dashboard" />; // Redirige al dashboard si no tiene permiso
    }

    // Si todo está bien, renderiza el contenido de la ruta
    return children;
};

export default PrivateRoute;