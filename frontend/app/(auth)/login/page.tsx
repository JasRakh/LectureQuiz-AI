'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${base}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || 'Invalid credentials');
      }

      const data: {
        user: { name: string; email: string; role: 'student' | 'professor' };
        token: string;
      } = await res.json();

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('lecturequiz_token', data.token);
        window.localStorage.setItem('lecturequiz_user_name', data.user.name);
        window.localStorage.setItem('lecturequiz_user_email', data.user.email);
        window.localStorage.setItem('lecturequiz_user_role', data.user.role);
      }

      toast.success('Logged in successfully');
      router.push(data.user.role === 'professor' ? '/dashboard/professor' : '/dashboard/student');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to login right now');
    }
  };

  return (
    <Paper
      sx={{
        width: '100%',
        maxWidth: 400,
        p: 4,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant='h5' sx={{ color: 'text.primary' }}>
        Welcome back
      </Typography>
      <Typography variant='body2' sx={{ mt: 0.5, color: 'text.secondary' }}>
        Log in to your account.
      </Typography>

      <Box
        component='form'
        onSubmit={handleSubmit(onSubmit)}
        sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <Box>
          <Typography variant='body2' sx={{ color: 'text.primary', mb: 0.5, fontWeight: 500 }}>
            Email
          </Typography>
          <Input type='email' placeholder='you@university.edu' {...register('email')} />
          {errors.email && (
            <Typography variant='caption' sx={{ color: 'error.main', mt: 0.5 }}>
              {errors.email.message}
            </Typography>
          )}
        </Box>

        <Box>
          <Typography variant='body2' sx={{ color: 'text.primary', mb: 0.5, fontWeight: 500 }}>
            Password
          </Typography>
          <Input type='password' placeholder='••••••••' {...register('password')} />
          {errors.password && (
            <Typography variant='caption' sx={{ color: 'error.main', mt: 0.5 }}>
              {errors.password.message}
            </Typography>
          )}
        </Box>

        <Button type='submit' size='large' disabled={isSubmitting} sx={{ mt: 1 }}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </Box>

      <Typography
        variant='body2'
        sx={{ mt: 3, display: 'block', textAlign: 'center', color: 'text.secondary' }}
      >
        Don&apos;t have an account?{' '}
        <Link href='/register' style={{ color: 'inherit', fontWeight: 600 }}>
          Create one
        </Link>
      </Typography>
    </Paper>
  );
}
