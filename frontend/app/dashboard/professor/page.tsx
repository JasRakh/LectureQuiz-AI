'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/button';
import {
  UploadCloud,
  Mic,
  ListChecks,
  Sparkles,
  LogOut,
  BookOpen,
  Users,
  Plus,
  ChevronLeft,
} from 'lucide-react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { toast } from 'sonner';

const TOKEN_KEY = 'lecturequiz_token';

type AiCapabilities = {
  whisperBackend: string;
  whisperAvailable: boolean;
  openaiConfigured: boolean;
  anthropicConfigured: boolean;
  claudeModel: string;
  canTranscribe: boolean;
  canGenerateBullets: boolean;
  canGenerateQuiz: boolean;
  demoMode?: boolean;
};

type CourseRow = {
  id: number;
  name: string;
  code: string;
  description: string | null;
  createdAt: string;
  _count: { enrollments: number; lectures: number };
};

type StudentRow = { id: number; name: string; email: string; enrolledAt: string };

type LectureRow = {
  id: number;
  title: string;
  videoUrl: string;
  transcript: string | null;
  bulletPoints: string | null;
  createdAt: string;
  course?: { id: number; name: string; code: string } | null;
};

type LectureDetail = LectureRow & { bulletPoints: string[] | null };

type QuizQuestion = {
  id: number;
  question: string;
  options: string;
  correctAnswer: string;
};

type GeneratedQuiz = {
  id: number;
  questions: QuizQuestion[];
};

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
}

export default function ProfessorDashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<CourseRow | null>(null);
  const [courseStudents, setCourseStudents] = useState<StudentRow[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [creatingCourse, setCreatingCourse] = useState(false);

  const [lectures, setLectures] = useState<LectureRow[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<LectureDetail | null>(null);
  const [caps, setCaps] = useState<AiCapabilities | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [generatedQuiz, setGeneratedQuiz] = useState<GeneratedQuiz | null>(null);

  const [tab, setTab] = useState<'students' | 'lectures'>('lectures');

  const authHeaders = useMemo((): HeadersInit => {
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    if (!t) { router.replace('/login'); return; }
    setToken(t);
  }, [router]);

  const loadCapabilities = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase()}/lectures/ai-capabilities`);
      if (!res.ok) return;
      setCaps(await res.json());
    } catch { /* ignore */ }
  }, []);

  const loadCourses = useCallback(async () => {
    if (!token) return;
    setLoadingCourses(true);
    try {
      const res = await fetch(`${apiBase()}/courses`, { headers: authHeaders });
      if (!res.ok) throw new Error('Failed to load courses');
      const data = (await res.json()) as { courses: CourseRow[] };
      setCourses(data.courses);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load courses');
    } finally {
      setLoadingCourses(false);
    }
  }, [authHeaders, token]);

  const loadStudents = useCallback(async (courseId: number) => {
    if (!token) return;
    setLoadingStudents(true);
    try {
      const res = await fetch(`${apiBase()}/courses/${courseId}/students`, { headers: authHeaders });
      if (!res.ok) throw new Error('Failed to load students');
      const data = (await res.json()) as { students: StudentRow[] };
      setCourseStudents(data.students);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load students');
    } finally {
      setLoadingStudents(false);
    }
  }, [authHeaders, token]);

  const refreshLectures = useCallback(async (courseId?: number) => {
    if (!token) return;
    setLoadingList(true);
    try {
      const url = courseId ? `${apiBase()}/lectures?courseId=${courseId}` : `${apiBase()}/lectures`;
      const res = await fetch(url, { headers: authHeaders });
      if (res.status === 401) { localStorage.removeItem(TOKEN_KEY); router.replace('/login'); return; }
      if (!res.ok) throw new Error('Failed to load lectures');
      const data = (await res.json()) as { lectures: LectureRow[] };
      setLectures(data.lectures);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load lectures');
    } finally {
      setLoadingList(false);
    }
  }, [authHeaders, router, token]);

  const loadDetail = useCallback(async (id: number) => {
    if (!token) return;
    setLoadingDetail(true);
    try {
      const res = await fetch(`${apiBase()}/lectures/${id}`, { headers: authHeaders });
      if (!res.ok) throw new Error('Failed to load lecture');
      const data = (await res.json()) as { lecture: LectureDetail };
      setDetail(data.lecture);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load lecture');
    } finally {
      setLoadingDetail(false);
    }
  }, [authHeaders, token]);

  useEffect(() => {
    if (!token) return;
    void loadCapabilities();
    void loadCourses();
  }, [token, loadCapabilities, loadCourses]);

  useEffect(() => {
    if (!selectedCourse) { setLectures([]); setCourseStudents([]); return; }
    void refreshLectures(selectedCourse.id);
    void loadStudents(selectedCourse.id);
  }, [selectedCourse, refreshLectures, loadStudents]);

  useEffect(() => {
    if (!selectedId || !token) { setDetail(null); setGeneratedQuiz(null); return; }
    setGeneratedQuiz(null);
    void loadDetail(selectedId);
  }, [selectedId, token, loadDetail]);

  const handleCreateCourse = async () => {
    if (!token) return;
    setCreatingCourse(true);
    try {
      const res = await fetch(`${apiBase()}/courses`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCourseName.trim(),
          code: newCourseCode.trim(),
          description: newCourseDesc.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'Failed to create course');
      toast.success(`Course "${data.course.code}" created`);
      setShowCreateCourse(false);
      setNewCourseName('');
      setNewCourseCode('');
      setNewCourseDesc('');
      await loadCourses();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create course');
    } finally {
      setCreatingCourse(false);
    }
  };

  const handleUpload = async () => {
    if (!token || !file || !selectedCourse) {
      toast.error('Select a course and choose a video file');
      return;
    }
    const fd = new FormData();
    fd.append('video', file);
    fd.append('title', uploadTitle.trim() || 'Untitled lecture');
    fd.append('courseId', String(selectedCourse.id));
    setBusy('upload');
    try {
      const res = await fetch(`${apiBase()}/lectures/upload`, {
        method: 'POST',
        headers: authHeaders,
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'Upload failed');
      toast.success('Lecture uploaded');
      setFile(null);
      setUploadTitle('');
      await refreshLectures(selectedCourse.id);
      await loadCourses();
      const id = data.lecture?.id as number | undefined;
      if (typeof id === 'number') setSelectedId(id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(null);
    }
  };

  const runAction = async (path: string, label: string) => {
    if (!token || !selectedId) return;
    setBusy(label);
    try {
      const res = await fetch(`${apiBase()}/lectures/${selectedId}${path}`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || `${label} failed`);
      toast.success(`${label} done`);
      if (data?.quiz) {
        setGeneratedQuiz(data.quiz as GeneratedQuiz);
      }
      await loadDetail(selectedId);
      if (selectedCourse) await refreshLectures(selectedCourse.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : `${label} failed`);
    } finally {
      setBusy(null);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('lecturequiz_user_name');
    localStorage.removeItem('lecturequiz_user_email');
    localStorage.removeItem('lecturequiz_user_role');
    router.replace('/login');
  };

  if (!token) return null;

  // ── Course list ──
  if (!selectedCourse) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
              Professor Dashboard
            </Typography>
            <Typography variant='h5' sx={{ color: 'text.primary', mt: 0.5 }}>
              Your Courses
            </Typography>
            <Typography variant='body2' sx={{ color: 'text.secondary', mt: 0.5 }}>
              Create courses, upload lectures, and manage students.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size='small' onClick={() => setShowCreateCourse(true)}>
              <Plus size={14} style={{ marginRight: 4 }} />
              New Course
            </Button>
            <Button variant='outlined' size='small' onClick={logout}>
              <LogOut size={14} style={{ marginRight: 6 }} />
              Log out
            </Button>
          </Box>
        </Box>

        {loadingCourses ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
            <CircularProgress size={24} sx={{ color: 'text.secondary' }} />
          </Box>
        ) : courses.length === 0 ? (
          <Paper sx={{ p: 4, border: 1, borderColor: 'divider', textAlign: 'center' }}>
            <BookOpen size={32} style={{ margin: '0 auto 8px' }} />
            <Typography variant='body1' sx={{ color: 'text.secondary' }}>
              No courses yet. Create your first one.
            </Typography>
            <Button size='small' sx={{ mt: 2 }} onClick={() => setShowCreateCourse(true)}>
              <Plus size={14} style={{ marginRight: 4 }} />
              Create Course
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {courses.map((c) => (
              <Grid key={c.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper
                  onClick={() => { setSelectedCourse(c); setSelectedId(null); setDetail(null); setTab('lectures'); }}
                  sx={{
                    p: 2.5,
                    border: 1,
                    borderColor: 'divider',
                    cursor: 'pointer',
                    transition: 'border-color .2s',
                    '&:hover': { borderColor: 'text.secondary' },
                  }}
                >
                  <Chip label={c.code} size='small' sx={{ bgcolor: 'action.selected', fontWeight: 600, fontSize: 12, mb: 1 }} />
                  <Typography variant='subtitle1' sx={{ color: 'text.primary' }}>
                    {c.name}
                  </Typography>
                  {c.description && (
                    <Typography variant='body2' sx={{ color: 'text.secondary', fontSize: 13, mt: 0.5 }}>
                      {c.description}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', gap: 2, mt: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Users size={14} />
                      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                        {c._count.enrollments} students
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <BookOpen size={14} />
                      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                        {c._count.lectures} lectures
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        <Dialog
          open={showCreateCourse}
          onClose={() => setShowCreateCourse(false)}
          PaperProps={{ sx: { border: 1, borderColor: 'divider', minWidth: 400 } }}
        >
          <DialogTitle>Create New Course</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
            <TextField
              size='small'
              label='Course Name'
              placeholder='e.g. Linear Algebra'
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
              fullWidth
            />
            <TextField
              size='small'
              label='Course Code'
              placeholder='e.g. MATH101'
              value={newCourseCode}
              onChange={(e) => setNewCourseCode(e.target.value)}
              fullWidth
            />
            <TextField
              size='small'
              label='Description (optional)'
              placeholder='Brief description'
              value={newCourseDesc}
              onChange={(e) => setNewCourseDesc(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button variant='outlined' size='small' onClick={() => setShowCreateCourse(false)}>
              Cancel
            </Button>
            <Button
              size='small'
              disabled={creatingCourse || !newCourseName.trim() || !newCourseCode.trim()}
              onClick={() => void handleCreateCourse()}
            >
              {creatingCourse ? <CircularProgress size={16} /> : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // ── Course detail ──
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box component='header'>
        <Button
          variant='text'
          size='small'
          onClick={() => { setSelectedCourse(null); setSelectedId(null); setDetail(null); void loadCourses(); }}
          sx={{ color: 'text.secondary', mb: 1, pl: 0 }}
        >
          <ChevronLeft size={16} style={{ marginRight: 4 }} />
          All Courses
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip label={selectedCourse.code} size='small' sx={{ bgcolor: 'action.selected', fontWeight: 600 }} />
            <Typography variant='h5' sx={{ color: 'text.primary' }}>
              {selectedCourse.name}
            </Typography>
          </Box>
          <Button variant='outlined' size='small' onClick={logout}>
            <LogOut size={14} style={{ marginRight: 6 }} />
            Log out
          </Button>
        </Box>
        {selectedCourse.description && (
          <Typography variant='body2' sx={{ mt: 0.5, color: 'text.secondary' }}>
            {selectedCourse.description}
          </Typography>
        )}
      </Box>

      {/* Tabs */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Chip
          label='Lectures'
          onClick={() => setTab('lectures')}
          sx={{
            cursor: 'pointer',
            fontWeight: tab === 'lectures' ? 600 : 400,
            bgcolor: tab === 'lectures' ? 'text.primary' : 'transparent',
            color: tab === 'lectures' ? 'background.default' : 'text.secondary',
            border: 1,
            borderColor: tab === 'lectures' ? 'text.primary' : 'divider',
            '&:hover': { bgcolor: tab === 'lectures' ? 'text.primary' : 'action.hover' },
          }}
        />
        <Chip
          label={`Students (${courseStudents.length})`}
          onClick={() => setTab('students')}
          sx={{
            cursor: 'pointer',
            fontWeight: tab === 'students' ? 600 : 400,
            bgcolor: tab === 'students' ? 'text.primary' : 'transparent',
            color: tab === 'students' ? 'background.default' : 'text.secondary',
            border: 1,
            borderColor: tab === 'students' ? 'text.primary' : 'divider',
            '&:hover': { bgcolor: tab === 'students' ? 'text.primary' : 'action.hover' },
          }}
        />
      </Box>

      {/* AI capabilities */}
      {tab === 'lectures' && caps && (
        <Paper sx={{ p: 2, border: 1, borderColor: caps.demoMode ? 'warning.main' : 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              AI capabilities
            </Typography>
            {caps.demoMode && (
              <Chip
                size='small'
                label='DEMO MODE — hardcoded data'
                sx={{ fontSize: 10, bgcolor: 'warning.main', color: 'warning.contrastText', fontWeight: 700 }}
              />
            )}
          </Box>
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip size='small' label={`Whisper: ${caps.whisperBackend}`} variant='outlined' sx={{ fontSize: 11 }} />
            <Chip size='small' label={caps.claudeModel} variant='outlined' sx={{ fontSize: 11 }} />
            <Chip
              size='small'
              label={caps.canTranscribe ? 'Transcribe: ready' : 'Transcribe: off'}
              sx={{
                fontSize: 11,
                bgcolor: caps.canTranscribe ? 'success.main' : 'error.main',
                color: caps.canTranscribe ? 'success.contrastText' : 'error.contrastText',
              }}
            />
            <Chip
              size='small'
              label='Bullets: ready'
              sx={{ fontSize: 11, bgcolor: 'success.main', color: 'success.contrastText' }}
            />
            <Chip
              size='small'
              label='Quiz: ready'
              sx={{ fontSize: 11, bgcolor: 'success.main', color: 'success.contrastText' }}
            />
          </Box>
          {caps.demoMode && (
            <Typography variant='caption' sx={{ color: 'text.secondary', mt: 1, display: 'block', fontSize: 11 }}>
              Claude API не подключён. Bullet points и квизы генерируются из готовых шаблонов.
            </Typography>
          )}
        </Paper>
      )}

      {/* Students */}
      {tab === 'students' && (
        <Paper sx={{ p: 2.5, border: 1, borderColor: 'divider', minHeight: 300 }}>
          <Typography variant='subtitle2' sx={{ color: 'text.primary', mb: 2 }}>
            Enrolled Students
          </Typography>
          {loadingStudents ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
              <CircularProgress size={20} sx={{ color: 'text.secondary' }} />
            </Box>
          ) : courseStudents.length === 0 ? (
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              No students enrolled yet.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {courseStudents.map((s) => (
                <Paper
                  key={s.id}
                  sx={{
                    p: 1.5,
                    border: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.default',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography variant='body2' sx={{ color: 'text.primary', fontWeight: 500 }}>
                      {s.name}
                    </Typography>
                    <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                      {s.email}
                    </Typography>
                  </Box>
                  <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                    {new Date(s.enrolledAt).toLocaleDateString()}
                  </Typography>
                </Paper>
              ))}
            </Box>
          )}
        </Paper>
      )}

      {/* Lectures */}
      {tab === 'lectures' && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ p: 2.5, border: 1, borderColor: 'divider' }}>
              <Typography variant='subtitle2' sx={{ color: 'text.primary', mb: 1.5 }}>
                Upload lecture
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <TextField
                  size='small'
                  label='Title'
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  fullWidth
                />
                <Button variant='outlined' size='small' component='label'>
                  Choose video
                  <input type='file' hidden accept='video/*' onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                </Button>
                {file && (
                  <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                    {file.name}
                  </Typography>
                )}
                <Button size='small' disabled={busy === 'upload' || !file} onClick={() => void handleUpload()}>
                  {busy === 'upload' ? <CircularProgress size={16} /> : 'Upload'}
                </Button>
              </Box>

              <Typography variant='subtitle2' sx={{ color: 'text.primary', mt: 3, mb: 1 }}>
                Lectures
              </Typography>
              {loadingList ? (
                <CircularProgress size={20} sx={{ color: 'text.secondary' }} />
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 320, overflow: 'auto' }}>
                  {lectures.length === 0 && (
                    <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                      No lectures yet.
                    </Typography>
                  )}
                  {lectures.map((l) => (
                    <Paper
                      key={l.id}
                      onClick={() => setSelectedId(l.id)}
                      sx={{
                        p: 1.5,
                        cursor: 'pointer',
                        bgcolor: selectedId === l.id ? 'action.selected' : 'background.default',
                        border: 1,
                        borderColor: selectedId === l.id ? 'text.secondary' : 'divider',
                        transition: 'all .15s',
                      }}
                    >
                      <Typography variant='body2' sx={{ color: 'text.primary', fontWeight: 500 }}>
                        {l.title}
                      </Typography>
                      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                        {l.transcript ? 'Transcribed' : 'No transcript'} · {l.bulletPoints ? 'Has bullets' : 'No bullets'}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Paper sx={{ p: 2.5, border: 1, borderColor: 'divider', minHeight: 360 }}>
              {!selectedId && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 1 }}>
                  <Sparkles size={28} style={{ opacity: 0.3 }} />
                  <Typography variant='body2' sx={{ color: 'text.secondary', textAlign: 'center' }}>
                    Выберите лекцию слева, чтобы сгенерировать<br />bullet points или квиз.
                  </Typography>
                </Box>
              )}
              {selectedId && loadingDetail && (
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
                  <CircularProgress size={24} sx={{ color: 'text.secondary' }} />
                </Box>
              )}
              {selectedId && !loadingDetail && detail && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box>
                    <Typography variant='h6' sx={{ color: 'text.primary' }}>
                      {detail.title}
                    </Typography>
                    <Typography variant='caption' sx={{ color: 'text.secondary', wordBreak: 'break-all' }}>
                      {detail.videoUrl}
                    </Typography>
                  </Box>

                  {/* Action buttons */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Button
                      size='small'
                      variant='outlined'
                      disabled={busy !== null || !caps?.canTranscribe}
                      onClick={() => void runAction('/transcribe', 'Transcribe')}
                    >
                      {busy === 'Transcribe' ? <CircularProgress size={14} sx={{ mr: 0.5 }} /> : <Mic size={14} style={{ marginRight: 4 }} />}
                      Whisper
                    </Button>
                    <Button
                      size='small'
                      variant='outlined'
                      disabled={busy !== null}
                      onClick={() => void runAction('/generate-bullets', 'Bullets')}
                    >
                      {busy === 'Bullets' ? <CircularProgress size={14} sx={{ mr: 0.5 }} /> : <ListChecks size={14} style={{ marginRight: 4 }} />}
                      Bullet points
                    </Button>
                    <Button
                      size='small'
                      disabled={busy !== null}
                      onClick={() => { setGeneratedQuiz(null); void runAction('/generate-quiz', 'Quiz'); }}
                    >
                      {busy === 'Quiz' ? <CircularProgress size={14} sx={{ mr: 0.5 }} /> : <Sparkles size={14} style={{ marginRight: 4 }} />}
                      Сгенерировать квиз
                    </Button>
                  </Box>

                  {/* Transcript */}
                  <Box>
                    <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                      Транскрипт
                    </Typography>
                    <Paper
                      sx={{
                        mt: 0.5,
                        p: 1.5,
                        maxHeight: 160,
                        overflow: 'auto',
                        bgcolor: 'background.default',
                        border: 1,
                        borderColor: 'divider',
                        fontSize: 13,
                        color: 'text.secondary',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {detail.transcript || (
                        <span style={{ fontStyle: 'italic', opacity: 0.6 }}>
                          Транскрипт ещё не создан. Нажмите «Whisper» для генерации.
                        </span>
                      )}
                    </Paper>
                  </Box>

                  {/* Bullet points */}
                  <Box>
                    <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                      Ключевые тезисы
                    </Typography>
                    {detail.bulletPoints?.length ? (
                      <Box sx={{ mt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {detail.bulletPoints.map((b, i) => (
                          <Box
                            key={`${i}-${b.slice(0, 24)}`}
                            sx={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 1,
                              p: 1,
                              borderRadius: 1,
                              bgcolor: 'action.hover',
                            }}
                          >
                            <Box
                              sx={{
                                minWidth: 22,
                                height: 22,
                                borderRadius: '50%',
                                bgcolor: 'text.primary',
                                color: 'background.default',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 11,
                                fontWeight: 700,
                                flexShrink: 0,
                                mt: 0.1,
                              }}
                            >
                              {i + 1}
                            </Box>
                            <Typography variant='body2' sx={{ color: 'text.primary', fontSize: 13 }}>
                              {b}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant='body2' sx={{ color: 'text.secondary', mt: 0.5, fontStyle: 'italic', fontSize: 13 }}>
                        Нажмите «Bullet points» для генерации ключевых тезисов.
                      </Typography>
                    )}
                  </Box>

                  {/* Generated quiz preview */}
                  {generatedQuiz && generatedQuiz.questions.length > 0 && (
                    <Box>
                      <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Сгенерированный квиз ({generatedQuiz.questions.length} вопросов)
                      </Typography>
                      <Box sx={{ mt: 0.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {generatedQuiz.questions.map((q, qi) => {
                          let opts: string[] = [];
                          try { opts = JSON.parse(q.options); } catch { opts = []; }
                          return (
                            <Paper
                              key={q.id}
                              sx={{
                                p: 1.5,
                                border: 1,
                                borderColor: 'divider',
                                bgcolor: 'background.default',
                              }}
                            >
                              <Typography variant='body2' sx={{ color: 'text.primary', fontWeight: 500, mb: 1, fontSize: 13 }}>
                                {qi + 1}. {q.question}
                              </Typography>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, pl: 1 }}>
                                {opts.map((opt) => (
                                  <Box
                                    key={opt}
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 0.75,
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: '50%',
                                        bgcolor: opt === q.correctAnswer ? 'success.main' : 'text.disabled',
                                        flexShrink: 0,
                                      }}
                                    />
                                    <Typography
                                      variant='caption'
                                      sx={{
                                        color: opt === q.correctAnswer ? 'success.main' : 'text.secondary',
                                        fontWeight: opt === q.correctAnswer ? 600 : 400,
                                        fontSize: 12,
                                      }}
                                    >
                                      {opt}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            </Paper>
                          );
                        })}
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
