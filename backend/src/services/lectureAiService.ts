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
  if (!env.anthropicApiKey.trim()) {
    return getDemoBulletPoints(transcript);
  }

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

const DEMO_BULLET_SETS: string[][] = [
  [
    "Введение в основные концепции и определения предмета",
    "Исторический контекст и эволюция подходов в данной области",
    "Ключевые теоремы и принципы, лежащие в основе дисциплины",
    "Практическое применение теории в реальных задачах",
    "Сравнение различных методологий и их преимуществ",
    "Типичные ошибки и заблуждения при изучении темы",
    "Связь с другими дисциплинами и междисциплинарные подходы",
    "Современные тенденции и актуальные исследования",
  ],
  [
    "Основные определения: переменные, функции и операторы",
    "Структуры данных: массивы, списки и деревья",
    "Алгоритмическая сложность: O(n), O(log n), O(n²)",
    "Рекурсия и итерация: когда что использовать",
    "Принципы проектирования: модульность и инкапсуляция",
    "Тестирование и отладка: unit-тесты и интеграционные тесты",
    "Паттерны проектирования: Observer, Singleton, Factory",
    "Оптимизация производительности и профилирование кода",
    "Работа с внешними API и обработка ошибок",
  ],
  [
    "Линейные уравнения и системы: методы решения",
    "Матрицы: операции, определитель и обратная матрица",
    "Векторные пространства и линейная независимость",
    "Собственные значения и собственные векторы",
    "Ортогональность и проекции в евклидовом пространстве",
    "Линейные преобразования и их матричное представление",
    "Применение линейной алгебры в машинном обучении",
    "Разложение матриц: SVD, LU, QR-разложения",
  ],
];

const DEMO_QUIZ_SETS: {
  question: string;
  options: string[];
  correctAnswer: string;
}[][] = [
  [
    {
      question: "Какой алгоритм сортировки имеет среднюю сложность O(n log n)?",
      options: ["Bubble Sort", "Quick Sort", "Selection Sort", "Insertion Sort"],
      correctAnswer: "Quick Sort",
    },
    {
      question: "Что такое инкапсуляция в ООП?",
      options: [
        "Наследование свойств от родительского класса",
        "Сокрытие внутренней реализации и предоставление интерфейса",
        "Возможность объекта принимать разные формы",
        "Создание нескольких экземпляров класса",
      ],
      correctAnswer:
        "Сокрытие внутренней реализации и предоставление интерфейса",
    },
    {
      question: "Какая структура данных работает по принципу FIFO?",
      options: ["Стек", "Очередь", "Дерево", "Граф"],
      correctAnswer: "Очередь",
    },
    {
      question: "Что возвращает рекурсивная функция без базового случая?",
      options: [
        "Пустой массив",
        "Null",
        "Ошибку переполнения стека (Stack Overflow)",
        "Бесконечный цикл",
      ],
      correctAnswer: "Ошибку переполнения стека (Stack Overflow)",
    },
    {
      question: "Какой паттерн гарантирует создание только одного экземпляра класса?",
      options: ["Observer", "Factory", "Singleton", "Strategy"],
      correctAnswer: "Singleton",
    },
  ],
  [
    {
      question: "Чему равен определитель единичной матрицы?",
      options: ["0", "1", "-1", "Не определён"],
      correctAnswer: "1",
    },
    {
      question: "Какое свойство НЕ является свойством векторного пространства?",
      options: [
        "Замкнутость относительно сложения",
        "Существование нулевого вектора",
        "Коммутативность умножения векторов",
        "Замкнутость относительно умножения на скаляр",
      ],
      correctAnswer: "Коммутативность умножения векторов",
    },
    {
      question: "Что показывают собственные значения матрицы?",
      options: [
        "Размерность матрицы",
        "Коэффициенты растяжения при линейном преобразовании",
        "Количество строк в матрице",
        "Сумму элементов главной диагонали",
      ],
      correctAnswer:
        "Коэффициенты растяжения при линейном преобразовании",
    },
    {
      question: "Какой метод используется для решения системы линейных уравнений?",
      options: [
        "Метод Ньютона",
        "Метод Гаусса",
        "Метод Монте-Карло",
        "Метод градиентного спуска",
      ],
      correctAnswer: "Метод Гаусса",
    },
    {
      question: "Два вектора ортогональны, если их скалярное произведение равно…",
      options: ["1", "-1", "0", "Бесконечности"],
      correctAnswer: "0",
    },
  ],
  [
    {
      question: "Какой протокол используется для безопасной передачи данных в вебе?",
      options: ["HTTP", "FTP", "HTTPS", "SMTP"],
      correctAnswer: "HTTPS",
    },
    {
      question: "Что такое REST API?",
      options: [
        "Библиотека для работы с базами данных",
        "Архитектурный стиль для создания веб-сервисов",
        "Язык программирования",
        "Система управления версиями",
      ],
      correctAnswer: "Архитектурный стиль для создания веб-сервисов",
    },
    {
      question: "Какой HTTP-метод используется для создания нового ресурса?",
      options: ["GET", "POST", "DELETE", "PATCH"],
      correctAnswer: "POST",
    },
    {
      question: "Что такое JWT?",
      options: [
        "JavaScript Web Template",
        "JSON Web Token",
        "Java Web Toolkit",
        "JavaScript Worker Thread",
      ],
      correctAnswer: "JSON Web Token",
    },
    {
      question: "Какой статус-код означает 'Not Found'?",
      options: ["200", "301", "404", "500"],
      correctAnswer: "404",
    },
  ],
];

function getDemoBulletPoints(_transcript: string): string[] {
  const idx = Math.floor(Math.random() * DEMO_BULLET_SETS.length);
  return DEMO_BULLET_SETS[idx];
}

export function getDemoBulletPointsAndQuiz(_transcript: string): {
  bulletPoints: string[];
  questions: { question: string; options: string[]; correctAnswer: string }[];
} {
  const bIdx = Math.floor(Math.random() * DEMO_BULLET_SETS.length);
  const qIdx = Math.floor(Math.random() * DEMO_QUIZ_SETS.length);
  return {
    bulletPoints: DEMO_BULLET_SETS[bIdx],
    questions: DEMO_QUIZ_SETS[qIdx],
  };
}
