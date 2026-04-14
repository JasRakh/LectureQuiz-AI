import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AuthPayload {
  userId: number;
  role: "student" | "professor";
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const raw = jwt.verify(token, env.jwtSecret) as {
      userId?: unknown;
      role?: string;
    };
    const userId =
      typeof raw.userId === "number"
        ? raw.userId
        : typeof raw.userId === "string"
          ? Number.parseInt(raw.userId, 10)
          : NaN;
    if (!Number.isFinite(userId)) {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (raw.role !== "student" && raw.role !== "professor") {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = { userId, role: raw.role };
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export function requireRole(role: AuthPayload["role"]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return next();
  };
}

