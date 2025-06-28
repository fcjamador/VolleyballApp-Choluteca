import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register, reset } from '../features/auth/authSlice';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '', // Para confirmar contraseña
  });

  const { username, email, password, password2 } = formData;

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
      navigate('/dashboard'); // Redirige al dashboard si el registro es exitoso o ya está logueado
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

    if (password !== password2) {
      console.error('Las contraseñas no coinciden.');
      // Aquí podrías mostrar un toast o alerta
      return;
    } else {
      const userData = {
        username,
        email,
        password,
        // Por defecto, se registrará como rol 'Normal' en el backend
      };
      dispatch(register(userData));
    }
  };

  if (isLoading) {
    return <h2>Cargando...</h2>; // Puedes reemplazar con un spinner
  }

  return (
    <div>
      <h2>Registrarse</h2>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          name="username"
          value={username}
          onChange={onChange}
          placeholder="Ingrese su nombre de usuario"
          required
        />
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
        <input
          type="password"
          name="password2"
          value={password2}
          onChange={onChange}
          placeholder="Confirme su contraseña"
          required
        />
        <button type="submit">Registrarse</button>
      </form>
      {isError && <p style={{ color: 'red' }}>Error: {message}</p>}
    </div>
  );
}

export default Register;