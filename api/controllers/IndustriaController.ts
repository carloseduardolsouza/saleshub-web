import { Request, Response } from 'express';
import { IndustriaModel } from '../models/Industria.js';

export const IndustriaController = {
  async index(req: Request, res: Response) {
    try {
      const industrias = await IndustriaModel.getAll();
      return res.json(industrias);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar industrias' });
    }
  },

  async show(req: Request, res: Response) {
    try {
      const industria = await IndustriaModel.getById(Number(req.params.id));
      if (!industria) return res.status(404).json({ error: 'Industria nao encontrada' });
      return res.json(industria);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar industria' });
    }
  },

  async store(req: Request, res: Response) {
    try {
      const { cnpj, nome } = req.body;
      if (!cnpj?.trim()) return res.status(400).json({ error: 'CNPJ e obrigatorio' });
      if (!nome?.trim()) return res.status(400).json({ error: 'Nome e obrigatorio' });

      const cnpjNumbers = cnpj.replace(/\D/g, '');
      if (cnpjNumbers.length !== 14) {
        return res.status(400).json({ error: 'CNPJ deve ter 14 digitos' });
      }

      const existing = await IndustriaModel.getByCnpj(cnpj);
      if (existing) {
        return res.status(400).json({ error: 'CNPJ ja cadastrado' });
      }

      if (req.body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
        return res.status(400).json({ error: 'Email invalido' });
      }

      const industria = await IndustriaModel.create(req.body);
      return res.status(201).json(industria);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar industria' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const existing = await IndustriaModel.getById(id);
      if (!existing) return res.status(404).json({ error: 'Industria nao encontrada' });

      const { cnpj, nome } = req.body;
      if (!cnpj?.trim()) return res.status(400).json({ error: 'CNPJ e obrigatorio' });
      if (!nome?.trim()) return res.status(400).json({ error: 'Nome e obrigatorio' });

      const cnpjNumbers = cnpj.replace(/\D/g, '');
      if (cnpjNumbers.length !== 14) {
        return res.status(400).json({ error: 'CNPJ deve ter 14 digitos' });
      }

      const cnpjExists = await IndustriaModel.getByCnpj(cnpj, id);
      if (cnpjExists) {
        return res.status(400).json({ error: 'CNPJ ja cadastrado para outra industria' });
      }

      if (req.body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
        return res.status(400).json({ error: 'Email invalido' });
      }

      const industria = await IndustriaModel.update(id, req.body);
      return res.json(industria);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar industria' });
    }
  },

  async destroy(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const existing = await IndustriaModel.getById(id);
      if (!existing) return res.status(404).json({ error: 'Industria nao encontrada' });

      await IndustriaModel.delete(id);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao deletar industria' });
    }
  },
};
