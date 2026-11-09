import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bell,
  History,
  Radio,
  Box,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Users
} from 'lucide-react';
import './Layout.css';

function Layout({ children, userType, usuario, onLogout }) {
  const menuItems = [
    {
      section: 'MONITORAMENTO',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
        { path: '/alertas', label: 'Alertas', icon: Bell, badge: null },
        { path: '/historico', label: 'Histórico', icon: History, badge: null },
        { path: '/sensores', label: 'Sensores', icon: Radio, badge: null },
        { path: '/equipamentos', label: 'Equipamentos', icon: Box, badge: null },
      ]
    },
    {
      section: 'ANÁLISE',
      items: [
        { path: '/graficos-historicos', label: 'Gráficos históricos', icon: BarChart3, badge: null },
        { path: '/relatorios', label: 'Relatórios', icon: FileText, badge: null },
      ]
    },
    {
      section: 'ADMINISTRAÇÃO',
      items: [
        { path: '/configuracoes', label: 'Configurações', icon: Settings, badge: null },
        ...(userType === 'admin' ? [{ path: '/usuarios', label: 'Usuários', icon: Users, badge: null }] : []),
      ]
    }
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">FI</div>
            <span className="logo-text">NUCLENAI</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((section) => (
            <div key={section.section} className="nav-section">
              <h3 className="nav-section-title">{section.section}</h3>
              <ul className="nav-list">
                {section.items.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `nav-link ${isActive ? 'active' : ''}`
                      }
                    >
                      <item.icon size={20} />
                      <span className="nav-label">{item.label}</span>
                      {item.badge && (
                        <span className="nav-badge">{item.badge}</span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {usuario?.nome?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <div className="user-name">
                {usuario?.nome || 'Usuário'}
              </div>
              <div className="user-role">
                {userType === 'admin' ? 'Administrador' : 'Operador'}
              </div>
            </div>
          </div>
          <button className="logout-btn" onClick={onLogout} title="Sair">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;
