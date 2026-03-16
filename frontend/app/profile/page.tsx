'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<'student' | 'professor' | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setName(window.localStorage.getItem('lecturequiz_user_name'));
    setEmail(window.localStorage.getItem('lecturequiz_user_email'));
    const storedRole = window.localStorage.getItem('lecturequiz_user_role');
    if (storedRole === 'student' || storedRole === 'professor') {
      setRole(storedRole);
    }
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor:
          'radial-gradient(circle at top,rgba(37,99,235,0.35),#020617 55%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Paper
        sx={{
          maxWidth: 480,
          width: '100%',
          p: 3,
          borderRadius: 3,
          bgcolor: 'rgba(15,23,42,0.96)',
          border: '1px solid rgba(148,163,184,0.25)',
        }}
      >
        <Typography variant="h6" sx={{ color: '#e5e7eb', fontWeight: 600 }}>
          Profile
        </Typography>
        <Typography
          variant="body2"
          sx={{ mt: 0.5, fontSize: 12, color: 'rgba(148,163,184,0.9)' }}
        >
          Basic information about your LectureQuiz AI account.
        </Typography>

        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box>
            <Typography
              variant="caption"
              sx={{ color: '#cbd5f5', mb: 0.5, display: 'block' }}
            >
              Name
            </Typography>
            <Typography variant="body2" sx={{ color: '#e5e7eb' }}>
              {name ?? '—'}
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="caption"
              sx={{ color: '#cbd5f5', mb: 0.5, display: 'block' }}
            >
              Email
            </Typography>
            <Typography variant="body2" sx={{ color: '#e5e7eb' }}>
              {email ?? '—'}
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="caption"
              sx={{ color: '#cbd5f5', mb: 0.5, display: 'block' }}
            >
              Role
            </Typography>
            {role ? (
              <Chip
                label={role === 'student' ? 'Student' : 'Professor'}
                size="small"
                sx={{
                  borderRadius: 999,
                  fontSize: 11,
                  bgcolor:
                    role === 'student'
                      ? 'rgba(59,130,246,0.15)'
                      : 'rgba(139,92,246,0.15)',
                  color: '#e5e7eb',
                }}
              />
            ) : (
              <Typography variant="body2" sx={{ color: '#e5e7eb' }}>
                —
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

