import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import { api, type Pedido } from '../../api/client';
import './Dashboard.css';

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  pendente: { label: 'Pendente', className: 'badge-pending' },
  processando: { label: 'Processando', className: 'badge-progress' },
  concluido: { label: 'Concluido', className: 'badge-done' },
  cancelado: { label: 'Cancelado', className: 'badge-late' },
};

export function Dashboard() {
  const [metrics, setMetrics] = useState([
    { label: 'Pedidos Hoje', value: '0', icon: ShoppingCart, color: 'var(--color-info)', change: '' },
    { label: 'Clientes', value: '0', icon: Users, color: 'var(--color-success)', change: '' },
    { label: 'Produtos', value: '0', icon: Package, color: 'var(--color-accent)', change: '' },
    { label: 'Faturamento', value: 'R$ 0,00', icon: TrendingUp, color: 'var(--color-primary)', change: '' },
  ]);
  const [recentOrders, setRecentOrders] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [pedidos, clientes, produtos] = await Promise.all([
          api.pedidos.getAll(),
          api.clientes.getAll(),
          api.produtos.getAll(),
        ]);

        const today = new Date().toISOString().split('T')[0];
        const pedidosHoje = pedidos.filter((p) => p.data?.startsWith(today));
        const faturamento = pedidos
          .filter((p) => p.status !== 'cancelado')
          .reduce((acc, p) => acc + p.total, 0);

        setMetrics([
          { label: 'Pedidos Hoje', value: String(pedidosHoje.length), icon: ShoppingCart, color: 'var(--color-info)', change: '' },
          { label: 'Clientes', value: String(clientes.length), icon: Users, color: 'var(--color-success)', change: '' },
          { label: 'Produtos', value: String(produtos.length), icon: Package, color: 'var(--color-accent)', change: '' },
          { label: 'Faturamento', value: `R$ ${faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'var(--color-primary)', change: '' },
        ]);

        setRecentOrders(pedidos.slice(0, 5));
      } catch {
        console.error('Erro ao carregar dashboard');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function formatPrice(value: number) {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  }

  function formatTime(date?: string) {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  if (loading) {
    return <div className="dashboard"><p>Carregando...</p></div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Dashboard</h1>
          <p className="dashboard__subtitle">Visao geral do seu negocio</p>
        </div>
      </div>

      <div className="dashboard__metrics">
        {metrics.map((m) => (
          <div key={m.label} className="metric-card" style={{ borderLeftColor: m.color }}>
            <div className="metric-card__header">
              <div className="metric-card__icon" style={{ background: m.color + '18' }}>
                <m.icon size={20} color={m.color} />
              </div>
              {m.change && <span className="metric-card__change">{m.change}</span>}
            </div>
            <span className="metric-card__value">{m.value}</span>
            <span className="metric-card__label">{m.label}</span>
          </div>
        ))}
      </div>

      <div className="dashboard__grid">
        <div className="dashboard__card">
          <div className="dashboard__card-header">
            <h2 className="dashboard__card-title">Pedidos Recentes</h2>
            <a href="/pedidos" className="dashboard__link">
              Ver todos <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="dashboard__orders">
            {recentOrders.length === 0 ? (
              <p className="dashboard__empty">Nenhum pedido encontrado</p>
            ) : (
              recentOrders.map((order) => {
                const status = STATUS_MAP[order.status ?? 'pendente'] ?? STATUS_MAP.pendente;
                return (
                  <div key={order.id} className="order-row">
                    <div className="order-row__left">
                      <span className="order-row__id">#{order.id}</span>
                      <span className="order-row__client">{order.cliente}</span>
                    </div>
                    <div className="order-row__right">
                      <span className={`badge ${status.className}`}>{status.label}</span>
                      <span className="order-row__total">{formatPrice(order.total)}</span>
                      <span className="order-row__time">{formatTime(order.data)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="dashboard__card">
          <div className="dashboard__card-header">
            <h2 className="dashboard__card-title">Acoes Rapidas</h2>
          </div>
          <div className="dashboard__actions">
            <a href="/pedidos" className="action-btn action-btn--primary">
              <ShoppingCart size={18} />
              <span>Novo Pedido</span>
            </a>
            <a href="/clientes" className="action-btn action-btn--success">
              <Users size={18} />
              <span>Novo Cliente</span>
            </a>
            <a href="/produtos" className="action-btn action-btn--accent">
              <Package size={18} />
              <span>Novo Produto</span>
            </a>
            <a href="/industrias" className="action-btn action-btn--info">
              <LayoutDashboard size={18} />
              <span>Industrias</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
