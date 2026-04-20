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

type QuizQuestion = { id: number; question: string; options: string };
type QuizDetail = { id: number; lectureId: number; questions: QuizQuestion[] };
type SubmitFeedbackItem = {
  questionId: number;
  correct: boolean;
  correctAnswer: string;
  yourAnswer: string | null;
};
type SubmitResult = { score: number; correct: number; total: number; feedback: SubmitFeedbackItem[] };

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

  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<number | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseRow | null>(null);

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

  const loadCourses = useCallback(async () => {
    if (!apiBase || !getToken()) { setCoursesLoading(false); return; }
    setCoursesLoading(true);
    try {
      const res = await fetch(`${apiBase}/courses`, {
        headers: { Authorization: `Bearer ${getToken()}` },
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

  const loadLectures = useCallback(async (courseId: number) => {
    if (!apiBase || !getToken()) { setListLoading(false); return; }
    setListLoading(true);
    try {
      const res = await fetch(`${apiBase}/lectures?courseId=${courseId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('Could not load lectures');
      const data = (await res.json()) as { lectures: LectureRow[] } | LectureRow[];
      setLectures(Array.isArray(data) ? data : data.lectures);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load lectures');
    } finally {
      setListLoading(false);
    }
  }, [apiBase]);

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
      if (!seekLock && el.currentTime > maxWatchedRef.current)
        maxWatchedRef.current = el.currentTime;
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
      if (el.currentTime > savedMax + 0.5) { el.currentTime = savedMax; return; }
      seekLock = false;
      if (wasPlaying) el.play().catch(() => {});
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

  useEffect(() => { void loadCourses(); }, [loadCourses]);
  useEffect(() => { if (selectedCourse) void loadLectures(selectedCourse.id); }, [selectedCourse, loadLectures]);

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
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
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

  const exitQuiz = () => { setActiveQuiz(null); setResult(null); setAnswers({}); setCurrentQ(0); };

  const handleTranscribe = async () => {
    if (!apiBase || !videoLecture) return;
    const token = getToken();
    if (!token) return;
    setTranscribing(true);
    try {
      const res = await fetch(`${apiBase}/lectures/${videoLecture.id}/transcribe`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || 'Transcription failed');
      const transcript = data?.transcript as string;
      setVideoLecture({ ...videoLecture, transcript });
      setLectures((prev) => prev.map((l) => (l.id === videoLecture.id ? { ...l, transcript } : l)));
      toast.success('Transcript generated');
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

  // ── Video player ──
  if (videoLecture) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 900, mx: 'auto' }}>
        <Button
          variant='text'
          size='small'
          onClick={() => { setVideoLecture(null); setVideoEnded(false); setTranscribing(false); maxWatchedRef.current = 0; }}
          sx={{ color: 'text.secondary', alignSelf: 'flex-start' }}
        >
          <ChevronLeft size={16} style={{ marginRight: 4 }} />
          Back
        </Button>

        <Typography variant='h6' sx={{ color: 'text.primary' }}>
          {videoLecture.title}
        </Typography>

        <video
          ref={videoRef}
          controls
          autoPlay
          src={videoLecture.videoUrl}
          style={{ width: '100%', borderRadius: 10, backgroundColor: '#000', maxHeight: '70vh' }}
        />

        {!videoEnded && !videoLecture.transcript && (
          <Paper sx={{ p: 2.5, border: 1, borderColor: 'divider', textAlign: 'center' }}>
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              Watch the full video to unlock the transcript.
            </Typography>
          </Paper>
        )}

        {(videoEnded || videoLecture.transcript) && videoLecture.transcript ? (
          <Paper sx={{ p: 2.5, border: 1, borderColor: 'divider', maxHeight: 300, overflow: 'auto' }}>
            <Typography variant='subtitle2' sx={{ color: 'secondary.main', mb: 1 }}>
              Transcript
            </Typography>
            <Typography variant='body2' sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap', fontSize: 13 }}>
              {videoLecture.transcript}
            </Typography>
          </Paper>
        ) : videoEnded ? (
          <Paper sx={{ p: 3, border: 1, borderColor: 'divider', textAlign: 'center' }}>
            <Typography variant='body2' sx={{ color: 'text.secondary', mb: 2 }}>
              No transcript yet. Generate one with AI.
            </Typography>
            <Button size='small' disabled={transcribing} onClick={() => void handleTranscribe()}>
              {transcribing ? (
                <><Loader2 size={14} style={{ marginRight: 6 }} className='animate-spin' /> Transcribing...</>
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
        <CircularProgress size={24} sx={{ color: 'text.secondary' }} />
      </Box>
    );
  }

  if (activeQuiz && !result) {
    const q = activeQuiz.questions[currentQ];
    const opts = parseOptions(q.options);
    const total = activeQuiz.questions.length;
    const answeredCount = Object.keys(answers).length;

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 680, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button variant='text' size='small' onClick={exitQuiz} sx={{ color: 'text.secondary' }}>
            <ChevronLeft size={16} style={{ marginRight: 4 }} />
            Back
          </Button>
          <Box sx={{ flex: 1 }} />
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            {currentQ + 1} / {total}
          </Typography>
        </Box>

        <LinearProgress
          variant='determinate'
          value={((currentQ + 1) / total) * 100}
          sx={{
            borderRadius: 1,
            height: 4,
            bgcolor: 'divider',
            '& .MuiLinearProgress-bar': { bgcolor: 'text.primary' },
          }}
        />

        <Paper sx={{ p: 3, border: 1, borderColor: 'divider' }}>
          <Typography variant='body1' sx={{ color: 'text.primary', fontWeight: 500, mb: 2.5 }}>
            {q.question}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {opts.map((opt) => {
              const selected = answers[String(q.id)] === opt;
              return (
                <Paper
                  key={opt}
                  onClick={() => setAnswers((prev) => ({ ...prev, [String(q.id)]: opt }))}
                  sx={{
                    p: 1.5,
                    cursor: 'pointer',
                    border: 1,
                    borderColor: selected ? 'text.primary' : 'divider',
                    bgcolor: selected ? 'action.selected' : 'background.default',
                    transition: 'all .15s',
                    '&:hover': { borderColor: 'text.secondary' },
                  }}
                >
                  <Typography variant='body2' sx={{ color: 'text.primary' }}>
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
          >
            Previous
          </Button>
          {currentQ < total - 1 ? (
            <Button size='small' onClick={() => setCurrentQ((p) => p + 1)}>
              Next
              <ArrowRight size={14} style={{ marginLeft: 4 }} />
            </Button>
          ) : (
            <Button
              size='small'
              disabled={submitting || answeredCount < total}
              onClick={() => void submitQuiz()}
            >
              {submitting ? (
                <><Loader2 size={14} style={{ marginRight: 4 }} className='animate-spin' /> Submitting...</>
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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 680, mx: 'auto' }}>
        <Button
          variant='text'
          size='small'
          onClick={exitQuiz}
          sx={{ alignSelf: 'flex-start', color: 'text.secondary' }}
        >
          <ChevronLeft size={16} style={{ marginRight: 4 }} />
          Back
        </Button>

        <Paper sx={{ p: 3, border: 1, borderColor: 'divider', textAlign: 'center' }}>
          <Typography variant='h4' sx={{ color: 'text.primary' }}>
            {result.score}%
          </Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary', mt: 0.5 }}>
            {result.correct} / {result.total} correct
          </Typography>
        </Paper>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {result.feedback.map((fb, i) => {
            const q = activeQuiz.questions.find((x) => x.id === fb.questionId);
            return (
              <Paper
                key={fb.questionId}
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: 'divider',
                  borderLeft: 3,
                  borderLeftColor: fb.correct ? 'success.main' : 'error.main',
                }}
              >
                <Typography variant='body2' sx={{ color: 'text.primary', fontWeight: 500, mb: 0.5 }}>
                  {i + 1}. {q?.question ?? `Question #${fb.questionId}`}
                </Typography>
                {!fb.correct && (
                  <>
                    <Typography variant='caption' sx={{ color: 'error.main', display: 'block' }}>
                      Your answer: {fb.yourAnswer ?? '(none)'}
                    </Typography>
                    <Typography variant='caption' sx={{ color: 'success.main', display: 'block' }}>
                      Correct: {fb.correctAnswer}
                    </Typography>
                  </>
                )}
                {fb.correct && (
                  <Typography variant='caption' sx={{ color: 'success.main' }}>
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
        <Button
          variant='text'
          size='small'
          onClick={() => { setSelectedCourse(null); setLectures([]); }}
          sx={{ color: 'text.secondary', alignSelf: 'flex-start' }}
        >
          <ChevronLeft size={16} style={{ marginRight: 4 }} />
          All Courses
        </Button>

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Chip
              label={selectedCourse.code}
              size='small'
              sx={{ bgcolor: 'action.selected', color: 'text.primary', fontWeight: 600 }}
            />
            <Typography variant='h5' sx={{ color: 'text.primary' }}>
              {selectedCourse.name}
            </Typography>
          </Box>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            Prof. {selectedCourse.professor.name} · {selectedCourse._count.lectures} lectures
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 2.5, border: 1, borderColor: 'divider', minHeight: 400 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
                  Lectures
                </Typography>
                {listLoading && <CircularProgress size={16} sx={{ color: 'text.secondary' }} />}
              </Box>

              {!listLoading && lectures.length === 0 && (
                <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                  No lectures uploaded yet.
                </Typography>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {lectures.map((lec) => {
                  const bullets = parseBulletPoints(lec.bulletPoints);
                  const hasQuiz = lec.quizzes.length > 0;
                  return (
                    <Paper
                      key={lec.id}
                      sx={{ p: 2, border: 1, borderColor: 'divider', bgcolor: 'background.default' }}
                    >
                      <Box
                        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}
                      >
                        <Box sx={{ flex: 1, minWidth: 200 }}>
                          <Typography variant='body2' sx={{ color: 'text.primary', fontWeight: 500 }}>
                            {lec.title}
                          </Typography>
                          <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                            {hasQuiz ? `${lec.quizzes.length} quiz available` : 'No quiz yet'}
                            {bullets.length > 0 && ` · ${bullets.length} key points`}
                            {lec.transcript ? ' · Transcribed' : ''}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button variant='outlined' size='small' onClick={() => setVideoLecture(lec)}>
                            <PlayCircle size={14} style={{ marginRight: 4 }} />
                            Watch
                          </Button>
                          {hasQuiz && (
                            <Button size='small' onClick={() => void startQuiz(lec.quizzes[0].id)}>
                              Take quiz
                            </Button>
                          )}
                          {!hasQuiz && (
                            <Chip
                              label={lec.transcript ? 'Transcribed' : 'Pending'}
                              size='small'
                              sx={{
                                bgcolor: lec.transcript ? 'success.main' : 'action.hover',
                                color: lec.transcript ? 'success.contrastText' : 'text.secondary',
                                fontSize: 11,
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
            <Paper sx={{ p: 2.5, border: 1, borderColor: 'divider' }}>
              <Typography variant='subtitle2' sx={{ color: 'text.primary', mb: 1.5 }}>
                How it works
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  'Your professor uploads a lecture video.',
                  'AI transcribes and creates key summaries.',
                  'A quiz is generated. Click "Take quiz".',
                  'See your score and correct answers.',
                ].map((text) => (
                  <Box key={text} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <CheckCircle2 size={14} style={{ marginTop: 3, flexShrink: 0 }} />
                    <Typography variant='body2' sx={{ color: 'text.secondary', fontSize: 13 }}>
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
          <Typography variant='overline' sx={{ color: 'text.secondary', letterSpacing: 2 }}>
            Student Dashboard
          </Typography>
          <Typography variant='h5' sx={{ color: 'text.primary', mt: 0.5 }}>
            {name ? `Welcome, ${name}` : 'Welcome'}
          </Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary', mt: 0.5 }}>
            Enroll in courses to access lectures and quizzes.
          </Typography>
        </Box>
        <Button variant='outlined' size='small' onClick={logout}>
          <LogOutIcon size={14} style={{ marginRight: 6 }} />
          Log out
        </Button>
      </Box>

      {coursesLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
          <CircularProgress size={24} sx={{ color: 'text.secondary' }} />
        </Box>
      ) : (
        <>
          {enrolledCourses.length > 0 && (
            <Box>
              <Typography variant='subtitle1' sx={{ color: 'text.primary', mb: 1.5 }}>
                My Courses
              </Typography>
              <Grid container spacing={2}>
                {enrolledCourses.map((c) => (
                  <Grid key={c.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Paper
                      sx={{
                        p: 2.5,
                        border: 1,
                        borderColor: 'divider',
                        cursor: 'pointer',
                        transition: 'border-color .2s',
                        '&:hover': { borderColor: 'text.secondary' },
                      }}
                      onClick={() => setSelectedCourse(c)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip label={c.code} size='small' sx={{ bgcolor: 'action.selected', fontWeight: 600, fontSize: 12 }} />
                        <Chip label='Enrolled' size='small' sx={{ bgcolor: 'success.main', color: 'success.contrastText', fontSize: 10 }} />
                      </Box>
                      <Typography variant='subtitle1' sx={{ color: 'text.primary' }}>
                        {c.name}
                      </Typography>
                      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                        Prof. {c.professor.name} · {c._count.lectures} lectures · {c._count.enrollments} students
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                        <Button
                          size='small'
                          onClick={(e) => { e.stopPropagation(); setSelectedCourse(c); }}
                        >
                          <BookOpen size={14} style={{ marginRight: 4 }} />
                          Open
                        </Button>
                        <Button
                          variant='outlined'
                          size='small'
                          color='error'
                          disabled={enrolling === c.id}
                          onClick={(e) => { e.stopPropagation(); void handleUnenroll(c.id); }}
                        >
                          {enrolling === c.id ? <CircularProgress size={14} /> : 'Unenroll'}
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          <Box>
            <Typography variant='subtitle1' sx={{ color: 'text.primary', mb: 1.5 }}>
              {enrolledCourses.length > 0 ? 'Available Courses' : 'All Courses'}
            </Typography>
            {availableCourses.length === 0 && enrolledCourses.length === 0 && (
              <Paper sx={{ p: 4, border: 1, borderColor: 'divider', textAlign: 'center' }}>
                <BookOpen size={32} style={{ margin: '0 auto 8px' }} />
                <Typography variant='body1' sx={{ color: 'text.secondary' }}>
                  No courses available yet.
                </Typography>
              </Paper>
            )}
            {availableCourses.length === 0 && enrolledCourses.length > 0 && (
              <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                You are enrolled in all available courses.
              </Typography>
            )}
            <Grid container spacing={2}>
              {availableCourses.map((c) => (
                <Grid key={c.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Paper sx={{ p: 2.5, border: 1, borderColor: 'divider' }}>
                    <Chip label={c.code} size='small' sx={{ bgcolor: 'action.selected', fontWeight: 600, fontSize: 12, mb: 1 }} />
                    <Typography variant='subtitle1' sx={{ color: 'text.primary' }}>
                      {c.name}
                    </Typography>
                    {c.description && (
                      <Typography variant='body2' sx={{ color: 'text.secondary', fontSize: 13, mt: 0.5 }}>
                        {c.description}
                      </Typography>
                    )}
                    <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                      Prof. {c.professor.name} · {c._count.lectures} lectures · {c._count.enrollments} enrolled
                    </Typography>
                    <Button
                      size='small'
                      sx={{ mt: 1.5 }}
                      disabled={enrolling === c.id}
                      onClick={() => void handleEnroll(c.id)}
                    >
                      {enrolling === c.id ? <CircularProgress size={14} /> : (
                        <><LogIn size={14} style={{ marginRight: 4 }} /> Enroll</>
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
