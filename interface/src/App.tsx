import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Login } from './auth/login';
import { Dashboard } from './pages/dashboard';
import { Pedidos } from './pages/pedidos';
import { Produtos } from './pages/produtos';
import { Clientes } from './pages/clientes';
import { Industrias } from './pages/industrias';
import { Configuracoes } from './pages/configuracoes';
import { DefaultLayout } from './shared';
import { api } from './api/client';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!api.auth.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const [authenticated, setAuthenticated] = useState(api.auth.isAuthenticated());

  useEffect(() => {
    if (authenticated) {
      api.auth.me().catch(() => {
        api.auth.logout();
        setAuthenticated(false);
      });
    }
  }, [authenticated]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            authenticated
              ? <Navigate to="/dashboard" replace />
              : <Login onLogin={() => setAuthenticated(true)} />
          }
        />

        <Route element={<ProtectedRoute><DefaultLayout onLogout={() => { api.auth.logout(); setAuthenticated(false); }} /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/industrias" element={<Industrias />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Route>

        <Route path="*" element={<Navigate to={authenticated ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
