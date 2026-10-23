import { Request, Response } from 'express';
import { fail } from '../middleware/validate.js';
import { ConfiguracaoModel } from '../models/Configuracao.js';

export const ConfiguracaoController = {
  async index(req: Request, res: Response) {
    try {
      const config = await ConfiguracaoModel.getAll();
      return res.json(config);
    } catch (error) {
      return fail(res, error, 'Erro ao buscar configuracoes');
    }
  },

  async show(req: Request, res: Response) {
    try {
      const chave = String(req.params.chave);
      const valor = await ConfiguracaoModel.get(chave);
      return res.json({ chave, valor });
    } catch (error) {
      return fail(res, error, 'Erro ao buscar configuracao');
    }
  },

  async store(req: Request, res: Response) {
    try {
      const { chave, valor } = req.body;
      if (!chave?.trim()) return res.status(400).json({ error: 'Chave e obrigatoria' });
      if (valor === undefined) return res.status(400).json({ error: 'Valor e obrigatorio' });

      await ConfiguracaoModel.set(chave, String(valor));
      return res.status(201).json({ chave, valor });
    } catch (error) {
      return fail(res, error, 'Erro ao salvar configuracao');
    }
  },

  async destroy(req: Request, res: Response) {
    try {
      const chave = String(req.params.chave);
      await ConfiguracaoModel.delete(chave);
      return res.status(204).send();
    } catch (error) {
      return fail(res, error, 'Erro ao deletar configuracao');
    }
  },
};
