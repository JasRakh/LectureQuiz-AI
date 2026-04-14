'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/button';
import { UploadCloud, Mic, ListChecks, Sparkles, LogOut } from 'lucide-react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
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

type LectureRow = {
  id: number;
  title: string;
  videoUrl: string;
  transcript: string | null;
  bulletPoints: string | null;
  createdAt: string;
};

type LectureDetail = LectureRow & { bulletPoints: string[] | null };

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
}

export default function ProfessorDashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [lectures, setLectures] = useState<LectureRow[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<LectureDetail | null>(null);
  const [caps, setCaps] = useState<AiCapabilities | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

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

  const refreshList = useCallback(async () => {
    if (!token) return;
    setLoadingList(true);
    try {
      const res = await fetch(`${apiBase()}/lectures`, {
        headers: authHeaders,
      });
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
  }, [authHeaders, router, token]);

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
    void refreshList();
  }, [token, loadCapabilities, refreshList]);

  useEffect(() => {
    if (!selectedId || !token) {
      setDetail(null);
      return;
    }
    void loadDetail(selectedId);
  }, [selectedId, token, loadDetail]);

  const handleUpload = async () => {
    if (!token || !file) {
      toast.error('Choose a video file');
      return;
    }
    const fd = new FormData();
    fd.append('video', file);
    fd.append('title', uploadTitle.trim() || 'Untitled lecture');
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
      await refreshList();
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
      await refreshList();
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

  const configHints = useMemo(() => {
    if (!caps) return [];
    const lines: string[] = [];
    if (!caps.canTranscribe) {
      lines.push(
        caps.whisperBackend === 'local'
          ? 'Whisper (local): install Python + pip install openai-whisper; set WHISPER_LOCAL_PYTHON if needed; set FFMPEG_PATH so ffmpeg is visible to Whisper.'
          : 'Whisper (OpenAI): set OPENAI_API_KEY in backend/.env, or switch WHISPER_BACKEND=local.'
      );
    }
    if (!caps.canGenerateBullets) {
      lines.push('Summary bullets need ANTHROPIC_API_KEY (Claude) in backend/.env.');
    }
    if (!caps.canGenerateQuiz) {
      lines.push('Full quiz generation uses Claude after transcription; add ANTHROPIC_API_KEY.');
    }
    return lines;
  }, [caps]);

  if (!token) {
    return null;
  }

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
            sx={{
              letterSpacing: '.2em',
              textTransform: 'uppercase',
              color: '#a5b4fc',
            }}
          >
            PROFESSOR DASHBOARD
          </Typography>
          <Typography variant='h5' sx={{ mt: 1, color: '#e5e7eb', fontWeight: 600 }}>
            Lectures & AI pipeline
          </Typography>
          <Typography variant='body2' sx={{ mt: 0.5, fontSize: 12, color: '#9ca3af' }}>
            Upload video → Whisper transcript → Claude bullets → full quiz (transcribe + bullets +
            questions).
          </Typography>
        </Box>
        <Button variant='outlined' size='small' onClick={logout}>
          <LogOut className='mr-2 h-4 w-4' />
          Log out
        </Button>
      </Box>

      {caps && (
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
          {/* {configHints.length > 0 && (
            <Alert
              severity="warning"
              sx={{ mt: 2, fontSize: 12, bgcolor: "rgba(250,204,21,0.08)" }}
            >
              {configHints.map((h) => (
                <Typography
                  key={h}
                  variant="body2"
                  sx={{ fontSize: 12, mb: 0.5 }}
                >
                  {h}
                </Typography>
              ))}
            </Alert>
          )} */}
        </Paper>
      )}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(15,23,42,0.95)' }}>
            <Typography variant='subtitle2' sx={{ color: '#e5e7eb', mb: 1 }}>
              <UploadCloud className='mr-1 inline h-4 w-4' />
              Upload lecture
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
              Your lectures
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
    </Box>
  );
}
