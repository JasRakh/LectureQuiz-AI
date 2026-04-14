import { Router } from "express";
import { z } from "zod";
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

      const body = submitSchema.safeParse(req.body);
      if (!body.success) {
        return res
          .status(400)
          .json({ message: 'Body must contain { answers: { "<questionId>": "chosen option" } }' });
      }

      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: { questions: true }
      });
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      const { answers } = body.data;
      let correct = 0;
      const feedback: {
        questionId: number;
        correct: boolean;
        correctAnswer: string;
        yourAnswer: string | null;
      }[] = [];

      for (const q of quiz.questions) {
        const chosen = answers[String(q.id)] ?? null;
        const isCorrect = chosen === q.correctAnswer;
        if (isCorrect) correct++;
        feedback.push({
          questionId: q.id,
          correct: isCorrect,
          correctAnswer: q.correctAnswer,
          yourAnswer: chosen
        });
      }

      const total = quiz.questions.length;
      const score = total > 0 ? Math.round((correct / total) * 100) : 0;

      const result = await prisma.quizResult.create({
        data: {
          studentId: req.user!.userId,
          quizId,
          score
        }
      });

      return res.status(201).json({ result, score, correct, total, feedback });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid payload", errors: err.errors });
      }
      return res.status(500).json({ message: (err as Error).message });
    }
  }
);
