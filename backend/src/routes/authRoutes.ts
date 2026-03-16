import { Router } from "express";
import { loginHandler, registerHandler, meHandler } from "../controllers/authController";
import { authenticate } from "../middleware/auth";

export const authRouter = Router();

authRouter.post("/register", registerHandler);
authRouter.post("/login", loginHandler);
authRouter.get("/me", authenticate, meHandler);

