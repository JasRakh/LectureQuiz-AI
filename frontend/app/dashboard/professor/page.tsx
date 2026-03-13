import { Button } from '../../../components/ui/button';
import { UploadCloud, BarChart3, Brain } from 'lucide-react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

export default function ProfessorDashboardPage() {
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
              color: '#a5b4fc',
            }}
          >
            PROFESSOR DASHBOARD
          </Typography>
          <Typography
            variant='h5'
            sx={{ mt: 1, color: '#e5e7eb', fontWeight: 600 }}
          >
            Good afternoon, Dr. Rivera.
          </Typography>
          <Typography
            variant='body2'
            sx={{ mt: 0.5, fontSize: 12, color: '#9ca3af' }}
          >
            Upload your next lecture and generate quizzes in minutes.
          </Typography>
        </Box>
        <Button size='large'>
          <UploadCloud className='mr-2 h-4 w-4' />
          Upload lecture
        </Button>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(15,23,42,0.95)' }}
          >
            <Typography variant='caption' sx={{ color: '#9ca3af' }}>
              Lectures processed
            </Typography>
            <Typography
              variant='h4'
              sx={{ mt: 1, color: '#e5e7eb', fontWeight: 600 }}
            >
              42
            </Typography>
            <Typography variant='caption' sx={{ mt: 0.5, color: '#9ca3af' }}>
              Across 3 courses this semester
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(15,23,42,0.95)' }}
          >
            <Typography variant='caption' sx={{ color: '#9ca3af' }}>
              Questions generated
            </Typography>
            <Typography
              variant='h4'
              sx={{ mt: 1, color: '#6ee7b7', fontWeight: 600 }}
            >
              680+
            </Typography>
            <Typography variant='caption' sx={{ mt: 0.5, color: '#9ca3af' }}>
              From long-form lecture videos
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(15,23,42,0.95)' }}
          >
            <Typography variant='caption' sx={{ color: '#9ca3af' }}>
              Concept mastery (cohort average)
            </Typography>
            <Typography
              variant='h4'
              sx={{ mt: 1, color: '#38bdf8', fontWeight: 600 }}
            >
              73%
            </Typography>
            <Typography variant='caption' sx={{ mt: 0.5, color: '#9ca3af' }}>
              Focus on &quot;Regularisation&quot; and &quot;Optimisers&quot;
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(15,23,42,0.95)' }}
          >
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}
            >
              <Typography variant='subtitle2' sx={{ color: '#e5e7eb' }}>
                Recent lectures
              </Typography>
              <Button
                variant='text'
                size='small'
                sx={{ fontSize: 11, color: '#38bdf8' }}
              >
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
                    <Typography
                      variant='body2'
                      sx={{ color: '#e5e7eb', fontWeight: 500 }}
                    >
                      Convolutional Neural Networks – Week 5
                    </Typography>
                    <Typography variant='caption' sx={{ color: '#9ca3af' }}>
                      24 questions generated · 126 student attempts
                    </Typography>
                  </Box>
                  <Button
                    variant='outlined'
                    size='small'
                    sx={{ borderRadius: 999, fontSize: 11 }}
                  >
                    Manage quiz
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
                    <Typography
                      variant='body2'
                      sx={{ color: '#e5e7eb', fontWeight: 500 }}
                    >
                      Optimisation – Advanced topics
                    </Typography>
                    <Typography variant='caption' sx={{ color: '#9ca3af' }}>
                      18 questions generated · 89 student attempts
                    </Typography>
                  </Box>
                  <Button
                    variant='outlined'
                    size='small'
                    sx={{ borderRadius: 999, fontSize: 11 }}
                  >
                    Manage quiz
                  </Button>
                </Box>
              </Paper>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(15,23,42,0.95)' }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant='subtitle2' sx={{ color: '#e5e7eb' }}>
                Concept analytics
              </Typography>
              <BarChart3 className='h-4 w-4' color='#38bdf8' />
            </Box>
            <Typography
              variant='body2'
              sx={{ mt: 1.5, fontSize: 12, color: '#9ca3af' }}
            >
              This area will visualise which lecture segments lead to the most
              student mistakes and where additional explanation is needed.
            </Typography>

            <Box
              sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant='caption' sx={{ color: '#e5e7eb' }}>
                  Regularisation
                </Typography>
                <Chip
                  label='58% correct'
                  size='small'
                  sx={{
                    bgcolor: 'rgba(248,113,113,0.12)',
                    color: '#fb7185',
                    fontSize: 10,
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant='caption' sx={{ color: '#e5e7eb' }}>
                  Learning rate schedules
                </Typography>
                <Chip
                  label='69% correct'
                  size='small'
                  sx={{
                    bgcolor: 'rgba(251,191,36,0.12)',
                    color: '#fbbf24',
                    fontSize: 10,
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant='caption' sx={{ color: '#e5e7eb' }}>
                  Backpropagation basics
                </Typography>
                <Chip
                  label='91% correct'
                  size='small'
                  sx={{
                    bgcolor: 'rgba(34,197,94,0.12)',
                    color: '#4ade80',
                    fontSize: 10,
                  }}
                />
              </Box>
            </Box>

            <Box
              sx={{
                mt: 2.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                borderRadius: 2,
                bgcolor: '#020617',
                p: 1.5,
              }}
            >
              <Brain className='h-4 w-4' color='#818cf8' />
              <Typography variant='caption' sx={{ color: '#9ca3af' }}>
                In production, these insights will be powered by AI models that
                align each question to concepts detected from Whisper
                transcripts.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
