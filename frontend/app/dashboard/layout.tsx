import { ReactNode } from 'react';
import { MainNav } from '../../components/layout/main-nav';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';

export default function DashboardLayout({ children }: { children: ReactNode }) {
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
