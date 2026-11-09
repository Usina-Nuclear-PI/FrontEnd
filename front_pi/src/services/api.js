const API_BASE_URL = 'http://3.95.239.175:8080';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const { headers, ...rest } = options;

    try {
      const response = await fetch(url, {
        ...rest,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // DELETE costuma voltar 204 sem corpo
      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Monitoramento
  async getMonitoramento() {
    return this.request('/monitoramento');
  }

  async getMonitoramentoById(id) {
    return this.request(`/monitoramento/${id}`);
  }

  async createMonitoramento(data) {
    return this.request('/monitoramento', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMonitoramento(id, data) {
    return this.request(`/monitoramento/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMonitoramento(id) {
    return this.request(`/monitoramento/${id}`, {
      method: 'DELETE',
    });
  }

  // Status
  async getStatus() {
    return this.request('/status');
  }

  async getStatusById(id) {
    return this.request(`/status/${id}`);
  }

  // Circuitos
  async getCircuitos() {
    return this.request('/circuitos');
  }

  async getCircuitoById(id) {
    return this.request(`/circuitos/${id}`);
  }

  async createCircuito(data) {
    return this.request('/circuitos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCircuito(id, data) {
    return this.request(`/circuitos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCircuito(id) {
    return this.request(`/circuitos/${id}`, {
      method: 'DELETE',
    });
  }

  // Turnos
  async getTurnos() {
    return this.request('/turnos');
  }

  async getTurnoById(id) {
    return this.request(`/turnos/${id}`);
  }

  // Usuários
  async login(email, senha) {
    const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    // 401 = credenciais erradas: não é erro de rede, devolve a mensagem para a tela
    if (response.status === 401) {
      return {
        success: false,
        message: data?.message || 'Email ou senha inválidos',
      };
    }

    if (!response.ok || !data) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return data;
  }

  async getUsuarios() {
    return this.request('/usuarios');
  }

  async getUsuarioById(id) {
    return this.request(`/usuarios/${id}`);
  }

  async createUsuario(data) {
    return this.request('/usuarios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteUsuario(id) {
    return this.request(`/usuarios/${id}`, {
      method: 'DELETE',
    });
  }

  // Arquivos
  async getArquivos() {
    return this.request('/arquivos');
  }

  async getArquivoById(id) {
    return this.request(`/arquivos/${id}`);
  }
}

export default new ApiService();