import { Router } from "express";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth";
import { prisma } from "../prisma/client";
import { z } from "zod";
import { generateQuizFromLecture } from "../services/quizGenerationService";

export const lectureRouter = Router();

const createLectureSchema = z.object({
  title: z.string().min(2),
  videoUrl: z.string().url()
});

lectureRouter.post(
  "/",
  authenticate,
  requireRole("professor"),
  async (req: AuthRequest, res) => {
    try {
      const data = createLectureSchema.parse(req.body);
      const lecture = await prisma.lecture.create({
        data: {
          title: data.title,
          videoUrl: data.videoUrl,
          professorId: req.user!.userId
        }
      });
      return res.status(201).json(lecture);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid payload", errors: err.errors });
      }
      return res.status(400).json({ message: (err as Error).message });
    }
  }
);

lectureRouter.get("/", authenticate, async (req: AuthRequest, res) => {
  const user = req.user!;
  if (user.role === "professor") {
    const lectures = await prisma.lecture.findMany({
      where: { professorId: user.userId },
      orderBy: { createdAt: "desc" }
    });
    return res.json(lectures);
  }

  // For students you might scope by enrolment; for now, return all lectures.
  const lectures = await prisma.lecture.findMany({
    orderBy: { createdAt: "desc" }
  });
  return res.json(lectures);
});

lectureRouter.post(
  "/:id/generate-quiz",
  authenticate,
  requireRole("professor"),
  async (req: AuthRequest, res) => {
    try {
      const lectureId = req.params.id;
      const quiz = await generateQuizFromLecture(lectureId);
      return res.status(201).json(quiz);
    } catch (err) {
      return res.status(400).json({ message: (err as Error).message });
    }
  }
);

