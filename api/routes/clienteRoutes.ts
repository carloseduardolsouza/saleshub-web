import { Router } from 'express';
import { validateId } from '../middleware/validate.js';
import { ClienteController } from '../controllers/ClienteController.js';

const clienteRoutes = Router();
clienteRoutes.param('id', validateId);

clienteRoutes.get('/', ClienteController.index);
clienteRoutes.get('/:id', ClienteController.show);
clienteRoutes.post('/', ClienteController.store);
clienteRoutes.put('/:id', ClienteController.update);
clienteRoutes.delete('/:id', ClienteController.destroy);

export default clienteRoutes;
