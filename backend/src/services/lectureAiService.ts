import { createReadStream } from 'fs';
import OpenAI from 'openai';
import { z } from 'zod';
import { env } from '../config/env';

const generatedSchema = z.object({
  bulletPoints: z.array(z.string()).min(1, "Model must produce at least 1 bullet point"),
  questions: z
    .array(
      z.object({
        question: z.string(),
        options: z.array(z.string()).min(2).max(6),
        correctAnswer: z.string(),
      })
    )
    .min(1, "Model must produce at least 1 question"),
});

function getClient(): OpenAI {
  if (!env.openaiApiKey) {
    throw new Error('OPENAI_API_KEY is not set');
  }
  return new OpenAI({ apiKey: env.openaiApiKey });
}

export async function transcribeAudioFile(audioPath: string): Promise<string> {
  const client = getClient();
  const result = await client.audio.transcriptions.create({
    file: createReadStream(audioPath),
    model: 'whisper-1',
  });
  return result.text.trim();
}

export async function generateBulletPointsAndQuiz(transcript: string): Promise<{
  bulletPoints: string[];
  questions: { question: string; options: string[]; correctAnswer: string }[];
}> {
  const client = getClient();
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are an assistant for university lectures. Given a transcript, output STRICT JSON with:
- "bulletPoints": array of 6–12 concise bullet summaries of the main ideas (no duplicates).
- "questions": array of 5–10 multiple-choice questions testing understanding. Each item has:
  - "question": string
  - "options": exactly 4 strings (one correct, three plausible distractors)
  - "correctAnswer": string that matches one of "options" EXACTLY (same spelling and casing)
Do not include markdown or extra keys.`,
      },
      {
        role: 'user',
        content: `Lecture transcript:\n\n${transcript.slice(0, 100_000)}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new Error('Empty model response');
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Model returned invalid JSON');
  }
  const out = generatedSchema.parse(parsed);

  for (const q of out.questions) {
    if (!q.options.includes(q.correctAnswer)) {
      throw new Error('Model produced a correctAnswer not in options');
    }
  }

  return out;
}
