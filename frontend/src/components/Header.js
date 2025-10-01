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
        <header className='flex justify-between items-center p-4 bg-white bg-opacity-80 backdrop-blur-md rounded-t-lg shadow-sm'>
            <div className='logo text-2xl font-bold text-gray-800'>
                <Link to='/' className="hover:text-blue-600 transition-colors">VolleyballApp</Link>
            </div>
            <nav>
                <ul className="flex items-center space-x-6">
                    {user ? (
                        <>
                            {/* Enlaces de administración */}
                            {user.role === 'Admin' && (
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
                            )}
                            <li>
                                <button className='bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 flex items-center' onClick={onLogout}>
                                    <FaSignOutAlt className='mr-1' /> Salir
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <Link to='/login' className="text-gray-600 hover:text-blue-600 font-semibold flex items-center">
                                    <FaSignInAlt className='mr-1' /> Iniciar Sesión
                                </Link>
                            </li>
                            <li>
                                <Link to='/register' className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 flex items-center">
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