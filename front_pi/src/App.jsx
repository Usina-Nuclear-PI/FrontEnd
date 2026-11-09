import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Alertas from './pages/Alertas';
import Historico from './pages/Historico';
import Sensores from './pages/Sensores';
import Equipamentos from './pages/Equipamentos';
import GraficosHistoricos from './pages/GraficosHistoricos';
import Relatorios from './pages/Relatorios';
import Configuracoes from './pages/Configuracoes';
import Usuarios from './pages/Usuarios';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('usuario');
    const tipoSalvo = localStorage.getItem('userType');
    if (usuarioSalvo && tipoSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
      setUserType(tipoSalvo);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (type, userData) => {
    setUserType(type);
    setUsuario(userData);
    setIsAuthenticated(true);
    localStorage.setItem('userType', type);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserType(null);
    setUsuario(null);
    localStorage.removeItem('usuario');
    localStorage.removeItem('userType');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout userType={userType} usuario={usuario} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/alertas" element={<Alertas />} />
        <Route path="/historico" element={<Historico />} />
        <Route path="/sensores" element={<Sensores />} />
        <Route path="/equipamentos" element={<Equipamentos />} />
        <Route path="/graficos-historicos" element={<GraficosHistoricos />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        {userType === 'admin' && (
          <Route path="/usuarios" element={<Usuarios />} />
        )}
      </Routes>
    </Layout>
  );
}

export default App;
