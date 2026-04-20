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
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', role: 'student' },
  });

  const roleValue = watch('role');

  const onSubmit = async (values: RegisterValues) => {
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${base}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || 'Unable to register');
      }

      const data = (await res.json()) as {
        token: string;
        user: { name: string; email: string; role: string };
      };
      localStorage.setItem('lecturequiz_token', data.token);
      localStorage.setItem('lecturequiz_user_name', data.user.name);
      localStorage.setItem('lecturequiz_user_email', data.user.email);
      localStorage.setItem('lecturequiz_user_role', data.user.role);
      toast.success('Account created successfully');
      router.push(data.user.role === 'professor' ? '/dashboard/professor' : '/dashboard/student');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to register right now');
    }
  };

  return (
    <Paper
      sx={{
        width: '100%',
        maxWidth: 440,
        p: 4,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant='h5' sx={{ color: 'text.primary' }}>
        Create your account
      </Typography>
      <Typography variant='body2' sx={{ mt: 0.5, color: 'text.secondary' }}>
        Choose your role and start generating quizzes.
      </Typography>

      <Box
        component='form'
        onSubmit={handleSubmit(onSubmit)}
        sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <Box>
          <Typography variant='body2' sx={{ color: 'text.primary', mb: 0.5, fontWeight: 500 }}>
            Name
          </Typography>
          <Input placeholder='Dr. Rivera' {...register('name')} />
          {errors.name && (
            <Typography variant='caption' sx={{ color: 'error.main', mt: 0.5 }}>
              {errors.name.message}
            </Typography>
          )}
        </Box>

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

        <Box>
          <Typography variant='body2' sx={{ color: 'text.primary', mb: 0.5, fontWeight: 500 }}>
            Role
          </Typography>
          <Stack direction='row' spacing={1}>
            {(['student', 'professor'] as const).map((r) => (
              <Chip
                key={r}
                label={r === 'student' ? 'Student' : 'Professor'}
                onClick={() => setValue('role', r, { shouldValidate: true, shouldDirty: true })}
                clickable
                variant={roleValue === r ? 'filled' : 'outlined'}
                sx={{
                  fontWeight: roleValue === r ? 600 : 400,
                  bgcolor: roleValue === r ? 'text.primary' : 'transparent',
                  color: roleValue === r ? 'background.default' : 'text.secondary',
                  borderColor: 'divider',
                  '&:hover': {
                    bgcolor: roleValue === r ? 'text.primary' : 'action.hover',
                  },
                }}
              />
            ))}
          </Stack>
          {errors.role && (
            <Typography variant='caption' sx={{ color: 'error.main', mt: 0.5 }}>
              {errors.role.message}
            </Typography>
          )}
        </Box>

        <Button type='submit' size='large' disabled={isSubmitting} sx={{ mt: 1 }}>
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </Button>
      </Box>

      <Typography
        variant='body2'
        sx={{ mt: 3, display: 'block', textAlign: 'center', color: 'text.secondary' }}
      >
        Already have an account?{' '}
        <Link href='/login' style={{ color: 'inherit', fontWeight: 600 }}>
          Log in
        </Link>
      </Typography>
    </Paper>
  );
}
