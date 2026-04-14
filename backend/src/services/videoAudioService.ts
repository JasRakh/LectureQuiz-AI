import { execFile } from "child_process";
import { promisify } from "util";
import { env } from "../config/env";

const execFileAsync = promisify(execFile);

function ffmpegExecutable(): string {
  if (env.ffmpegPath) {
    return env.ffmpegPath;
  }
  return process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg";
}

export async function extractAudioToMp3(
  videoPath: string,
  outMp3Path: string,
): Promise<void> {
  const bin = ffmpegExecutable();
  try {
    await execFileAsync(bin, [
      "-y",
      "-i",
      videoPath,
      "-vn",
      "-acodec",
      "libmp3lame",
      "-ar",
      "16000",
      "-ac",
      "1",
      "-b:a",
      "32k",
      outMp3Path,
    ]);
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      throw new Error(
        "ffmpeg not found. Install FFmpeg (winget install Gyan.FFmpeg), restart the terminal, or set FFMPEG_PATH in backend/.env to the full path to ffmpeg.exe.",
      );
    }
    throw e;
  }
}
