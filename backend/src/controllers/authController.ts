import { Request, Response } from "express";
import { z } from "zod";
import { registerUser, loginUser } from "../services/authService";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["student", "professor"])
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export async function registerHandler(req: Request, res: Response) {
  try {
    const data = registerSchema.parse(req.body);
    const result = await registerUser(data);
    return res.status(201).json({
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role
      },
      token: result.token
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid payload", errors: err.errors });
    }
    return res.status(400).json({ message: (err as Error).message });
  }
}

export async function loginHandler(req: Request, res: Response) {
  try {
    const data = loginSchema.parse(req.body);
    const result = await loginUser(data);
    return res.status(200).json({
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role
      },
      token: result.token
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid payload", errors: err.errors });
    }
    return res.status(401).json({ message: (err as Error).message });
  }
}

