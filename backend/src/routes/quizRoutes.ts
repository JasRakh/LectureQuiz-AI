import { Router } from "express";
import { z } from "zod";
import { authenticate, AuthRequest } from "../middleware/auth";
import { prisma } from "../prisma/client";

export const quizRouter = Router();

function parseQuizId(param: string): number | null {
  const id = Number(param);
  return Number.isInteger(id) && id > 0 ? id : null;
}

const submitSchema = z.object({
  answers: z.record(z.string(), z.string())
});

quizRouter.get(
  "/:id",
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      const id = parseQuizId(req.params.id);
      if (id === null) {
        return res.status(400).json({ message: "Invalid quiz id" });
      }

      const quiz = await prisma.quiz.findUnique({
        where: { id },
        include: { questions: true }
      });
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      if (req.user!.role === "student") {
        const sanitized = quiz.questions.map((q) => ({
          id: q.id,
          question: q.question,
          options: q.options
        }));
        return res.json({ ...quiz, questions: sanitized });
      }

      return res.json(quiz);
    } catch (err) {
      return res.status(500).json({ message: (err as Error).message });
    }
  }
);

quizRouter.post(
  "/:id/submit",
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      const quizId = parseQuizId(req.params.id);
      if (quizId === null) {
        return res.status(400).json({ message: "Invalid quiz id" });
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
