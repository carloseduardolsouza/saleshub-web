import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import './Dashboard.css';

const METRICS = [
  { label: 'Pedidos Hoje', value: '12', icon: ShoppingCart, color: 'var(--color-info)', change: '+8%' },
  { label: 'Clientes', value: '148', icon: Users, color: 'var(--color-success)', change: '+3%' },
  { label: 'Produtos', value: '326', icon: Package, color: 'var(--color-accent)', change: '+5%' },
  { label: 'Faturamento', value: 'R$ 24.580', icon: TrendingUp, color: 'var(--color-primary)', change: '+12%' },
];

const RECENT_ORDERS = [
  { id: '#1042', client: 'Maria Silva', total: 'R$ 458,90', status: 'pendente', time: '14:32' },
  { id: '#1041', client: 'Joao Santos', total: 'R$ 1.230,00', status: 'em_preparo', time: '13:15' },
  { id: '#1040', client: 'Ana Oliveira', total: 'R$ 89,50', status: 'pronto', time: '12:48' },
  { id: '#1039', client: 'Carlos Souza', total: 'R$ 345,00', status: 'entregue', time: '11:20' },
  { id: '#1038', client: 'Lucia Ferreira', total: 'R$ 672,30', status: 'atrasado', time: '10:05' },
];

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  pendente: { label: 'Pendente', className: 'badge-pending' },
  em_preparo: { label: 'Em Preparo', className: 'badge-progress' },
  pronto: { label: 'Pronto', className: 'badge-ready' },
  atrasado: { label: 'Atrasado', className: 'badge-late' },
  entregue: { label: 'Entregue', className: 'badge-done' },
};

export function Dashboard() {
  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Dashboard</h1>
          <p className="dashboard__subtitle">Visao geral do seu negocio</p>
        </div>
      </div>

      <div className="dashboard__metrics">
        {METRICS.map((m) => (
          <div key={m.label} className="metric-card" style={{ borderLeftColor: m.color }}>
            <div className="metric-card__header">
              <div className="metric-card__icon" style={{ background: m.color + '18' }}>
                <m.icon size={20} color={m.color} />
              </div>
              <span className="metric-card__change">{m.change}</span>
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
            {RECENT_ORDERS.map((order) => {
              const status = STATUS_MAP[order.status];
              return (
                <div key={order.id} className="order-row">
                  <div className="order-row__left">
                    <span className="order-row__id">{order.id}</span>
                    <span className="order-row__client">{order.client}</span>
                  </div>
                  <div className="order-row__right">
                    <span className={`badge ${status.className}`}>{status.label}</span>
                    <span className="order-row__total">{order.total}</span>
                    <span className="order-row__time">{order.time}</span>
                  </div>
                </div>
              );
            })}
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
