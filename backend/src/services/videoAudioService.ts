import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

/**
 * Extract mono MP3 audio from a video file using ffmpeg (must be installed on the server).
 * Low bitrate keeps files under typical Speech-to-Text API size limits for long lectures.
 */
export async function extractAudioToMp3(videoPath: string, outMp3Path: string): Promise<void> {
  await execFileAsync('ffmpeg', [
    '-y',
    '-i',
    videoPath,
    '-vn',
    '-acodec',
    'libmp3lame',
    '-ar',
    '16000',
    '-ac',
    '1',
    '-b:a',
    '32k',
    outMp3Path,
  ]);
}
