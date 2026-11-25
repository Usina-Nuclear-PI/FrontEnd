# 🖥️ NUCLENAI — Interface Web (`front_pi`)

Aplicação front-end desenvolvida em **React 19** e **Vite** para o monitoramento operacional em tempo real da usina nuclear **NUCLENAI**, totalmente integrada à API RESTful Spring Boot.

## ✨ Funcionalidades

* **Autenticação por Perfil**: Login para **Administrador** e **Operador**, com controle de acesso à gestão de usuários.
* **Dashboard em Tempo Real**: Indicadores críticos do reator, status dos circuitos, sensores online e gráficos dinâmicos.
* **Central de Alertas**: Monitoramento de anomalias (temperatura elevada, vibração acima do limite, etc.) com filtros por nível, status e período.
* **Histórico & Gráficos Históricos**: Consulta detalhada de eventos passados e análise temporal de variáveis com **Recharts**.
* **Sensores & Equipamentos**: Acompanhamento individualizado por circuito e equipamento com mini-gráficos de tendência.
* **Relatórios & Configurações**: Geração de relatórios operacionais/manutenção e personalização dos widgets visíveis no dashboard.

## 🛠️ Tecnologias Utilizadas

* **React 19.3** & **Vite 8.3**
* **React Router DOM 7** (Roteamento SPA)
* **Recharts 3** (Visualização de dados e séries temporais)
* **Lucide React** (Iconografia)

## 📁 Estrutura do Projeto

```text
front_pi/src/
├── components/
│   ├── Layout.jsx              # Estrutura base com sidebar responsiva e navegação
│   └── Layout.css
├── pages/
│   ├── Login.jsx               # Tela de autenticação
│   ├── Dashboard.jsx           # Painel principal de telemetria
│   ├── Alertas.jsx             # Gestão e filtragem de alertas
│   ├── Historico.jsx           # Log histórico de eventos
│   ├── Sensores.jsx            # Monitoramento de sensores
│   ├── Equipamentos.jsx        # Visão por circuito/equipamento
│   ├── GraficosHistoricos.jsx  # Análise gráfica de séries temporais
│   ├── Relatorios.jsx          # Emissão de relatórios
│   ├── Configuracoes.jsx       # Preferências do painel
│   └── Usuarios.jsx            # Gestão de usuários (perfil Admin)
└── services/
    └── api.js                  # Cliente HTTP centralizado para comunicação com a API
```

## 🚀 Como Executar

1. **Instale as dependências**:
   ```bash
   npm install
   ```
2. **Configure o endereço da API**:
   No arquivo `src/services/api.js`, defina a constante `API_BASE_URL` apontando para o servidor back-end (local ou nuvem):
   ```javascript
   const API_BASE_URL = 'http://localhost:8080';
   ```
3. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```
   Acesse `http://localhost:5173` no navegador.