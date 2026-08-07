import { Sun, Moon, Bell, Menu } from 'lucide-react';
import './header.css';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onToggleMobileMenu: () => void;
}

export function Header({ theme, onToggleTheme, onToggleMobileMenu }: HeaderProps) {
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
        <h2 className="header__title">Sistema de Pedidos</h2>
      </div>

      <div className="header__right">
        <button
          className="header__icon-btn"
          aria-label="Notificacoes"
        >
          <Bell size={20} />
        </button>

        <button
          className="header__icon-btn"
          onClick={onToggleTheme}
          aria-label="Alternar tema"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <div className="header__avatar">
          <span>U</span>
        </div>
      </div>
    </header>
  );
}
