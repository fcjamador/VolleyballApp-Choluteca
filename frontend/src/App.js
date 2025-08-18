// Ruta: frontend/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout & Auth
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';

// Pages & Components
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './components/UserDashboard';
import UserList from './components/UserList';
import UserForm from './components/UserForm';
import TeamList from './components/TeamList';
import TeamForm from './components/TeamForm';
import PlayerList from './components/PlayerList';
import PlayerForm from './components/PlayerForm';
import TournamentList from './components/TournamentList';
import TournamentForm from './components/TournamentForm';
import ManageTournamentTeams from './components/ManageTournamentTeams';
import MatchList from './components/MatchList';
import MatchForm from './components/MatchForm';
import MatchCalendar from './components/MatchCalendar';

// --- NUEVO COMPONENTE IMPORTADO ---
import TournamentStandings from './components/TournamentStandings';

function App() {
  return (
    <>
      <Router>
        <div className='container'>
          <Header />
          <main>
            <Routes>
              {/* Rutas Públicas */}
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />

              {/* Rutas Privadas */}
              <Route path='/' element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
              <Route path='/dashboard' element={<PrivateRoute><UserDashboard /></PrivateRoute>} />

              {/* Gestión de Usuarios (Solo Superadmin) */}
              <Route path='/users' element={<PrivateRoute allowedRoles={['Superadmin']}><UserList /></PrivateRoute>} />
              <Route path='/users/new' element={<PrivateRoute allowedRoles={['Superadmin']}><UserForm /></PrivateRoute>} />
              <Route path='/users/edit/:id' element={<PrivateRoute allowedRoles={['Superadmin']}><UserForm /></PrivateRoute>} />

              {/* Gestión de Equipos (Admin & Superadmin) */}
              <Route path='/teams' element={<PrivateRoute allowedRoles={['Admin', 'Superadmin']}><TeamList /></PrivateRoute>} />
              <Route path='/teams/new' element={<PrivateRoute allowedRoles={['Admin', 'Superadmin']}><TeamForm /></PrivateRoute>} />
              <Route path='/teams/edit/:id' element={<PrivateRoute allowedRoles={['Admin', 'Superadmin']}><TeamForm /></PrivateRoute>} />

              {/* Gestión de Jugadores (Admin & Superadmin) */}
              <Route path='/players' element={<PrivateRoute allowedRoles={['Admin', 'Superadmin']}><PlayerList /></PrivateRoute>} />
              <Route path='/players/new' element={<PrivateRoute allowedRoles={['Admin', 'Superadmin']}><PlayerForm /></PrivateRoute>} />
              <Route path='/players/edit/:id' element={<PrivateRoute allowedRoles={['Admin', 'Superadmin']}><PlayerForm /></PrivateRoute>} />

              {/* Gestión de Torneos (Admin & Superadmin) */}
              <Route path='/tournaments' element={<PrivateRoute allowedRoles={['Admin', 'Superadmin']}><TournamentList /></PrivateRoute>} />
              <Route path='/tournaments/new' element={<PrivateRoute allowedRoles={['Admin', 'Superadmin']}><TournamentForm /></PrivateRoute>} />
              <Route path='/tournaments/edit/:id' element={<PrivateRoute allowedRoles={['Admin', 'Superadmin']}><TournamentForm /></PrivateRoute>} />
              <Route path='/tournaments/:tournamentId/teams' element={<PrivateRoute allowedRoles={['Admin', 'Superadmin']}><ManageTournamentTeams /></PrivateRoute>} />
              
              {/* --- NUEVA RUTA PARA LA TABLA DE POSICIONES --- */}
              {/* Esta ruta es accesible para todos los roles de usuario logueados */}
              <Route 
                path='/tournaments/:tournamentId/standings' 
                element={
                  <PrivateRoute allowedRoles={['Admin', 'Superadmin', 'Normal']}>
                    <TournamentStandings />
                  </PrivateRoute>
                } 
              />

              {/* Gestión de Partidos (Admin & Superadmin) */}
              <Route path='/matches' element={<PrivateRoute allowedRoles={['Admin', 'Superadmin']}><MatchList /></PrivateRoute>} />
              <Route path='/matches/new' element={<PrivateRoute allowedRoles={['Admin', 'Superadmin']}><MatchForm /></PrivateRoute>} />
              <Route path='/matches/edit/:id' element={<PrivateRoute allowedRoles={['Admin', 'Superadmin']}><MatchForm /></PrivateRoute>} />
              <Route path='/calendar' element={<PrivateRoute allowedRoles={['Admin', 'Superadmin']}><MatchCalendar /></PrivateRoute>} />
            </Routes>
          </main>
        </div>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </>
  );
}

export default App;
