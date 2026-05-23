import type { Request } from "express";

export const parseBody = (req: Request) => req.body as Record<string, unknown>;
