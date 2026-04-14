import { randomUUID } from "crypto";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { env } from "../config/env";
import { prisma } from "../prisma/client";
import {
  generateBulletPointsAndQuiz,
  generateBulletPointsOnlyFromTranscript,
  transcribeAudioFile,
} from "./lectureAiService";
import { extractAudioToMp3 } from "./videoAudioService";
import { resolveVideoFileForProcessing } from "./videoPaths";

const WHISPER_MAX_BYTES = 25 * 1024 * 1024;

export async function transcribeVideoUrlToText(
  videoUrl: string,
): Promise<string> {
  let videoCleanup: (() => Promise<void>) | undefined;
  const tmpAudio = path.join(os.tmpdir(), `lecture-audio-${randomUUID()}.mp3`);

  try {
    const { localPath: videoPath, cleanup } =
      await resolveVideoFileForProcessing(videoUrl);
    videoCleanup = cleanup;

    await extractAudioToMp3(videoPath, tmpAudio);

    const stat = await fs.stat(tmpAudio);
    if (env.whisperBackend !== "local" && stat.size > WHISPER_MAX_BYTES) {
      throw new Error(
        "Extracted audio exceeds 25MB (Whisper API limit). Try a shorter video or re-encode with a lower bitrate.",
      );
    }

    const transcript = await transcribeAudioFile(tmpAudio);
    if (!transcript) {
      throw new Error("Transcription returned empty text");
    }

    return transcript;
  } finally {
    await fs.unlink(tmpAudio).catch(() => {});
    if (videoCleanup) {
      await videoCleanup();
    }
  }
}

export async function generateBulletPointsOnlyForLecture(
  lectureId: number,
): Promise<{
  bulletPoints: string[];
}> {
  if (!env.anthropicApiKey.trim()) {
    throw new Error(
      "ANTHROPIC_API_KEY is required for summary bullets (Claude). Transcribe the lecture first.",
    );
  }

  const lecture = await prisma.lecture.findUnique({
    where: { id: lectureId },
  });

  if (!lecture) {
    throw new Error("Lecture not found");
  }

  const transcript = lecture.transcript?.trim();
  if (!transcript) {
    throw new Error(
      "No transcript on this lecture yet. Run Whisper (transcribe) first.",
    );
  }

  const bulletPoints = await generateBulletPointsOnlyFromTranscript(transcript);

  await prisma.lecture.update({
    where: { id: lecture.id },
    data: { bulletPoints: JSON.stringify(bulletPoints) },
  });

  return { bulletPoints };
}

export async function generateQuizFromLecture(lectureId: number) {
  const lecture = await prisma.lecture.findUnique({
    where: { id: lectureId },
  });

  if (!lecture) {
    throw new Error("Lecture not found");
  }

  if (!env.anthropicApiKey.trim()) {
    throw new Error(
      "ANTHROPIC_API_KEY is required for bullet points and quiz (Claude). For transcription only, use POST /lectures/:id/transcribe with WHISPER_BACKEND=local.",
    );
  }

  const transcript = await transcribeVideoUrlToText(lecture.videoUrl);

  const { bulletPoints, questions } =
    await generateBulletPointsAndQuiz(transcript);

  const quiz = await prisma.$transaction(async (tx) => {
    await tx.lecture.update({
      where: { id: lecture.id },
      data: {
        transcript,
        bulletPoints: JSON.stringify(bulletPoints),
      },
    });

    const q = await tx.quiz.create({
      data: {
        lectureId: lecture.id,
        generatedFromAI: true,
      },
    });

    for (const item of questions) {
      await tx.question.create({
        data: {
          quizId: q.id,
          question: item.question,
          options: JSON.stringify(item.options),
          correctAnswer: item.correctAnswer,
        },
      });
    }

    return tx.quiz.findUnique({
      where: { id: q.id },
      include: { questions: true },
    });
  });

  if (!quiz) {
    throw new Error("Failed to load created quiz");
  }

  return {
    quiz,
    transcript,
    bulletPoints,
  };
}
