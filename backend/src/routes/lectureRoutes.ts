import { randomUUID } from "crypto";
import { Router } from "express";
import fs from "fs/promises";
import multer from "multer";
import path from "path";
import { z } from "zod";
import { env } from "../config/env";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth";
import { prisma } from "../prisma/client";
import { generateQuizFromLecture } from "../services/quizGenerationService";

export const lectureRouter = Router();

const createLectureSchema = z.object({
  title: z.string().min(2),
  videoUrl: z.string().url()
});

const uploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(process.cwd(), env.uploadDir));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".mp4";
    cb(null, `${randomUUID()}${ext}`);
  }
});

const uploadMp4 = multer({
  storage: uploadStorage,
  limits: { fileSize: 1024 * 1024 * 500 },
  fileFilter: (_req, file, cb) => {
    const name = file.originalname.toLowerCase();
    if (name.endsWith(".mp4") || name.endsWith(".mov")) {
      cb(null, true);
      return;
    }
    cb(new Error("Upload an MP4 or MOV lecture video."));
  }
});

function parseLectureId(param: string): number | null {
  const id = Number(param);
  return Number.isInteger(id) && id > 0 ? id : null;
}

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

lectureRouter.post(
  "/upload",
  authenticate,
  requireRole("professor"),
  (req: AuthRequest, res, next) => {
    uploadMp4.single("video")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: (err as Error).message });
      }
      return next();
    });
  },
  async (req: AuthRequest, res) => {
    try {
      const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
      if (title.length < 2) {
        if (req.file?.path) {
          await fs.unlink(req.file.path).catch(() => {});
        }
        return res.status(400).json({ message: "Title must be at least 2 characters" });
      }
      if (!req.file) {
        return res.status(400).json({ message: "Missing video file (field name: video)" });
      }

      const videoUrl = `${env.apiPublicUrl}/uploads/${req.file.filename}`;
      const lecture = await prisma.lecture.create({
        data: {
          title,
          videoUrl,
          professorId: req.user!.userId
        }
      });
      return res.status(201).json(lecture);
    } catch (err) {
      return res.status(400).json({ message: (err as Error).message });
    }
  }
);

lectureRouter.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    if (user.role === "professor") {
      const lectures = await prisma.lecture.findMany({
        where: { professorId: user.userId },
        orderBy: { createdAt: "desc" }
      });
      return res.json(lectures);
    }

    const lectures = await prisma.lecture.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        quizzes: { select: { id: true } }
      }
    });
    return res.json(lectures);
  } catch (err) {
    return res.status(500).json({ message: (err as Error).message });
  }
});

lectureRouter.get("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const id = parseLectureId(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: "Invalid lecture id" });
    }

    const lecture = await prisma.lecture.findUnique({
      where: { id },
      include: { quizzes: { select: { id: true } } }
    });
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    if (req.user!.role === "professor" && lecture.professorId !== req.user!.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    let bulletPoints: string[] | null = null;
    if (lecture.bulletPoints) {
      try {
        bulletPoints = JSON.parse(lecture.bulletPoints) as string[];
      } catch {
        bulletPoints = null;
      }
    }

    return res.json({
      ...lecture,
      bulletPoints
    });
  } catch (err) {
    return res.status(500).json({ message: (err as Error).message });
  }
});

lectureRouter.post(
  "/:id/generate-quiz",
  authenticate,
  requireRole("professor"),
  async (req: AuthRequest, res) => {
    try {
      const lectureId = parseLectureId(req.params.id);
      if (lectureId === null) {
        return res.status(400).json({ message: "Invalid lecture id" });
      }

      const existing = await prisma.lecture.findUnique({ where: { id: lectureId } });
      if (!existing) {
        return res.status(404).json({ message: "Lecture not found" });
      }
      if (existing.professorId !== req.user!.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const result = await generateQuizFromLecture(lectureId);
      return res.status(201).json(result);
    } catch (err) {
      return res.status(400).json({ message: (err as Error).message });
    }
  }
);
