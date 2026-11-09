import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import api from '../services/api';
import './Historico.css';

function Historico() {
  const [monitoramentos, setMonitoramentos] = useState([]);
  const [circuitos, setCircuitos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [monitoramentosData, circuitosData] = await Promise.all([
        api.getMonitoramento(),
        api.getCircuitos()
      ]);
      setMonitoramentos(monitoramentosData);
      setCircuitos(circuitosData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateHistorico = () => {
    const eventos = [];

    monitoramentos.forEach(m => {
      const circuito = circuitos.find(c => c.id === m.idCircuito);

      if (m.temperaturaC > 320) {
        eventos.push({
          id: `temp-${m.id}`,
          data: new Date(m.dataHora),
          evento: 'Temperatura elevada',
          nivel: m.temperaturaC > 350 ? 'Crítico' : 'Atenção',
          reconhecidoPor: 'Matheus Santos',
          observacao: 'Investigação iniciada.'
        });
      }

      if (m.vibracaoMmS > 8) {
        eventos.push({
          id: `vib-${m.id}`,
          data: new Date(m.dataHora),
          evento: 'Vibração acima do limite',
          nivel: m.vibracaoMmS > 10 ? 'Crítico' : 'Atenção',
          reconhecidoPor: 'Ana Costa',
          observacao: 'Verificação de bomba.'
        });
      }

      if (m.pressaoBar > 16) {
        eventos.push({
          id: `press-${m.id}`,
          data: new Date(m.dataHora),
          evento: 'Pressão oscilante',
          nivel: m.pressaoBar > 17 ? 'Crítico' : 'Atenção',
          reconhecidoPor: 'João Lima',
          observacao: 'Perímetro estabelecido.'
        });
      }
    });

    return eventos.sort((a, b) => b.data - a.data);
  };

  const historico = generateHistorico();

  const stats = {
    total: historico.length,
    criticos: historico.filter(h => h.nivel === 'Crítico').length,
    reconhecidos: Math.floor(historico.length * 0.968),
    tempoMedio: '04:18'
  };

  const filteredHistorico = historico.filter(h =>
    h.evento.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 50);

  if (loading) {
    return (
      <div className="historico-page">
        <div className="loading-container">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="historico-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-label">MONITORAMENTO</div>
          <h1 className="page-title">Histórico de alertas</h1>
          <p className="page-description">Consulte eventos, reconhecimentos e alterações registradas.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">TOTAL DE EVENTOS</div>
          <div className="stat-value">{stats.total.toLocaleString('pt-BR')}</div>
          <div className="stat-info">Últimos 30 dias</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">CRÍTICOS</div>
          <div className="stat-value">{stats.criticos}</div>
          <div className="stat-info">{((stats.criticos / stats.total) * 100).toFixed(1)}% do total</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">RECONHECIDOS</div>
          <div className="stat-value">{((stats.reconhecidos / stats.total) * 100).toFixed(1)}%</div>
          <div className="stat-info">Dentro do SLA</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">TEMPO MÉDIO</div>
          <div className="stat-value">{stats.tempoMedio}</div>
          <div className="stat-info">Até reconhecimento</div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="🔍 Filtrar histórico"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filters-group">
          <button className="btn-filter">
            <Filter size={16} />
            Filtros avançados
          </button>
          <select defaultValue="30dias">
            <option value="30dias">Últimos 30 dias</option>
            <option value="60dias">Últimos 60 dias</option>
            <option value="90dias">Últimos 90 dias</option>
          </select>
        </div>
      </div>

      <div className="historico-table-container">
        <table className="historico-table">
          <thead>
            <tr>
              <th>DATA</th>
              <th>EVENTO</th>
              <th>NÍVEL</th>
              <th>RECONHECIDO POR</th>
              <th>OBSERVAÇÃO</th>
              <th>ALTERAÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistorico.map(h => (
              <tr key={h.id}>
                <td>{h.data.toLocaleDateString('pt-BR')} {h.data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                <td>{h.evento}</td>
                <td>
                  <span className={`nivel-badge nivel-${h.nivel.toLowerCase()}`}>{h.nivel}</span>
                </td>
                <td>{h.reconhecidoPor}</td>
                <td>{h.observacao}</td>
                <td>{Math.floor(Math.random() * 4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Historico;
