import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './auth/login';
import { Dashboard } from './pages/dashboard';
import { Pedidos } from './pages/pedidos';
import { Produtos } from './pages/produtos';
import { Clientes } from './pages/clientes';
import { Industrias } from './pages/industrias';
import { Configuracoes } from './pages/configuracoes';
import { DefaultLayout } from './shared';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<DefaultLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/industrias" element={<Industrias />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
