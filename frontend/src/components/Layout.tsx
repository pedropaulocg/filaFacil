import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="layout">
      <nav className="nav">
        <span className="brand">FilaFácil</span>
        <div className="nav-links">
          <NavLink to="/criar">Criar senha</NavLink>
          <NavLink to="/fila">Fila</NavLink>
          <NavLink to="/chamar">Chamar</NavLink>
        </div>
        <div className="nav-user">
          <span>{user?.name}</span>
          <button type="button" className="link-button" onClick={logout}>
            Sair
          </button>
        </div>
      </nav>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
