import { useState } from 'react';
import { FileText, Download, Calendar, Users } from 'lucide-react';
import './Relatorios.css';

function Relatorios() {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [relatorioSelecionado, setRelatorioSelecionado] = useState(null);
  const [novoRelatorio, setNovoRelatorio] = useState({
    tipo: 'operacional',
    periodo: '7dias',
    formato: 'pdf'
  });

  const relatoriosDisponiveis = [
    {
      id: 1,
      tipo: 'Operacional',
      titulo: 'Relatório diário de operação',
      descricao: 'Resumo de indicadores, alertas e disponibilidade.',
      ultimaAtualizacao: '30 dias',
      icone: '📄'
    },
    {
      id: 2,
      tipo: 'Manutenção',
      titulo: 'Eventos de manutenção',
      descricao: 'Histórico de equipamentos e ocorrências do período.',
      ultimaAtualizacao: '30 dias',
      icone: '🔧'
    },
    {
      id: 3,
      tipo: 'Sensores',
      titulo: 'Disponibilidade de sensores',
      descricao: 'Status, indisponibilidades e tempo médio online.',
      ultimaAtualizacao: 'Últimos 7 dias',
      icone: '📡'
    }
  ];

  const historicoRelatorios = [
    { id: 1, relatorio: 'Relatório diário de operação', periodo: '02/10/2026', criadoPor: 'Administrador', data: '02/10 08:00', status: 'Disponível' },
    { id: 2, relatorio: 'Eventos de manutenção', periodo: '01/09 — 01/10', criadoPor: 'Administrador', data: '01/10 16:20', status: 'Disponível' },
    { id: 3, relatorio: 'Disponibilidade de sensores', periodo: '25/09 — 02/10', criadoPor: 'Operador', data: '02/10 14:35', status: 'Disponível' }
  ];

  const handleVisualizarRelatorio = (relatorio) => {
    setRelatorioSelecionado(relatorio);
    setMostrarModal(true);
  };

  const handleBaixarRelatorio = (relatorioHistorico) => {
    // Simular download
    const blob = new Blob([`Relatório: ${relatorioHistorico.relatorio}\nPeríodo: ${relatorioHistorico.periodo}\n\nConteúdo do relatório...`], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${relatorioHistorico.relatorio.replace(/ /g, '_')}_${relatorioHistorico.periodo.replace(/\//g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleCriarNovoRelatorio = () => {
    alert(`Relatório criado com sucesso!\n\nTipo: ${novoRelatorio.tipo}\nPeríodo: ${novoRelatorio.periodo}\nFormato: ${novoRelatorio.formato}`);
    setMostrarModal(false);
  };

  return (
    <div className="relatorios-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-label">ANÁLISE</div>
          <h1 className="page-title">Relatórios</h1>
          <p className="page-description">Gere, consulte e gerencie relatórios operacionais.</p>
        </div>
        <button className="btn-new-report" onClick={() => {
          setRelatorioSelecionado(null);
          setMostrarModal(true);
        }}>
          <FileText size={16} />
          + Novo relatório
        </button>
      </div>

      <div className="reports-grid">
        {relatoriosDisponiveis.map(rel => (
          <div key={rel.id} className="report-card">
            <div className="report-icon">{rel.icone}</div>
            <div className="report-type">{rel.tipo}</div>
            <h3 className="report-title">{rel.titulo}</h3>
            <p className="report-description">{rel.descricao}</p>
            <div className="report-footer">
              <span className="report-update">{rel.ultimaAtualizacao}</span>
              <button
                className="btn-visualize"
                onClick={() => handleVisualizarRelatorio(rel)}
              >
                Visualizar →
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card historic-card">
        <div className="card-header">
          <div>
            <div className="card-label">HISTÓRICO</div>
            <h3 className="card-title">Relatórios gerados</h3>
          </div>
        </div>
        <table className="historic-table">
          <thead>
            <tr>
              <th>RELATÓRIO</th>
              <th>PERÍODO</th>
              <th>CRIADO POR</th>
              <th>DATA</th>
              <th>STATUS</th>
              <th>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {historicoRelatorios.map((rel) => (
              <tr key={rel.id}>
                <td>{rel.relatorio}</td>
                <td>{rel.periodo}</td>
                <td>
                  <div className="user-cell">
                    <Users size={14} />
                    {rel.criadoPor}
                  </div>
                </td>
                <td>{rel.data}</td>
                <td>
                  <span className="status-badge status-available">{rel.status}</span>
                </td>
                <td>
                  <button
                    className="btn-download"
                    onClick={() => handleBaixarRelatorio(rel)}
                    title="Baixar relatório"
                  >
                    <Download size={16} />
                    Baixar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {mostrarModal && (
        <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{relatorioSelecionado ? 'Visualizar Relatório' : 'Criar Novo Relatório'}</h2>
              <button className="modal-close" onClick={() => setMostrarModal(false)}>×</button>
            </div>

            {relatorioSelecionado ? (
              <div className="modal-body">
                <div className="relatorio-preview">
                  <div className="preview-icon">{relatorioSelecionado.icone}</div>
                  <h3>{relatorioSelecionado.titulo}</h3>
                  <p className="preview-type">{relatorioSelecionado.tipo}</p>
                  <p className="preview-description">{relatorioSelecionado.descricao}</p>
                  <div className="preview-info">
                    <Calendar size={16} />
                    <span>Última atualização: {relatorioSelecionado.ultimaAtualizacao}</span>
                  </div>
                  <button className="btn-download-primary">
                    <Download size={18} />
                    Baixar Relatório (PDF)
                  </button>
                </div>
              </div>
            ) : (
              <div className="modal-body">
                <div className="form-group">
                  <label>Tipo de Relatório</label>
                  <select
                    value={novoRelatorio.tipo}
                    onChange={(e) => setNovoRelatorio({...novoRelatorio, tipo: e.target.value})}
                  >
                    <option value="operacional">Operacional</option>
                    <option value="manutencao">Manutenção</option>
                    <option value="sensores">Sensores</option>
                    <option value="completo">Completo</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Período</label>
                  <select
                    value={novoRelatorio.periodo}
                    onChange={(e) => setNovoRelatorio({...novoRelatorio, periodo: e.target.value})}
                  >
                    <option value="24horas">Últimas 24 horas</option>
                    <option value="7dias">Últimos 7 dias</option>
                    <option value="30dias">Últimos 30 dias</option>
                    <option value="90dias">Últimos 90 dias</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Formato</label>
                  <select
                    value={novoRelatorio.formato}
                    onChange={(e) => setNovoRelatorio({...novoRelatorio, formato: e.target.value})}
                  >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel (.xlsx)</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>

                <button className="btn-create-report" onClick={handleCriarNovoRelatorio}>
                  <FileText size={18} />
                  Gerar Relatório
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Relatorios;
