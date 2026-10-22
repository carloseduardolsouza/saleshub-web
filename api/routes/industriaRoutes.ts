import { Router } from 'express';
import { IndustriaController } from '../controllers/IndustriaController.js';

const industriaRoutes = Router();

industriaRoutes.get('/', IndustriaController.index);
industriaRoutes.get('/:id', IndustriaController.show);
industriaRoutes.post('/', IndustriaController.store);
industriaRoutes.put('/:id', IndustriaController.update);
industriaRoutes.delete('/:id', IndustriaController.destroy);

export default industriaRoutes;
