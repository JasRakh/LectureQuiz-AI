import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { env } from '../config/env';

function uploadBasenameFromVideoUrl(videoUrl: string): string | null {
  try {
    const u = new URL(videoUrl);
    if (!u.pathname.startsWith('/uploads/')) return null;
    const base = path.basename(u.pathname);
    if (!base || base.includes('..')) return null;
    return base;
  } catch {
    return null;
  }
}

/**
 * Returns a local filesystem path to the lecture video, plus cleanup if a temp file was downloaded.
 */
export async function resolveVideoFileForProcessing(videoUrl: string): Promise<{
  localPath: string;
  cleanup: () => Promise<void>;
}> {
  const basename = uploadBasenameFromVideoUrl(videoUrl);
  if (basename) {
    const local = path.join(process.cwd(), env.uploadDir, basename);
    await fs.access(local);
    return { localPath: local, cleanup: async () => {} };
  }

  if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
    const tmp = path.join(os.tmpdir(), `lecture-${randomUUID()}.mp4`);
    const res = await fetch(videoUrl);
    if (!res.ok) {
      throw new Error(`Failed to download video (${res.status})`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(tmp, buf);
    return {
      localPath: tmp,
      cleanup: async () => {
        await fs.unlink(tmp).catch(() => {});
      },
    };
  }

  throw new Error(
    'Unsupported videoUrl. Use https://... or upload an MP4 so the URL points to /uploads/...'
  );
}
