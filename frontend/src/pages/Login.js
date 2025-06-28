import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, reset } from '../features/auth/authSlice';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      console.error(message); // Aquí podrías mostrar un toast o alerta
    }

    if (isSuccess || user) {
      navigate('/dashboard'); // Redirige al dashboard si el login es exitoso o ya está logueado
    }

    dispatch(reset()); // Limpia el estado de Redux
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const userData = {
      email,
      password,
    };
    dispatch(login(userData));
  };

  if (isLoading) {
    return <h2>Cargando...</h2>; // Puedes reemplazar con un spinner
  }

  return (
    <div>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={onSubmit}>
        <input
          type="email"
          name="email"
          value={email}
          onChange={onChange}
          placeholder="Ingrese su email"
          required
        />
        <input
          type="password"
          name="password"
          value={password}
          onChange={onChange}
          placeholder="Ingrese su contraseña"
          required
        />
        <button type="submit">Iniciar Sesión</button>
      </form>
      {isError && <p style={{ color: 'red' }}>Error: {message}</p>}
    </div>
  );
}

export default Login;