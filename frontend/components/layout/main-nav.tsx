'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const links = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#benefits', label: 'Benefits' },
  { href: '#demo', label: 'Demo' }
];

export const MainNav = () => {
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<'student' | 'professor' | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const isAuthPage =
    pathname.startsWith('/login') || pathname.startsWith('/register');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = window.localStorage.getItem('lecturequiz_token');
    const storedRole = window.localStorage.getItem('lecturequiz_user_role');
    setIsLoggedIn(!!token);
    if (storedRole === 'student' || storedRole === 'professor') {
      setRole(storedRole);
    }
    setHydrated(true);
  }, [pathname]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('lecturequiz_token');
      window.localStorage.removeItem('lecturequiz_user_name');
      window.localStorage.removeItem('lecturequiz_user_role');
    }
    setIsLoggedIn(false);
    setRole(null);
    router.push('/login');
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'rgba(15,23,42,0.9)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(148,163,184,0.25)'
      }}
    >
      <Toolbar
        sx={{
          maxWidth: 1200,
          mx: 'auto',
          px: { xs: 2, md: 3 },
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box
          component={Link}
          href="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            textDecoration: 'none',
            flexShrink: 0
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 2,
              background:
                'linear-gradient(135deg,#4f46e5,#0ea5e9,#22c55e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 18px 40px rgba(79,70,229,0.55)'
            }}
          >
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{ color: '#020617' }}
            >
              LQ
            </Typography>
          </Box>
          <Typography
            variant="body2"
            sx={{
              display: { xs: 'none', sm: 'inline' },
              color: 'rgba(226,232,240,0.95)',
              fontWeight: 500
            }}
          >
            LectureQuiz AI
          </Typography>
        </Box>

        {!isAuthPage && (
          <Box
            component="nav"
            sx={{
              display: { xs: 'none', md: 'flex' },
              gap: 3,
              ml: 4
            }}
          >
            {links.map((link) => (
              <Button
                key={link.href}
                component="a"
                href={link.href}
                size="small"
                sx={{
                  color: 'rgba(148,163,184,0.9)',
                  fontSize: 12,
                  fontWeight: 500,
                  textTransform: 'none',
                  '&:hover': {
                    color: '#e5e7eb',
                    backgroundColor: 'transparent'
                  }
                }}
              >
                {link.label}
              </Button>
            ))}
          </Box>
        )}

        {/* flexible spacer so logo/text don't collide with auth buttons */}
        <Box sx={{ flexGrow: 1 }} />

        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            flexShrink: 0,
            ml: isAuthPage ? 4 : 0
          }}
        >
          {/* Avoid flicker between logged-out and logged-in buttons on first paint */}
          {!hydrated ? null : isLoggedIn ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                onClick={handleLogout}
                sx={{
                  borderRadius: 999,
                  fontSize: 12,
                  px: 2.5,
                  background:
                    'linear-gradient(135deg,#4f46e5,#0ea5e9,#22c55e)'
                }}
              >
                Log out
              </Button>
            </Box>
          ) : (
            <Box
              sx={{
                display: { xs: isAuthPage ? 'none' : 'flex', sm: 'flex' },
                gap: 1
              }}
            >
              <Button
                component={Link}
                href="/login"
                variant="outlined"
                size="small"
                sx={{
                  borderRadius: 999,
                  fontSize: 12,
                  borderColor: 'rgba(148,163,184,0.4)',
                  color: '#e5e7eb'
                }}
              >
                Log in
              </Button>
              <Button
                component={Link}
                href="/register"
                variant="contained"
                size="small"
                sx={{
                  borderRadius: 999,
                  fontSize: 12,
                  px: 2.5,
                  background:
                    'linear-gradient(135deg,#4f46e5,#0ea5e9,#22c55e)'
                }}
              >
                Get started
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
