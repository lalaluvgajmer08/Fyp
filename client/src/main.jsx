import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import router from './routes/router.jsx';
import queryClient from './config/queryClient.js';
import './styles/index.css';

// Providers sit outside the router so ProtectedRoute, Login and every admin
// page can read the session, raise toasts and translate from anywhere in the
// tree. LanguageProvider is outermost because api.js reads the stored language
// on every request, so it must be settled before the first query fires.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </LanguageProvider>
  </React.StrictMode>
);
