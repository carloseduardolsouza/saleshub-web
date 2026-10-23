import { useState, useEffect, useRef, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import { api, type Pedido } from '../../api/client';
import './dashboard.css';

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  pendente: { label: 'Pendente', className: 'badge-pending' },
  processando: { label: 'Processando', className: 'badge-progress' },
  concluido: { label: 'Concluido', className: 'badge-done' },
  cancelado: { label: 'Cancelado', className: 'badge-late' },
};

const formatInt = (v: number) => String(Math.round(v));
const formatPrice = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function formatTime(date?: string) {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function CountUp({ value, format }: { value: number; format: (v: number) => string }) {
  const [shown, setShown] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      from.current = value;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShown(value);
      return;
    }
    const origin = from.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 900);
      const v = origin + (value - origin) * (1 - Math.pow(1 - t, 3));
      from.current = v;
      setShown(v);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{format(shown)}</>;
}

export function Dashboard() {
  const [counts, setCounts] = useState({ hoje: 0, clientes: 0, produtos: 0, faturamento: 0 });
  const [recentOrders, setRecentOrders] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [pedidos, clientes, produtos] = await Promise.all([
          api.pedidos.getAll(),
          api.clientes.getAll(),
          api.produtos.getAll(),
        ]);

        // Compara no fuso local (toISOString usa UTC e erra "hoje" a noite)
        const hoje = new Date().toDateString();
        const pedidosHoje = pedidos.filter((p) => p.data && new Date(p.data).toDateString() === hoje);
        const faturamento = pedidos
          .filter((p) => p.status !== 'cancelado')
          .reduce((acc, p) => acc + p.total, 0);

        setCounts({ hoje: pedidosHoje.length, clientes: clientes.length, produtos: produtos.length, faturamento });
        setRecentOrders(pedidos.slice(0, 5));
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const metrics = [
    { label: 'Pedidos Hoje', value: counts.hoje, icon: ShoppingCart, color: 'var(--color-info)', format: formatInt },
    { label: 'Clientes', value: counts.clientes, icon: Users, color: 'var(--color-success)', format: formatInt },
    { label: 'Produtos', value: counts.produtos, icon: Package, color: 'var(--color-warning)', format: formatInt },
    { label: 'Faturamento', value: counts.faturamento, icon: TrendingUp, color: 'var(--color-accent)', format: formatPrice },
  ];

  if (loading) {
    return (
      <div className="dashboard" aria-busy="true">
        <div className="skeleton skeleton--title" />
        <div className="dashboard__metrics">
          {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton skeleton--card" />)}
        </div>
        <div className="skeleton skeleton--block" />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Dashboard</h1>
          <p className="dashboard__subtitle">Visao geral do seu negocio</p>
        </div>
      </div>

      {error && (
        <div className="dashboard__error" role="alert">
          Nao foi possivel carregar todos os dados. Verifique a conexao e recarregue a pagina.
        </div>
      )}

      <div className="dashboard__metrics">
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className="metric-card"
            style={{ '--accent': m.color, animationDelay: `${i * 70}ms` } as CSSProperties}
          >
            <div className="metric-card__header">
              <div className="metric-card__icon">
                <m.icon size={20} color={m.color} />
              </div>
            </div>
            <span className="metric-card__value"><CountUp value={m.value} format={m.format} /></span>
            <span className="metric-card__label">{m.label}</span>
          </div>
        ))}
      </div>

      <div className="dashboard__grid">
        <div className="dashboard__card">
          <div className="dashboard__card-header">
            <h2 className="dashboard__card-title">Pedidos Recentes</h2>
            <Link to="/pedidos" className="dashboard__link">
              Ver todos <ArrowUpRight size={14} />
            </Link>
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
            <Link to="/pedidos" className="action-btn action-btn--primary">
              <ShoppingCart size={18} />
              <span>Pedidos</span>
            </Link>
            <Link to="/clientes" className="action-btn action-btn--success">
              <Users size={18} />
              <span>Clientes</span>
            </Link>
            <Link to="/produtos" className="action-btn action-btn--accent">
              <Package size={18} />
              <span>Produtos</span>
            </Link>
            <Link to="/industrias" className="action-btn action-btn--info">
              <LayoutDashboard size={18} />
              <span>Industrias</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
