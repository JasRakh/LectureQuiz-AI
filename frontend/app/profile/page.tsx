'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainNav } from '../../components/layout/main-nav';
import Container from '@mui/material/Container';

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<'student' | 'professor' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = window.localStorage.getItem('lecturequiz_token');
    if (!token) {
      router.replace('/login');
      return;
    }
    setName(window.localStorage.getItem('lecturequiz_user_name'));
    setEmail(window.localStorage.getItem('lecturequiz_user_email'));
    const storedRole = window.localStorage.getItem('lecturequiz_user_role');
    if (storedRole === 'student' || storedRole === 'professor') {
      setRole(storedRole);
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={24} sx={{ color: 'text.secondary' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <MainNav />
      <Container
        maxWidth='sm'
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Paper
          sx={{
            maxWidth: 440,
            width: '100%',
            p: 4,
            border: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant='h5' sx={{ color: 'text.primary' }}>
            Profile
          </Typography>
          <Typography variant='body2' sx={{ mt: 0.5, color: 'text.secondary' }}>
            Your LectureQuiz AI account info.
          </Typography>

          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant='body2' sx={{ color: 'text.secondary', mb: 0.5 }}>
                Name
              </Typography>
              <Typography variant='body1' sx={{ color: 'text.primary', fontWeight: 500 }}>
                {name ?? '—'}
              </Typography>
            </Box>
            <Box>
              <Typography variant='body2' sx={{ color: 'text.secondary', mb: 0.5 }}>
                Email
              </Typography>
              <Typography variant='body1' sx={{ color: 'text.primary', fontWeight: 500 }}>
                {email ?? '—'}
              </Typography>
            </Box>
            <Box>
              <Typography variant='body2' sx={{ color: 'text.secondary', mb: 0.5 }}>
                Role
              </Typography>
              {role ? (
                <Chip
                  label={role === 'student' ? 'Student' : 'Professor'}
                  size='small'
                  sx={{
                    fontWeight: 600,
                    bgcolor: 'text.primary',
                    color: 'background.default',
                  }}
                />
              ) : (
                <Typography variant='body1' sx={{ color: 'text.primary' }}>
                  —
                </Typography>
              )}
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
