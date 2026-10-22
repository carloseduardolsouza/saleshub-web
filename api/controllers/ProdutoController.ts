import { Request, Response } from 'express';
import { ProdutoModel } from '../models/Produto.js';

export const ProdutoController = {
  async index(req: Request, res: Response) {
    try {
      const produtos = await ProdutoModel.getAll();
      return res.json(produtos);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
  },

  async show(req: Request, res: Response) {
    try {
      const produto = await ProdutoModel.getById(Number(req.params.id));
      if (!produto) return res.status(404).json({ error: 'Produto nao encontrado' });
      return res.json(produto);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar produto' });
    }
  },

  async store(req: Request, res: Response) {
    try {
      const { nome, preco, industria } = req.body;
      if (!nome?.trim()) return res.status(400).json({ error: 'Nome e obrigatorio' });
      if (!preco || preco <= 0) return res.status(400).json({ error: 'Preco invalido' });
      if (!industria?.trim()) return res.status(400).json({ error: 'Industria e obrigatoria' });

      const produto = await ProdutoModel.create(req.body);
      return res.status(201).json(produto);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar produto' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const existing = await ProdutoModel.getById(id);
      if (!existing) return res.status(404).json({ error: 'Produto nao encontrado' });

      const { nome, preco, industria } = req.body;
      if (!nome?.trim()) return res.status(400).json({ error: 'Nome e obrigatorio' });
      if (!preco || preco <= 0) return res.status(400).json({ error: 'Preco invalido' });
      if (!industria?.trim()) return res.status(400).json({ error: 'Industria e obrigatoria' });

      const produto = await ProdutoModel.update(id, req.body);
      return res.json(produto);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
  },

  async destroy(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const existing = await ProdutoModel.getById(id);
      if (!existing) return res.status(404).json({ error: 'Produto nao encontrado' });

      await ProdutoModel.delete(id);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao deletar produto' });
    }
  },
};
