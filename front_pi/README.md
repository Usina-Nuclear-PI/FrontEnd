# NUCLENAI - Front-end

Sistema de monitoramento operacional de usina nuclear integrado com API.

## 🚀 Tecnologias

- React 19.3.1
- Vite 8.3.6
- React Router DOM (navegação)
- Recharts (gráficos)
- Lucide React (ícones)

## 📦 Instalação

```bash
cd front_pi
npm install
```

## 🔧 Configuração da API

O front-end está configurado para conectar com a API em `http://localhost:8080`.

Para alterar a URL da API, edite o arquivo `src/services/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:8080';
```

## 🏃 Executar o projeto

### Modo desenvolvimento
```bash
npm run dev
```
O aplicativo estará disponível em: http://localhost:5173

### Build para produção
```bash
npm run build
```

### Preview da build
```bash
npm run preview
```

## 📁 Estrutura do projeto

```
front_pi/
├── src/
│   ├── components/
│   │   ├── Layout.jsx          # Layout principal com sidebar
│   │   └── Layout.css
│   ├── pages/
│   │   ├── Login.jsx           # Página de login
│   │   ├── Dashboard.jsx       # Dashboard principal
│   │   ├── Alertas.jsx         # Página de alertas
│   │   ├── Historico.jsx       # Histórico de eventos
│   │   ├── Sensores.jsx        # Listagem de sensores
│   │   ├── Equipamentos.jsx    # Listagem de equipamentos
│   │   ├── GraficosHistoricos.jsx  # Gráficos históricos
│   │   ├── Relatorios.jsx      # Geração de relatórios
│   │   └── Configuracoes.jsx   # Configurações do sistema
│   ├── services/
│   │   └── api.js              # Serviço de comunicação com API
│   ├── App.jsx                 # Componente principal
│   ├── main.jsx                # Ponto de entrada
│   └── index.css               # Estilos globais
└── package.json
```

## 🎨 Páginas do sistema

### 1. Login
- Seleção de tipo de usuário (Administrador/Operador)
- Interface intuitiva e moderna

### 2. Dashboard
- Status da planta em tempo real
- Alertas ativos
- Sensores online
- Equipamentos operacionais
- Estado do reator
- Gráfico de potência térmica
- Indicadores de disponibilidade

### 3. Alertas
- Lista de alertas ativos
- Filtros por nível, status e período
- Busca por alerta ou sensor
- Exportação de relatórios

### 4. Histórico
- Histórico completo de eventos
- Estatísticas de eventos
- Filtros avançados

### 5. Sensores
- Cards de sensores com dados em tempo real
- Mini gráficos de tendência
- Filtros por status e tipo
- Busca por ID ou nome

### 6. Equipamentos
- Listagem de equipamentos monitorados
- Status operacional
- Disponibilidade de sensores

### 7. Gráficos Históricos
- Visualização de dados históricos
- Seleção de sensores e períodos
- Exportação de dados

### 8. Relatórios
- Geração de relatórios operacionais
- Relatórios de manutenção
- Histórico de relatórios gerados

### 9. Configurações
- Parâmetros visíveis no dashboard
- Preferências de exibição
- Intervalo de atualização
- Formato de data e fuso horário

## 🔌 Integração com API

O front-end consome os seguintes endpoints da API:

- `GET /monitoramento` - Listar todos os monitoramentos
- `GET /monitoramento/{id}` - Buscar monitoramento por ID
- `POST /monitoramento` - Criar novo monitoramento
- `PUT /monitoramento/{id}` - Atualizar monitoramento
- `DELETE /monitoramento/{id}` - Deletar monitoramento
- `GET /status` - Listar status operacionais
- `GET /circuitos` - Listar circuitos
- `GET /turnos` - Listar turnos
- `GET /usuarios` - Listar usuários
- `GET /arquivos` - Listar arquivos

## 🎯 Funcionalidades

### Dados em tempo real
- Atualização automática dos dados da API
- Indicador visual de "dados ao vivo"
- Botão de atualização manual

### Visualizações
- Gráficos interativos com Recharts
- Cards de status com métricas importantes
- Tabelas filtráveis e pesquisáveis

### Alertas inteligentes
- Detecção automática de anomalias baseada em limites
- Classificação por nível (Crítico, Atenção, Info)
- Status de reconhecimento

### Responsividade
- Design adaptável para diferentes resoluções
- Interface otimizada para monitores grandes

## 🎨 Design System

O sistema utiliza uma paleta de cores dark theme:

- **Background**: Tons de azul escuro (#0a1628, #0f1d33, #132238)
- **Texto**: Tons de cinza claro (#e8eef5, #8b9bb3)
- **Acentos**:
  - Cyan: #3b9dd8, #4dd4e8
  - Verde: #10b981 (sucesso/online)
  - Amarelo: #fbbf24 (atenção)
  - Vermelho: #ef4444 (crítico)
  - Azul: #3b9dd8 (info)

## 📝 Notas importantes

1. **Certifique-se de que a API está rodando** antes de iniciar o front-end
2. A API deve estar disponível em `http://localhost:8080`
3. Verifique se há dados no banco de dados para visualização completa
4. O sistema detecta automaticamente anomalias baseado em limites pré-definidos

## 🔧 Troubleshooting

### Erro de conexão com API
- Verifique se a API está rodando
- Confirme a URL da API em `src/services/api.js`
- Verifique se há problemas de CORS

### Dados não aparecem
- Certifique-se de que há dados no banco de dados
- Verifique o console do navegador para erros
- Teste os endpoints da API diretamente

### Gráficos não carregam
- Verifique se há dados suficientes no banco
- Confirme que os campos numéricos estão corretos
- Verifique o console para erros do Recharts

## 👨‍💻 Desenvolvimento

Para adicionar novas páginas:

1. Crie o componente em `src/pages/`
2. Crie o arquivo CSS correspondente
3. Adicione a rota em `src/App.jsx`
4. Adicione o item no menu em `src/components/Layout.jsx`

## 📄 Licença

Este projeto faz parte do sistema NUCLENAI de monitoramento de usina nuclear.
