'use client';

import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { PlayCircle, TrendingUp, Clock } from 'lucide-react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

export default function StudentDashboardPage() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedName = window.localStorage.getItem('lecturequiz_user_name');
    if (storedName) {
      setName(storedName);
    }
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box
        component='header'
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant='caption'
            sx={{
              letterSpacing: '.2em',
              textTransform: 'uppercase',
              color: '#6ee7b7',
            }}
          >
            STUDENT DASHBOARD
          </Typography>
          <Typography variant='h5' sx={{ mt: 1, color: '#e5e7eb', fontWeight: 600 }}>
            {name ? `Welcome back, ${name}.` : 'Welcome back.'}
          </Typography>
          <Typography variant='body2' sx={{ mt: 0.5, fontSize: 12, color: '#9ca3af' }}>
            Continue where you left off or review your recent quiz results.
          </Typography>
        </Box>
        <Button size='large'>Resume latest quiz</Button>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(15,23,42,0.95)' }}>
            <Typography variant='caption' sx={{ color: '#9ca3af' }}>
              Average score last 7 days
            </Typography>
            <Typography variant='h4' sx={{ mt: 1, color: '#6ee7b7', fontWeight: 600 }}>
              86%
            </Typography>
            <Typography
              variant='caption'
              sx={{
                mt: 0.5,
                display: 'inline-flex',
                alignItems: 'center',
                color: '#6ee7b7',
              }}
            >
              <TrendingUp className='mr-1 h-3 w-3' />
              +8% vs previous week
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(15,23,42,0.95)' }}>
            <Typography variant='caption' sx={{ color: '#9ca3af' }}>
              Quizzes completed
            </Typography>
            <Typography variant='h4' sx={{ mt: 1, color: '#e5e7eb', fontWeight: 600 }}>
              24
            </Typography>
            <Typography variant='caption' sx={{ mt: 0.5, color: '#9ca3af' }}>
              Across 4 lecture series
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(15,23,42,0.95)' }}>
            <Typography variant='caption' sx={{ color: '#9ca3af' }}>
              Time spent practising
            </Typography>
            <Typography variant='h4' sx={{ mt: 1, color: '#e5e7eb', fontWeight: 600 }}>
              3.4h
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <Clock className='h-3 w-3' color='#38bdf8' />
              <Typography variant='caption' sx={{ color: '#9ca3af' }}>
                This week
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(15,23,42,0.95)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant='subtitle2' sx={{ color: '#e5e7eb' }}>
                Lecture videos
              </Typography>
              <Button variant='text' size='small' sx={{ fontSize: 11, color: '#38bdf8' }}>
                View all
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: '#020617' }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography variant='body2' sx={{ color: '#e5e7eb', fontWeight: 500 }}>
                      Neural Networks – Week 3
                    </Typography>
                    <Typography variant='caption' sx={{ color: '#9ca3af' }}>
                      18 questions generated · 2 remaining
                    </Typography>
                  </Box>
                  <Button variant='outlined' size='small' sx={{ borderRadius: 999, fontSize: 11 }}>
                    <PlayCircle className='mr-1 h-4 w-4' color='#38bdf8' />
                    Quiz
                  </Button>
                </Box>
              </Paper>
              <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: '#020617' }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography variant='body2' sx={{ color: '#e5e7eb', fontWeight: 500 }}>
                      Gradient Descent – Recap
                    </Typography>
                    <Typography variant='caption' sx={{ color: '#9ca3af' }}>
                      12 questions generated · Completed
                    </Typography>
                  </Box>
                  <Button variant='outlined' size='small' sx={{ borderRadius: 999, fontSize: 11 }}>
                    Review
                  </Button>
                </Box>
              </Paper>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(15,23,42,0.95)' }}>
            <Typography variant='subtitle2' sx={{ color: '#e5e7eb' }}>
              Recent quiz history
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: '#020617' }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography variant='body2' sx={{ color: '#e5e7eb', fontWeight: 500 }}>
                      Backpropagation – Core concepts
                    </Typography>
                    <Typography variant='caption' sx={{ color: '#9ca3af' }}>
                      Score: 9 / 10 · Strong understanding
                    </Typography>
                  </Box>
                  <Chip
                    label='Mastered'
                    size='small'
                    sx={{
                      bgcolor: 'rgba(34,197,94,0.1)',
                      color: '#6ee7b7',
                      fontSize: 10,
                    }}
                  />
                </Box>
              </Paper>
              <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: '#020617' }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography variant='body2' sx={{ color: '#e5e7eb', fontWeight: 500 }}>
                      Regularisation techniques
                    </Typography>
                    <Typography variant='caption' sx={{ color: '#9ca3af' }}>
                      Score: 6 / 10 · Review suggested
                    </Typography>
                  </Box>
                  <Chip
                    label='Needs review'
                    size='small'
                    sx={{
                      bgcolor: 'rgba(248,113,113,0.12)',
                      color: '#fb7185',
                      fontSize: 10,
                    }}
                  />
                </Box>
              </Paper>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
