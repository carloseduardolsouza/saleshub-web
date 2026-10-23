import { Request, Response } from 'express';
import { fail } from '../middleware/validate.js';
import { PedidoModel } from '../models/Pedido.js';

function validarPedido(body: any): string | null {
  const { cliente, produtos, metodoPagamento, total, prazos } = body;
  if (typeof cliente !== 'string' || !cliente.trim()) return 'Cliente e obrigatorio';
  if (!Array.isArray(produtos) || produtos.length === 0) return 'Adicione pelo menos um produto';
  if (!metodoPagamento) return 'Metodo de pagamento e obrigatorio';
  if (typeof total !== 'number' || !Number.isFinite(total) || total < 0) return 'Total invalido';
  for (const p of produtos) {
    if (!p?.nome || typeof p.nome !== 'string') return 'Produto sem nome';
    if (typeof p.preco !== 'number' || !Number.isFinite(p.preco) || p.preco < 0) return 'Preco do produto invalido';
    if (!Number.isInteger(p.quantidade) || p.quantidade <= 0) return 'Quantidade invalida';
  }
  if (metodoPagamento === 'boleto' && (!Array.isArray(prazos) || prazos.length === 0)) {
    return 'Prazos sao obrigatorios para boleto';
  }
  return null;
}

export const PedidoController = {
  async index(req: Request, res: Response) {
    try {
      const pedidos = await PedidoModel.getAll();
      return res.json(pedidos);
    } catch (error) {
      return fail(res, error, 'Erro ao buscar pedidos');
    }
  },

  async show(req: Request, res: Response) {
    try {
      const pedido = await PedidoModel.getById(Number(req.params.id));
      if (!pedido) return res.status(404).json({ error: 'Pedido nao encontrado' });
      return res.json(pedido);
    } catch (error) {
      return fail(res, error, 'Erro ao buscar pedido');
    }
  },

  async store(req: Request, res: Response) {
    try {
      const erro = validarPedido(req.body);
      if (erro) return res.status(400).json({ error: erro });

      const pedido = await PedidoModel.create(req.body);
      return res.status(201).json(pedido);
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      return fail(res, error, 'Erro ao criar pedido');
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

      const pedido = await PedidoModel.updateStatus(id, status);
      return res.json(pedido);
    } catch (error) {
      return fail(res, error, 'Erro ao atualizar status');
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const existing = await PedidoModel.getById(id);
      if (!existing) return res.status(404).json({ error: 'Pedido nao encontrado' });

      const erro = validarPedido(req.body);
      if (erro) return res.status(400).json({ error: erro });

      const pedido = await PedidoModel.update(id, req.body);
      return res.json(pedido);
    } catch (error) {
      return fail(res, error, 'Erro ao atualizar pedido');
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
      return fail(res, error, 'Erro ao deletar pedido');
    }
  },
};
