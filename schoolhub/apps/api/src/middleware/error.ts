import type { Request, Response, NextFunction } from 'express';

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  let message = 'Internal server error';
  if (err instanceof Error) {
    message = err.message;
  } else if (err !== null && typeof err === 'object' && 'message' in err) {
    // Supabase PostgrestError is a plain object with a message field
    message = String((err as { message: unknown }).message);
  }
  res.status(500).json({ error: message });
}
