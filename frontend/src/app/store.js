import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice'; // Crearemos esto en breve

export const store = configureStore({
  reducer: {
    auth: authReducer, // Aquí registraremos nuestro slice de autenticación
    // Agrega más slices aquí a medida que la app crezca (ej. teams, tournaments)
  },
});