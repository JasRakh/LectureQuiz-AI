'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme, darkTheme } from '../../lib/theme';
import { ThemeModeProvider, useThemeMode } from '../../lib/theme-context';
import { Toaster } from '../ui/toaster';

function InnerProvider({ children }: { children: ReactNode }) {
  const { mode } = useThemeMode();
  return (
    <ThemeProvider theme={mode === 'dark' ? darkTheme : lightTheme}>
      <CssBaseline />
      {children}
      <Toaster />
    </ThemeProvider>
  );
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeModeProvider>
      <InnerProvider>{children}</InnerProvider>
    </ThemeModeProvider>
  );
}
