import { useState, useEffect } from 'react';
import { Plus, TrendingUp, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import './Dashboard.css';

function Dashboard() {
  const [monitoramentos, setMonitoramentos] = useState([]);
  const [circuitos, setCircuitos] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString('pt-BR'));

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleString('pt-BR'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [monitoramentosData, circuitosData, statusData] = await Promise.all([
        api.getMonitoramento(),
        api.getCircuitos(),
        api.getStatus()
      ]);
      setMonitoramentos(monitoramentosData);
      setCircuitos(circuitosData);
      setStatusList(statusData);
    } catch (err) {
      setError('Erro ao carregar dados da API');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Processar dados para o dashboard
  const getLatestReading = () => {
    if (monitoramentos.length === 0) return null;
    return monitoramentos.reduce((latest, current) => {
      return new Date(current.dataHora) > new Date(latest.dataHora) ? current : latest;
    });
  };

  const getStatusPlanta = () => {
    const latest = getLatestReading();
    if (!latest) return { status: 'AGUARDANDO DADOS', className: 'status-warning' };

    const status = statusList.find(s => s.id === latest.idStatus);
    if (status?.descricao.toLowerCase().includes('normal')) {
      return { status: 'NORMAL', className: 'status-normal' };
    }
    if (status?.descricao.toLowerCase().includes('alerta')) {
      return { status: 'ATENÇÃO', className: 'status-warning' };
    }
    if (status?.descricao.toLowerCase().includes('crítico')) {
      return { status: 'CRÍTICO', className: 'status-critical' };
    }
    return { status: status?.descricao || 'DESCONHECIDO', className: 'status-info' };
  };

  const getAlertasAtivos = () => {
    // Usar todos os dados disponíveis
    let criticos = 0;
    let atencao = 0;

    monitoramentos.forEach(m => {
      // Definir limites de alerta
      if (m.temperaturaC > 350) criticos++;
      else if (m.temperaturaC > 320) atencao++;

      if (m.pressaoBar > 17) criticos++;
      else if (m.pressaoBar > 16) atencao++;

      if (m.vibracaoMmS > 10) criticos++;
      else if (m.vibracaoMmS > 8) atencao++;
    });

    return { total: criticos + atencao, criticos, atencao };
  };

  const getSensoresOnline = () => {
    // Considerar todos os circuitos com leituras
    const activeCircuits = new Set(
      monitoramentos.map(m => m.idCircuito)
    );

    const total = circuitos.length;
    const online = activeCircuits.size;
    const disponibilidade = total > 0 ? ((online / total) * 100).toFixed(1) : '0.0';

    return { online, total, disponibilidade };
  };

  const getEquipamentos = () => {
    const totalEquipamentos = circuitos.length;
    const sensores = getSensoresOnline();
    const emManutencao = totalEquipamentos - sensores.online;

    return { total: totalEquipamentos, operando: sensores.online, emManutencao };
  };

  const getPowerData = () => {
    // Pegar últimos 50 registros para o gráfico
    const recentData = monitoramentos
      .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora))
      .slice(-50);

    // Criar array para o gráfico
    const chartData = recentData.map((m, index) => ({
      time: new Date(m.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      value: parseFloat(m.potenciaMw || 0)
    }));

    return chartData;
  };

  const getRecentAlerts = () => {
    // Pegar dados mais recentes
    const recentData = monitoramentos
      .sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))
      .slice(0, 100);

    const alerts = [];

    recentData.forEach(m => {
      const circuito = circuitos.find(c => c.id === m.idCircuito);
      const time = new Date(m.dataHora).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });

      if (m.temperaturaC > 350) {
        alerts.push({
          id: `temp-${m.id}`,
          title: 'Temperatura crítica',
          sensor: circuito?.nome || `Circuito ${m.idCircuito}`,
          time,
          level: 'critical'
        });
      } else if (m.temperaturaC > 320) {
        alerts.push({
          id: `temp-${m.id}`,
          title: 'Temperatura elevada',
          sensor: circuito?.nome || `Circuito ${m.idCircuito}`,
          time,
          level: 'warning'
        });
      }

      if (m.vibracaoMmS > 10) {
        alerts.push({
          id: `vib-${m.id}`,
          title: 'Vibração crítica',
          sensor: circuito?.nome || `Circuito ${m.idCircuito}`,
          time,
          level: 'critical'
        });
      } else if (m.vibracaoMmS > 8) {
        alerts.push({
          id: `vib-${m.id}`,
          title: 'Vibração acima do limite',
          sensor: circuito?.nome || `Circuito ${m.idCircuito}`,
          time,
          level: 'warning'
        });
      }

      if (m.pressaoBar > 17) {
        alerts.push({
          id: `press-${m.id}`,
          title: 'Pressão crítica',
          sensor: circuito?.nome || `Circuito ${m.idCircuito}`,
          time,
          level: 'critical'
        });
      }
    });

    return alerts.slice(0, 4);
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <RefreshCw className="loading-icon" size={48} />
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={fetchData} className="btn-retry">Tentar novamente</button>
        </div>
      </div>
    );
  }

  const latestReading = getLatestReading();
  const statusPlanta = getStatusPlanta();
  const alertas = getAlertasAtivos();
  const sensores = getSensoresOnline();
  const equipamentos = getEquipamentos();
  const powerData = getPowerData();
  const recentAlerts = getRecentAlerts();

  return (
    <div className="dashboard">
      <div className="page-header">
        <div className="header-content">
          <div className="header-label">VISÃO GERAL</div>
          <h1 className="page-title">Dashboard principal</h1>
          <p className="page-description">Acompanhamento operacional da unidade em tempo real.</p>
        </div>
        <div className="header-status">
          <div className="live-indicator">
            <span className="live-dot"></span>
            DADOS AO VIVO
          </div>
          <div className="current-time">{currentTime}</div>
          <button onClick={fetchData} className="btn-refresh" title="Atualizar dados">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="status-grid">
        <div className="status-card">
          <div className="status-label">STATUS DA PLANTA</div>
          <div className={`status-value ${statusPlanta.className}`}>{statusPlanta.status}</div>
          <div className="status-info">
            {monitoramentos.length > 0 ? 'Sistema operacional' : 'Aguardando dados'}
          </div>
        </div>

        <div className="status-card">
          <div className="status-label">ALERTAS ATIVOS</div>
          <div className="status-value">{String(alertas.total).padStart(2, '0')}</div>
          <div className="status-info">
            {alertas.criticos} crítico{alertas.criticos !== 1 ? 's' : ''} • {alertas.atencao} atenção
          </div>
        </div>

        <div className="status-card">
          <div className="status-label">SENSORES ONLINE</div>
          <div className="status-value">
            {sensores.online} <span className="status-total">/ {sensores.total}</span>
          </div>
          <div className="status-info">{sensores.disponibilidade}% de disponibilidade</div>
        </div>

        <div className="status-card">
          <div className="status-label">EQUIPAMENTOS</div>
          <div className="status-value">
            {equipamentos.operando} <span className="status-total">/ {equipamentos.total}</span>
          </div>
          <div className="status-info">
            {equipamentos.emManutencao > 0 ? `${equipamentos.emManutencao} em manutenção` : 'Todos operacionais'}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* Reactor Status */}
        <div className="card reactor-card">
          <div className="card-header">
            <div>
              <div className="card-label">ESTADO OPERACIONAL</div>
              <h3 className="card-title">Estado do reator</h3>
            </div>
            <span className={`status-badge status-badge-${statusPlanta.className}`}>
              {statusPlanta.status}
            </span>
          </div>
          <div className="reactor-visual">
            <svg viewBox="0 0 200 200" className="reactor-gauge">
              <circle cx="100" cy="100" r="70" fill="none" stroke="var(--border-color)" strokeWidth="2" />
              <circle cx="100" cy="100" r="60" fill="none" stroke="var(--accent-cyan)" strokeWidth="1" opacity="0.3" />
              <circle cx="100" cy="100" r="50" fill="none" stroke="var(--accent-cyan)" strokeWidth="1" opacity="0.2" />
              <circle cx="100" cy="100" r="40" fill="var(--bg-card)" stroke="var(--accent-cyan)" strokeWidth="2" />
              <text x="100" y="95" textAnchor="middle" fill="var(--text-primary)" fontSize="14" fontWeight="600">REATOR</text>
              <text x="100" y="115" textAnchor="middle" fill="var(--accent-cyan)" fontSize="24" fontWeight="700">
                {latestReading ? `${latestReading.eficienciaTermicaPct?.toFixed(1) || '0'}%` : '--'}
              </text>
              <text x="100" y="130" textAnchor="middle" fill="var(--text-secondary)" fontSize="11">
                {statusPlanta.status === 'NORMAL' ? 'Operação estável' : 'Monitorando'}
              </text>
            </svg>
          </div>
          <div className="reactor-metrics">
            <div className="reactor-metric">
              <div className="metric-label">Potência térmica</div>
              <div className="metric-value">
                {latestReading ? `${latestReading.potenciaMw?.toFixed(1) || '0'} MW` : '--'}
              </div>
            </div>
            <div className="reactor-metric">
              <div className="metric-label">Temperatura</div>
              <div className="metric-value">
                {latestReading ? `${latestReading.temperaturaC?.toFixed(1) || '0'} °C` : '--'}
              </div>
            </div>
            <div className="reactor-metric">
              <div className="metric-label">Pressão</div>
              <div className="metric-value">
                {latestReading ? `${latestReading.pressaoBar?.toFixed(1) || '0'} MPa` : '--'}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="card alerts-card">
          <div className="card-header">
            <div>
              <div className="card-label">ALERTAS</div>
              <h3 className="card-title">Últimos eventos</h3>
            </div>
            <a href="/alertas" className="card-link">Ver todos →</a>
          </div>
          <div className="alerts-list">
            {recentAlerts.length > 0 ? (
              recentAlerts.map(alert => (
                <div key={alert.id} className="alert-item">
                  <div className={`alert-indicator alert-${alert.level}`}></div>
                  <div className="alert-content">
                    <div className="alert-title">{alert.title}</div>
                    <div className="alert-meta">{alert.sensor} • {alert.time}</div>
                  </div>
                  <span className={`alert-badge badge-${alert.level}`}>
                    {alert.level === 'critical' ? 'CRÍTICO' :
                     alert.level === 'warning' ? 'ATENÇÃO' : 'INFO'}
                  </span>
                </div>
              ))
            ) : (
              <div className="no-alerts">
                <p>Nenhum alerta recente</p>
                <p className="no-alerts-sub">Sistema operando normalmente</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Power Chart */}
      <div className="card chart-card">
        <div className="card-header">
          <div>
            <div className="card-label">GRÁFICO PRINCIPAL</div>
            <h3 className="card-title">Potência térmica — últimas 24 horas</h3>
          </div>
          <div className="chart-badge">
            <TrendingUp size={16} />
            {latestReading ? `${latestReading.potenciaMw?.toFixed(1) || '0'} MW` : '-- MW'}
          </div>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={powerData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="time" stroke="var(--text-muted)" style={{ fontSize: '12px' }} />
              <YAxis stroke="var(--text-muted)" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)'
                }}
                formatter={(value) => [`${value.toFixed(2)} MW`, 'Potência']}
              />
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

      {/* Bottom Grid */}
      <div className="bottom-grid">
        {/* Availability Indicator */}
        <div className="card availability-card">
          <div className="card-header">
            <div>
              <div className="card-label">INDICADORES</div>
              <h3 className="card-title">Disponibilidade</h3>
            </div>
          </div>
          <div className="availability-visual">
            <svg viewBox="0 0 160 160" className="availability-circle">
              <circle cx="80" cy="80" r="60" fill="none" stroke="var(--border-color)" strokeWidth="8" />
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="none"
                stroke="var(--accent-green)"
                strokeWidth="8"
                strokeDasharray="377"
                strokeDashoffset={377 - (377 * parseFloat(sensores.disponibilidade) / 100)}
                strokeLinecap="round"
                transform="rotate(-90 80 80)"
              />
              <text x="80" y="75" textAnchor="middle" fill="var(--accent-green)" fontSize="32" fontWeight="700">
                {sensores.disponibilidade}%
              </text>
              <text x="80" y="95" textAnchor="middle" fill="var(--text-secondary)" fontSize="11">de disponibilidade</text>
            </svg>
            <div className="availability-stats">
              <div className="availability-stat">
                <span className="stat-dot stat-online"></span>
                <span className="stat-text">Online: <strong>{sensores.online}</strong></span>
              </div>
              <div className="availability-stat">
                <span className="stat-dot stat-offline"></span>
                <span className="stat-text">Offline: <strong>{sensores.total - sensores.online}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Info */}
        <div className="card dashboard-info-card">
          <div className="card-header">
            <div>
              <div className="card-label">MONITORAMENTO</div>
              <h3 className="card-title">Resumo do sistema</h3>
            </div>
          </div>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-label">Total de registros</div>
              <div className="info-value">{monitoramentos.length.toLocaleString('pt-BR')}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Circuitos ativos</div>
              <div className="info-value">{circuitos.length}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Última atualização</div>
              <div className="info-value">
                {latestReading ? new Date(latestReading.dataHora).toLocaleString('pt-BR') : '--'}
              </div>
            </div>
            <div className="info-item">
              <div className="info-label">Status operacional</div>
              <div className="info-value">{statusPlanta.status}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
