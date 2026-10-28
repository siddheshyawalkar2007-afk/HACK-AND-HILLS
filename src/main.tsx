import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { Web3Provider } from './context/Web3Context';
import { AppProvider } from './context/AppContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <Web3Provider>
        <AppProvider>
          <App />
        </AppProvider>
      </Web3Provider>
    </AuthProvider>
  </React.StrictMode>
);

