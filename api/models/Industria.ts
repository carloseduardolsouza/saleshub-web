import prisma from '../prisma.js';

export interface IndustriaInput {
  id?: number;
  cnpj: string;
  nome: string;
  telefoneComercial?: string;
  telefoneAssistencia?: string;
  email?: string;
}

export const IndustriaModel = {
  async getAll() {
    return prisma.industria.findMany({ orderBy: { nome: 'asc' } });
  },

  async getById(id: number) {
    return prisma.industria.findUnique({ where: { id } });
  },

  async getByCnpj(cnpj: string, excludeId?: number) {
    const where: any = { cnpj };
    if (excludeId) where.id = { not: excludeId };
    return prisma.industria.findFirst({ where });
  },

  async create(data: IndustriaInput) {
    return prisma.industria.create({
      data: {
        cnpj: data.cnpj,
        nome: data.nome,
        telefoneComercial: data.telefoneComercial || null,
        telefoneAssistencia: data.telefoneAssistencia || null,
        email: data.email || null,
      },
    });
  },

  async update(id: number, data: IndustriaInput) {
    return prisma.industria.update({
      where: { id },
      data: {
        cnpj: data.cnpj,
        nome: data.nome,
        telefoneComercial: data.telefoneComercial || null,
        telefoneAssistencia: data.telefoneAssistencia || null,
        email: data.email || null,
        dataEdicao: new Date(),
      },
    });
  },

  async delete(id: number) {
    return prisma.industria.delete({ where: { id } });
  },
};
