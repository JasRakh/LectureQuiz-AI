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
};

type CourseRow = {
  id: number;
  name: string;
  code: string;
  description: string | null;
  createdAt: string;
  _count: { enrollments: number; lectures: number };
};

type StudentRow = {
  id: number;
  name: string;
  email: string;
  enrolledAt: string;
};

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

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
}

export default function ProfessorDashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  // --- Courses ---
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

  // --- Lectures ---
  const [lectures, setLectures] = useState<LectureRow[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<LectureDetail | null>(null);
  const [caps, setCaps] = useState<AiCapabilities | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  // --- Tab ---
  const [tab, setTab] = useState<'students' | 'lectures'>('lectures');

  const authHeaders = useMemo((): HeadersInit => {
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    if (!t) {
      router.replace('/login');
      return;
    }
    setToken(t);
  }, [router]);

  const loadCapabilities = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase()}/lectures/ai-capabilities`);
      if (!res.ok) return;
      setCaps(await res.json());
    } catch {
      /* ignore */
    }
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

  const loadStudents = useCallback(
    async (courseId: number) => {
      if (!token) return;
      setLoadingStudents(true);
      try {
        const res = await fetch(`${apiBase()}/courses/${courseId}/students`, {
          headers: authHeaders,
        });
        if (!res.ok) throw new Error('Failed to load students');
        const data = (await res.json()) as { students: StudentRow[] };
        setCourseStudents(data.students);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to load students');
      } finally {
        setLoadingStudents(false);
      }
    },
    [authHeaders, token]
  );

  const refreshLectures = useCallback(
    async (courseId?: number) => {
      if (!token) return;
      setLoadingList(true);
      try {
        const url = courseId
          ? `${apiBase()}/lectures?courseId=${courseId}`
          : `${apiBase()}/lectures`;
        const res = await fetch(url, { headers: authHeaders });
        if (res.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
          router.replace('/login');
          return;
        }
        if (!res.ok) throw new Error('Failed to load lectures');
        const data = (await res.json()) as { lectures: LectureRow[] };
        setLectures(data.lectures);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to load lectures');
      } finally {
        setLoadingList(false);
      }
    },
    [authHeaders, router, token]
  );

  const loadDetail = useCallback(
    async (id: number) => {
      if (!token) return;
      setLoadingDetail(true);
      try {
        const res = await fetch(`${apiBase()}/lectures/${id}`, {
          headers: authHeaders,
        });
        if (!res.ok) throw new Error('Failed to load lecture');
        const data = (await res.json()) as { lecture: LectureDetail };
        setDetail(data.lecture);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to load lecture');
      } finally {
        setLoadingDetail(false);
      }
    },
    [authHeaders, token]
  );

  useEffect(() => {
    if (!token) return;
    void loadCapabilities();
    void loadCourses();
  }, [token, loadCapabilities, loadCourses]);

  useEffect(() => {
    if (!selectedCourse) {
      setLectures([]);
      setCourseStudents([]);
      return;
    }
    void refreshLectures(selectedCourse.id);
    void loadStudents(selectedCourse.id);
  }, [selectedCourse, refreshLectures, loadStudents]);

  useEffect(() => {
    if (!selectedId || !token) {
      setDetail(null);
      return;
    }
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

  // ── Course list view (no course selected) ──
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
            <Typography
              variant='caption'
              sx={{ letterSpacing: '.2em', textTransform: 'uppercase', color: '#a5b4fc' }}
            >
              PROFESSOR DASHBOARD
            </Typography>
            <Typography variant='h5' sx={{ mt: 1, color: '#e5e7eb', fontWeight: 600 }}>
              Your Courses
            </Typography>
            <Typography variant='body2' sx={{ mt: 0.5, fontSize: 12, color: '#9ca3af' }}>
              Create courses, upload lectures, and manage enrolled students.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size='small' onClick={() => setShowCreateCourse(true)}>
              <Plus className='mr-1 h-4 w-4' />
              New Course
            </Button>
            <Button variant='outlined' size='small' onClick={logout}>
              <LogOut className='mr-2 h-4 w-4' />
              Log out
            </Button>
          </Box>
        </Box>

        {loadingCourses ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
            <CircularProgress sx={{ color: '#818cf8' }} />
          </Box>
        ) : courses.length === 0 ? (
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
              No courses yet. Create your first course to start uploading lectures.
            </Typography>
            <Button size='small' sx={{ mt: 2 }} onClick={() => setShowCreateCourse(true)}>
              <Plus className='mr-1 h-4 w-4' />
              Create Course
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {courses.map((c) => (
              <Grid key={c.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper
                  onClick={() => {
                    setSelectedCourse(c);
                    setSelectedId(null);
                    setDetail(null);
                    setTab('lectures');
                  }}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    bgcolor: 'rgba(15,23,42,0.95)',
                    cursor: 'pointer',
                    border: '1px solid transparent',
                    transition: 'all .2s',
                    '&:hover': {
                      border: '1px solid rgba(99,102,241,0.4)',
                      bgcolor: 'rgba(79,70,229,0.08)',
                    },
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
                      sx={{ color: '#9ca3af', fontSize: 12, mt: 0.5, lineClamp: 2 }}
                    >
                      {c.description}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', gap: 2, mt: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Users className='h-3.5 w-3.5' color='#6ee7b7' />
                      <Typography variant='caption' sx={{ color: '#9ca3af' }}>
                        {c._count.enrollments} students
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <BookOpen className='h-3.5 w-3.5' color='#818cf8' />
                      <Typography variant='caption' sx={{ color: '#9ca3af' }}>
                        {c._count.lectures} lectures
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Create Course Dialog */}
        <Dialog
          open={showCreateCourse}
          onClose={() => setShowCreateCourse(false)}
          PaperProps={{
            sx: {
              bgcolor: 'rgba(15,23,42,0.98)',
              border: '1px solid rgba(148,163,184,0.2)',
              borderRadius: 3,
              minWidth: 400,
            },
          }}
        >
          <DialogTitle sx={{ color: '#e5e7eb' }}>Create New Course</DialogTitle>
          <DialogContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}
          >
            <TextField
              size='small'
              label='Course Name'
              placeholder='e.g. Linear Algebra'
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
              fullWidth
              sx={{
                '& .MuiInputBase-input': { color: '#e5e7eb', fontSize: 13 },
                '& .MuiInputLabel-root': { color: '#9ca3af' },
              }}
            />
            <TextField
              size='small'
              label='Course Code'
              placeholder='e.g. MATH101'
              value={newCourseCode}
              onChange={(e) => setNewCourseCode(e.target.value)}
              fullWidth
              sx={{
                '& .MuiInputBase-input': { color: '#e5e7eb', fontSize: 13 },
                '& .MuiInputLabel-root': { color: '#9ca3af' },
              }}
            />
            <TextField
              size='small'
              label='Description (optional)'
              placeholder='Brief description of the course'
              value={newCourseDesc}
              onChange={(e) => setNewCourseDesc(e.target.value)}
              fullWidth
              multiline
              rows={2}
              sx={{
                '& .MuiInputBase-input': { color: '#e5e7eb', fontSize: 13 },
                '& .MuiInputLabel-root': { color: '#9ca3af' },
              }}
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

  // ── Course detail view (course selected) ──
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
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
          <Button
            variant='text'
            size='small'
            onClick={() => {
              setSelectedCourse(null);
              setSelectedId(null);
              setDetail(null);
              void loadCourses();
            }}
            sx={{ color: '#9ca3af', mb: 1, pl: 0 }}
          >
            <ChevronLeft className='h-4 w-4 mr-1' />
            All Courses
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
          {selectedCourse.description && (
            <Typography variant='body2' sx={{ mt: 0.5, fontSize: 12, color: '#9ca3af' }}>
              {selectedCourse.description}
            </Typography>
          )}
        </Box>
        <Button variant='outlined' size='small' onClick={logout}>
          <LogOut className='mr-2 h-4 w-4' />
          Log out
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Chip
          label='Lectures'
          icon={<BookOpen className='h-3.5 w-3.5' />}
          onClick={() => setTab('lectures')}
          sx={{
            cursor: 'pointer',
            bgcolor: tab === 'lectures' ? 'rgba(99,102,241,0.2)' : '#020617',
            color: tab === 'lectures' ? '#a5b4fc' : '#9ca3af',
            border: tab === 'lectures' ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
            fontWeight: 500,
          }}
        />
        <Chip
          label={`Students (${courseStudents.length})`}
          icon={<Users className='h-3.5 w-3.5' />}
          onClick={() => setTab('students')}
          sx={{
            cursor: 'pointer',
            bgcolor: tab === 'students' ? 'rgba(110,231,183,0.15)' : '#020617',
            color: tab === 'students' ? '#6ee7b7' : '#9ca3af',
            border:
              tab === 'students' ? '1px solid rgba(110,231,183,0.4)' : '1px solid transparent',
            fontWeight: 500,
          }}
        />
      </Box>

      {/* AI capabilities strip */}
      {tab === 'lectures' && caps && (
        <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(15,23,42,0.95)' }}>
          <Typography variant='caption' sx={{ color: '#9ca3af' }}>
            AI capabilities
          </Typography>
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip
              size='small'
              label={`Whisper: ${caps.whisperBackend}`}
              sx={{ fontSize: 11, bgcolor: '#020617', color: '#e5e7eb' }}
            />
            <Chip
              size='small'
              label={caps.claudeModel}
              sx={{ fontSize: 11, bgcolor: '#020617', color: '#a5b4fc' }}
            />
            <Chip
              size='small'
              label={caps.canTranscribe ? 'Transcribe: ready' : 'Transcribe: blocked'}
              sx={{
                fontSize: 11,
                bgcolor: caps.canTranscribe ? 'rgba(34,197,94,0.15)' : 'rgba(248,113,113,0.12)',
                color: caps.canTranscribe ? '#4ade80' : '#fb7185',
              }}
            />
            <Chip
              size='small'
              label={caps.canGenerateBullets ? 'Claude bullets: ready' : 'Claude bullets: off'}
              sx={{
                fontSize: 11,
                bgcolor: caps.canGenerateBullets ? 'rgba(34,197,94,0.15)' : 'rgba(251,191,36,0.12)',
                color: caps.canGenerateBullets ? '#4ade80' : '#fbbf24',
              }}
            />
          </Box>
        </Paper>
      )}

      {/* Students Tab */}
      {tab === 'students' && (
        <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(15,23,42,0.95)', minHeight: 300 }}>
          <Typography variant='subtitle2' sx={{ color: '#e5e7eb', mb: 2 }}>
            <Users className='mr-1 inline h-4 w-4' />
            Enrolled Students
          </Typography>
          {loadingStudents ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
              <CircularProgress size={22} sx={{ color: '#6ee7b7' }} />
            </Box>
          ) : courseStudents.length === 0 ? (
            <Typography variant='body2' sx={{ color: '#6b7280' }}>
              No students enrolled in this course yet.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {courseStudents.map((s) => (
                <Paper
                  key={s.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: '#020617',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography variant='body2' sx={{ color: '#e5e7eb', fontWeight: 500 }}>
                      {s.name}
                    </Typography>
                    <Typography variant='caption' sx={{ color: '#9ca3af' }}>
                      {s.email}
                    </Typography>
                  </Box>
                  <Typography variant='caption' sx={{ color: '#6b7280' }}>
                    Enrolled {new Date(s.enrolledAt).toLocaleDateString()}
                  </Typography>
                </Paper>
              ))}
            </Box>
          )}
        </Paper>
      )}

      {/* Lectures Tab */}
      {tab === 'lectures' && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(15,23,42,0.95)' }}>
              <Typography variant='subtitle2' sx={{ color: '#e5e7eb', mb: 1 }}>
                <UploadCloud className='mr-1 inline h-4 w-4' />
                Upload lecture to {selectedCourse.code}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <TextField
                  size='small'
                  label='Title'
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  fullWidth
                  sx={{
                    '& .MuiInputBase-input': { color: '#e5e7eb', fontSize: 13 },
                    '& .MuiInputLabel-root': { color: '#9ca3af' },
                  }}
                />
                <Button variant='outlined' size='small' component='label' className='w-fit'>
                  Choose video
                  <input
                    type='file'
                    hidden
                    accept='video/*'
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </Button>
                {file && (
                  <Typography variant='caption' sx={{ color: '#9ca3af' }}>
                    {file.name}
                  </Typography>
                )}
                <Button
                  size='small'
                  disabled={busy === 'upload' || !file}
                  onClick={() => void handleUpload()}
                >
                  {busy === 'upload' ? <CircularProgress size={16} /> : 'Upload'}
                </Button>
              </Box>

              <Typography variant='subtitle2' sx={{ color: '#e5e7eb', mt: 3, mb: 1 }}>
                Course lectures
              </Typography>
              {loadingList ? (
                <CircularProgress size={22} />
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    maxHeight: 320,
                    overflow: 'auto',
                  }}
                >
                  {lectures.length === 0 && (
                    <Typography variant='caption' sx={{ color: '#6b7280' }}>
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
                        bgcolor: selectedId === l.id ? 'rgba(56,189,248,0.12)' : '#020617',
                        border:
                          selectedId === l.id
                            ? '1px solid rgba(56,189,248,0.4)'
                            : '1px solid transparent',
                      }}
                    >
                      <Typography variant='body2' sx={{ color: '#e5e7eb', fontWeight: 500 }}>
                        {l.title}
                      </Typography>
                      <Typography variant='caption' sx={{ color: '#6b7280' }}>
                        {l.transcript ? 'Has transcript' : 'No transcript'} ·{' '}
                        {l.bulletPoints ? 'Has bullets' : 'No bullets'}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Paper
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: 'rgba(15,23,42,0.95)',
                minHeight: 360,
              }}
            >
              {!selectedId && (
                <Typography variant='body2' sx={{ color: '#6b7280' }}>
                  Select a lecture to transcribe or generate quizzes.
                </Typography>
              )}
              {selectedId && loadingDetail && <CircularProgress size={24} />}
              {selectedId && !loadingDetail && detail && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant='h6' sx={{ color: '#e5e7eb', fontWeight: 600 }}>
                    {detail.title}
                  </Typography>
                  <Typography variant='caption' sx={{ color: '#6b7280', wordBreak: 'break-all' }}>
                    {detail.videoUrl}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Button
                      size='small'
                      variant='outlined'
                      disabled={busy !== null || !caps?.canTranscribe}
                      onClick={() => void runAction('/transcribe', 'Transcribe')}
                    >
                      <Mic className='mr-1 h-3 w-3' />
                      Whisper only
                    </Button>
                    <Button
                      size='small'
                      variant='outlined'
                      disabled={busy !== null || !caps?.canGenerateBullets}
                      onClick={() => void runAction('/generate-bullets', 'Bullets')}
                    >
                      <ListChecks className='mr-1 h-3 w-3' />
                      Bullets only
                    </Button>
                    <Button
                      size='small'
                      disabled={busy !== null || !caps?.canGenerateQuiz}
                      onClick={() => void runAction('/generate-quiz', 'Quiz')}
                    >
                      <Sparkles className='mr-1 h-3 w-3' />
                      Full quiz
                    </Button>
                  </Box>
                  <Box>
                    <Typography variant='caption' sx={{ color: '#9ca3af' }}>
                      Transcript
                    </Typography>
                    <Paper
                      sx={{
                        mt: 0.5,
                        p: 1.5,
                        maxHeight: 200,
                        overflow: 'auto',
                        bgcolor: '#020617',
                        fontSize: 12,
                        color: '#cbd5e1',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {detail.transcript || '—'}
                    </Paper>
                  </Box>
                  <Box>
                    <Typography variant='caption' sx={{ color: '#9ca3af' }}>
                      Bullet points
                    </Typography>
                    <Box component='ul' sx={{ m: 0, pl: 2, color: '#e5e7eb', fontSize: 13 }}>
                      {detail.bulletPoints?.length
                        ? detail.bulletPoints.map((b, i) => (
                            <li key={`${i}-${b.slice(0, 24)}`}>{b}</li>
                          ))
                        : '—'}
                    </Box>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
