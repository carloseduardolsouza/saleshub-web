import prisma from '../prisma.js';

export interface PedidoProdutoInput {
  produtoId?: number;
  nome: string;
  preco: number;
  quantidade: number;
  descontoTipo?: string;
  descontoValor?: string;
  variacaoTipo?: string;
  variacaoValor?: string;
}

export interface PedidoPrazoInput {
  dias: string;
}

export interface PedidoInput {
  id?: number;
  cliente: string;
  total: number;
  descontoTipo?: string;
  descontoValor?: string;
  metodoPagamento: string;
  observacoes?: string;
  status?: string;
  data?: string;
  produtos?: PedidoProdutoInput[];
  prazos?: PedidoPrazoInput[];
}

export const PedidoModel = {
  async getAll() {
    return prisma.pedido.findMany({
      include: { produtos: true, prazos: true },
      orderBy: { data: 'desc' },
    });
  },

  async getById(id: number) {
    return prisma.pedido.findUnique({
      where: { id },
      include: { produtos: true, prazos: true },
    });
  },

  async create(data: PedidoInput) {
    return prisma.pedido.create({
      data: {
        cliente: data.cliente,
        total: data.total,
        descontoTipo: data.descontoTipo || null,
        descontoValor: data.descontoValor || null,
        metodoPagamento: data.metodoPagamento,
        observacoes: data.observacoes || null,
        status: data.status || 'pendente',
        data: data.data ? new Date(data.data) : new Date(),
        produtos: data.produtos
          ? {
              create: data.produtos.map((p) => ({
                produtoId: p.produtoId || null,
                nome: p.nome,
                preco: p.preco,
                quantidade: p.quantidade,
                descontoTipo: p.descontoTipo || null,
                descontoValor: p.descontoValor || null,
                variacaoTipo: p.variacaoTipo || null,
                variacaoValor: p.variacaoValor || null,
              })),
            }
          : undefined,
        prazos: data.prazos
          ? { create: data.prazos.map((p) => ({ dias: p.dias })) }
          : undefined,
      },
      include: { produtos: true, prazos: true },
    });
  },

  async update(id: number, data: PedidoInput) {
    await prisma.pedidoProduto.deleteMany({ where: { pedidoId: id } });
    await prisma.pedidoPrazo.deleteMany({ where: { pedidoId: id } });

    return prisma.pedido.update({
      where: { id },
      data: {
        cliente: data.cliente,
        total: data.total,
        descontoTipo: data.descontoTipo || null,
        descontoValor: data.descontoValor || null,
        metodoPagamento: data.metodoPagamento,
        observacoes: data.observacoes || null,
        status: data.status || 'pendente',
        produtos: data.produtos
          ? {
              create: data.produtos.map((p) => ({
                produtoId: p.produtoId || null,
                nome: p.nome,
                preco: p.preco,
                quantidade: p.quantidade,
                descontoTipo: p.descontoTipo || null,
                descontoValor: p.descontoValor || null,
                variacaoTipo: p.variacaoTipo || null,
                variacaoValor: p.variacaoValor || null,
              })),
            }
          : undefined,
        prazos: data.prazos
          ? { create: data.prazos.map((p) => ({ dias: p.dias })) }
          : undefined,
      },
      include: { produtos: true, prazos: true },
    });
  },

  async delete(id: number) {
    await prisma.pedidoProduto.deleteMany({ where: { pedidoId: id } });
    await prisma.pedidoPrazo.deleteMany({ where: { pedidoId: id } });
    return prisma.pedido.delete({ where: { id } });
  },
};
