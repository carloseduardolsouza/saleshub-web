import { Request, Response } from 'express';
import { PedidoModel } from '../models/Pedido.js';

export const PedidoController = {
  async index(req: Request, res: Response) {
    try {
      const pedidos = await PedidoModel.getAll();
      return res.json(pedidos);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar pedidos' });
    }
  },

  async show(req: Request, res: Response) {
    try {
      const pedido = await PedidoModel.getById(Number(req.params.id));
      if (!pedido) return res.status(404).json({ error: 'Pedido nao encontrado' });
      return res.json(pedido);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar pedido' });
    }
  },

  async store(req: Request, res: Response) {
    try {
      const { cliente, produtos, metodoPagamento } = req.body;
      if (!cliente?.trim()) return res.status(400).json({ error: 'Cliente e obrigatorio' });
      if (!produtos || produtos.length === 0) {
        return res.status(400).json({ error: 'Adicione pelo menos um produto' });
      }
      if (!metodoPagamento) {
        return res.status(400).json({ error: 'Metodo de pagamento e obrigatorio' });
      }
      if (metodoPagamento === 'boleto' && (!req.body.prazos || req.body.prazos.length === 0)) {
        return res.status(400).json({ error: 'Prazos sao obrigatorios para boleto' });
      }

      const pedido = await PedidoModel.create(req.body);
      return res.status(201).json(pedido);
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      return res.status(500).json({ error: 'Erro ao criar pedido' });
    }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const existing = await PedidoModel.getById(id);
      if (!existing) return res.status(404).json({ error: 'Pedido nao encontrado' });

      const { status } = req.body;
      const validStatuses = ['pendente', 'processando', 'concluido', 'cancelado'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Status invalido' });
      }

      const pedido = await PedidoModel.update(id, { ...existing, status } as any);
      return res.json(pedido);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar status' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const existing = await PedidoModel.getById(id);
      if (!existing) return res.status(404).json({ error: 'Pedido nao encontrado' });

      const pedido = await PedidoModel.update(id, req.body);
      return res.json(pedido);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar pedido' });
    }
  },

  async destroy(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const existing = await PedidoModel.getById(id);
      if (!existing) return res.status(404).json({ error: 'Pedido nao encontrado' });

      await PedidoModel.delete(id);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao deletar pedido' });
    }
  },
};
