import { Router } from 'express';
import { ConfiguracaoController } from '../controllers/ConfiguracaoController.js';

const configuracaoRoutes = Router();

configuracaoRoutes.get('/', ConfiguracaoController.index);
configuracaoRoutes.get('/:chave', ConfiguracaoController.show);
configuracaoRoutes.post('/', ConfiguracaoController.store);
configuracaoRoutes.delete('/:chave', ConfiguracaoController.destroy);

export default configuracaoRoutes;
