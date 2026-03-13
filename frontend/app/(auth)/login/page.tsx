'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        throw new Error('Invalid credentials');
      }

      toast.success('Logged in successfully');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Unable to login right now'
      );
    }
  };

  return (
    <Paper
      elevation={8}
      sx={{
        width: '100%',
        maxWidth: 420,
        px: 3,
        py: 3,
        borderRadius: 3,
        bgcolor: 'rgba(15,23,42,0.96)',
        border: '1px solid rgba(148,163,184,0.25)',
      }}
    >
      <Typography variant="h6" sx={{ color: '#e5e7eb', fontWeight: 600 }}>
        Welcome back
      </Typography>
      <Typography
        variant="body2"
        sx={{ mt: 0.5, fontSize: 12, color: 'rgba(148,163,184,0.9)' }}
      >
        Log in to access your LectureQuiz AI dashboard.
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <Box>
          <Typography
            variant="caption"
            sx={{ color: '#cbd5f5', mb: 0.5, display: 'block' }}
          >
            Email
          </Typography>
          <Input
            type="email"
            placeholder="you@university.edu"
            {...register('email')}
          />
          {errors.email && (
            <Typography variant="caption" sx={{ color: '#fb7185' }}>
              {errors.email.message}
            </Typography>
          )}
        </Box>

        <Box>
          <Typography
            variant="caption"
            sx={{ color: '#cbd5f5', mb: 0.5, display: 'block' }}
          >
            Password
          </Typography>
          <Input
            type="password"
            placeholder="••••••••"
            {...register('password')}
          />
          {errors.password && (
            <Typography variant="caption" sx={{ color: '#fb7185' }}>
              {errors.password.message}
            </Typography>
          )}
        </Box>

        <Button
          type="submit"
          size="large"
          disabled={isSubmitting}
          sx={{ mt: 1 }}
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </Box>

      <Typography
        variant="caption"
        sx={{ mt: 2.5, display: 'block', textAlign: 'center', color: '#9ca3af' }}
      >
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          style={{ color: '#a5b4fc', textDecoration: 'none' }}
        >
          Create one
        </Link>
      </Typography>
    </Paper>
  );
}
