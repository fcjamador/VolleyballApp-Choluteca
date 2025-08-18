// frontend/src/components/Header.js
import React from 'react';
import { FaSignInAlt, FaSignOutAlt, FaUser, FaUsers, FaClipboardList, FaTrophy, FaVolleyballBall, FaCalendarAlt } from 'react-icons/fa'; // Importa FaCalendarAlt
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';
import { toast } from 'react-toastify';

function Header() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const onLogout = () => {
        dispatch(logout());
        dispatch(reset());
        navigate('/');
        toast.info('Sesión cerrada.');
    };

    return (
        <header className='header'>
            <div className='logo'>
                <Link to='/'>VolleyballApp</Link>
            </div>
            <nav>
                <ul className="flex items-center">
                    {user ? (
                        <>
                            {/* Enlaces de administración */}
                            {user.role === 'Admin' || user.role === 'Superadmin' ? (
                                <>
                                    <li>
                                        <Link to='/users'>
                                            <FaUsers className='mr-1' /> Usuarios
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to='/teams'>
                                            <FaVolleyballBall className='mr-1' /> Equipos
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to='/players'>
                                            <FaUser className='mr-1' /> Jugadores
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to='/tournaments'>
                                            <FaTrophy className='mr-1' /> Torneos
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to='/matches'>
                                            <FaClipboardList className='mr-1' /> Partidos
                                        </Link>
                                    </li>
                                    {/* ¡NUEVO ENLACE AQUÍ! */}
                                    <li>
                                        <Link to='/calendar'>
                                            <FaCalendarAlt className='mr-1' /> Calendario
                                        </Link>
                                    </li>
                                </>
                            ) : null}
                            <li>
                                <button className='btn-logout' onClick={onLogout}>
                                    <FaSignOutAlt className='mr-1' /> Salir
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <Link to='/login'>
                                    <FaSignInAlt className='mr-1' /> Iniciar Sesión
                                </Link>
                            </li>
                            <li>
                                <Link to='/register'>
                                    <FaUser className='mr-1' /> Registrarse
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </nav>
        </header>
    );
}

export default Header;