import { ReactNode } from 'react';
import { MainNav } from '../../components/layout/main-nav';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'radial-gradient(circle at top,rgba(37,99,235,0.35),#020617 55%)',
      }}
    >
      <MainNav />
      <Container
        maxWidth='sm'
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 72px)',
        }}
      >
        {children}
      </Container>
    </Box>
  );
}
