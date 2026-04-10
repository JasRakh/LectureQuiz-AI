"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { UploadCloud, Sparkles, Loader2 } from "lucide-react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "sonner";

type LectureRow = {
  id: number;
  title: string;
  videoUrl: string;
  transcript: string | null;
  bulletPoints: string | null;
  createdAt: string;
};

type GenerateQuizResponse = {
  quiz: { id: number; questions: { id: number }[] };
  transcript: string;
  bulletPoints: string[];
};

function parseBulletPoints(raw: string | null): string[] | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) && v.every((x) => typeof x === "string") ? v : null;
  } catch {
    return null;
  }
}

export default function ProfessorDashboardPage() {
  const [name, setName] = useState<string | null>(null);
  const [lectures, setLectures] = useState<LectureRow[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [generatingId, setGeneratingId] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<GenerateQuizResponse | null>(
    null,
  );
  const fileRef = useRef<HTMLInputElement>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL;

  const loadLectures = useCallback(async () => {
    if (!apiBase || typeof window === "undefined") return;
    const token = window.localStorage.getItem("lecturequiz_token");
    if (!token) return;
    setListLoading(true);
    try {
      const res = await fetch(`${apiBase}/lectures`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Could not load lectures");
      const data = (await res.json()) as LectureRow[];
      setLectures(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load lectures");
    } finally {
      setListLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedName = window.localStorage.getItem("lecturequiz_user_name");
    if (storedName) setName(storedName);
  }, []);

  useEffect(() => {
    void loadLectures();
  }, [loadLectures]);

  const handleUploadClick = () => {
    fileRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !apiBase) {
      if (!apiBase) toast.error("NEXT_PUBLIC_API_URL is not set");
      return;
    }
    const trimmed = title.trim();
    if (trimmed.length < 2) {
      toast.error(
        "Enter a lecture title (at least 2 characters) before uploading.",
      );
      return;
    }
    const token = window.localStorage.getItem("lecturequiz_token");
    if (!token) {
      toast.error("Please log in again.");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("title", trimmed);
      fd.append("video", file);
      const res = await fetch(`${apiBase}/lectures/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Upload failed");
      }
      toast.success("Lecture uploaded. You can generate a quiz when ready.");
      setTitle("");
      await loadLectures();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateQuiz = async (lectureId: number) => {
    if (!apiBase) {
      toast.error("NEXT_PUBLIC_API_URL is not set");
      return;
    }
    const token = window.localStorage.getItem("lecturequiz_token");
    if (!token) {
      toast.error("Please log in again.");
      return;
    }

    setGeneratingId(lectureId);
    setLastResult(null);
    try {
      const res = await fetch(
        `${apiBase}/lectures/${lectureId}/generate-quiz`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Generation failed");
      }
      setLastResult(data as GenerateQuizResponse);
      toast.success("Transcript, summary, and quiz are ready.");
      await loadLectures();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <input
        ref={fileRef}
        type="file"
        accept="video/mp4,video/quicktime,.mp4,.mov"
        hidden
        onChange={handleFileSelected}
      />

      <Box
        component="header"
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="caption"
            sx={{
              letterSpacing: ".2em",
              textTransform: "uppercase",
              color: "#a5b4fc",
            }}
          >
            PROFESSOR DASHBOARD
          </Typography>
          <Typography
            variant="h5"
            sx={{ mt: 1, color: "#e5e7eb", fontWeight: 600 }}
          >
            {name ? `Good afternoon, ${name}.` : "Good afternoon."}
          </Typography>
          <Typography
            variant="body2"
            sx={{ mt: 0.5, fontSize: 12, color: "#9ca3af" }}
          >
            Upload an MP4 lecture: the server extracts audio (ffmpeg),
            transcribes with Whisper, then GPT-4o-mini writes bullet points and
            quiz questions.
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            minWidth: { md: 280 },
          }}
        >
          <Input
            placeholder="Lecture title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={uploading}
          />
          <Button size="large" disabled={uploading} onClick={handleUploadClick}>
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <UploadCloud className="mr-2 h-4 w-4" />
                Upload lecture (MP4)
              </>
            )}
          </Button>
        </Box>
      </Box>

      {lastResult && (
        <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: "rgba(15,23,42,0.95)" }}>
          <Typography variant="subtitle2" sx={{ color: "#e5e7eb", mb: 1 }}>
            Latest generation
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "#9ca3af", display: "block", mb: 1 }}
          >
            Quiz ID {lastResult.quiz.id} · {lastResult.quiz.questions.length}{" "}
            questions · fetch via{" "}
            <Typography
              component="span"
              variant="caption"
              sx={{ color: "#a5b4fc" }}
            >
              GET /quizzes/{lastResult.quiz.id}
            </Typography>
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "#6ee7b7", display: "block", mb: 0.5 }}
          >
            Bullet points
          </Typography>
          <Box
            component="ul"
            sx={{ m: 0, pl: 2.5, color: "#d1d5db", fontSize: 13 }}
          >
            {lastResult.bulletPoints.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </Box>
          <Typography
            variant="caption"
            sx={{ color: "#6ee7b7", display: "block", mt: 2, mb: 0.5 }}
          >
            Transcript (preview)
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#9ca3af", fontSize: 12, whiteSpace: "pre-wrap" }}
          >
            {lastResult.transcript.length > 600
              ? `${lastResult.transcript.slice(0, 600)}…`
              : lastResult.transcript}
          </Typography>
        </Paper>
      )}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            sx={{ p: 2.5, borderRadius: 3, bgcolor: "rgba(15,23,42,0.95)" }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 2,
                alignItems: "center",
              }}
            >
              <Typography variant="subtitle2" sx={{ color: "#e5e7eb" }}>
                Your lectures
              </Typography>
              {listLoading && (
                <CircularProgress size={18} sx={{ color: "#818cf8" }} />
              )}
            </Box>

            {!listLoading && lectures.length === 0 && (
              <Typography
                variant="body2"
                sx={{ color: "#9ca3af", fontSize: 13 }}
              >
                No lectures yet. Add a title, then upload an MP4.
              </Typography>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {lectures.map((lec) => {
                const bullets = parseBulletPoints(lec.bulletPoints);
                const hasContent = Boolean(lec.transcript);
                return (
                  <Paper
                    key={lec.id}
                    sx={{ p: 1.5, borderRadius: 2, bgcolor: "#020617" }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography
                          variant="body2"
                          sx={{ color: "#e5e7eb", fontWeight: 500 }}
                        >
                          {lec.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                          {hasContent
                            ? `${bullets?.length ?? 0} summary bullets saved · transcript on file`
                            : "Not processed yet"}
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ borderRadius: 999, fontSize: 11 }}
                        disabled={generatingId !== null}
                        onClick={() => void handleGenerateQuiz(lec.id)}
                      >
                        {generatingId === lec.id ? (
                          <>
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            Working…
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-1 h-3 w-3" />
                            Audio → text → quiz
                          </>
                        )}
                      </Button>
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{ p: 2.5, borderRadius: 3, bgcolor: "rgba(15,23,42,0.95)" }}
          >
            <Typography variant="subtitle2" sx={{ color: "#e5e7eb", mb: 1 }}>
              Requirements
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Chip
                label="ffmpeg on the server"
                size="small"
                sx={{
                  alignSelf: "flex-start",
                  bgcolor: "#020617",
                  color: "#9ca3af",
                  fontSize: 11,
                }}
              />
              <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                Install ffmpeg (e.g. brew install ffmpeg). Without it, audio
                extraction fails.
              </Typography>
              <Chip
                label="OPENAI_API_KEY"
                size="small"
                sx={{
                  alignSelf: "flex-start",
                  bgcolor: "#020617",
                  color: "#9ca3af",
                  fontSize: 11,
                }}
              />
              <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                Whisper handles speech-to-text; gpt-4o-mini builds bullets and
                multiple-choice questions. Audio must stay under the Whisper
                25MB limit after compression.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
