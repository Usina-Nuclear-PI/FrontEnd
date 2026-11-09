import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import api from '../services/api';
import './Equipamentos.css';

function Equipamentos() {
  const [circuitos, setCircuitos] = useState([]);
  const [monitoramentos, setMonitoramentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [novoEquipamento, setNovoEquipamento] = useState({
    nome: '',
    tipo: 'Reator',
    localizacao: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [circuitosData, monitoramentosData] = await Promise.all([
        api.getCircuitos(),
        api.getMonitoramento()
      ]);
      setCircuitos(circuitosData);
      setMonitoramentos(monitoramentosData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const getEquipamentosData = () => {
    return circuitos.map(circuito => {
      const readings = monitoramentos.filter(m => m.idCircuito === circuito.id);
      const latestReading = readings.sort((a, b) =>
        new Date(b.dataHora) - new Date(a.dataHora)
      )[0];

      const lastHour = new Date(Date.now() - 60 * 60 * 1000);
      const recentReadings = readings.filter(m => new Date(m.dataHora) > lastHour);
      const sensoresOnline = recentReadings.length;
      const sensoresTotal = 12; // Estimativa
      const disponibilidade = ((sensoresOnline / sensoresTotal) * 100).toFixed(1);

      let status = 'Operando';
      let statusClass = 'status-operating';

      if (disponibilidade < 80) {
        status = 'Atenção';
        statusClass = 'status-warning';
      }

      if (disponibilidade < 50) {
        status = 'Manutenção';
        statusClass = 'status-maintenance';
      }

      return {
        id: circuito.id,
        nome: circuito.nome,
        tipo: circuito.nome.includes('Reator') ? 'Reator' :
              circuito.nome.includes('Bomba') ? 'Bomba' :
              circuito.nome.includes('Fluxo') ? 'Sistema de fluxo' : 'Equipamento',
        localizacao: 'Unidade de geração • Área principal',
        status,
        statusClass,
        sensoresOnline,
        sensoresTotal,
        disponibilidade
      };
    });
  };

  const equipamentos = getEquipamentosData();

  const handleCadastrarEquipamento = async (e) => {
    e.preventDefault();
    try {
      // Simular cadastro (normalmente seria chamada à API)
      alert(`Equipamento cadastrado com sucesso!\n\nNome: ${novoEquipamento.nome}\nTipo: ${novoEquipamento.tipo}\nLocalização: ${novoEquipamento.localizacao}`);
      setMostrarModal(false);
      setNovoEquipamento({ nome: '', tipo: 'Reator', localizacao: '' });
      fetchData();
    } catch (error) {
      console.error('Erro ao cadastrar equipamento:', error);
      alert('Erro ao cadastrar equipamento');
    }
  };

  const handleVerSensores = (equipId) => {
    navigate('/sensores');
  };

  if (loading) {
    return (
      <div className="equipamentos-page">
        <div className="loading-container">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="equipamentos-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-label">INFRAESTRUTURA</div>
          <h1 className="page-title">Equipamentos</h1>
          <p className="page-description">Equipamentos monitorados e seus respectivos sensores.</p>
        </div>
        <button className="btn-add" onClick={() => setMostrarModal(true)}>
          <Plus size={18} />
          Cadastrar equipamento
        </button>
      </div>

      <div className="equipamentos-grid">
        {equipamentos.map(equip => (
          <div key={equip.id} className="equipamento-card">
            <div className="equip-header">
              <div className="equip-icon">
                <span>⚙️</span>
              </div>
              <span className={`equip-status ${equip.statusClass}`}>{equip.status}</span>
            </div>

            <h3 className="equip-name">{equip.nome}</h3>
            <p className="equip-type">{equip.tipo} • {equip.localizacao}</p>

            <div className="equip-stats">
              <div className="equip-stat">
                <div className="stat-label">Sensores</div>
                <div className="stat-value">{equip.sensoresOnline} online</div>
              </div>
              <div className="equip-stat">
                <div className="stat-label">Disponibilidade</div>
                <div className="stat-value">{equip.disponibilidade}%</div>
              </div>
            </div>

            <button
              onClick={() => handleVerSensores(equip.id)}
              className="equip-link"
            >
              Ver sensores →
            </button>
          </div>
        ))}
      </div>

      {/* Modal Cadastrar Equipamento */}
      {mostrarModal && (
        <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Cadastrar Novo Equipamento</h2>
              <button className="modal-close" onClick={() => setMostrarModal(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCadastrarEquipamento} className="modal-body">
              <div className="form-group">
                <label>Nome do Equipamento</label>
                <input
                  type="text"
                  value={novoEquipamento.nome}
                  onChange={(e) => setNovoEquipamento({...novoEquipamento, nome: e.target.value})}
                  placeholder="Ex: Reator Principal 01"
                  required
                />
              </div>

              <div className="form-group">
                <label>Tipo</label>
                <select
                  value={novoEquipamento.tipo}
                  onChange={(e) => setNovoEquipamento({...novoEquipamento, tipo: e.target.value})}
                >
                  <option value="Reator">Reator</option>
                  <option value="Bomba">Bomba</option>
                  <option value="Sistema de fluxo">Sistema de fluxo</option>
                  <option value="Turbina">Turbina</option>
                  <option value="Gerador">Gerador</option>
                  <option value="Sistema de refrigeração">Sistema de refrigeração</option>
                </select>
              </div>

              <div className="form-group">
                <label>Localização</label>
                <input
                  type="text"
                  value={novoEquipamento.localizacao}
                  onChange={(e) => setNovoEquipamento({...novoEquipamento, localizacao: e.target.value})}
                  placeholder="Ex: Unidade de geração • Área A"
                  required
                />
              </div>

              <button type="submit" className="btn-submit-equip">
                <Plus size={18} />
                Cadastrar Equipamento
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Equipamentos;
