import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { store } from './app/store'; // Importa tu store
import { Provider } from 'react-redux'; // Importa Provider

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Provider store={store}> {/* Envuelve App con Provider y pasa el store */}
      <App />
    </Provider>
  </React.StrictMode>
);
