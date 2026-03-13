import { Router } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { prisma } from "../prisma/client";

export const quizRouter = Router();

quizRouter.get(
  "/:id",
  authenticate,
  async (req: AuthRequest, res) => {
    const quiz = await prisma.quiz.findUnique({
      where: { id: req.params.id },
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
    const quizId = req.params.id;
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

