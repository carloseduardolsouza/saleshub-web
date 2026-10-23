import { Router } from 'express';
import { validateId } from '../middleware/validate.js';
import { ProdutoController } from '../controllers/ProdutoController.js';

const produtoRoutes = Router();
produtoRoutes.param('id', validateId);

produtoRoutes.get('/', ProdutoController.index);
produtoRoutes.get('/:id', ProdutoController.show);
produtoRoutes.post('/', ProdutoController.store);
produtoRoutes.put('/:id', ProdutoController.update);
produtoRoutes.delete('/:id', ProdutoController.destroy);

export default produtoRoutes;
