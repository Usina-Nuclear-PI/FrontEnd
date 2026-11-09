import { useState, useEffect } from 'react';
import { Search, TrendingUp, Plus, X } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import './Sensores.css';

function Sensores() {
  const [monitoramentos, setMonitoramentos] = useState([]);
  const [circuitos, setCircuitos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterType, setFilterType] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [novoSensor, setNovoSensor] = useState({
    nome: '',
    tipo: 'Temperatura',
    localizacao: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
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

  const getSensorData = () => {
    const sensorMap = new Map();

    // Agrupar por circuito
    circuitos.forEach(circuito => {
      const readings = monitoramentos
        .filter(m => m.idCircuito === circuito.id)
        .sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));

      if (readings.length > 0) {
        const latest = readings[0];
        const last10 = readings.slice(0, 10).reverse();

        // Determinar tipo de sensor baseado nos valores
        let tipo = 'Temperatura';
        let valor = latest.temperaturaC;
        let unidade = '°C';
        let limite = 320;

        if (latest.pressaoBar > 0) {
          tipo = 'Pressão';
          valor = latest.pressaoBar;
          unidade = 'MPa';
          limite = 16;
        }

        if (latest.vibracaoMmS > 0) {
          tipo = 'Vibração';
          valor = latest.vibracaoMmS;
          unidade = 'mm/s';
          limite = 8;
        }

        if (latest.vazaoM3H > 0) {
          tipo = 'Fluxo';
          valor = latest.vazaoM3H;
          unidade = 'L/min';
          limite = 100;
        }

        // Determinar status
        let status = 'online';
        const lastUpdate = new Date(latest.dataHora);
        const hoursSinceUpdate = (new Date() - lastUpdate) / (1000 * 60 * 60);

        if (hoursSinceUpdate > 1) {
          status = 'offline';
        }

        // Gerar dados do gráfico
        const chartData = last10.map(m => ({
          value: parseFloat(tipo === 'Temperatura' ? m.temperaturaC :
                           tipo === 'Pressão' ? m.pressaoBar :
                           tipo === 'Vibração' ? m.vibracaoMmS : m.vazaoM3H)
        }));

        sensorMap.set(circuito.id, {
          id: `${tipo.substring(0, 3).toUpperCase()}-${circuito.id.toString().padStart(3, '0')}`,
          nome: circuito.nome,
          tipo,
          valor: parseFloat(valor).toFixed(1),
          unidade,
          status,
          limite,
          chartData,
          localizacao: circuito.nome.includes('Reator') ? 'Reator 02' :
                       circuito.nome.includes('Bomba') ? 'Bomba primária' :
                       circuito.nome.includes('Fluxo') ? 'Circuito secundário' : 'Área principal'
        });
      }
    });

    return Array.from(sensorMap.values());
  };

  const sensors = getSensorData();

  const filteredSensors = sensors.filter(sensor => {
    const matchesSearch =
      sensor.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sensor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sensor.tipo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'todos' || sensor.status === filterStatus;
    const matchesType = filterType === 'todos' || sensor.tipo === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleAdicionarSensor = async (e) => {
    e.preventDefault();
    try {
      // Simular criação de sensor (normalmente seria uma chamada à API)
      alert(`Sensor adicionado com sucesso!\n\nNome: ${novoSensor.nome}\nTipo: ${novoSensor.tipo}\nLocalização: ${novoSensor.localizacao}`);
      setMostrarModal(false);
      setNovoSensor({ nome: '', tipo: 'Temperatura', localizacao: '' });
      // Recarregar dados
      fetchData();
    } catch (error) {
      console.error('Erro ao adicionar sensor:', error);
      alert('Erro ao adicionar sensor');
    }
  };

  if (loading) {
    return (
      <div className="sensores-page">
        <div className="loading-container">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="sensores-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-label">INFRAESTRUTURA</div>
          <h1 className="page-title">Sensores</h1>
          <p className="page-description">Consulta dos sensores e seus dados operacionais.</p>
        </div>
        <button className="btn-add-sensor" onClick={() => setMostrarModal(true)}>
          <Plus size={18} />
          Adicionar sensor
        </button>
      </div>

      {/* Filtros */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="🔍 Buscar por ID, tipo ou equipamento"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filters-group">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="todos">Todos os status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="todos">Todos os tipos</option>
            <option value="Temperatura">Temperatura</option>
            <option value="Pressão">Pressão</option>
            <option value="Vibração">Vibração</option>
            <option value="Fluxo">Fluxo</option>
          </select>
        </div>
      </div>

      {/* Grid de sensores */}
      <div className="sensors-grid">
        {filteredSensors.map(sensor => (
          <div key={sensor.id} className="sensor-card">
            <div className="sensor-header">
              <div className="sensor-info">
                <div className={`sensor-status sensor-status-${sensor.status}`}>
                  <span className="status-dot"></span>
                  {sensor.status.toUpperCase()}
                </div>
                <h3 className="sensor-id">{sensor.id}</h3>
              </div>
            </div>

            <div className="sensor-body">
              <div className="sensor-type">{sensor.tipo} • {sensor.localizacao}</div>

              <div className="sensor-value-section">
                <div className="sensor-value">
                  {sensor.valor}
                  <span className="sensor-unit">{sensor.unidade}</span>
                </div>
                <div className="sensor-limit">
                  Limite: {sensor.limite} {sensor.unidade}
                </div>
              </div>

              <div className="sensor-chart">
                <ResponsiveContainer width="100%" height={60}>
                  <LineChart data={sensor.chartData}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="var(--accent-cyan)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="sensor-footer">
              <a href={`/sensores/${sensor.id}`} className="sensor-link">
                Ver dados →
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Adicionar Sensor */}
      {mostrarModal && (
        <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Adicionar Novo Sensor</h2>
              <button className="modal-close" onClick={() => setMostrarModal(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAdicionarSensor} className="modal-body">
              <div className="form-group">
                <label>Nome do Sensor</label>
                <input
                  type="text"
                  value={novoSensor.nome}
                  onChange={(e) => setNovoSensor({...novoSensor, nome: e.target.value})}
                  placeholder="Ex: Sensor Primário Reator 1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Tipo de Sensor</label>
                <select
                  value={novoSensor.tipo}
                  onChange={(e) => setNovoSensor({...novoSensor, tipo: e.target.value})}
                >
                  <option value="Temperatura">Temperatura</option>
                  <option value="Pressão">Pressão</option>
                  <option value="Vibração">Vibração</option>
                  <option value="Fluxo">Fluxo</option>
                  <option value="Radiação">Radiação</option>
                </select>
              </div>

              <div className="form-group">
                <label>Localização</label>
                <input
                  type="text"
                  value={novoSensor.localizacao}
                  onChange={(e) => setNovoSensor({...novoSensor, localizacao: e.target.value})}
                  placeholder="Ex: Reator 02, Bomba Primária"
                  required
                />
              </div>

              <button type="submit" className="btn-submit-sensor">
                <Plus size={18} />
                Adicionar Sensor
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sensores;
