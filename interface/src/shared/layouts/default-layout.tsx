import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../sidebar';
import { MobileSidebar } from '../sidebar/mobile-sidebar';
import { Header } from '../header';
import { Footer } from '../footer';
import { api, type Usuario } from '../../api/client';
import './default-layout.css';

interface DefaultLayoutProps {
  onLogout?: () => void;
}

type Theme = 'light' | 'dark';

function initialTheme(): Theme {
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function DefaultLayout({ onLogout }: DefaultLayoutProps) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === 'true');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<Usuario | null>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    let active = true;
    api.auth.me().then((u) => active && setUser(u)).catch(() => {});
    return () => { active = false; };
  }, []);

  // Fecha o drawer ao navegar
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Configuracoes dispara este evento ao trocar o tema
  useEffect(() => {
    const sync = (e: Event) => setTheme((e as CustomEvent<Theme>).detail);
    window.addEventListener('saleshub:theme', sync);
    return () => window.removeEventListener('saleshub:theme', sync);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen]);

  return (
    <div className="layout">
      <a href="#conteudo" className="layout__skip">Pular para o conteudo</a>

      <div
        className={`layout__overlay ${mobileOpen ? 'layout__overlay--visible' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={() => setCollapsed((c) => !c)}
        onCloseMobile={() => setMobileOpen(false)}
        onLogout={onLogout}
      />

      <div className={`layout__main ${collapsed ? 'layout__main--collapsed' : ''}`}>
        <Header
          theme={theme}
          user={user}
          onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
          onToggleMobileMenu={() => setMobileOpen((o) => !o)}
          onLogout={onLogout}
        />
        <main id="conteudo" className="layout__content" tabIndex={-1}>
          <Outlet />
        </main>
        <div className="layout__footer-desktop">
          <Footer />
        </div>
      </div>

      <MobileSidebar onMore={() => setMobileOpen(true)} />
    </div>
  );
}
