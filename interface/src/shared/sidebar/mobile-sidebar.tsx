import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
} from 'lucide-react';
import './mobile-sidebar.css';

const MOBILE_NAV_ITEMS = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { to: '/produtos', label: 'Produtos', icon: Package },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/configuracoes', label: 'Config', icon: Settings },
];

export function MobileSidebar() {
  return (
    <nav className="mobile-nav">
      {MOBILE_NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `mobile-nav__item ${isActive ? 'mobile-nav__item--active' : ''}`
          }
        >
          <item.icon size={22} strokeWidth={2} />
          <span className="mobile-nav__label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
