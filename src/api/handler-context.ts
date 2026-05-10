import type { Context } from 'elysia';

export type HandlerContext = Omit<Context, 'status'>;
