import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { UsuarioModel } from '../models/Usuario.js';
import { signToken } from '../middleware/auth.js';

export const AuthController = {
  async login(req: Request, res: Response) {
    try {
      const { email, senha } = req.body;
      if (!email?.trim() || !senha?.trim()) {
        return res.status(400).json({ error: 'Email e senha sao obrigatorios' });
      }

      const usuario = await UsuarioModel.findByEmail(email);
      if (!usuario) {
        return res.status(401).json({ error: 'Credenciais invalidas' });
      }

      if (!usuario.ativo) {
        return res.status(401).json({ error: 'Conta desativada' });
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        return res.status(401).json({ error: 'Credenciais invalidas' });
      }

      const token = signToken(usuario.id, usuario.role);

      return res.json({
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          role: usuario.role,
        },
      });
    } catch {
      return res.status(500).json({ error: 'Erro ao fazer login' });
    }
  },

  async me(req: Request, res: Response) {
    try {
      const userId = Number((req as any).userId);
      const usuario = await UsuarioModel.findById(userId);
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario nao encontrado' });
      }
      return res.json({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
      });
    } catch {
      return res.status(500).json({ error: 'Erro ao buscar usuario' });
    }
  },
};
