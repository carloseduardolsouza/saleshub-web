import express from 'express';
import cors from 'cors';
import prisma from './prisma.js';
import { authMiddleware } from './middleware/auth.js';
import authRoutes from './routes/authRoutes.js';
import clienteRoutes from './routes/clienteRoutes.js';
import produtoRoutes from './routes/produtoRoutes.js';
import industriaRoutes from './routes/industriaRoutes.js';
import pedidoRoutes from './routes/pedidoRoutes.js';
import configuracaoRoutes from './routes/configuracaoRoutes.js';

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);

app.use('/api/clientes', authMiddleware, clienteRoutes);
app.use('/api/produtos', authMiddleware, produtoRoutes);
app.use('/api/industrias', authMiddleware, industriaRoutes);
app.use('/api/pedidos', authMiddleware, pedidoRoutes);
app.use('/api/configuracoes', authMiddleware, configuracaoRoutes);

app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch {
    res.json({ status: 'ok', database: 'disconnected', timestamp: new Date().toISOString() });
  }
});

app.listen(PORT, () => {
  console.log(`SalesHub API running on http://localhost:${PORT}`);
});

export default app;
