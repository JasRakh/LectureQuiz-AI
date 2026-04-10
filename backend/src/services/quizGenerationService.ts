import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { prisma } from '../prisma/client';
import { generateBulletPointsAndQuiz, transcribeAudioFile } from './lectureAiService';
import { extractAudioToMp3 } from './videoAudioService';
import { resolveVideoFileForProcessing } from './videoPaths';

const WHISPER_MAX_BYTES = 25 * 1024 * 1024;

export async function generateQuizFromLecture(lectureId: number) {
  const lecture = await prisma.lecture.findUnique({
    where: { id: lectureId },
  });

  if (!lecture) {
    throw new Error('Lecture not found');
  }

  let videoCleanup: (() => Promise<void>) | undefined;
  const tmpAudio = path.join(os.tmpdir(), `lecture-audio-${randomUUID()}.mp3`);

  try {
    const { localPath: videoPath, cleanup } = await resolveVideoFileForProcessing(lecture.videoUrl);
    videoCleanup = cleanup;

    await extractAudioToMp3(videoPath, tmpAudio);

    const stat = await fs.stat(tmpAudio);
    if (stat.size > WHISPER_MAX_BYTES) {
      throw new Error(
        'Extracted audio exceeds 25MB (Whisper API limit). Try a shorter video or re-encode with a lower bitrate.'
      );
    }

    const transcript = await transcribeAudioFile(tmpAudio);
    if (!transcript) {
      throw new Error('Transcription returned empty text');
    }

    const { bulletPoints, questions } = await generateBulletPointsAndQuiz(transcript);

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
      throw new Error('Failed to load created quiz');
    }

    return {
      quiz,
      transcript,
      bulletPoints,
    };
  } finally {
    await fs.unlink(tmpAudio).catch(() => {});
    if (videoCleanup) {
      await videoCleanup();
    }
  }
}
