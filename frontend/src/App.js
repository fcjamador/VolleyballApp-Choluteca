import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from './features/auth/authSlice';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement'; // Nueva
import TeamManagement from './pages/TeamManagement'; // Nueva
import PlayerManagement from './pages/PlayerManagement'; // Nueva
import AdminNavbar from './components/AdminNavbar'; // Nueva
import './App.css';

// Componente para proteger rutas. Se mueve fuera para mejor práctica y rendimiento.
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    // Si no está logueado, redirige a /login
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Si está logueado pero no tiene el rol permitido, redirige al dashboard
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function AppLayout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/'); // Redirige a la página de inicio o login
  };

  return (
    <>
      <header className="navbar">
        <div className="logo">
          <Link to="/">Voleibol App</Link>
        </div>
        <nav>
          <ul>
            {user ? (
              <>
                <li>
                  <Link to="/dashboard">Dashboard</Link>
                </li>
                <li>
                  <button className="btn" onClick={onLogout}>
                    Cerrar Sesión
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login">Iniciar Sesión</Link>
                </li>
                <li>
                  <Link to="/register">Registrarse</Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </header>

      {/* Renderiza AdminNavbar solo si el usuario es Admin o Superadmin */}
      {(user && (user.role === 'Admin' || user.role === 'Superadmin')) && <AdminNavbar />}

      <div className="container">
        <Routes>
          <Route path="/" element={<h1>Página de Inicio</h1>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Rutas de administración protegidas */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['Superadmin']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/teams"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Superadmin']}>
                <TeamManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/players"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Superadmin']}>
                <PlayerManagement />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
