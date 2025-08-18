import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register, reset } from '../features/auth/authSlice';
import { toast } from 'react-toastify';
import { FaUser } from 'react-icons/fa';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
  });

  const { username, email, password, password2 } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess || user) {
      navigate('/dashboard');
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (password !== password2) {
      toast.error('Las contraseñas no coinciden.');
      return;
    } else {
      const userData = {
        username,
        email,
        password,
      };
      dispatch(register(userData));
    }
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-80px)] bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <section className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center">
            <FaUser className="mr-3 text-green-600" /> Registrarse
          </h1>
          <p className="text-gray-600 mt-2">Crea una cuenta para empezar a usar la app</p>
        </section>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              name="username"
              value={username}
              onChange={onChange}
              placeholder="Nombre de usuario"
              required
            />
          </div>
          <div>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="Correo electrónico"
              required
            />
          </div>
          <div>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              name="password"
              value={password}
              onChange={onChange}
              placeholder="Contraseña"
              required
            />
          </div>
          <div>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              name="password2"
              value={password2}
              onChange={onChange}
              placeholder="Confirmar contraseña"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-green-700 transition duration-300 shadow-lg"
            >
              Registrarse
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;