const API_BASE = import.meta.env.VITE_API_URL ?? 'http://31.97.168.13:3334/api';

function getToken(): string | null {
  return localStorage.getItem('saleshub_token');
}

function setToken(token: string) {
  localStorage.setItem('saleshub_token', token);
}

function clearToken() {
  localStorage.removeItem('saleshub_token');
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${url}`, { ...options, headers: { ...headers, ...options?.headers } });

  if (res.status === 401 && url !== '/auth/login') {
    clearToken();
    window.location.href = '/login';
    throw new Error('Sessao expirada');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Erro na requisicao' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: string;
}

export interface Cliente {
  id?: number;
  cnpj?: string;
  nomeFantasia: string;
  razaoSocial?: string;
  inscricaoEstadual?: string;
  nomeComprador?: string;
  email?: string;
  telefone?: string;
  telefoneEmpresa?: string;
  emailEmpresa?: string;
  dataNascimento?: string;
  enderecoCep?: string;
  enderecoLogradouro?: string;
  enderecoNumero?: string;
  enderecoComplemento?: string;
  enderecoBairro?: string;
  enderecoCidade?: string;
  enderecoEstado?: string;
  contatos?: string;
  observacoes?: string;
  dataCadastro?: string;
  dataAtualizacao?: string;
}

export interface Industria {
  id?: number;
  cnpj: string;
  nome: string;
  telefoneComercial?: string;
  telefoneAssistencia?: string;
  email?: string;
  dataCadastro?: string;
  dataEdicao?: string;
}

export interface ProdutoVariacao {
  id?: number;
  produtoId?: number;
  tipo: string;
  valor: string;
}

export interface Produto {
  id?: number;
  nome: string;
  preco: number;
  industria: string;
  descricao?: string;
  imagens?: string[];
  variacoes?: ProdutoVariacao[];
  dataCadastro?: string;
  dataAtualizacao?: string;
}

export interface PedidoProduto {
  id?: number;
  pedidoId?: number;
  produtoId?: number;
  nome: string;
  preco: number;
  quantidade: number;
  descontoTipo?: string;
  descontoValor?: string;
  variacaoTipo?: string;
  variacaoValor?: string;
}

export interface PedidoPrazo {
  id?: number;
  pedidoId?: number;
  dias: string;
}

export interface Pedido {
  id?: number;
  cliente: string;
  total: number;
  descontoTipo?: string;
  descontoValor?: string;
  metodoPagamento: string;
  observacoes?: string;
  status?: string;
  data?: string;
  produtos?: PedidoProduto[];
  prazos?: PedidoPrazo[];
}

export const api = {
  auth: {
    login: async (email: string, senha: string) => {
      const data = await request<{ token: string; usuario: Usuario }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha }),
      });
      setToken(data.token);
      return data;
    },
    me: () => request<Usuario>('/auth/me'),
    logout: () => { clearToken(); },
    isAuthenticated: () => !!getToken(),
  },

  clientes: {
    getAll: () => request<Cliente[]>('/clientes'),
    getById: (id: number) => request<Cliente>(`/clientes/${id}`),
    create: (data: Cliente) => request<Cliente>('/clientes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Cliente) => request<Cliente>(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/clientes/${id}`, { method: 'DELETE' }),
  },

  industrias: {
    getAll: () => request<Industria[]>('/industrias'),
    getById: (id: number) => request<Industria>(`/industrias/${id}`),
    create: (data: Industria) => request<Industria>('/industrias', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Industria) => request<Industria>(`/industrias/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/industrias/${id}`, { method: 'DELETE' }),
  },

  produtos: {
    getAll: () => request<Produto[]>('/produtos'),
    getById: (id: number) => request<Produto>(`/produtos/${id}`),
    create: (data: Produto) => request<Produto>('/produtos', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Produto) => request<Produto>(`/produtos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/produtos/${id}`, { method: 'DELETE' }),
  },

  pedidos: {
    getAll: () => request<Pedido[]>('/pedidos'),
    getById: (id: number) => request<Pedido>(`/pedidos/${id}`),
    create: (data: Pedido) => request<Pedido>('/pedidos', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Pedido) => request<Pedido>(`/pedidos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    updateStatus: (id: number, status: string) => request<Pedido>(`/pedidos/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    delete: (id: number) => request<void>(`/pedidos/${id}`, { method: 'DELETE' }),
    downloadPDF: async (id: number, descontos: boolean) => {
      const token = getToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/pedidos/${id}/pdf?descontos=${descontos}`, { headers });
      if (!res.ok) throw new Error('Erro ao baixar PDF');
      const blob = await res.blob();
      const disposition = res.headers.get('Content-Disposition') || '';
      const match = disposition.match(/filename="?(.+?)"?$/);
      const filename = match ? match[1] : `Pedido_${id}.pdf`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },
  },

  configuracoes: {
    getAll: () => request<Record<string, string>>('/configuracoes'),
    get: (chave: string) => request<{ chave: string; valor: string | null }>(`/configuracoes/${chave}`),
    set: (chave: string, valor: string) => request<{ chave: string; valor: string }>('/configuracoes', { method: 'POST', body: JSON.stringify({ chave, valor }) }),
    delete: (chave: string) => request<void>(`/configuracoes/${chave}`, { method: 'DELETE' }),
  },
};
