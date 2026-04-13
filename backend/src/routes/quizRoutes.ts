import { Router } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { prisma } from "../prisma/client";

export const quizRouter = Router();

function parseQuizIdParam(param: string): number | null {
  const n = Number.parseInt(param, 10);
  if (!Number.isFinite(n) || n < 1) return null;
  return n;
}

quizRouter.get(
  "/:id",
  authenticate,
  async (req: AuthRequest, res) => {
    const quizId = parseQuizIdParam(req.params.id);
    if (quizId === null) {
      return res.status(400).json({ message: "Invalid quiz id" });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true }
    });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    return res.json(quiz);
  }
);

quizRouter.post(
  "/:id/submit",
  authenticate,
  async (req: AuthRequest, res) => {
    const quizId = parseQuizIdParam(req.params.id);
    if (quizId === null) {
      return res.status(400).json({ message: "Invalid quiz id" });
    }

    const { score } = req.body as { score: number };

    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const result = await prisma.quizResult.create({
      data: {
        studentId: req.user!.userId,
        quizId,
        score
      }
    });

    return res.status(201).json(result);
  }
);

