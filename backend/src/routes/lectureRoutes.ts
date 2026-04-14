import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";
import { env } from "../config/env";
import { authenticate, AuthRequest } from "../middleware/auth";
import { prisma } from "../prisma/client";
import {
  generateBulletPointsOnlyForLecture,
  generateQuizFromLecture,
  transcribeVideoUrlToText,
} from "../services/quizGenerationService";

const router = Router();

const uploadDir = path.resolve(env.uploadDir);
const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".mp4";
    cb(null, `${randomUUID()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
});

function parseLectureIdParam(param: string): number | null {
  const n = Number.parseInt(param, 10);
  if (!Number.isFinite(n) || n < 1) return null;
  return n;
}

function parseBulletPoints(raw: string | null | undefined): string[] | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) && parsed.every((x) => typeof x === "string")
      ? (parsed as string[])
      : null;
  } catch {
    return null;
  }
}

router.post(
  "/upload",
  authenticate,
  upload.single("video"),
  async (req: AuthRequest, res) => {
    try {
      if (req.user?.role !== "professor") {
        return res
          .status(403)
          .json({ message: "Only professors can upload lectures" });
      }

      if (!req.file) {
        return res
          .status(400)
          .json({ message: "Missing video file (field name: video)" });
      }

      const title =
        (req.body?.title as string | undefined)?.trim() || "Untitled lecture";
      const relative = `/uploads/${req.file.filename}`;
      const videoUrl = `${env.apiPublicUrl.replace(/\/$/, "")}${relative}`;

      const lecture = await prisma.lecture.create({
        data: {
          title,
          videoUrl,
          professorId: req.user.userId,
        },
      });

      return res.status(201).json({ lecture });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Failed to upload lecture" });
    }
  },
);

router.get("/ai-capabilities", (_req, res) => {
  const whisperBackend = env.whisperBackend;
  const hasOpenAI = Boolean(env.openaiApiKey.trim());
  const hasAnthropic = Boolean(env.anthropicApiKey.trim());

  const whisperAvailable =
    whisperBackend === "local" || (whisperBackend === "openai" && hasOpenAI);

  return res.json({
    whisperBackend,
    whisperAvailable,
    openaiConfigured: hasOpenAI,
    anthropicConfigured: hasAnthropic,
    claudeModel: env.claudeModel,
    canTranscribe: whisperAvailable,
    canGenerateBullets: hasAnthropic,
    canGenerateQuiz: hasAnthropic,
  });
});

router.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role === "professor") {
      const lectures = await prisma.lecture.findMany({
        where: { professorId: req.user.userId },
        orderBy: { createdAt: "desc" },
      });
      return res.json({ lectures });
    }

    const lectures = await prisma.lecture.findMany({
      orderBy: { createdAt: "desc" },
      include: { quizzes: { select: { id: true } } },
    });
    return res.json({ lectures });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Failed to list lectures" });
  }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    const lectureId = parseLectureIdParam(req.params.id);
    if (lectureId === null) {
      return res.status(400).json({ message: "Invalid lecture id" });
    }

    const lecture = await prisma.lecture.findUnique({
      where: { id: lectureId },
    });

    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    const bulletPoints = parseBulletPoints(lecture.bulletPoints);

    return res.json({
      lecture: {
        ...lecture,
        bulletPoints,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Failed to load lecture" });
  }
});

router.post("/:id/transcribe", authenticate, async (req: AuthRequest, res) => {
  try {
    const whisperBackend = env.whisperBackend;
    const hasOpenAI = Boolean(env.openaiApiKey.trim());
    if (whisperBackend === "openai" && !hasOpenAI) {
      return res.status(503).json({
        message:
          "Whisper transcription is not configured. Set OPENAI_API_KEY (for whisper-1) or switch WHISPER_BACKEND=local.",
      });
    }

    const lectureId = parseLectureIdParam(req.params.id);
    if (lectureId === null) {
      return res.status(400).json({ message: "Invalid lecture id" });
    }

    const lecture = await prisma.lecture.findUnique({
      where: { id: lectureId },
    });

    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    if (lecture.transcript?.trim()) {
      return res.json({ lecture, transcript: lecture.transcript });
    }

    const transcript = await transcribeVideoUrlToText(lecture.videoUrl);

    const updated = await prisma.lecture.update({
      where: { id: lecture.id },
      data: { transcript },
    });

    return res.json({ lecture: updated, transcript });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Transcription failed";
    return res.status(500).json({ message: msg });
  }
});

router.post(
  "/:id/generate-bullets",
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      if (req.user?.role !== "professor") {
        return res
          .status(403)
          .json({ message: "Only professors can generate bullets" });
      }

      if (!env.anthropicApiKey.trim()) {
        return res.status(503).json({
          message:
            "ANTHROPIC_API_KEY is required for summary bullets (Claude). Transcribe the lecture first.",
        });
      }

      const lectureId = parseLectureIdParam(req.params.id);
      if (lectureId === null) {
        return res.status(400).json({ message: "Invalid lecture id" });
      }

      const lecture = await prisma.lecture.findUnique({
        where: { id: lectureId },
      });

      if (!lecture) {
        return res.status(404).json({ message: "Lecture not found" });
      }

      if (lecture.professorId !== req.user.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { bulletPoints } = await generateBulletPointsOnlyForLecture(
        lecture.id,
      );

      return res.json({ bulletPoints });
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Failed to generate bullets";
      return res.status(500).json({ message: msg });
    }
  },
);

router.post(
  "/:id/generate-quiz",
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      if (req.user?.role !== "professor") {
        return res
          .status(403)
          .json({ message: "Only professors can generate quizzes" });
      }

      const lectureId = parseLectureIdParam(req.params.id);
      if (lectureId === null) {
        return res.status(400).json({ message: "Invalid lecture id" });
      }

      const lecture = await prisma.lecture.findUnique({
        where: { id: lectureId },
      });

      if (!lecture) {
        return res.status(404).json({ message: "Lecture not found" });
      }

      if (lecture.professorId !== req.user.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const result = await generateQuizFromLecture(lecture.id);
      return res.json(result);
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Quiz generation failed";
      return res.status(500).json({ message: msg });
    }
  },
);

export const lectureRouter = router;
