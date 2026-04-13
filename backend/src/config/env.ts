import dotenv from 'dotenv';

dotenv.config();

const whisperLang = (process.env.WHISPER_LANGUAGE || '').trim().toLowerCase();
const whisperBackendRaw = (process.env.WHISPER_BACKEND || 'openai').trim().toLowerCase();
const whisperBackend = whisperBackendRaw === 'local' ? 'local' : 'openai';

const whisperLocalPython = (process.env.WHISPER_LOCAL_PYTHON || 'python').trim() || 'python';
const whisperLocalPythonArgs = (process.env.WHISPER_LOCAL_PY_ARGS || '')
  .trim()
  .split(/\s+/)
  .filter(Boolean);
const whisperLocalModel = (process.env.WHISPER_LOCAL_MODEL || 'tiny').trim() || 'tiny';
const whisperLocalFp16 = ['1', 'true', 'yes', 'on'].includes(
  (process.env.WHISPER_LOCAL_FP16 || '').trim().toLowerCase()
);
const whisperLocalDevice = (process.env.WHISPER_LOCAL_DEVICE || '').trim() || undefined;

const claudeModel =
  (process.env.CLAUDE_MODEL || 'claude-sonnet-4-5').trim() || 'claude-sonnet-4-5';

export const env = {
  port: Number(process.env.PORT) || 4000,
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  claudeModel,
  whisperBackend,
  whisperLocalPython,
  whisperLocalPythonArgs,
  whisperLocalModel,
  whisperLocalFp16,
  whisperLocalDevice,
  whisperLanguage: whisperLang.length >= 2 ? whisperLang : undefined,
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  apiPublicUrl: (process.env.API_PUBLIC_URL || 'http://localhost:4000').replace(/\/$/, ''),
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  ffmpegPath: (process.env.FFMPEG_PATH || '').trim(),
};
