import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../sidebar';
import { MobileSidebar } from '../sidebar/mobile-sidebar';
import { Header } from '../header';
import { Footer } from '../footer';
import './default-layout.css';

interface DefaultLayoutProps {
  onLogout?: () => void;
}

export function DefaultLayout({ onLogout }: DefaultLayoutProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  function toggleTheme() {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }

  function toggleCollapsed() {
    setCollapsed((prev) => !prev);
  }

  function toggleMobileMenu() {
    setMobileOpen((prev) => !prev);
  }

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <div className="layout">
      {mobileOpen && (
        <div className="layout__overlay" onClick={closeMobile} />
      )}

      <div className="layout__sidebar-desktop">
        <Sidebar collapsed={collapsed} onToggle={toggleCollapsed} />
      </div>

      <div className="layout__main">
        <Header
          theme={theme}
          onToggleTheme={toggleTheme}
          onToggleMobileMenu={toggleMobileMenu}
          onLogout={onLogout}
        />
        <main className="layout__content">
          <Outlet />
        </main>
        <div className="layout__footer-desktop">
          <Footer />
        </div>
      </div>

      <MobileSidebar />
    </div>
  );
}
