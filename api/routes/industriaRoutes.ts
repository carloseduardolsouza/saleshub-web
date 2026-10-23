import { Router } from 'express';
import { validateId } from '../middleware/validate.js';
import { IndustriaController } from '../controllers/IndustriaController.js';

const industriaRoutes = Router();
industriaRoutes.param('id', validateId);

industriaRoutes.get('/', IndustriaController.index);
industriaRoutes.get('/:id', IndustriaController.show);
industriaRoutes.post('/', IndustriaController.store);
industriaRoutes.put('/:id', IndustriaController.update);
industriaRoutes.delete('/:id', IndustriaController.destroy);

export default industriaRoutes;
