import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Importa el nuevo componente que creamos para el usuario normal
import UserDashboard from '../components/UserDashboard';

// Este es un componente simple para el dashboard de administradores.
const AdminDashboard = () => (
    <div className="p-6 bg-gray-50 min-h-[calc(100vh-80px)]">
        <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
        <p className="mt-4 text-lg text-gray-600">
            Bienvenido. Utiliza la barra de navegación superior para gestionar usuarios, equipos, torneos y más.
        </p>
    </div>
);

function Dashboard() {
  const navigate = useNavigate();
  const { user, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    // Si no está cargando y no hay usuario, redirigir al login.
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  // Muestra un estado de carga mientras se verifica el estado de autenticación.
  if (isLoading || !user) {
    return <div className="text-center py-20 text-gray-500">Cargando...</div>;
  }

  // Lógica de renderizado condicional basada en el rol del usuario.
  return (
    <>
        { (user.role === 'Admin' || user.role === 'Superadmin') ? <AdminDashboard /> : <UserDashboard /> }
    </>
  );
}

export default Dashboard;