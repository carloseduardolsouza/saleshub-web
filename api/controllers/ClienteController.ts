import { Request, Response } from 'express';
import { fail } from '../middleware/validate.js';
import { ClienteModel } from '../models/Cliente.js';

export const ClienteController = {
  async index(req: Request, res: Response) {
    try {
      const clientes = await ClienteModel.getAll();
      return res.json(clientes);
    } catch (error) {
      return fail(res, error, 'Erro ao buscar clientes');
    }
  },

  async show(req: Request, res: Response) {
    try {
      const cliente = await ClienteModel.getById(Number(req.params.id));
      if (!cliente) return res.status(404).json({ error: 'Cliente nao encontrado' });
      return res.json(cliente);
    } catch (error) {
      return fail(res, error, 'Erro ao buscar cliente');
    }
  },

  async store(req: Request, res: Response) {
    try {
      const { nomeFantasia } = req.body;
      if (!nomeFantasia?.trim()) {
        return res.status(400).json({ error: 'Nome Fantasia e obrigatorio' });
      }
      const cliente = await ClienteModel.create(req.body);
      return res.status(201).json(cliente);
    } catch (error) {
      return fail(res, error, 'Erro ao criar cliente');
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const existing = await ClienteModel.getById(id);
      if (!existing) return res.status(404).json({ error: 'Cliente nao encontrado' });

      const { nomeFantasia } = req.body;
      if (!nomeFantasia?.trim()) {
        return res.status(400).json({ error: 'Nome Fantasia e obrigatorio' });
      }

      const cliente = await ClienteModel.update(id, req.body);
      return res.json(cliente);
    } catch (error) {
      return fail(res, error, 'Erro ao atualizar cliente');
    }
  },

  async destroy(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const existing = await ClienteModel.getById(id);
      if (!existing) return res.status(404).json({ error: 'Cliente nao encontrado' });

      await ClienteModel.delete(id);
      return res.status(204).send();
    } catch (error) {
      return fail(res, error, 'Erro ao deletar cliente');
    }
  },
};
