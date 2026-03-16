 'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainNav } from '../../components/layout/main-nav';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    async function verify() {
      if (typeof window === 'undefined') return;

      const token = window.localStorage.getItem('lecturequiz_token');
      if (!token) {
        router.replace('/login');
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!res.ok) {
          router.replace('/login');
          return;
        }

        setCheckingAuth(false);
      } catch {
        router.replace('/login');
      }
    }

    void verify();
  }, [router]);

  if (checkingAuth) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor:
          'radial-gradient(circle at top,rgba(37,99,235,0.35),#020617 55%)',
      }}
    >
      <MainNav />
      <Container maxWidth='lg' sx={{ pt: 5, pb: 6 }}>
        {children}
      </Container>
    </Box>
  );
}
