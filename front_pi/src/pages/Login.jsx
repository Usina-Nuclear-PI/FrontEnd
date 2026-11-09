import { useState } from 'react';
import { User, Settings, LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import './Login.css';

function Login({ onLogin }) {
  const [tipoUsuario, setTipoUsuario] = useState('admin');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const response = await api.login(email, senha);

      if (response.success) {
        localStorage.setItem('usuario', JSON.stringify(response.usuario));
        onLogin(tipoUsuario, response.usuario);
      } else {
        setErro(response.message || 'Email ou senha inválidos');
      }
    } catch (error) {
      setErro('Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setCarregando(false);
    }
  };

  const preencherCredenciais = (tipo) => {
    setTipoUsuario(tipo);
    if (tipo === 'admin') {
      setEmail('admin@nuclenai.com');
      setSenha('admin123');
    } else {
      setEmail('operador@nuclenai.com');
      setSenha('operador123');
    }
    setErro('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-icon">
          <div className="nuclenai-logo">FI</div>
        </div>

        <h1 className="login-title">NUCLENAI</h1>
        <p className="login-subtitle">Plataforma de monitoramento operacional</p>

        <div className="login-tipo-tabs">
          <button
            className={`tipo-tab ${tipoUsuario === 'admin' ? 'active' : ''}`}
            onClick={() => preencherCredenciais('admin')}
          >
            <User size={18} />
            Administrador
          </button>
          <button
            className={`tipo-tab ${tipoUsuario === 'operador' ? 'active' : ''}`}
            onClick={() => preencherCredenciais('operador')}
          >
            <Settings size={18} />
            Operador
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>
              <Mail size={18} />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              disabled={carregando}
            />
          </div>

          <div className="form-group">
            <label>
              <Lock size={18} />
              Senha
            </label>
            <div className="password-input-wrapper">
              <input
                type={mostrarSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                disabled={carregando}
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                tabIndex={-1}
              >
                {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {erro && (
            <div className="login-erro">
              {erro}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={carregando}
          >
            <LogIn size={18} />
            {carregando ? 'Entrando...' : 'Entrar no Sistema'}
          </button>
        </form>

        <p className="login-footer">
          Acesso protegido • Autenticação e controle de permissões
        </p>
      </div>
    </div>
  );
}

export default Login;
