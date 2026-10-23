import { useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, LogOut } from 'lucide-react';
import type { Usuario } from '../../api/client';
import './header.css';

interface HeaderProps {
  theme: 'light' | 'dark';
  user?: Usuario | null;
  onToggleTheme: () => void;
  onToggleMobileMenu: () => void;
  onLogout?: () => void;
}

const TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/pedidos': 'Pedidos',
  '/produtos': 'Produtos',
  '/clientes': 'Clientes',
  '/industrias': 'Industrias',
  '/configuracoes': 'Configuracoes',
};

function initials(nome?: string) {
  const parts = (nome ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

export function Header({ theme, user, onToggleTheme, onToggleMobileMenu, onLogout }: HeaderProps) {
  const { pathname } = useLocation();
  const title = TITLES[pathname] ?? 'Sistema de Pedidos';

  return (
    <header className="app-header">
      <div className="header__left">
        <button
          className="header__hamburger"
          onClick={onToggleMobileMenu}
          aria-label="Abrir menu"
        >
          <Menu size={22} />
        </button>
        <h2 className="header__title" key={title}>{title}</h2>
      </div>

      <div className="header__right">
        <button
          className="header__icon-btn"
          onClick={onToggleTheme}
          aria-label={theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'}
          title="Alternar tema"
        >
          <span className="header__theme-icon" key={theme}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </span>
        </button>

        {onLogout && (
          <button
            className="header__icon-btn"
            onClick={onLogout}
            aria-label="Sair"
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        )}

        <div className="header__user" title={user?.email}>
          <div className="header__avatar" aria-hidden="true">{initials(user?.nome)}</div>
          {user && <span className="header__user-name">{user.nome.split(' ')[0]}</span>}
        </div>
      </div>
    </header>
  );
}
