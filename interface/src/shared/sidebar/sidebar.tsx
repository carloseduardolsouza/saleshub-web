import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Factory,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';
import './sidebar.css';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { to: '/produtos', label: 'Produtos', icon: Package },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/industrias', label: 'Industrias', icon: Factory },
];

const BOTTOM_ITEMS = [
  { to: '/configuracoes', label: 'Configuracoes', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  mobileOpen?: boolean;
  onToggle: () => void;
  onCloseMobile?: () => void;
  onLogout?: () => void;
}

export function Sidebar({ collapsed, mobileOpen = false, onToggle, onCloseMobile, onLogout }: SidebarProps) {
  const renderItem = (item: (typeof NAV_ITEMS)[number]) => (
    <NavLink
      key={item.to}
      to={item.to}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) => `sidebar-item ${isActive ? 'sidebar-item--active' : ''}`}
    >
      <item.icon size={20} />
      <span className="sidebar-item__label">{item.label}</span>
    </NavLink>
  );

  return (
    <aside
      className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''} ${mobileOpen ? 'sidebar--open' : ''}`}
      aria-label="Menu principal"
    >
      <div className="sidebar__header">
        <div className="sidebar__brand">
          <span className="sidebar__brand-icon">S</span>
          <span className="sidebar__brand-text">SalesHub</span>
        </div>
        <button
          className="sidebar__toggle"
          onClick={onToggle}
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>
        <button
          className="sidebar__close"
          onClick={onCloseMobile}
          aria-label="Fechar menu"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="sidebar__nav">{NAV_ITEMS.map(renderItem)}</nav>

      <div className="sidebar__bottom">
        {BOTTOM_ITEMS.map(renderItem)}
        <button
          className="sidebar-item sidebar-item--logout"
          title={collapsed ? 'Sair' : undefined}
          onClick={onLogout}
        >
          <LogOut size={20} />
          <span className="sidebar-item__label">Sair</span>
        </button>
      </div>
    </aside>
  );
}
