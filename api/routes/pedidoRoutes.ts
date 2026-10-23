import { Router } from 'express';
import { validateId } from '../middleware/validate.js';
import { PedidoController } from '../controllers/PedidoController.js';
import { generatePedidoPDF } from '../services/pdfGenerator.js';

const pedidoRoutes = Router();
pedidoRoutes.param('id', validateId);

pedidoRoutes.get('/', PedidoController.index);
pedidoRoutes.get('/:id/pdf', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const mostrarDescontos = req.query.descontos === 'true';
    const pdfBuffer = await generatePedidoPDF(id, mostrarDescontos);
    const filename = `NotaPedido_${id}${mostrarDescontos ? '_com_descontos' : '_sem_descontos'}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (error: any) {
    console.error('Erro ao gerar PDF:', error);
    const notFound = error.message === 'Pedido nao encontrado';
    res.status(notFound ? 404 : 500).json({ error: error.message || 'Erro ao gerar PDF' });
  }
});
pedidoRoutes.get('/:id', PedidoController.show);
pedidoRoutes.post('/', PedidoController.store);
pedidoRoutes.put('/:id', PedidoController.update);
pedidoRoutes.patch('/:id/status', PedidoController.updateStatus);
pedidoRoutes.delete('/:id', PedidoController.destroy);

export default pedidoRoutes;
