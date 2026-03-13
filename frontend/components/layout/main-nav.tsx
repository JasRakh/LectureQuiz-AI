'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

  const isAuthPage =
    pathname.startsWith('/login') || pathname.startsWith('/register');

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
          py: 1.5
        }}
      >
        <Box
          component={Link}
          href="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            textDecoration: 'none'
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
              ml: 4,
              flexGrow: 1
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

        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
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
        </Box>
      </Toolbar>
    </AppBar>
  );
};
