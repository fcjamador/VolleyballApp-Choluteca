import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      navigate('/login'); // Redirige a login si no hay usuario logueado
    }
  }, [user, navigate]);

  return (
    <div>
      <h2>Dashboard de Ligas de Voleibol</h2>
      {user ? (
        <p>Bienvenido, {user.username} ({user.role})!</p>
      ) : (
        <p>Cargando información del usuario...</p>
      )}
      {/* Aquí irá el contenido principal de tu aplicación */}
    </div>
  );
}

export default Dashboard;