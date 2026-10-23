import { Request, Response, NextFunction } from 'express';

export function validateId(_req: Request, res: Response, next: NextFunction, value: string) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Id invalido' });
  return next();
}

// Maps Prisma known errors to HTTP codes; anything else is a 500 with the given message.
export function fail(res: Response, error: unknown, message: string) {
  const code = (error as { code?: string })?.code;
  if (code === 'P2025') return res.status(404).json({ error: 'Registro nao encontrado' });
  if (code === 'P2002') return res.status(409).json({ error: 'Registro duplicado' });
  if (code === 'P2003') return res.status(409).json({ error: 'Registro vinculado a outros dados' });
  console.error(message, error);
  return res.status(500).json({ error: message });
}
