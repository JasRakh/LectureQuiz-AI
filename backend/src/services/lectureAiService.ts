import { createReadStream } from "fs";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { z } from "zod";
import { env } from "../config/env";
import { transcribeWithLocalWhisper } from "./localWhisperService";

const generatedSchema = z.object({
  bulletPoints: z
    .array(z.string())
    .min(1, "Model must produce at least 1 bullet point"),
  questions: z
    .array(
      z.object({
        question: z.string(),
        options: z.array(z.string()).min(2).max(6),
        correctAnswer: z.string(),
      }),
    )
    .min(1, "Model must produce at least 1 question"),
});

const bulletsOnlySchema = z.object({
  bulletPoints: z
    .array(z.string())
    .min(1, "Model must produce at least 1 bullet point"),
});

function getOpenAI(): OpenAI {
  if (!env.openaiApiKey.trim()) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  return new OpenAI({ apiKey: env.openaiApiKey });
}

function getAnthropic(): Anthropic {
  if (!env.anthropicApiKey.trim()) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  return new Anthropic({ apiKey: env.anthropicApiKey });
}

function textFromAnthropicMessage(msg: {
  content: Array<{ type: string; text?: string }>;
}): string {
  return msg.content
    .filter((b) => b.type === "text" && typeof b.text === "string")
    .map((b) => b.text as string)
    .join("\n")
    .trim();
}

function parseJsonFromModelOutput(raw: string): unknown {
  let t = raw.trim();
  const fence = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/im.exec(t);
  if (fence) {
    t = fence[1].trim();
  }
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start !== -1 && end > start) {
    t = t.slice(start, end + 1);
  }
  return JSON.parse(t);
}

export async function transcribeAudioFile(audioPath: string): Promise<string> {
  if (env.whisperBackend === "local") {
    return transcribeWithLocalWhisper(audioPath);
  }

  const client = getOpenAI();
  const result = await client.audio.transcriptions.create({
    file: createReadStream(audioPath),
    model: "whisper-1",
    ...(env.whisperLanguage ? { language: env.whisperLanguage } : {}),
  });
  return result.text.trim();
}

export async function generateBulletPointsAndQuiz(transcript: string): Promise<{
  bulletPoints: string[];
  questions: { question: string; options: string[]; correctAnswer: string }[];
}> {
  const anthropic = getAnthropic();

  const system = `You are an assistant for university lectures. Given a transcript, output STRICT JSON with:
- "bulletPoints": array of 6–12 concise bullet summaries of the main ideas (no duplicates).
- "questions": array of 5–10 multiple-choice questions testing understanding. Each item has:
  - "question": string
  - "options": exactly 4 strings (one correct, three plausible distractors)
  - "correctAnswer": string that matches one of "options" EXACTLY (same spelling and casing)
Output only valid JSON. No markdown fences, no commentary, no extra keys.`;

  const msg = await anthropic.messages.create({
    model: env.claudeModel,
    max_tokens: 16_384,
    system,
    messages: [
      {
        role: "user",
        content: `Lecture transcript:\n\n${transcript.slice(0, 100_000)}`,
      },
    ],
  });

  const raw = textFromAnthropicMessage(msg);
  if (!raw) {
    throw new Error("Empty Claude response");
  }

  let parsed: unknown;
  try {
    parsed = parseJsonFromModelOutput(raw);
  } catch {
    throw new Error("Claude returned invalid JSON");
  }

  const out = generatedSchema.parse(parsed);

  for (const q of out.questions) {
    if (!q.options.includes(q.correctAnswer)) {
      throw new Error("Model produced a correctAnswer not in options");
    }
  }

  return out;
}

export async function generateBulletPointsOnlyFromTranscript(
  transcript: string,
): Promise<string[]> {
  const anthropic = getAnthropic();

  const system = `You are an assistant for university lectures. Given a transcript, output STRICT JSON with only one key:
- "bulletPoints": array of 6–12 concise bullet summaries of the main ideas (no duplicates).
Output only valid JSON. No markdown fences, no commentary, no extra keys.`;

  const msg = await anthropic.messages.create({
    model: env.claudeModel,
    max_tokens: 4096,
    system,
    messages: [
      {
        role: "user",
        content: `Lecture transcript:\n\n${transcript.slice(0, 100_000)}`,
      },
    ],
  });

  const raw = textFromAnthropicMessage(msg);
  if (!raw) {
    throw new Error("Empty Claude response");
  }

  let parsed: unknown;
  try {
    parsed = parseJsonFromModelOutput(raw);
  } catch {
    throw new Error("Claude returned invalid JSON");
  }

  const out = bulletsOnlySchema.parse(parsed);
  return out.bulletPoints;
}
