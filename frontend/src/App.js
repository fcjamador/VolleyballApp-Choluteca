import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
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
import TournamentStandings from './pages/TournamentStandings';
import PlayerStandings from './pages/PlayerStandings';
import UploadPoints from './pages/PlayerPointsUpload';
import PublicLiveMatchView from './public/PublicLiveMatchView';
import UserDashboard from './components/UserDashboard';
import TournamentTeamManagement from './pages/TournamentTeamManagement';


function App() {
  return (
    <>
      <Router>
        <div className='container'>
          <Header />
          <Routes>
            {/* Rutas Públicas */}
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/public/match/:matchId' element={<PublicLiveMatchView />} />

            {/* Rutas Protegidas */}
            <Route path='/' element={<PrivateRoute><UserDashboard /></PrivateRoute>} /> {/* Ruta raíz protegida */}
            <Route path='/dashboard' element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
            {/* Rutas de Usuarios (solo Admin) */}
            <Route path='/users' element={<PrivateRoute allowedRoles={['Admin']}><UserList /></PrivateRoute>} />
            <Route path='/users/new' element={<PrivateRoute allowedRoles={['Admin']}><UserForm /></PrivateRoute>} />
            <Route path='/users/edit/:id' element={<PrivateRoute allowedRoles={['Admin']}><UserForm /></PrivateRoute>} />

            {/* Rutas de Equipos (Admin) */}
            <Route path='/teams' element={<PrivateRoute allowedRoles={['Admin']}><TeamList /></PrivateRoute>} />
            <Route path='/teams/new' element={<PrivateRoute allowedRoles={['Admin']}><TeamForm /></PrivateRoute>} />
            <Route path='/teams/edit/:id' element={<PrivateRoute allowedRoles={['Admin']}><TeamForm /></PrivateRoute>} />

            {/* Rutas de Jugadores (Admin y Normal para ver standings) */}
            <Route path='/players' element={<PrivateRoute allowedRoles={['Admin']}><PlayerList /></PrivateRoute>} />
            <Route path='/players/new' element={<PrivateRoute allowedRoles={['Admin']}><PlayerForm /></PrivateRoute>} />
            <Route path='/players/edit/:id' element={<PrivateRoute allowedRoles={['Admin']}><PlayerForm /></PrivateRoute>} />
            <Route path='/players/upload-points' element={<PrivateRoute allowedRoles={['Admin']}><UploadPoints /></PrivateRoute>} />
            <Route path='/players/standings' element={<PrivateRoute allowedRoles={['Admin', 'User']}><PlayerStandings /></PrivateRoute>} />

            {/* Rutas de Torneos (Admin) */}
            <Route path='/tournaments' element={<PrivateRoute allowedRoles={['Admin']}><TournamentList /></PrivateRoute>} />
            <Route path='/tournaments/new' element={<PrivateRoute allowedRoles={['Admin']}><TournamentForm /></PrivateRoute>} />
            <Route path='/tournaments/edit/:id' element={<PrivateRoute allowedRoles={['Admin']}><TournamentForm /></PrivateRoute>} />
            <Route path='/tournaments/:tournamentId/teams' element={<PrivateRoute allowedRoles={['Admin']}><ManageTournamentTeams /></PrivateRoute>} />
            <Route path='/tournaments/:tournamentId/standings' element={<PrivateRoute allowedRoles={['Admin', 'User']}><TournamentStandings /></PrivateRoute>} />
            <Route path='/tournaments/:tournamentId/manage-teams' element={<PrivateRoute allowedRoles={['Admin']}><TournamentTeamManagement /></PrivateRoute>} />


            {/* Rutas de Partidos (Admin) */}
            <Route path='/matches' element={<PrivateRoute allowedRoles={['Admin']}><MatchList /></PrivateRoute>} />
            <Route path='/matches/new' element={<PrivateRoute allowedRoles={['Admin']}><MatchForm /></PrivateRoute>} />
            <Route path='/matches/edit/:id' element={<PrivateRoute allowedRoles={['Admin']}><MatchForm /></PrivateRoute>} />
            <Route path='/calendar' element={<PrivateRoute allowedRoles={['Admin']}><MatchCalendar /></PrivateRoute>} />

          </Routes>
        </div>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;