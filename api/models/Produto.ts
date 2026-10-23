import prisma from '../prisma.js';

export interface ProdutoInput {
  id?: number;
  nome: string;
  preco: number;
  industria: string;
  descricao?: string;
  imagens?: string[];
  variacoes?: { tipo: string; valor: string }[];
}

export const ProdutoModel = {
  async getAll() {
    return prisma.produto.findMany({
      include: { imagens: { orderBy: { ordem: 'asc' } }, variacoes: true },
      orderBy: { nome: 'asc' },
    });
  },

  async getById(id: number) {
    return prisma.produto.findUnique({
      where: { id },
      include: { imagens: { orderBy: { ordem: 'asc' } }, variacoes: true },
    });
  },

  async create(data: ProdutoInput) {
    return prisma.produto.create({
      data: {
        nome: data.nome,
        preco: data.preco,
        industria: data.industria,
        descricao: data.descricao || null,
        imagens: data.imagens
          ? { create: data.imagens.map((img, i) => ({ imagem: img, ordem: i })) }
          : undefined,
        variacoes: data.variacoes
          ? { create: data.variacoes.map((v) => ({ tipo: v.tipo, valor: v.valor })) }
          : undefined,
      },
      include: { imagens: true, variacoes: true },
    });
  },

  async update(id: number, data: ProdutoInput) {
    return prisma.$transaction(async (tx) => {
    if (data.imagens) {
      await tx.produtoImagem.deleteMany({ where: { produtoId: id } });
    }
    if (data.variacoes) {
      await tx.produtoVariacao.deleteMany({ where: { produtoId: id } });
    }

    return tx.produto.update({
      where: { id },
      data: {
        nome: data.nome,
        preco: data.preco,
        industria: data.industria,
        descricao: data.descricao || null,
        dataAtualizacao: new Date(),
        imagens: data.imagens
          ? { create: data.imagens.map((img, i) => ({ imagem: img, ordem: i })) }
          : undefined,
        variacoes: data.variacoes
          ? { create: data.variacoes.map((v) => ({ tipo: v.tipo, valor: v.valor })) }
          : undefined,
      },
      include: { imagens: true, variacoes: true },
    });
    });
  },

  async delete(id: number) {
    return prisma.produto.delete({ where: { id } });
  },
};
