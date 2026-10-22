import prisma from '../prisma.js';

export const UsuarioModel = {
  async findByEmail(email: string) {
    return prisma.usuario.findUnique({ where: { email } });
  },

  async findById(id: number) {
    return prisma.usuario.findUnique({ where: { id } });
  },

  async create(data: { nome: string; email: string; senha: string; role?: string }) {
    return prisma.usuario.create({
      data: {
        nome: data.nome,
        email: data.email,
        senha: data.senha,
        role: data.role || 'user',
      },
    });
  },
};
