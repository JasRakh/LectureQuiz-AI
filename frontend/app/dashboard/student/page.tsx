'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '../../../components/ui/button';
import {
  PlayCircle,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  ArrowRight,
  BookOpen,
  LogIn,
  LogOut as LogOutIcon,
} from 'lucide-react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type CourseRow = {
  id: number;
  name: string;
  code: string;
  description: string | null;
  enrolled: boolean;
  professor: { id: number; name: string };
  _count: { enrollments: number; lectures: number };
};

type LectureRow = {
  id: number;
  title: string;
  videoUrl: string;
  quizzes: { id: number }[];
  bulletPoints: string | null;
  transcript: string | null;
  createdAt: string;
  course?: { id: number; name: string; code: string } | null;
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
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);

  // --- Courses ---
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<number | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseRow | null>(null);

  // --- Lectures ---
  const [lectures, setLectures] = useState<LectureRow[]>([]);
  const [listLoading, setListLoading] = useState(false);

  const [videoLecture, setVideoLecture] = useState<LectureRow | null>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const maxWatchedRef = useRef(0);
  const [activeQuiz, setActiveQuiz] = useState<QuizDetail | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL;

  const getToken = () =>
    typeof window !== 'undefined' ? window.localStorage.getItem('lecturequiz_token') : null;

  // --- Load courses ---
  const loadCourses = useCallback(async () => {
    if (!apiBase || !getToken()) {
      setCoursesLoading(false);
      return;
    }
    const token = getToken();
    setCoursesLoading(true);
    try {
      const res = await fetch(`${apiBase}/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load courses');
      const data = (await res.json()) as { courses: CourseRow[] };
      setCourses(data.courses);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load courses');
    } finally {
      setCoursesLoading(false);
    }
  }, [apiBase]);

  // --- Enroll / Unenroll ---
  const handleEnroll = async (courseId: number) => {
    if (!apiBase) return;
    const token = getToken();
    if (!token) return;
    setEnrolling(courseId);
    try {
      const res = await fetch(`${apiBase}/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'Failed to enroll');
      toast.success('Enrolled successfully');
      await loadCourses();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to enroll');
    } finally {
      setEnrolling(null);
    }
  };

  const handleUnenroll = async (courseId: number) => {
    if (!apiBase) return;
    const token = getToken();
    if (!token) return;
    setEnrolling(courseId);
    try {
      const res = await fetch(`${apiBase}/courses/${courseId}/enroll`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to unenroll');
      toast.success('Unenrolled');
      if (selectedCourse?.id === courseId) {
        setSelectedCourse(null);
        setLectures([]);
      }
      await loadCourses();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to unenroll');
    } finally {
      setEnrolling(null);
    }
  };

  // --- Load lectures for selected course ---
  const loadLectures = useCallback(
    async (courseId: number) => {
      if (!apiBase || !getToken()) {
        setListLoading(false);
        return;
      }
      const token = getToken();
      setListLoading(true);
      try {
        const res = await fetch(`${apiBase}/lectures?courseId=${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Could not load lectures');
        const data = (await res.json()) as { lectures: LectureRow[] } | LectureRow[];
        setLectures(Array.isArray(data) ? data : data.lectures);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to load lectures');
      } finally {
        setListLoading(false);
      }
    },
    [apiBase],
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setName(window.localStorage.getItem('lecturequiz_user_name'));
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    let seekLock = false;
    let savedMax = 0;
    let wasPlaying = false;

    const onTimeUpdate = () => {
      if (!seekLock && el.currentTime > maxWatchedRef.current) {
        maxWatchedRef.current = el.currentTime;
      }
    };

    const onSeeking = () => {
      if (seekLock) return;
      savedMax = maxWatchedRef.current;
      if (el.currentTime > savedMax + 0.5) {
        seekLock = true;
        wasPlaying = !el.paused;
        el.pause();
        el.currentTime = savedMax;
      }
    };

    const onSeeked = () => {
      if (!seekLock) return;
      maxWatchedRef.current = savedMax;
      if (el.currentTime > savedMax + 0.5) {
        el.currentTime = savedMax;
        return;
      }
      seekLock = false;
      if (wasPlaying) {
        el.play().catch(() => {});
      }
    };

    const onEnded = () => setVideoEnded(true);

    el.addEventListener('timeupdate', onTimeUpdate);
    el.addEventListener('seeking', onSeeking);
    el.addEventListener('seeked', onSeeked);
    el.addEventListener('ended', onEnded);

    return () => {
      el.removeEventListener('timeupdate', onTimeUpdate);
      el.removeEventListener('seeking', onSeeking);
      el.removeEventListener('seeked', onSeeked);
      el.removeEventListener('ended', onEnded);
    };
  }, [videoLecture]);

  useEffect(() => {
    void loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    if (selectedCourse) {
      void loadLectures(selectedCourse.id);
    }
  }, [selectedCourse, loadLectures]);

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
      if (!res.ok) throw new Error('Could not load quiz');
      setActiveQuiz((await res.json()) as QuizDetail);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load quiz');
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
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || 'Submit failed');
      setResult(data as SubmitResult);
      toast.success(`Quiz complete: ${(data as SubmitResult).score}%`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Submit failed');
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

  const handleTranscribe = async () => {
    if (!apiBase || !videoLecture) return;
    const token = getToken();
    if (!token) return;
    setTranscribing(true);
    try {
      const res = await fetch(`${apiBase}/lectures/${videoLecture.id}/transcribe`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || 'Transcription failed');
      const transcript = data?.transcript as string;
      setVideoLecture({ ...videoLecture, transcript });
      setLectures((prev) =>
        prev.map((l) => (l.id === videoLecture.id ? { ...l, transcript } : l)),
      );
      toast.success('Transcript generated successfully');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Transcription failed');
    } finally {
      setTranscribing(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('lecturequiz_token');
    localStorage.removeItem('lecturequiz_user_name');
    localStorage.removeItem('lecturequiz_user_email');
    localStorage.removeItem('lecturequiz_user_role');
    router.replace('/login');
  };

  // ── Video player view ──
  if (videoLecture) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          maxWidth: 960,
          mx: 'auto',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant='text'
            size='small'
            onClick={() => {
              setVideoLecture(null);
              setVideoEnded(false);
              setTranscribing(false);
              maxWatchedRef.current = 0;
            }}
            sx={{ color: '#9ca3af' }}
          >
            <ChevronLeft className='h-4 w-4 mr-1' />
            Back to lectures
          </Button>
        </Box>

        <Typography variant='h6' sx={{ color: '#e5e7eb', fontWeight: 600 }}>
          {videoLecture.title}
        </Typography>

        <video
          ref={videoRef}
          controls
          autoPlay
          src={videoLecture.videoUrl}
          style={{
            width: '100%',
            borderRadius: 12,
            backgroundColor: '#000',
            maxHeight: '70vh',
          }}
        />

        {!videoEnded && !videoLecture.transcript && (
          <Paper
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: 'rgba(15,23,42,0.95)',
              textAlign: 'center',
            }}
          >
            <Typography variant='body2' sx={{ color: '#6b7280', fontSize: 13 }}>
              Watch the full video to unlock the transcript.
            </Typography>
          </Paper>
        )}

        {(videoEnded || videoLecture.transcript) && videoLecture.transcript ? (
          <Paper
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: 'rgba(15,23,42,0.95)',
              maxHeight: 300,
              overflow: 'auto',
            }}
          >
            <Typography variant='subtitle2' sx={{ color: '#6ee7b7', mb: 1 }}>
              Transcript
            </Typography>
            <Typography
              variant='body2'
              sx={{ color: '#cbd5e1', whiteSpace: 'pre-wrap', fontSize: 13 }}
            >
              {videoLecture.transcript}
            </Typography>
          </Paper>
        ) : videoEnded ? (
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: 'rgba(15,23,42,0.95)',
              textAlign: 'center',
            }}
          >
            <Typography variant='body2' sx={{ color: '#9ca3af', mb: 2 }}>
              No transcript available yet. Generate one using AI speech recognition.
            </Typography>
            <Button
              size='small'
              disabled={transcribing}
              onClick={() => void handleTranscribe()}
              sx={{
                borderRadius: 999,
                px: 3,
                background: 'linear-gradient(135deg,#4f46e5,#0ea5e9)',
              }}
            >
              {transcribing ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Transcribing… (this may take a minute)
                </>
              ) : (
                'Generate Transcript'
              )}
            </Button>
          </Paper>
        ) : null}
      </Box>
    );
  }

  // ── Quiz in progress ──
  if (quizLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}>
        <CircularProgress sx={{ color: '#818cf8' }} />
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
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          maxWidth: 720,
          mx: 'auto',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button variant='text' size='small' onClick={exitQuiz} sx={{ color: '#9ca3af' }}>
            <ChevronLeft className='h-4 w-4 mr-1' />
            Back to lectures
          </Button>
          <Box sx={{ flex: 1 }} />
          <Typography variant='caption' sx={{ color: '#9ca3af' }}>
            {currentQ + 1} / {total}
          </Typography>
        </Box>

        <LinearProgress
          variant='determinate'
          value={((currentQ + 1) / total) * 100}
          sx={{
            borderRadius: 2,
            height: 6,
            bgcolor: '#1e293b',
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(90deg,#4f46e5,#0ea5e9)',
            },
          }}
        />

        <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'rgba(15,23,42,0.95)' }}>
          <Typography variant='body1' sx={{ color: '#e5e7eb', fontWeight: 500, mb: 2.5 }}>
            {q.question}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {opts.map((opt) => {
              const selected = answers[String(q.id)] === opt;
              return (
                <Paper
                  key={opt}
                  onClick={() => setAnswers((prev) => ({ ...prev, [String(q.id)]: opt }))}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    cursor: 'pointer',
                    bgcolor: selected ? 'rgba(79,70,229,0.18)' : '#020617',
                    border: selected
                      ? '1px solid rgba(99,102,241,0.6)'
                      : '1px solid rgba(148,163,184,0.15)',
                    transition: 'all .15s',
                    '&:hover': {
                      bgcolor: selected ? 'rgba(79,70,229,0.22)' : 'rgba(30,41,59,0.7)',
                    },
                  }}
                >
                  <Typography variant='body2' sx={{ color: '#e5e7eb', fontSize: 14 }}>
                    {opt}
                  </Typography>
                </Paper>
              );
            })}
          </Box>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant='outlined'
            size='small'
            disabled={currentQ === 0}
            onClick={() => setCurrentQ((p) => p - 1)}
            sx={{ borderRadius: 999 }}
          >
            Previous
          </Button>
          {currentQ < total - 1 ? (
            <Button
              size='small'
              onClick={() => setCurrentQ((p) => p + 1)}
              sx={{ borderRadius: 999 }}
            >
              Next
              <ArrowRight className='ml-1 h-4 w-4' />
            </Button>
          ) : (
            <Button
              size='small'
              disabled={submitting || answeredCount < total}
              onClick={() => void submitQuiz()}
              sx={{
                borderRadius: 999,
                background: 'linear-gradient(135deg,#4f46e5,#0ea5e9)',
              }}
            >
              {submitting ? (
                <>
                  <Loader2 className='mr-1 h-4 w-4 animate-spin' />
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

  // ── Quiz results ──
  if (activeQuiz && result) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          maxWidth: 720,
          mx: 'auto',
        }}
      >
        <Button
          variant='text'
          size='small'
          onClick={exitQuiz}
          sx={{ alignSelf: 'flex-start', color: '#9ca3af' }}
        >
          <ChevronLeft className='h-4 w-4 mr-1' />
          Back to lectures
        </Button>

        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            bgcolor: 'rgba(15,23,42,0.95)',
            textAlign: 'center',
          }}
        >
          <Typography variant='h4' sx={{ color: '#e5e7eb', fontWeight: 700 }}>
            {result.score}%
          </Typography>
          <Typography variant='body2' sx={{ color: '#9ca3af', mt: 0.5 }}>
            {result.correct} / {result.total} correct
          </Typography>
        </Paper>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {result.feedback.map((fb, i) => {
            const q = activeQuiz.questions.find((x) => x.id === fb.questionId);
            return (
              <Paper
                key={fb.questionId}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: '#020617',
                  borderLeft: fb.correct ? '3px solid #22c55e' : '3px solid #ef4444',
                }}
              >
                <Typography variant='body2' sx={{ color: '#e5e7eb', fontWeight: 500, mb: 0.5 }}>
                  {i + 1}. {q?.question ?? `Question #${fb.questionId}`}
                </Typography>
                {!fb.correct && (
                  <>
                    <Typography variant='caption' sx={{ color: '#fb7185', display: 'block' }}>
                      Your answer: {fb.yourAnswer ?? '(none)'}
                    </Typography>
                    <Typography variant='caption' sx={{ color: '#6ee7b7', display: 'block' }}>
                      Correct: {fb.correctAnswer}
                    </Typography>
                  </>
                )}
                {fb.correct && (
                  <Typography variant='caption' sx={{ color: '#6ee7b7' }}>
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

  // ── Course lectures view ──
  if (selectedCourse) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant='text'
            size='small'
            onClick={() => {
              setSelectedCourse(null);
              setLectures([]);
            }}
            sx={{ color: '#9ca3af', pl: 0 }}
          >
            <ChevronLeft className='h-4 w-4 mr-1' />
            All Courses
          </Button>
        </Box>

        <Box component='header'>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Chip
              label={selectedCourse.code}
              size='small'
              sx={{
                bgcolor: 'rgba(99,102,241,0.15)',
                color: '#a5b4fc',
                fontWeight: 700,
                fontSize: 13,
              }}
            />
            <Typography variant='h5' sx={{ color: '#e5e7eb', fontWeight: 600 }}>
              {selectedCourse.name}
            </Typography>
          </Box>
          <Typography variant='body2' sx={{ fontSize: 12, color: '#9ca3af' }}>
            Professor: {selectedCourse.professor.name} ·{' '}
            {selectedCourse._count.lectures} lectures
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: 'rgba(15,23,42,0.95)',
                minHeight: 400,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 2,
                  alignItems: 'center',
                }}
              >
                <Typography variant='subtitle2' sx={{ color: '#e5e7eb' }}>
                  Lectures
                </Typography>
                {listLoading && <CircularProgress size={18} sx={{ color: '#818cf8' }} />}
              </Box>

              {!listLoading && lectures.length === 0 && (
                <Typography variant='body2' sx={{ color: '#9ca3af', fontSize: 13 }}>
                  No lectures uploaded for this course yet.
                </Typography>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {lectures.map((lec) => {
                  const bullets = parseBulletPoints(lec.bulletPoints);
                  const hasQuiz = lec.quizzes.length > 0;
                  return (
                    <Paper key={lec.id} sx={{ p: 1.5, borderRadius: 2, bgcolor: '#020617' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 1,
                          flexWrap: 'wrap',
                        }}
                      >
                        <Box sx={{ flex: 1, minWidth: 200 }}>
                          <Typography
                            variant='body2'
                            sx={{ color: '#e5e7eb', fontWeight: 500 }}
                          >
                            {lec.title}
                          </Typography>
                          <Typography variant='caption' sx={{ color: '#9ca3af' }}>
                            {hasQuiz
                              ? `${lec.quizzes.length} quiz available`
                              : 'No quiz yet'}
                            {bullets.length > 0 && ` · ${bullets.length} key points`}
                            {lec.transcript ? ' · Has transcript' : ''}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Button
                            variant='outlined'
                            size='small'
                            sx={{ borderRadius: 999, fontSize: 11 }}
                            onClick={() => setVideoLecture(lec)}
                          >
                            <PlayCircle className='mr-1 h-3 w-3' />
                            Watch
                          </Button>
                          {hasQuiz && (
                            <Button
                              size='small'
                              sx={{
                                borderRadius: 999,
                                fontSize: 11,
                                background: 'linear-gradient(135deg,#4f46e5,#0ea5e9)',
                              }}
                              onClick={() => void startQuiz(lec.quizzes[0].id)}
                            >
                              Take quiz
                            </Button>
                          )}
                          {!hasQuiz && (
                            <Chip
                              label={lec.transcript ? 'Transcribed' : 'Pending'}
                              size='small'
                              sx={{
                                bgcolor: lec.transcript
                                  ? 'rgba(34,197,94,0.12)'
                                  : '#1e293b',
                                color: lec.transcript ? '#4ade80' : '#9ca3af',
                                fontSize: 10,
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(15,23,42,0.95)' }}>
              <Typography variant='subtitle2' sx={{ color: '#e5e7eb', mb: 1.5 }}>
                How it works
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  'Your professor uploads a lecture video (MP4).',
                  'AI transcribes it and creates key summary bullet points.',
                  'A multiple-choice quiz is generated. Click "Take quiz" when ready.',
                  'After submitting, you see your score and which answers were correct.',
                ].map((text) => (
                  <Box key={text} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <CheckCircle2
                      className='h-4 w-4 mt-0.5 flex-shrink-0'
                      color='#6ee7b7'
                    />
                    <Typography variant='caption' sx={{ color: '#9ca3af' }}>
                      {text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // ── Main: course catalog ──
  const enrolledCourses = courses.filter((c) => c.enrolled);
  const availableCourses = courses.filter((c) => !c.enrolled);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box
        component='header'
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          gap: 2,
          alignItems: { md: 'center' },
        }}
      >
        <Box>
          <Typography
            variant='caption'
            sx={{
              letterSpacing: '.2em',
              textTransform: 'uppercase',
              color: '#6ee7b7',
            }}
          >
            STUDENT DASHBOARD
          </Typography>
          <Typography variant='h5' sx={{ mt: 1, color: '#e5e7eb', fontWeight: 600 }}>
            {name ? `Welcome back, ${name}.` : 'Welcome back.'}
          </Typography>
          <Typography variant='body2' sx={{ mt: 0.5, fontSize: 12, color: '#9ca3af' }}>
            Enroll in courses to access lectures and quizzes from your professors.
          </Typography>
        </Box>
        <Button variant='outlined' size='small' onClick={logout}>
          <LogOutIcon className='mr-2 h-4 w-4' />
          Log out
        </Button>
      </Box>

      {coursesLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
          <CircularProgress sx={{ color: '#818cf8' }} />
        </Box>
      ) : (
        <>
          {/* Enrolled courses */}
          {enrolledCourses.length > 0 && (
            <Box>
              <Typography variant='subtitle1' sx={{ color: '#e5e7eb', fontWeight: 600, mb: 1.5 }}>
                My Courses
              </Typography>
              <Grid container spacing={2}>
                {enrolledCourses.map((c) => (
                  <Grid key={c.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Paper
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        bgcolor: 'rgba(15,23,42,0.95)',
                        border: '1px solid rgba(110,231,183,0.2)',
                        cursor: 'pointer',
                        transition: 'all .2s',
                        '&:hover': {
                          border: '1px solid rgba(110,231,183,0.5)',
                          bgcolor: 'rgba(110,231,183,0.05)',
                        },
                      }}
                      onClick={() => setSelectedCourse(c)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip
                          label={c.code}
                          size='small'
                          sx={{
                            bgcolor: 'rgba(110,231,183,0.15)',
                            color: '#6ee7b7',
                            fontWeight: 600,
                            fontSize: 12,
                          }}
                        />
                        <Chip
                          label='Enrolled'
                          size='small'
                          sx={{
                            bgcolor: 'rgba(34,197,94,0.12)',
                            color: '#4ade80',
                            fontSize: 10,
                          }}
                        />
                      </Box>
                      <Typography
                        variant='subtitle1'
                        sx={{ color: '#e5e7eb', fontWeight: 600 }}
                      >
                        {c.name}
                      </Typography>
                      <Typography variant='caption' sx={{ color: '#9ca3af' }}>
                        Prof. {c.professor.name} · {c._count.lectures} lectures ·{' '}
                        {c._count.enrollments} students
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                        <Button
                          size='small'
                          sx={{
                            borderRadius: 999,
                            fontSize: 11,
                            background: 'linear-gradient(135deg,#4f46e5,#0ea5e9)',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCourse(c);
                          }}
                        >
                          <BookOpen className='mr-1 h-3 w-3' />
                          Open
                        </Button>
                        <Button
                          variant='outlined'
                          size='small'
                          sx={{ borderRadius: 999, fontSize: 11, color: '#fb7185', borderColor: '#fb7185' }}
                          disabled={enrolling === c.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleUnenroll(c.id);
                          }}
                        >
                          {enrolling === c.id ? (
                            <CircularProgress size={14} />
                          ) : (
                            'Unenroll'
                          )}
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Available courses */}
          <Box>
            <Typography variant='subtitle1' sx={{ color: '#e5e7eb', fontWeight: 600, mb: 1.5 }}>
              {enrolledCourses.length > 0 ? 'Available Courses' : 'All Courses'}
            </Typography>
            {availableCourses.length === 0 && enrolledCourses.length === 0 && (
              <Paper
                sx={{
                  p: 4,
                  borderRadius: 3,
                  bgcolor: 'rgba(15,23,42,0.95)',
                  textAlign: 'center',
                }}
              >
                <BookOpen className='mx-auto h-10 w-10 mb-2' color='#6b7280' />
                <Typography variant='body1' sx={{ color: '#9ca3af' }}>
                  No courses available yet. Your professors will create them soon.
                </Typography>
              </Paper>
            )}
            {availableCourses.length === 0 && enrolledCourses.length > 0 && (
              <Typography variant='body2' sx={{ color: '#6b7280' }}>
                You are enrolled in all available courses.
              </Typography>
            )}
            <Grid container spacing={2}>
              {availableCourses.map((c) => (
                <Grid key={c.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Paper
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      bgcolor: 'rgba(15,23,42,0.95)',
                      border: '1px solid transparent',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip
                        label={c.code}
                        size='small'
                        sx={{
                          bgcolor: 'rgba(99,102,241,0.15)',
                          color: '#a5b4fc',
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      />
                    </Box>
                    <Typography variant='subtitle1' sx={{ color: '#e5e7eb', fontWeight: 600 }}>
                      {c.name}
                    </Typography>
                    {c.description && (
                      <Typography
                        variant='body2'
                        sx={{ color: '#9ca3af', fontSize: 12, mt: 0.5 }}
                      >
                        {c.description}
                      </Typography>
                    )}
                    <Typography variant='caption' sx={{ color: '#9ca3af', display: 'block', mt: 0.5 }}>
                      Prof. {c.professor.name} · {c._count.lectures} lectures ·{' '}
                      {c._count.enrollments} enrolled
                    </Typography>
                    <Button
                      size='small'
                      sx={{
                        mt: 1.5,
                        borderRadius: 999,
                        fontSize: 11,
                        background: 'linear-gradient(135deg,#059669,#0ea5e9)',
                      }}
                      disabled={enrolling === c.id}
                      onClick={() => void handleEnroll(c.id)}
                    >
                      {enrolling === c.id ? (
                        <CircularProgress size={14} />
                      ) : (
                        <>
                          <LogIn className='mr-1 h-3 w-3' />
                          Enroll
                        </>
                      )}
                    </Button>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </>
      )}
    </Box>
  );
}
