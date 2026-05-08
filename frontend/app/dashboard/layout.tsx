'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MainNav } from '../../components/layout/main-nav';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    async function verify() {
      if (typeof window === 'undefined') return;

      const token = window.localStorage.getItem('lecturequiz_token');
      if (!token) {
        router.replace('/login');
        return;
      }

      const apiBase = process.env.NEXT_PUBLIC_API_URL;
      if (!apiBase) {
        router.replace('/login');
        return;
      }

      try {
        const res = await fetch(`${apiBase}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          router.replace('/login');
          return;
        }

        const data = (await res.json()) as {
          user: { role: 'student' | 'professor' };
        };
        const role = data.user.role;

        if (pathname.startsWith('/dashboard/professor') && role !== 'professor') {
          router.replace('/dashboard/student');
          return;
        }
        if (pathname.startsWith('/dashboard/student') && role !== 'student') {
          router.replace('/dashboard/professor');
          return;
        }

        setCheckingAuth(false);
      } catch {
        router.replace('/login');
      }
    }

    void verify();
  }, [router, pathname]);

  if (checkingAuth) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <CircularProgress size={24} sx={{ color: 'text.secondary' }} />
        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
          Verifying session...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <MainNav />
      <Container maxWidth='lg' sx={{ pt: 4, pb: 6 }}>
        {children}
      </Container>
    </Box>
  );
}
