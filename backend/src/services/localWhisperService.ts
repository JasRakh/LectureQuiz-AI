import { execFile } from 'child_process';
import { randomUUID } from 'crypto';
import { promisify } from 'util';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { env } from '../config/env';

const execFileAsync = promisify(execFile);

async function listTxtFilesRecursive(dir: string): Promise<string[]> {
  const results: string[] = [];
  let names: string[];
  try {
    names = await fs.readdir(dir);
  } catch {
    return results;
  }
  for (const name of names) {
    const p = path.join(dir, name);
    let st: Awaited<ReturnType<typeof fs.stat>>;
    try {
      st = await fs.stat(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      results.push(...(await listTxtFilesRecursive(p)));
    } else if (name.endsWith('.txt')) {
      results.push(p);
    }
  }
  return results;
}

function vttToPlainText(vtt: string): string {
  return vtt
    .split('\n')
    .map((line) => line.trim())
    .filter(
      (line) =>
        line.length > 0 &&
        !line.startsWith('WEBVTT') &&
        !line.includes('-->') &&
        !/^\d+$/.test(line)
    )
    .join(' ')
    .trim();
}

export async function transcribeWithLocalWhisper(audioPath: string): Promise<string> {
  const outDir = path.join(os.tmpdir(), `whisper-local-${randomUUID()}`);
  await fs.mkdir(outDir, { recursive: true });

  const stem = path.basename(audioPath, path.extname(audioPath));
  const audioDir = path.dirname(audioPath);
  const expectedTxt = path.join(outDir, `${stem}.txt`);

  const args = [
    ...env.whisperLocalPythonArgs,
    '-m',
    'whisper',
    audioPath,
    '--model',
    env.whisperLocalModel,
    '--output_dir',
    outDir,
    '--output_format',
    'txt',
  ];

  if (env.whisperLanguage) {
    args.push('--language', env.whisperLanguage);
  }

  if (env.whisperLocalFp16) {
    args.push('--fp16', 'True');
  } else {
    args.push('--fp16', 'False');
  }

  if (env.whisperLocalDevice) {
    args.push('--device', env.whisperLocalDevice);
  }

  const whisperEnv = { ...process.env };
  if (env.ffmpegPath) {
    const ffmpegDir = path.dirname(env.ffmpegPath);
    const sep = path.delimiter;
    whisperEnv.PATH = whisperEnv.PATH ? `${ffmpegDir}${sep}${whisperEnv.PATH}` : ffmpegDir;
  }

  let stderr = '';
  try {
    const r = (await execFileAsync(env.whisperLocalPython, args, {
      encoding: 'utf8',
      maxBuffer: 50 * 1024 * 1024,
      windowsHide: true,
      env: whisperEnv,
    })) as { stdout: string; stderr: string };
    stderr = r.stderr ?? '';
  } catch (e) {
    const err = e as Error & { code?: string; stderr?: Buffer | string };
    const tail =
      typeof err.stderr === 'string'
        ? err.stderr
        : err.stderr?.toString('utf8') ?? '';
    const hint =
      err.code === 'ENOENT'
        ? '\nPython not found on PATH for this process. Set WHISPER_LOCAL_PYTHON in backend/.env to the full path of python.exe, then restart the backend.'
        : '\nInstall: pip install openai-whisper';
    throw new Error(`Local Whisper failed: ${err.message}${tail ? `\n${tail.slice(-3000)}` : ''}${hint}`);
  }

  const tryRead = async (filePath: string): Promise<string | null> => {
    try {
      return await fs.readFile(filePath, 'utf8');
    } catch {
      return null;
    }
  };

  let text: string | null =
    (await tryRead(expectedTxt)) ??
    (await tryRead(path.join(outDir, `${path.basename(audioPath)}.txt`))) ??
    (await tryRead(path.join(audioDir, `${stem}.txt`))) ??
    (await tryRead(path.join(audioDir, `${path.basename(audioPath)}.txt`)));

  if (!text) {
    const inOut = await listTxtFilesRecursive(outDir);
    const inAudio = await listTxtFilesRecursive(audioDir);
    const related = [...inOut, ...inAudio].filter(
      (p) =>
        path.basename(p, '.txt').includes(stem) ||
        path.basename(p, '.txt') === stem ||
        p.includes(stem)
    );
    const unique = [...new Set(related)];
    if (unique.length === 1) {
      text = await tryRead(unique[0]);
    } else if (unique.length > 1) {
      const prefer = unique.find((p) => p.startsWith(outDir)) ?? unique[0];
      text = await tryRead(prefer);
    }
  }

  if (!text) {
    const vttInOut = (await fs.readdir(outDir).catch(() => [])).filter((f) => f.endsWith('.vtt'));
    if (vttInOut.length === 1) {
      const vtt = await fs.readFile(path.join(outDir, vttInOut[0]), 'utf8');
      text = vttToPlainText(vtt);
    }
  }

  if (!text?.trim()) {
    let outNames: string[] = [];
    try {
      outNames = await fs.readdir(outDir);
    } catch {
      /* ignore */
    }
    const errTail = stderr ? `\nWhisper stderr (tail):\n${stderr.slice(-2500)}` : '';
    throw new Error(
      `Local Whisper produced no transcript. Expected "${path.basename(expectedTxt)}". Output dir files: ${outNames.join(', ') || '(empty)'}${errTail}`
    );
  }

  await fs.rm(outDir, { recursive: true, force: true }).catch(() => {});

  return text.trim();
}
