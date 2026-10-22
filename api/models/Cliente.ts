import prisma from '../prisma.js';

export interface ClienteInput {
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
}

export const ClienteModel = {
  async getAll() {
    return prisma.cliente.findMany({ orderBy: { nomeFantasia: 'asc' } });
  },

  async getById(id: number) {
    return prisma.cliente.findUnique({ where: { id } });
  },

  async create(data: ClienteInput) {
    return prisma.cliente.create({
      data: {
        cnpj: data.cnpj || null,
        nomeFantasia: data.nomeFantasia,
        razaoSocial: data.razaoSocial || null,
        inscricaoEstadual: data.inscricaoEstadual || null,
        nomeComprador: data.nomeComprador || null,
        email: data.email || null,
        telefone: data.telefone || null,
        telefoneEmpresa: data.telefoneEmpresa || null,
        emailEmpresa: data.emailEmpresa || null,
        dataNascimento: data.dataNascimento ? new Date(data.dataNascimento) : null,
        enderecoCep: data.enderecoCep || null,
        enderecoLogradouro: data.enderecoLogradouro || null,
        enderecoNumero: data.enderecoNumero || null,
        enderecoComplemento: data.enderecoComplemento || null,
        enderecoBairro: data.enderecoBairro || null,
        enderecoCidade: data.enderecoCidade || null,
        enderecoEstado: data.enderecoEstado || null,
        contatos: data.contatos || null,
        observacoes: data.observacoes || null,
      },
    });
  },

  async update(id: number, data: ClienteInput) {
    return prisma.cliente.update({
      where: { id },
      data: {
        cnpj: data.cnpj || null,
        nomeFantasia: data.nomeFantasia,
        razaoSocial: data.razaoSocial || null,
        inscricaoEstadual: data.inscricaoEstadual || null,
        nomeComprador: data.nomeComprador || null,
        email: data.email || null,
        telefone: data.telefone || null,
        telefoneEmpresa: data.telefoneEmpresa || null,
        emailEmpresa: data.emailEmpresa || null,
        dataNascimento: data.dataNascimento ? new Date(data.dataNascimento) : null,
        enderecoCep: data.enderecoCep || null,
        enderecoLogradouro: data.enderecoLogradouro || null,
        enderecoNumero: data.enderecoNumero || null,
        enderecoComplemento: data.enderecoComplemento || null,
        enderecoBairro: data.enderecoBairro || null,
        enderecoCidade: data.enderecoCidade || null,
        enderecoEstado: data.enderecoEstado || null,
        contatos: data.contatos || null,
        observacoes: data.observacoes || null,
        dataAtualizacao: new Date(),
      },
    });
  },

  async delete(id: number) {
    return prisma.cliente.delete({ where: { id } });
  },
};
