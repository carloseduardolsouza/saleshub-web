import prisma from '../prisma.js';

export const ConfiguracaoModel = {
  async get(chave: string) {
    const row = await prisma.configuracao.findUnique({ where: { chave } });
    return row ? row.valor : null;
  },

  async set(chave: string, valor: string) {
    return prisma.configuracao.upsert({
      where: { chave },
      update: { valor },
      create: { chave, valor },
    });
  },

  async getAll() {
    const rows = await prisma.configuracao.findMany();
    const config: Record<string, string> = {};
    rows.forEach((r) => { config[r.chave] = r.valor; });
    return config;
  },

  async delete(chave: string) {
    return prisma.configuracao.delete({ where: { chave } });
  },
};
