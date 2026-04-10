"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import {
  PlayCircle,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  ArrowRight,
} from "lucide-react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import { toast } from "sonner";

type LectureRow = {
  id: number;
  title: string;
  quizzes: { id: number }[];
  bulletPoints: string | null;
  createdAt: string;
};

type QuizQuestion = {
  id: number;
  question: string;
  options: string;
};

type QuizDetail = {
  id: number;
  lectureId: number;
  questions: QuizQuestion[];
};

type SubmitFeedbackItem = {
  questionId: number;
  correct: boolean;
  correctAnswer: string;
  yourAnswer: string | null;
};

type SubmitResult = {
  score: number;
  correct: number;
  total: number;
  feedback: SubmitFeedbackItem[];
};

function parseOptions(raw: string): string[] {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function parseBulletPoints(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export default function StudentDashboardPage() {
  const [name, setName] = useState<string | null>(null);
  const [lectures, setLectures] = useState<LectureRow[]>([]);
  const [listLoading, setListLoading] = useState(true);

  const [activeQuiz, setActiveQuiz] = useState<QuizDetail | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL;

  const getToken = () =>
    typeof window !== "undefined"
      ? window.localStorage.getItem("lecturequiz_token")
      : null;

  const loadLectures = useCallback(async () => {
    if (!apiBase) return;
    const token = getToken();
    if (!token) return;
    setListLoading(true);
    try {
      const res = await fetch(`${apiBase}/lectures`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Could not load lectures");
      setLectures((await res.json()) as LectureRow[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load lectures");
    } finally {
      setListLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setName(window.localStorage.getItem("lecturequiz_user_name"));
  }, []);

  useEffect(() => {
    void loadLectures();
  }, [loadLectures]);

  const startQuiz = async (quizId: number) => {
    if (!apiBase) return;
    const token = getToken();
    if (!token) return;
    setQuizLoading(true);
    setResult(null);
    setAnswers({});
    setCurrentQ(0);
    try {
      const res = await fetch(`${apiBase}/quizzes/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Could not load quiz");
      setActiveQuiz((await res.json()) as QuizDetail);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load quiz");
    } finally {
      setQuizLoading(false);
    }
  };

  const submitQuiz = async () => {
    if (!apiBase || !activeQuiz) return;
    const token = getToken();
    if (!token) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${apiBase}/quizzes/${activeQuiz.id}/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Submit failed");
      setResult(data as SubmitResult);
      toast.success(`Quiz complete: ${(data as SubmitResult).score}%`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  const exitQuiz = () => {
    setActiveQuiz(null);
    setResult(null);
    setAnswers({});
    setCurrentQ(0);
  };

  if (quizLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", pt: 10 }}>
        <CircularProgress sx={{ color: "#818cf8" }} />
      </Box>
    );
  }

  if (activeQuiz && !result) {
    const q = activeQuiz.questions[currentQ];
    const opts = parseOptions(q.options);
    const total = activeQuiz.questions.length;
    const answeredCount = Object.keys(answers).length;

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          maxWidth: 720,
          mx: "auto",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            variant="text"
            size="small"
            onClick={exitQuiz}
            sx={{ color: "#9ca3af" }}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to lectures
          </Button>
          <Box sx={{ flex: 1 }} />
          <Typography variant="caption" sx={{ color: "#9ca3af" }}>
            {currentQ + 1} / {total}
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={((currentQ + 1) / total) * 100}
          sx={{
            borderRadius: 2,
            height: 6,
            bgcolor: "#1e293b",
            "& .MuiLinearProgress-bar": {
              background: "linear-gradient(90deg,#4f46e5,#0ea5e9)",
            },
          }}
        />

        <Paper sx={{ p: 3, borderRadius: 3, bgcolor: "rgba(15,23,42,0.95)" }}>
          <Typography
            variant="body1"
            sx={{ color: "#e5e7eb", fontWeight: 500, mb: 2.5 }}
          >
            {q.question}
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {opts.map((opt) => {
              const selected = answers[String(q.id)] === opt;
              return (
                <Paper
                  key={opt}
                  onClick={() =>
                    setAnswers((prev) => ({ ...prev, [String(q.id)]: opt }))
                  }
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    cursor: "pointer",
                    bgcolor: selected ? "rgba(79,70,229,0.18)" : "#020617",
                    border: selected
                      ? "1px solid rgba(99,102,241,0.6)"
                      : "1px solid rgba(148,163,184,0.15)",
                    transition: "all .15s",
                    "&:hover": {
                      bgcolor: selected
                        ? "rgba(79,70,229,0.22)"
                        : "rgba(30,41,59,0.7)",
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "#e5e7eb", fontSize: 14 }}
                  >
                    {opt}
                  </Typography>
                </Paper>
              );
            })}
          </Box>
        </Paper>

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            variant="outlined"
            size="small"
            disabled={currentQ === 0}
            onClick={() => setCurrentQ((p) => p - 1)}
            sx={{ borderRadius: 999 }}
          >
            Previous
          </Button>
          {currentQ < total - 1 ? (
            <Button
              size="small"
              onClick={() => setCurrentQ((p) => p + 1)}
              sx={{ borderRadius: 999 }}
            >
              Next
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="small"
              disabled={submitting || answeredCount < total}
              onClick={() => void submitQuiz()}
              sx={{
                borderRadius: 999,
                background: "linear-gradient(135deg,#4f46e5,#0ea5e9)",
              }}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                `Submit (${answeredCount}/${total})`
              )}
            </Button>
          )}
        </Box>
      </Box>
    );
  }

  if (activeQuiz && result) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          maxWidth: 720,
          mx: "auto",
        }}
      >
        <Button
          variant="text"
          size="small"
          onClick={exitQuiz}
          sx={{ alignSelf: "flex-start", color: "#9ca3af" }}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to lectures
        </Button>

        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            bgcolor: "rgba(15,23,42,0.95)",
            textAlign: "center",
          }}
        >
          <Typography variant="h4" sx={{ color: "#e5e7eb", fontWeight: 700 }}>
            {result.score}%
          </Typography>
          <Typography variant="body2" sx={{ color: "#9ca3af", mt: 0.5 }}>
            {result.correct} / {result.total} correct
          </Typography>
        </Paper>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {result.feedback.map((fb, i) => {
            const q = activeQuiz.questions.find((x) => x.id === fb.questionId);
            return (
              <Paper
                key={fb.questionId}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "#020617",
                  borderLeft: fb.correct
                    ? "3px solid #22c55e"
                    : "3px solid #ef4444",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "#e5e7eb", fontWeight: 500, mb: 0.5 }}
                >
                  {i + 1}. {q?.question ?? `Question #${fb.questionId}`}
                </Typography>
                {!fb.correct && (
                  <>
                    <Typography
                      variant="caption"
                      sx={{ color: "#fb7185", display: "block" }}
                    >
                      Your answer: {fb.yourAnswer ?? "(none)"}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "#6ee7b7", display: "block" }}
                    >
                      Correct: {fb.correctAnswer}
                    </Typography>
                  </>
                )}
                {fb.correct && (
                  <Typography variant="caption" sx={{ color: "#6ee7b7" }}>
                    Correct
                  </Typography>
                )}
              </Paper>
            );
          })}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Box component="header">
        <Typography
          variant="caption"
          sx={{
            letterSpacing: ".2em",
            textTransform: "uppercase",
            color: "#6ee7b7",
          }}
        >
          STUDENT DASHBOARD
        </Typography>
        <Typography
          variant="h5"
          sx={{ mt: 1, color: "#e5e7eb", fontWeight: 600 }}
        >
          {name ? `Welcome back, ${name}.` : "Welcome back."}
        </Typography>
        <Typography
          variant="body2"
          sx={{ mt: 0.5, fontSize: 12, color: "#9ca3af" }}
        >
          Browse lectures and take quizzes generated by your professors.
        </Typography>
      </Box>

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
                Available lectures
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
                No lectures available yet. Your professors will upload them
                soon.
              </Typography>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {lectures.map((lec) => {
                const bullets = parseBulletPoints(lec.bulletPoints);
                const hasQuiz = lec.quizzes.length > 0;
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
                          {hasQuiz
                            ? `${lec.quizzes.length} quiz available`
                            : "No quiz yet"}
                          {bullets.length > 0 &&
                            ` · ${bullets.length} key points`}
                        </Typography>
                      </Box>
                      {hasQuiz && (
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{ borderRadius: 999, fontSize: 11 }}
                          onClick={() => void startQuiz(lec.quizzes[0].id)}
                        >
                          <PlayCircle className="mr-1 h-3 w-3" />
                          Take quiz
                        </Button>
                      )}
                      {!hasQuiz && (
                        <Chip
                          label="Pending"
                          size="small"
                          sx={{
                            bgcolor: "#1e293b",
                            color: "#9ca3af",
                            fontSize: 10,
                          }}
                        />
                      )}
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
            <Typography variant="subtitle2" sx={{ color: "#e5e7eb", mb: 1.5 }}>
              How it works
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                <CheckCircle2
                  className="h-4 w-4 mt-0.5 flex-shrink-0"
                  color="#6ee7b7"
                />
                <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                  Your professor uploads a lecture video (MP4).
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                <CheckCircle2
                  className="h-4 w-4 mt-0.5 flex-shrink-0"
                  color="#6ee7b7"
                />
                <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                  AI transcribes it and creates key summary bullet points.
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                <CheckCircle2
                  className="h-4 w-4 mt-0.5 flex-shrink-0"
                  color="#6ee7b7"
                />
                <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                  A multiple-choice quiz is generated. Click "Take quiz" when
                  ready.
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                <CheckCircle2
                  className="h-4 w-4 mt-0.5 flex-shrink-0"
                  color="#6ee7b7"
                />
                <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                  After submitting, you see your score and which answers were
                  correct.
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
