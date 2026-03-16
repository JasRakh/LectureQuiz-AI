import { MainNav } from '../components/layout/main-nav';
import { Button } from '../components/ui/button';
import { ArrowRight, PlayCircle, Sparkles, Video, Workflow } from 'lucide-react';
import { MotionHero } from '../components/landing/motion-hero';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export default function LandingPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top,rgba(37,99,235,0.4),#020617 55%)',
      }}
    >
      <MainNav />

      <Container
        maxWidth='lg'
        sx={{ pt: 6, pb: 8, display: 'flex', flexDirection: 'column', gap: 8 }}
      >
        <Grid container spacing={4} alignItems='center'>
          <Grid size={{ xs: 12, md: 7 }}>
            <MotionHero />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper
              sx={{
                position: 'relative',
                p: 3,
                borderRadius: 3,
                bgcolor: 'rgba(15,23,42,0.96)',
                border: '1px solid rgba(148,163,184,0.3)',
              }}
              elevation={10}
            >
              <Typography
                variant='caption'
                sx={{
                  textTransform: 'uppercase',
                  letterSpacing: '.2em',
                  color: '#a5b4fc',
                }}
              >
                LIVE PREVIEW
              </Typography>
              <Typography variant='body2' sx={{ mt: 1, fontSize: 12, color: '#9ca3af' }}>
                Watch LectureQuiz AI turn a 60-minute lecture into an adaptive quiz in seconds.
              </Typography>

              <Box
                sx={{
                  mt: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.2,
                  fontSize: 12,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    borderRadius: 999,
                    bgcolor: '#020617',
                    px: 1.5,
                    py: 1,
                  }}
                >
                  <Video className='h-4 w-4' color='#38bdf8' />
                  <Typography variant='caption' sx={{ color: '#e5e7eb' }}>
                    Upload lecture video
                  </Typography>
                  <Typography
                    variant='caption'
                    sx={{
                      ml: 'auto',
                      fontSize: 10,
                      color: '#6b7280',
                      letterSpacing: '.2em',
                    }}
                  >
                    STEP 01
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    borderRadius: 999,
                    bgcolor: '#020617',
                    px: 1.5,
                    py: 1,
                  }}
                >
                  <Workflow className='h-4 w-4' color='#22c55e' />
                  <Typography variant='caption' sx={{ color: '#e5e7eb' }}>
                    AI analyses concepts & topics
                  </Typography>
                  <Typography
                    variant='caption'
                    sx={{
                      ml: 'auto',
                      fontSize: 10,
                      color: '#6b7280',
                      letterSpacing: '.2em',
                    }}
                  >
                    STEP 02
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    borderRadius: 999,
                    bgcolor: '#020617',
                    px: 1.5,
                    py: 1,
                  }}
                >
                  <Sparkles className='h-4 w-4' color='#a855f7' />
                  <Typography variant='caption' sx={{ color: '#e5e7eb' }}>
                    Personalised quiz for every student
                  </Typography>
                  <Typography
                    variant='caption'
                    sx={{
                      ml: 'auto',
                      fontSize: 10,
                      color: '#6b7280',
                      letterSpacing: '.2em',
                    }}
                  >
                    STEP 03
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  mt: 3,
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 1.5,
                }}
              >
                <Button component='a' href='/register' size='large' sx={{ flex: 1 }}>
                  Get started free
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Button>
                <Button component='a' href='#demo' variant='outlined' size='large' sx={{ flex: 1 }}>
                  <PlayCircle className='mr-2 h-5 w-5' color='#38bdf8' />
                  Watch interactive demo
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <section id='how-it-works' className='space-y-6'>
          <div className='flex items-center justify-between gap-4'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-sky-300'>
                HOW IT WORKS
              </p>
              <h2 className='mt-2 text-xl font-semibold text-slate-50 md:text-2xl'>
                From lecture video to adaptive quiz in three steps.
              </h2>
            </div>
          </div>

          <div className='grid gap-5 md:grid-cols-3'>
            {[
              {
                step: '01',
                title: 'Ingest lecture video',
                body: 'Upload from your LMS, Zoom, or local files. We normalise audio and prepare it for transcription.',
              },
              {
                step: '02',
                title: 'Transcribe & understand',
                body: 'Whisper converts speech into text while NLP models map key concepts, definitions, and relationships.',
              },
              {
                step: '03',
                title: 'Generate adaptive quiz',
                body: 'GPT / T5 generate concept-anchored questions tuned to student proficiency and learning goals.',
              },
            ].map((item) => (
              <div key={item.step} className='glass-panel relative overflow-hidden p-5'>
                <div className='pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/15 via-transparent to-emerald-500/10' />
                <div className='relative'>
                  <p className='text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400'>
                    STEP {item.step}
                  </p>
                  <h3 className='mt-2 text-sm font-semibold text-slate-50'>{item.title}</h3>
                  <p className='mt-2 text-xs text-slate-400'>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id='features' className='space-y-6'>
          <div className='flex flex-col gap-3 md:flex-row md:items-end md:justify-between'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300'>
                PLATFORM FEATURES
              </p>
              <h2 className='mt-2 text-xl font-semibold text-slate-50 md:text-2xl'>
                Built for real lecture workflows, not generic quizzes.
              </h2>
            </div>
          </div>

          <div className='grid gap-5 md:grid-cols-3'>
            <div className='glass-panel p-5'>
              <h3 className='text-sm font-semibold text-slate-50'>
                Concept-aware question generation
              </h3>
              <p className='mt-2 text-xs text-slate-400'>
                Questions are anchored to core concepts, not random sentences. Every item knows
                exactly which learning outcome it targets.
              </p>
            </div>
            <div className='glass-panel p-5'>
              <h3 className='text-sm font-semibold text-slate-50'>Difficulty-curved quizzes</h3>
              <p className='mt-2 text-xs text-slate-400'>
                Start with warm-up questions, then ramp up to deeper application and synthesis using
                prior performance data.
              </p>
            </div>
            <div className='glass-panel p-5'>
              <h3 className='text-sm font-semibold text-slate-50'>LMS-friendly & privacy-first</h3>
              <p className='mt-2 text-xs text-slate-400'>
                Designed to plug into existing LMS workflows and keep student data encrypted and
                under institutional control.
              </p>
            </div>
          </div>
        </section>

        <section id='benefits' className='grid gap-6 md:grid-cols-2'>
          <div className='glass-panel p-6'>
            <p className='text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300'>
              FOR PROFESSORS
            </p>
            <h3 className='mt-2 text-lg font-semibold text-slate-50'>
              Turn lectures into assessments without extra prep time.
            </h3>
            <ul className='mt-4 space-y-2 text-xs text-slate-300'>
              <li>• Auto-generate quizzes minutes after each lecture.</li>
              <li>• Map questions to learning outcomes and modules.</li>
              <li>• See which concepts need reteaching at a glance.</li>
              <li>• Export to LMS or share links with one click.</li>
            </ul>
          </div>

          <div className='glass-panel p-6'>
            <p className='text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300'>
              FOR STUDENTS
            </p>
            <h3 className='mt-2 text-lg font-semibold text-slate-50'>
              Adaptive practice that follows the lecture, not the textbook.
            </h3>
            <ul className='mt-4 space-y-2 text-xs text-slate-300'>
              <li>• Quiz directly on what you just watched.</li>
              <li>• Focus on weak spots with targeted retries.</li>
              <li>• Track progress across lectures and weeks.</li>
              <li>• Revisit tricky segments with time-stamped links.</li>
            </ul>
          </div>
        </section>

        <section
          id='demo'
          className='glass-panel flex flex-col gap-6 p-6 md:flex-row md:items-center'
        >
          <div className='flex-1 space-y-3'>
            <p className='text-xs font-semibold uppercase tracking-[0.2em] text-sky-300'>
              INTERACTIVE DEMO
            </p>
            <h3 className='text-lg font-semibold text-slate-50'>
              Experience the professor and student dashboards.
            </h3>
            <p className='text-xs text-slate-300'>
              Explore how LectureQuiz AI visualises lecture coverage, question quality, and student
              performance with live dashboards.
            </p>
            <div className='flex flex-wrap gap-3 text-xs'>
              <Button>
                <Link href='/dashboard/professor'>Professor dashboard</Link>
              </Button>
              <Button className='border-border/70'>
                <Link href='/dashboard/student'>Student dashboard</Link>
              </Button>
            </div>
          </div>
          <div className='flex-1 rounded-2xl border border-border/70 bg-slate-950/70 p-4 text-xs text-slate-300'>
            <p className='font-medium text-slate-100'>
              This is where a real product demo or embedded video would live.
            </p>
            <p className='mt-2'>
              In production, this surface can showcase AI-generated quiz flows: upload a short
              lecture sample, watch Whisper transcribe it, then preview generated questions live.
            </p>
          </div>
        </section>

        <section className='glass-panel flex flex-col items-center justify-between gap-4 p-6 text-center md:flex-row md:text-left'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300'>
              READY TO TRY
            </p>
            <h3 className='mt-2 text-lg font-semibold text-slate-50'>
              Pilot LectureQuiz AI with your next course.
            </h3>
            <p className='mt-2 text-xs text-slate-300'>
              Start with a single module, measure concept mastery, and scale to your entire program
              with confidence.
            </p>
          </div>
          <div className='flex flex-col gap-2 text-xs md:flex-row'>
            <Button className='text-sm'>
              <Link href='/register'>Create educator account</Link>
            </Button>
            <Button className='border border-border/70 bg-slate-900/70 text-sm'>
              <a href='#demo'>View live demo</a>
            </Button>
          </div>
        </section>

        <footer className='flex flex-col items-center justify-between gap-3 text-[11px] text-slate-500 md:flex-row'>
          <p>© {new Date().getFullYear()} LectureQuiz AI. All rights reserved.</p>
          <div className='flex gap-4'>
            <a href='#' className='hover:text-slate-300'>
              Privacy
            </a>
            <a href='#' className='hover:text-slate-300'>
              Terms
            </a>
          </div>
        </footer>
      </Container>
    </Box>
  );
}
