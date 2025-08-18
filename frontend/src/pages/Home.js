import React from 'react';

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gray-50 p-4">
      <h1 className="text-5xl font-extrabold text-blue-700 mb-6 animate-fade-in-down">
        Bienvenido a VolleyballApp
      </h1>
      <p className="text-xl text-gray-700 mb-8 max-w-2xl text-center animate-fade-in-up">
        Tu plataforma integral para la gestión de ligas y torneos de voleibol.
        Organiza equipos, jugadores, partidos y sigue el progreso de tus competiciones favoritas.
      </p>
      <div className="flex space-x-4 animate-scale-in">
        {/* Estos enlaces se mostrarán/ocultarán con la lógica del Header */}
        <a href="/login" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300">
          Iniciar Sesión
        </a>
        <a href="/register" className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300">
          Registrarse
        </a>
      </div>
    </div>
  );
}

export default Home;