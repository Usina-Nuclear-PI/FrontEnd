import { useState, useEffect } from 'react';
import { Users, Mail, Trash2, UserPlus, Shield } from 'lucide-react';
import api from '../services/api';
import './Usuarios.css';

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [novoUsuario, setNovoUsuario] = useState({
    nome: '',
    email: '',
    senha: ''
  });
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      const data = await api.getUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const handleCriarUsuario = async (e) => {
    e.preventDefault();
    setCarregando(true);

    try {
      await api.createUsuario(novoUsuario);
      setMostrarForm(false);
      setNovoUsuario({ nome: '', email: '', senha: '' });
      carregarUsuarios();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      alert('Erro ao criar usuário');
    } finally {
      setCarregando(false);
    }
  };

  const handleDeletarUsuario = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja deletar o usuário "${nome}"?`)) {
      try {
        await api.deleteUsuario(id);
        carregarUsuarios();
      } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        alert('Erro ao deletar usuário');
      }
    }
  };

  return (
    <div className="usuarios-page">
      <div className="page-header">
        <div className="header-content">
          <Users size={32} />
          <div>
            <h1>Gerenciamento de Usuários</h1>
            <p>Administre os usuários do sistema</p>
          </div>
        </div>
        <button
          className="btn-criar-usuario"
          onClick={() => setMostrarForm(!mostrarForm)}
        >
          <UserPlus size={18} />
          {mostrarForm ? 'Cancelar' : 'Novo Usuário'}
        </button>
      </div>

      {mostrarForm && (
        <div className="form-criar-usuario">
          <h3>Criar Novo Usuário</h3>
          <form onSubmit={handleCriarUsuario}>
            <div className="form-row">
              <div className="form-group">
                <label>Nome Completo</label>
                <input
                  type="text"
                  value={novoUsuario.nome}
                  onChange={(e) => setNovoUsuario({...novoUsuario, nome: e.target.value})}
                  placeholder="Nome do usuário"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={novoUsuario.email}
                  onChange={(e) => setNovoUsuario({...novoUsuario, email: e.target.value})}
                  placeholder="usuario@email.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Senha</label>
                <input
                  type="password"
                  value={novoUsuario.senha}
                  onChange={(e) => setNovoUsuario({...novoUsuario, senha: e.target.value})}
                  placeholder="Senha inicial"
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn-submit" disabled={carregando}>
              {carregando ? 'Criando...' : 'Criar Usuário'}
            </button>
          </form>
        </div>
      )}

      <div className="usuarios-lista">
        <table className="usuarios-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>#{usuario.id}</td>
                <td>
                  <div className="usuario-nome">
                    <Shield size={16} />
                    {usuario.nome}
                  </div>
                </td>
                <td>
                  <div className="usuario-email">
                    <Mail size={14} />
                    {usuario.email}
                  </div>
                </td>
                <td>
                  <button
                    className="btn-deletar"
                    onClick={() => handleDeletarUsuario(usuario.id, usuario.nome)}
                    title="Deletar usuário"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {usuarios.length === 0 && (
          <div className="empty-state">
            <Users size={48} />
            <p>Nenhum usuário cadastrado</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Usuarios;
