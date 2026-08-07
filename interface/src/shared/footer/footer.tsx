import './footer.css';

export function Footer() {
  return (
    <footer className="app-footer">
      <span className="footer__text">
        SalesHub &copy; {new Date().getFullYear()} — Controle de Pedidos
      </span>
    </footer>
  );
}
