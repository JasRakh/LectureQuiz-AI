'use client';

import { Toaster as SonnerToaster } from 'sonner';
import { useThemeMode } from '../../lib/theme-context';

export function Toaster() {
  const { mode } = useThemeMode();
  return <SonnerToaster position='top-right' richColors theme={mode} />;
}
