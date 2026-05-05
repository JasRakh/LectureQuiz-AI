'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import { Sun, Moon, Bell } from 'lucide-react';
import { useThemeMode } from '../../lib/theme-context';

const links = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#benefits', label: 'Benefits' },
];

export const MainNav = () => {
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const { mode, toggleMode } = useThemeMode();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<'student' | 'professor' | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: number; message: string; isRead: boolean }>>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const menuOpen = Boolean(anchorEl);

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isDashboardPage = pathname.startsWith('/dashboard');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = window.localStorage.getItem('lecturequiz_token');
    const storedRole = window.localStorage.getItem('lecturequiz_user_role');
    const storedName = window.localStorage.getItem('lecturequiz_user_name');
    setIsLoggedIn(!!token);
    if (storedRole === 'student' || storedRole === 'professor') {
      setRole(storedRole);
    }
    if (storedName) {
      setName(storedName);
    }
    setHydrated(true);
  }, [pathname]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('lecturequiz_token');
      window.localStorage.removeItem('lecturequiz_user_name');
      window.localStorage.removeItem('lecturequiz_user_email');
      window.localStorage.removeItem('lecturequiz_user_role');
    }
    setIsLoggedIn(false);
    setRole(null);
    setName(null);
    setAnchorEl(null);
    router.push('/login');
  };

  const loadNotifications = async () => {
    if (typeof window === 'undefined') return;
    const token = window.localStorage.getItem('lecturequiz_token');
    if (!token) return;
    setNotificationsLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiBase}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = (await res.json()) as {
        notifications: Array<{ id: number; message: string; isRead: boolean }>;
        unreadCount: number;
      };
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const markAllNotificationsRead = async () => {
    if (typeof window === 'undefined' || unreadCount === 0) return;
    const token = window.localStorage.getItem('lecturequiz_token');
    if (!token) return;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    await fetch(`${apiBase}/notifications/read-all`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  useEffect(() => {
    if (!isLoggedIn) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    void loadNotifications();
    const timer = window.setInterval(() => {
      void loadNotifications();
    }, 15000);
    return () => window.clearInterval(timer);
  }, [isLoggedIn]);

  return (
    <AppBar
      position='sticky'
      sx={{
        bgcolor: 'background.default',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Toolbar
        sx={{
          maxWidth: 1100,
          width: '100%',
          mx: 'auto',
          px: { xs: 2, md: 3 },
          py: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box
          component={Link}
          href='/'
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <Typography
            variant='body1'
            sx={{ color: 'text.primary', fontWeight: 700, letterSpacing: '-0.02em' }}
          >
            LectureQuiz
          </Typography>
        </Box>

        {!isAuthPage && !isDashboardPage && (
          <Box component='nav' sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            {links.map((link) => (
              <Button
                key={link.href}
                component='a'
                href={link.href}
                size='small'
                sx={{
                  color: 'text.secondary',
                  fontSize: 13,
                  fontWeight: 400,
                  '&:hover': { color: 'text.primary', bgcolor: 'transparent' },
                }}
              >
                {link.label}
              </Button>
            ))}
          </Box>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
          {isLoggedIn && (
              <IconButton
                  size='small'
                  onClick={() => setIsNotificationsOpen(true)}
                  sx={{ color: 'text.secondary' }}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <Box
                        sx={{
                          ml: 0.6,
                          minWidth: 18,
                          height: 18,
                          px: 0.5,
                          borderRadius: 10,
                          bgcolor: 'error.main',
                          color: 'error.contrastText',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: 10,
                          fontWeight: 700,
                          lineHeight: 1,
                        }}
                    >
                      {unreadCount}
                    </Box>
                )}
              </IconButton>
          )}

          <IconButton size='small' onClick={toggleMode} sx={{ color: 'text.secondary' }}>
            {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </IconButton>

          {!hydrated ? null : isLoggedIn ? (
            <>
              <IconButton size='small' onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0 }}>
                <Avatar
                  sx={{
                    width: 30,
                    height: 30,
                    bgcolor: 'text.primary',
                    color: 'background.default',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {name ? name.charAt(0).toUpperCase() : 'U'}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                  paper: {
                    sx: { mt: 1, minWidth: 180, border: 1, borderColor: 'divider' },
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>
                    {name ?? 'User'}
                  </Typography>
                  {role && (
                    <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                      {role === 'student' ? 'Student' : 'Professor'}
                    </Typography>
                  )}
                </Box>
                <Divider />
                <MenuItem
                  onClick={() => {
                    setAnchorEl(null);
                    router.push(
                      role === 'professor' ? '/dashboard/professor' : '/dashboard/student'
                    );
                  }}
                >
                  Dashboard
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setAnchorEl(null);
                    router.push('/profile');
                  }}
                >
                  Profile
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>Log out</MenuItem>
              </Menu>
            </>
          ) : (
            <Box
              sx={{
                display: { xs: isAuthPage ? 'none' : 'flex', sm: 'flex' },
                gap: 1,
              }}
            >
              <Button
                component={Link}
                href='/login'
                variant='text'
                size='small'
                sx={{ color: 'text.secondary', fontSize: 13 }}
              >
                Log in
              </Button>
              <Button
                component={Link}
                href='/register'
                variant='contained'
                size='small'
                sx={{ fontSize: 13, px: 2 }}
              >
                Get started
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
      <Drawer
        anchor='right'
        open={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      >
        <Box sx={{ width: 360, p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant='subtitle1' sx={{ color: 'text.primary' }}>
              Notifications
            </Typography>
            <Button
              size='small'
              variant='outlined'
              disabled={unreadCount === 0 || notificationsLoading}
              onClick={() => void markAllNotificationsRead()}
            >
              Mark all read
            </Button>
          </Box>
          {notificationsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={18} />
            </Box>
          ) : notifications.length === 0 ? (
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              No notifications yet.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {notifications.map((notification) => (
                <Paper key={notification.id} sx={{ p: 1.25, border: 1, borderColor: 'divider' }}>
                  <Typography
                    variant='body2'
                    sx={{
                      color: notification.isRead ? 'text.secondary' : 'text.primary',
                      fontWeight: notification.isRead ? 400 : 600,
                    }}
                  >
                    {notification.message}
                  </Typography>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      </Drawer>
    </AppBar>
  );
};
