import { useState, useEffect } from 'react';
import { Search, Filter, Download, AlertCircle, AlertTriangle, Info, X, CheckCircle } from 'lucide-react';
import api from '../services/api';
import './Alertas.css';

function Alertas() {
  const [monitoramentos, setMonitoramentos] = useState([]);
  const [circuitos, setCircuitos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterPeriod, setFilterPeriod] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [alertaSelecionado, setAlertaSelecionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

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

  const generateAlerts = () => {
    const alerts = [];

    // Agrupar por circuito e ordenar por tempo
    const circuitosMap = new Map();
    monitoramentos.forEach(m => {
      if (!circuitosMap.has(m.idCircuito)) {
        circuitosMap.set(m.idCircuito, []);
      }
      circuitosMap.get(m.idCircuito).push(m);
    });

    // Para cada circuito, ordenar por tempo e detectar transições
    circuitosMap.forEach((readings, circuitoId) => {
      const circuito = circuitos.find(c => c.id === circuitoId);
      const sortedReadings = readings.sort((a, b) =>
        new Date(a.dataHora) - new Date(b.dataHora)
      );

      for (let i = 1; i < sortedReadings.length; i++) {
        const prev = sortedReadings[i - 1];
        const curr = sortedReadings[i];
        const dataHora = new Date(curr.dataHora);

        // DETECÇÃO DE TRANSIÇÃO DE TEMPERATURA
        const prevTempStatus = prev.temperaturaC > 350 ? 'critico' :
                               prev.temperaturaC > 320 ? 'atencao' : 'normal';
        const currTempStatus = curr.temperaturaC > 350 ? 'critico' :
                               curr.temperaturaC > 320 ? 'atencao' : 'normal';

        if (prevTempStatus !== currTempStatus && currTempStatus !== 'normal') {
          alerts.push({
            id: `temp-transition-${curr.id}`,
            nivel: currTempStatus === 'critico' ? 'Crítico' : 'Atenção',
            alerta: currTempStatus === 'critico' ? 'Temperatura crítica detectada' : 'Temperatura elevada detectada',
            descricao: `Transição de ${prev.temperaturaC.toFixed(1)}°C para ${curr.temperaturaC.toFixed(1)}°C`,
            origem: circuito?.nome || `Circuito ${circuitoId}`,
            dataHora: dataHora,
            status: Math.random() > 0.3 ? 'Reconhecido' : 'Não reconhecido',
            acoes: Math.floor(Math.random() * 3)
          });
        }

        // DETECÇÃO DE PICO DE TEMPERATURA (variação >30% em curto período)
        const tempVariation = Math.abs(curr.temperaturaC - prev.temperaturaC);
        if (tempVariation > prev.temperaturaC * 0.3 && curr.temperaturaC > 100) {
          alerts.push({
            id: `temp-spike-${curr.id}`,
            nivel: 'Crítico',
            alerta: 'Variação abrupta de temperatura',
            descricao: `Variação de ${tempVariation.toFixed(1)}°C detectada (${prev.temperaturaC.toFixed(1)}°C → ${curr.temperaturaC.toFixed(1)}°C)`,
            origem: circuito?.nome || `Circuito ${circuitoId}`,
            dataHora: dataHora,
            status: 'Não reconhecido',
            acoes: 0
          });
        }

        // DETECÇÃO DE TRANSIÇÃO DE PRESSÃO
        const prevPressStatus = prev.pressaoBar > 17 ? 'critico' :
                                prev.pressaoBar > 16 ? 'atencao' : 'normal';
        const currPressStatus = curr.pressaoBar > 17 ? 'critico' :
                                curr.pressaoBar > 16 ? 'atencao' : 'normal';

        if (prevPressStatus !== currPressStatus && currPressStatus !== 'normal') {
          alerts.push({
            id: `press-transition-${curr.id}`,
            nivel: currPressStatus === 'critico' ? 'Crítico' : 'Atenção',
            alerta: 'Pressão elevada detectada',
            descricao: `Pressão passou de ${prev.pressaoBar.toFixed(1)} bar para ${curr.pressaoBar.toFixed(1)} bar`,
            origem: circuito?.nome || `Circuito ${circuitoId}`,
            dataHora: dataHora,
            status: Math.random() > 0.4 ? 'Reconhecido' : 'Não reconhecido',
            acoes: Math.floor(Math.random() * 2)
          });
        }

        // DETECÇÃO DE TRANSIÇÃO DE VIBRAÇÃO
        const prevVibStatus = prev.vibracaoMmS > 10 ? 'critico' :
                              prev.vibracaoMmS > 8 ? 'atencao' : 'normal';
        const currVibStatus = curr.vibracaoMmS > 10 ? 'critico' :
                              curr.vibracaoMmS > 8 ? 'atencao' : 'normal';

        if (prevVibStatus !== currVibStatus && currVibStatus !== 'normal') {
          alerts.push({
            id: `vib-transition-${curr.id}`,
            nivel: currVibStatus === 'critico' ? 'Crítico' : 'Atenção',
            alerta: currVibStatus === 'critico' ? 'Vibração crítica' : 'Vibração elevada',
            descricao: `Vibração passou de ${prev.vibracaoMmS.toFixed(2)} mm/s para ${curr.vibracaoMmS.toFixed(2)} mm/s`,
            origem: circuito?.nome || `Circuito ${circuitoId}`,
            dataHora: dataHora,
            status: Math.random() > 0.5 ? 'Reconhecido' : 'Não reconhecido',
            acoes: Math.floor(Math.random() * 2)
          });
        }

        // DETECÇÃO DE QUEDA ABRUPTA DE VAZÃO (possível falha)
        if (prev.vazaoM3H > 1000 && curr.vazaoM3H < 100) {
          alerts.push({
            id: `flow-drop-${curr.id}`,
            nivel: 'Crítico',
            alerta: 'Queda abrupta de vazão',
            descricao: `Vazão caiu de ${prev.vazaoM3H.toFixed(1)} m³/h para ${curr.vazaoM3H.toFixed(1)} m³/h - Possível falha de bomba`,
            origem: circuito?.nome || `Circuito ${circuitoId}`,
            dataHora: dataHora,
            status: 'Não reconhecido',
            acoes: 0
          });
        }

        // DETECÇÃO DE RADIAÇÃO ELEVADA
        if (prev.radiacaoMsvH < 0.04 && curr.radiacaoMsvH > 0.05) {
          alerts.push({
            id: `rad-increase-${curr.id}`,
            nivel: 'Atenção',
            alerta: 'Aumento de radiação detectado',
            descricao: `Radiação aumentou de ${prev.radiacaoMsvH.toFixed(4)} mSv/h para ${curr.radiacaoMsvH.toFixed(4)} mSv/h`,
            origem: circuito?.nome || `Circuito ${circuitoId}`,
            dataHora: dataHora,
            status: 'Reconhecido',
            acoes: 1
          });
        }

        // DETECÇÃO DE NÍVEL DE REFRIGERANTE BAIXO
        if (prev.nivelRefrigerantePct > 90 && curr.nivelRefrigerantePct < 85) {
          alerts.push({
            id: `coolant-low-${curr.id}`,
            nivel: 'Atenção',
            alerta: 'Nível de refrigerante baixo',
            descricao: `Nível caiu de ${prev.nivelRefrigerantePct.toFixed(1)}% para ${curr.nivelRefrigerantePct.toFixed(1)}%`,
            origem: circuito?.nome || `Circuito ${circuitoId}`,
            dataHora: dataHora,
            status: 'Reconhecido',
            acoes: 1
          });
        }

        // DETECÇÃO DE QUEDA DE EFICIÊNCIA
        if (prev.eficienciaTermicaPct > 35 && curr.eficienciaTermicaPct < 30) {
          alerts.push({
            id: `efficiency-drop-${curr.id}`,
            nivel: 'Info',
            alerta: 'Queda de eficiência térmica',
            descricao: `Eficiência caiu de ${prev.eficienciaTermicaPct.toFixed(1)}% para ${curr.eficienciaTermicaPct.toFixed(1)}%`,
            origem: circuito?.nome || `Circuito ${circuitoId}`,
            dataHora: dataHora,
            status: 'Reconhecido',
            acoes: 0
          });
        }
      }
    });

    // Ordenar por data (mais recente primeiro)
    return alerts.sort((a, b) => b.dataHora - a.dataHora);
  };

  const alerts = generateAlerts();

  // Filtrar alertas
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch =
      alert.alerta.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.origem.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLevel = filterLevel === 'todos' || alert.nivel === filterLevel;
    const matchesStatus = filterStatus === 'todos' ||
      (filterStatus === 'reconhecido' && alert.status === 'Reconhecido') ||
      (filterStatus === 'nao-reconhecido' && alert.status === 'Não reconhecido');

    return matchesSearch && matchesLevel && matchesStatus;
  });

  // Aplicar filtro de período após filtros básicos
  let finalAlerts = filteredAlerts;
  if (filterPeriod === 'recentes') {
    finalAlerts = filteredAlerts.slice(0, 100);
  } else if (filterPeriod === 'criticos') {
    finalAlerts = filteredAlerts.filter(a => a.nivel === 'Crítico');
  }

  const getLevelIcon = (nivel) => {
    switch (nivel) {
      case 'Crítico': return <AlertCircle size={16} />;
      case 'Atenção': return <AlertTriangle size={16} />;
      case 'Info': return <Info size={16} />;
      default: return <Info size={16} />;
    }
  };

  const getLevelClass = (nivel) => {
    switch (nivel) {
      case 'Crítico': return 'critical';
      case 'Atenção': return 'warning';
      case 'Info': return 'info';
      default: return 'info';
    }
  };

  const getStatusClass = (status) => {
    return status === 'Reconhecido' ? 'status-acknowledged' : 'status-pending';
  };

  const abrirDetalhes = (alert) => {
    setAlertaSelecionado(alert);
    setMostrarModal(true);
  };

  const reconhecerAlerta = () => {
    alert('Alerta reconhecido com sucesso!');
    setMostrarModal(false);
  };

  if (loading) {
    return (
      <div className="alertas-page">
        <div className="loading-container">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="alertas-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-label">MONITORAMENTO</div>
          <h1 className="page-title">Alertas</h1>
          <p className="page-description">Consulte, reconheça e acompanhe ocorrências operacionais.</p>
        </div>
        <button className="btn-export">
          <Download size={16} />
          Exportar relatório
        </button>
      </div>

      {/* Filtros */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar alerta, sensor ou equipamento"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filters-group">
          <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}>
            <option value="todos">Todos os níveis</option>
            <option value="Crítico">Crítico</option>
            <option value="Atenção">Atenção</option>
            <option value="Info">Info</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="todos">Todos os status</option>
            <option value="reconhecido">Reconhecido</option>
            <option value="nao-reconhecido">Não reconhecido</option>
          </select>
          <select value={filterPeriod} onChange={(e) => setFilterPeriod(e.target.value)}>
            <option value="todos">Todos os alertas</option>
            <option value="recentes">Mais recentes (100)</option>
            <option value="criticos">Apenas críticos</option>
          </select>
        </div>
      </div>

      {/* Lista de alertas */}
      <div className="alerts-container">
        <div className="alerts-count">
          {finalAlerts.length} alertas
          <span className="alerts-updated">Total de {alerts.length} alertas no sistema</span>
        </div>

        <div className="alerts-table">
          <div className="table-header">
            <div className="th th-level">NÍVEL</div>
            <div className="th th-alert">ALERTA</div>
            <div className="th th-origin">ORIGEM</div>
            <div className="th th-datetime">DATA/HORA</div>
            <div className="th th-status">STATUS</div>
            <div className="th th-actions">AÇÃO</div>
          </div>
          <div className="table-body">
            {finalAlerts.length > 0 ? (
              finalAlerts.map(alert => (
              <div key={alert.id} className="table-row">
                <div className={`td td-level level-${getLevelClass(alert.nivel)}`}>
                  <span className="level-indicator">
                    {getLevelIcon(alert.nivel)}
                  </span>
                  {alert.nivel}
                </div>
                <div className="td td-alert">
                  <div className="alert-title">{alert.alerta}</div>
                  <div className="alert-description">{alert.descricao}</div>
                </div>
                <div className="td td-origin">{alert.origem}</div>
                <div className="td td-datetime">
                  {alert.dataHora.toLocaleDateString('pt-BR')} {alert.dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="td td-status">
                  <span className={`status-badge ${getStatusClass(alert.status)}`}>
                    {alert.status}
                  </span>
                </div>
                <div className="td td-actions">
                  <button className="btn-action" onClick={() => abrirDetalhes(alert)}>
                    Abrir →
                  </button>
                </div>
              </div>
            ))
            ) : (
              <div className="empty-state">
                <AlertCircle size={48} />
                <p>Nenhum alerta encontrado</p>
                <span>Ajuste os filtros para ver mais resultados</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Detalhes */}
      {mostrarModal && alertaSelecionado && (
        <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-section">
                <div className={`level-badge level-${getLevelClass(alertaSelecionado.nivel)}`}>
                  {getLevelIcon(alertaSelecionado.nivel)}
                  {alertaSelecionado.nivel}
                </div>
                <h2>{alertaSelecionado.alerta}</h2>
              </div>
              <button className="modal-close" onClick={() => setMostrarModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="alert-details-grid">
                <div className="detail-item">
                  <label>Origem</label>
                  <p>{alertaSelecionado.origem}</p>
                </div>
                <div className="detail-item">
                  <label>Data e Hora</label>
                  <p>
                    {alertaSelecionado.dataHora.toLocaleDateString('pt-BR')} às {' '}
                    {alertaSelecionado.dataHora.toLocaleTimeString('pt-BR')}
                  </p>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <p>
                    <span className={`status-badge ${getStatusClass(alertaSelecionado.status)}`}>
                      {alertaSelecionado.status}
                    </span>
                  </p>
                </div>
                <div className="detail-item">
                  <label>Ações Registradas</label>
                  <p>{alertaSelecionado.acoes} ação(ões)</p>
                </div>
              </div>

              <div className="detail-section">
                <label>Descrição do Alerta</label>
                <p className="description-text">{alertaSelecionado.descricao}</p>
              </div>

              <div className="detail-section">
                <label>Recomendações</label>
                <ul className="recommendations-list">
                  {alertaSelecionado.nivel === 'Crítico' && (
                    <>
                      <li>Notificar supervisor imediatamente</li>
                      <li>Verificar status do equipamento</li>
                      <li>Registrar observações no sistema</li>
                      <li>Considerar isolamento do circuito se necessário</li>
                    </>
                  )}
                  {alertaSelecionado.nivel === 'Atenção' && (
                    <>
                      <li>Monitorar evolução do parâmetro</li>
                      <li>Verificar histórico recente</li>
                      <li>Preparar manutenção preventiva se necessário</li>
                    </>
                  )}
                  {alertaSelecionado.nivel === 'Info' && (
                    <>
                      <li>Registrar para análise futura</li>
                      <li>Nenhuma ação imediata necessária</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="modal-actions">
                {alertaSelecionado.status === 'Não reconhecido' && (
                  <button className="btn-acknowledge" onClick={reconhecerAlerta}>
                    <CheckCircle size={18} />
                    Reconhecer Alerta
                  </button>
                )}
                <button className="btn-secondary" onClick={() => setMostrarModal(false)}>
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Alertas;
