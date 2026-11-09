import { useState } from 'react';
import './Configuracoes.css';

function Configuracoes() {
  const [configs, setConfigs] = useState({
    estadoReator: true,
    alertasAtivos: true,
    sensoresOnline: true,
    graficoPotencia: true,
    indicadoresManutencao: false
  });

  const toggleConfig = (key) => {
    setConfigs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="configuracoes-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-label">ADMINISTRAÇÃO</div>
          <h1 className="page-title">Configurações</h1>
          <p className="page-description">Personalize os parâmetros e informações exibidas no dashboard.</p>
        </div>
        <button className="btn-save">Salvar alterações</button>
      </div>

      <div className="config-grid">
        {/* Parâmetros Visíveis */}
        <div className="config-card">
          <div className="config-section">
            <div className="section-label">DASHBOARD</div>
            <h3 className="section-title">Parâmetros visíveis</h3>
          </div>

          <div className="config-item">
            <div className="config-info">
              <div className="config-name">Estado do reator</div>
              <div className="config-desc">Exibir estado Operat.qual principal</div>
            </div>
            <div
              className={`toggle-switch ${configs.estadoReator ? 'active' : ''}`}
              onClick={() => toggleConfig('estadoReator')}
            ></div>
          </div>

          <div className="config-item">
            <div className="config-info">
              <div className="config-name">Alertas ativos</div>
              <div className="config-desc">Quantidade e último avento</div>
            </div>
            <div
              className={`toggle-switch ${configs.alertasAtivos ? 'active' : ''}`}
              onClick={() => toggleConfig('alertasAtivos')}
            ></div>
          </div>

          <div className="config-item">
            <div className="config-info">
              <div className="config-name">Sensores online</div>
              <div className="config-desc">Disponibilidade dos sensores</div>
            </div>
            <div
              className={`toggle-switch ${configs.sensoresOnline ? 'active' : ''}`}
              onClick={() => toggleConfig('sensoresOnline')}
            ></div>
          </div>

          <div className="config-item">
            <div className="config-info">
              <div className="config-name">Gráfico de potência</div>
              <div className="config-desc">Exibição das últimas 24 horas</div>
            </div>
            <div
              className={`toggle-switch ${configs.graficoPotencia ? 'active' : ''}`}
              onClick={() => toggleConfig('graficoPotencia')}
            ></div>
          </div>

          <div className="config-item">
            <div className="config-info">
              <div className="config-name">Indicadores de manutenção</div>
              <div className="config-desc">Resumo de equipamentos</div>
            </div>
            <div
              className={`toggle-switch ${configs.indicadoresManutencao ? 'active' : ''}`}
              onClick={() => toggleConfig('indicadoresManutencao')}
            ></div>
          </div>
        </div>

        {/* Preferências */}
        <div className="config-card">
          <div className="config-section">
            <div className="section-label">PREFERÊNCIAS</div>
            <h3 className="section-title">Exibição</h3>
          </div>

          <div className="form-group">
            <label className="form-label">Intervalo de atualização</label>
            <select className="form-select" defaultValue="5">
              <option value="5">5 segundos</option>
              <option value="10">10 segundos</option>
              <option value="30">30 segundos</option>
              <option value="60">1 minuto</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Formato de data</label>
            <select className="form-select" defaultValue="DD/MM/AAAA">
              <option value="DD/MM/AAAA">DD/MM/AAAA</option>
              <option value="MM/DD/AAAA">MM/DD/AAAA</option>
              <option value="AAAA-MM-DD">AAAA-MM-DD</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Fuso horário</label>
            <select className="form-select" defaultValue="brasilia">
              <option value="brasilia">(UTC-03:00) Brasília</option>
              <option value="utc">(UTC+00:00) UTC</option>
              <option value="ny">(UTC-05:00) New York</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Itens por página</label>
            <select className="form-select" defaultValue="25">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Configuracoes;
