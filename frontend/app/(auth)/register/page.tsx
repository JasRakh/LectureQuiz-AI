'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

const registerSchema = z.object({
  name: z.string().min(2, 'Name is too short'),
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'professor'], {
    required_error: 'Please select a role',
  }),
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'student',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (values: RegisterValues) => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL;

      if (!apiBase) {
        toast.error('API URL is not configured (NEXT_PUBLIC_API_URL)');
        return;
      }

      // Helpful for debugging in the browser console if something still fails
      console.log('Submitting register', { values, apiBase });

      const res = await fetch(`${apiBase}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || 'Unable to register');
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

      toast.success('Account created successfully');

      if (data.user.role === 'student') {
        router.push('/dashboard/student');
      } else {
        router.push('/dashboard/professor');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to register right now');
    }
  };

  return (
    <Paper
      elevation={8}
      sx={{
        width: '100%',
        maxWidth: 460,
        px: 3,
        py: 3,
        borderRadius: 3,
        bgcolor: 'rgba(15,23,42,0.96)',
        border: '1px solid rgba(148,163,184,0.25)',
      }}
    >
      <Typography variant='h6' sx={{ color: '#e5e7eb', fontWeight: 600 }}>
        Create your account
      </Typography>
      <Typography variant='body2' sx={{ mt: 0.5, fontSize: 12, color: 'rgba(148,163,184,0.9)' }}>
        Choose your role and start generating lecture-aligned quizzes.
      </Typography>

      <Box
        component='form'
        onSubmit={handleSubmit(onSubmit)}
        sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <Box>
          <Typography variant='caption' sx={{ color: '#cbd5f5', mb: 0.5 }}>
            Name
          </Typography>
          <Input placeholder='Dr. Rivera' {...register('name')} />
          {errors.name && (
            <Typography variant='caption' sx={{ color: '#fb7185' }}>
              {errors.name.message}
            </Typography>
          )}
        </Box>

        <Box>
          <Typography variant='caption' sx={{ color: '#cbd5f5', mb: 0.5 }}>
            Email
          </Typography>
          <Input type='email' placeholder='you@university.edu' {...register('email')} />
          {errors.email && (
            <Typography variant='caption' sx={{ color: '#fb7185' }}>
              {errors.email.message}
            </Typography>
          )}
        </Box>

        <Box>
          <Typography variant='caption' sx={{ color: '#cbd5f5', mb: 0.5 }}>
            Password
          </Typography>
          <Input type='password' placeholder='••••••••' {...register('password')} />
          {errors.password && (
            <Typography variant='caption' sx={{ color: '#fb7185' }}>
              {errors.password.message}
            </Typography>
          )}
        </Box>

        <Box>
          <Typography variant='caption' sx={{ color: '#cbd5f5', mb: 0.5 }}>
            Role
          </Typography>
          <Stack direction='row' spacing={1}>
            {(['student', 'professor'] as const).map((roleOption) => {
              const isSelected = selectedRole === roleOption;
              return (
                <Chip
                  key={roleOption}
                  label={roleOption === 'student' ? 'Student' : 'Professor'}
                  onClick={() => setValue('role', roleOption)}
                  clickable
                  variant={isSelected ? 'filled' : 'outlined'}
                  color={isSelected ? 'primary' : 'default'}
                  sx={{ borderRadius: 999, fontSize: 11 }}
                />
              );
            })}
          </Stack>
          <input type='radio' value='student' style={{ display: 'none' }} {...register('role')} />
          <input type='radio' value='professor' style={{ display: 'none' }} {...register('role')} />
          {errors.role && (
            <Typography variant='caption' sx={{ color: '#fb7185' }}>
              {errors.role.message}
            </Typography>
          )}
        </Box>

        <Button type='submit' size='large' disabled={isSubmitting} sx={{ mt: 1 }}>
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </Button>
      </Box>

      <Typography
        variant='caption'
        sx={{ mt: 2.5, display: 'block', textAlign: 'center', color: '#9ca3af' }}
      >
        Already have an account?{' '}
        <Link href='/login' style={{ color: '#a5b4fc', textDecoration: 'none' }}>
          Log in
        </Link>
      </Typography>
    </Paper>
  );
}
