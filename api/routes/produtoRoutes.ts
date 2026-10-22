import { Router } from 'express';
import { ProdutoController } from '../controllers/ProdutoController.js';

const produtoRoutes = Router();

produtoRoutes.get('/', ProdutoController.index);
produtoRoutes.get('/:id', ProdutoController.show);
produtoRoutes.post('/', ProdutoController.store);
produtoRoutes.put('/:id', ProdutoController.update);
produtoRoutes.delete('/:id', ProdutoController.destroy);

export default produtoRoutes;
