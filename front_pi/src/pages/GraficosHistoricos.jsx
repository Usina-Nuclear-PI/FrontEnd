import { useState, useEffect } from 'react';
import { Download, Calendar, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../services/api';
import './GraficosHistoricos.css';

function GraficosHistoricos() {
  const [monitoramentos, setMonitoramentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSensor, setSelectedSensor] = useState('temperatura');
  const [timePeriod, setTimePeriod] = useState('100');
  const [tempSelectedSensor, setTempSelectedSensor] = useState('temperatura');
  const [tempTimePeriod, setTempTimePeriod] = useState('100');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await api.getMonitoramento();
      setMonitoramentos(data);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    setSelectedSensor(tempSelectedSensor);
    setTimePeriod(tempTimePeriod);
  };

  const getChartData = () => {
    const sortedData = monitoramentos.sort((a, b) =>
      new Date(a.dataHora) - new Date(b.dataHora)
    );

    const limit = parseInt(timePeriod);
    const filteredData = sortedData.slice(-limit);

    return filteredData.map(m => ({
      time: new Date(m.dataHora).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      temperatura: parseFloat(m.temperaturaC || 0),
      pressao: parseFloat(m.pressaoBar || 0),
      vazao: parseFloat(m.vazaoM3H || 0),
      potencia: parseFloat(m.potenciaMw || 0),
      radiacao: parseFloat(m.radiacaoMsvH || 0),
      vibracao: parseFloat(m.vibracaoMmS || 0)
    }));
  };

  const exportarDados = () => {
    const chartData = getChartData();

    // Criar CSV
    const headers = ['Data/Hora', 'Temperatura (°C)', 'Pressão (bar)', 'Vazão (m³/h)', 'Potência (MW)', 'Radiação (mSv/h)', 'Vibração (mm/s)'];
    const csvContent = [
      headers.join(','),
      ...chartData.map(row =>
        `${row.time},${row.temperatura},${row.pressao},${row.vazao},${row.potencia},${row.radiacao},${row.vibracao}`
      )
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `graficos_historicos_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const getSensorConfig = () => {
    const configs = {
      temperatura: {
        label: 'Temperatura do reator',
        code: 'TMP-204',
        unit: '°C',
        color: '#ef4444'
      },
      pressao: {
        label: 'Pressão do reator',
        code: 'PRS-082',
        unit: 'bar',
        color: '#3b82f6'
      },
      vazao: {
        label: 'Vazão do circuito',
        code: 'FLW-031',
        unit: 'm³/h',
        color: '#10b981'
      },
      potencia: {
        label: 'Potência térmica',
        code: 'PWR-001',
        unit: 'MW',
        color: '#f59e0b'
      },
      radiacao: {
        label: 'Radiação',
        code: 'RAD-015',
        unit: 'mSv/h',
        color: '#8b5cf6'
      },
      vibracao: {
        label: 'Vibração',
        code: 'VIB-092',
        unit: 'mm/s',
        color: '#ec4899'
      }
    };
    return configs[selectedSensor] || configs.temperatura;
  };

  const chartData = getChartData();
  const sensorConfig = getSensorConfig();

  const getStatistics = () => {
    const values = chartData.map(d => d[selectedSensor]);
    const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
    const max = Math.max(...values).toFixed(2);
    const min = Math.min(...values).toFixed(2);
    return { avg, max, min };
  };

  const stats = getStatistics();

  if (loading) {
    return (
      <div className="graficos-page">
        <div className="loading-container">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="graficos-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-label">ANÁLISE</div>
          <h1 className="page-title">Gráficos históricos</h1>
          <p className="page-description">Compare parâmetros operacionais por período.</p>
        </div>
        <button className="btn-export" onClick={exportarDados}>
          <Download size={16} />
          Exportar dados
        </button>
      </div>

      <div className="filters-card">
        <div className="filter-group">
          <label>
            <TrendingUp size={16} />
            Parâmetro
          </label>
          <select value={tempSelectedSensor} onChange={(e) => setTempSelectedSensor(e.target.value)}>
            <option value="temperatura">Temperatura (°C)</option>
            <option value="pressao">Pressão (bar)</option>
            <option value="vazao">Vazão (m³/h)</option>
            <option value="potencia">Potência térmica (MW)</option>
            <option value="radiacao">Radiação (mSv/h)</option>
            <option value="vibracao">Vibração (mm/s)</option>
          </select>
        </div>

        <div className="filter-group">
          <label>
            <Calendar size={16} />
            Registros
          </label>
          <select value={tempTimePeriod} onChange={(e) => setTempTimePeriod(e.target.value)}>
            <option value="50">Últimos 50 registros</option>
            <option value="100">Últimos 100 registros</option>
            <option value="200">Últimos 200 registros</option>
            <option value="500">Últimos 500 registros</option>
            <option value="1000">Últimos 1000 registros</option>
          </select>
        </div>

        <button className="btn-apply-filters" onClick={aplicarFiltros}>
          Aplicar Filtros
        </button>
      </div>

      {/* Estatísticas */}
      <div className="stats-grid">
        <div className="stat-card-small">
          <div className="stat-label">MÉDIA</div>
          <div className="stat-value">{stats.avg} <span className="stat-unit">{sensorConfig.unit}</span></div>
        </div>
        <div className="stat-card-small">
          <div className="stat-label">MÁXIMO</div>
          <div className="stat-value">{stats.max} <span className="stat-unit">{sensorConfig.unit}</span></div>
        </div>
        <div className="stat-card-small">
          <div className="stat-label">MÍNIMO</div>
          <div className="stat-value">{stats.min} <span className="stat-unit">{sensorConfig.unit}</span></div>
        </div>
        <div className="stat-card-small">
          <div className="stat-label">REGISTROS</div>
          <div className="stat-value">{chartData.length}</div>
        </div>
      </div>

      <div className="card chart-card">
        <div className="card-header">
          <div>
            <div className="card-label">{sensorConfig.code}</div>
            <h3 className="card-title">{sensorConfig.label}</h3>
          </div>
          <div className="chart-legend">
            <span className="legend-dot" style={{ background: sensorConfig.color }}></span>
            {sensorConfig.label}
          </div>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={450}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis
                dataKey="time"
                stroke="var(--text-muted)"
                style={{ fontSize: '11px' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                stroke="var(--text-muted)"
                style={{ fontSize: '12px' }}
                label={{
                  value: sensorConfig.unit,
                  angle: -90,
                  position: 'insideLeft',
                  style: { fill: 'var(--text-muted)', fontSize: '12px' }
                }}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)'
                }}
                formatter={(value) => [`${parseFloat(value).toFixed(2)} ${sensorConfig.unit}`, sensorConfig.label]}
              />
              <Line
                type="monotone"
                dataKey={selectedSensor}
                stroke={sensorConfig.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default GraficosHistoricos;
