'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { MainNav } from '../components/layout/main-nav';
import { Button } from '../components/ui/button';
import {
  ArrowRight,
  Upload,
  AudioLines,
  Brain,
  FileQuestion,
  CheckCircle2,
  BarChart3,
  Shield,
  Zap,
  Users,
  BookOpen,
  GraduationCap,
  Target,
} from 'lucide-react';
import { MotionHero } from '../components/landing/motion-hero';
import { PipelineDemo } from '../components/landing/pipeline-demo';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedCard({ children, index }: { children: React.ReactNode; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
      style={{ height: '100%' }}
    >
      {children}
    </motion.div>
  );
}

const pipelineSteps = [
  {
    icon: Upload,
    num: '01',
    title: 'Upload lecture video',
    body: 'Upload MP4 from your LMS, Zoom recording, or local files. Supports lectures of any length.',
    detail: 'Drag & drop or URL import',
  },
  {
    icon: AudioLines,
    num: '02',
    title: 'AI transcription',
    body: 'OpenAI Whisper converts speech to text with high accuracy, even for technical terminology.',
    detail: 'Powered by Whisper large-v3',
  },
  {
    icon: Brain,
    num: '03',
    title: 'Concept extraction',
    body: 'Claude AI reads the transcript, identifies core concepts, and generates structured bullet-point summaries.',
    detail: 'Claude 3.5 Sonnet / GPT-4',
  },
  {
    icon: FileQuestion,
    num: '04',
    title: 'Quiz generation',
    body: 'AI produces concept-anchored multiple-choice questions with difficulty curves tailored to each student.',
    detail: 'Adaptive difficulty engine',
  },
];

const features = [
  {
    icon: Target,
    title: 'Concept-aware questions',
    body: 'Every question is anchored to a specific learning outcome extracted from the lecture.',
  },
  {
    icon: BarChart3,
    title: 'Difficulty curves',
    body: 'Quizzes start easy and ramp up based on prior performance data.',
  },
  {
    icon: Shield,
    title: 'Privacy-first',
    body: 'Student data stays encrypted and under institutional control.',
  },
  {
    icon: Zap,
    title: 'Real-time processing',
    body: 'Go from a 60-minute lecture to a ready quiz in under 5 minutes.',
  },
  {
    icon: BookOpen,
    title: 'LMS integration',
    body: 'Export quizzes to Canvas, Moodle, or share direct links.',
  },
  {
    icon: Users,
    title: 'Multi-role support',
    body: 'Separate dashboards for professors (manage) and students (learn).',
  },
];

const stats = [
  { value: '60 min', label: 'lecture processed' },
  { value: '< 5 min', label: 'to generate quiz' },
  { value: '95%+', label: 'transcription accuracy' },
  { value: '∞', label: 'adaptive variations' },
];

export default function LandingPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <MainNav />

      <Container maxWidth='lg' sx={{ pt: { xs: 6, md: 10 }, pb: 10 }}>
        {/* ─── HERO ─── */}
        <Grid
          container
          spacing={{ xs: 4, md: 6 }}
          alignItems='center'
          sx={{ mb: { xs: 8, md: 14 } }}
        >
          <Grid size={{ xs: 12, md: 7 }}>
            <MotionHero />
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.5 }}
            >
              <Box sx={{ display: 'flex', gap: 1.5, mt: 4 }}>
                <Button component={Link} href='/register' size='large'>
                  Get started free
                  <ArrowRight size={16} style={{ marginLeft: 6 }} />
                </Button>
                <Button component='a' href='#pipeline' variant='outlined' size='large'>
                  See how it works
                </Button>
              </Box>
            </motion.div>
          </Grid>

          {/* Hero right — animated architecture preview */}
          <Grid size={{ xs: 12, md: 5 }}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <Paper
                sx={{
                  p: 3,
                  border: 1,
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Typography
                  variant='overline'
                  sx={{ color: 'text.secondary', letterSpacing: 2, fontSize: 10 }}
                >
                  System Architecture
                </Typography>

                <Box sx={{ mt: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {[
                    { label: 'Frontend', tech: 'Next.js + React + MUI', color: '#3b82f6' },
                    { label: 'Backend', tech: 'Node.js + Express + Prisma', color: '#10b981' },
                    { label: 'AI Layer', tech: 'Whisper ASR + Claude LLM', color: '#8b5cf6' },
                    { label: 'Database', tech: 'PostgreSQL + Prisma ORM', color: '#f59e0b' },
                  ].map((layer, i) => (
                    <motion.div
                      key={layer.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + i * 0.12, duration: 0.4 }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          px: 2,
                          py: 1.5,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: layer.color,
                            flexShrink: 0,
                            boxShadow: `0 0 8px ${layer.color}40`,
                          }}
                        />
                        <Box>
                          <Typography
                            variant='body2'
                            component='div'
                            sx={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}
                          >
                            {layer.label}
                          </Typography>
                          <Typography
                            variant='body2'
                            component='div'
                            sx={(theme) => ({
                              fontSize: 11,
                              lineHeight: 1.3,
                              color: theme.palette.text.secondary,
                            })}
                          >
                            {layer.tech}
                          </Typography>
                        </Box>
                      </Box>
                    </motion.div>
                  ))}
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        {/* ─── STATS ─── */}
        <AnimatedSection>
          <Grid container spacing={2} sx={{ mb: { xs: 8, md: 12 } }}>
            {stats.map((s, i) => (
              <Grid key={s.label} size={{ xs: 6, md: 3 }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                >
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography
                      variant='h4'
                      sx={{ color: 'text.primary', fontWeight: 700, fontSize: { xs: 24, md: 32 } }}
                    >
                      {s.value}
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{ color: 'text.secondary', mt: 0.5, fontSize: 13 }}
                    >
                      {s.label}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </AnimatedSection>

        {/* ─── PIPELINE ─── */}
        <Box id='pipeline' sx={{ mb: { xs: 8, md: 14 } }}>
          <AnimatedSection>
            <Box sx={{ mb: 5 }}>
              <Typography variant='overline' sx={{ color: 'text.secondary', letterSpacing: 2 }}>
                How it works
              </Typography>
              <Typography variant='h4' sx={{ color: 'text.primary', mt: 0.5, maxWidth: 500 }}>
                The AI pipeline behind every quiz.
              </Typography>
              <Typography variant='body1' sx={{ color: 'text.secondary', mt: 1, maxWidth: 550 }}>
                Each lecture goes through four processing stages — fully automated, from raw video
                to student-ready assessment.
              </Typography>
            </Box>
          </AnimatedSection>

          <Grid container spacing={2}>
            {pipelineSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <Grid key={step.num} size={{ xs: 12, sm: 6, md: 3 }}>
                  <AnimatedCard index={i}>
                    <Paper
                      sx={{
                        p: 3,
                        height: '100%',
                        border: 1,
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                      }}
                    >
                      <Typography
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 16,
                          fontSize: 48,
                          fontWeight: 800,
                          color: 'divider',
                          lineHeight: 1,
                          userSelect: 'none',
                        }}
                      >
                        {step.num}
                      </Typography>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 2,
                          bgcolor: 'action.hover',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                        }}
                      >
                        <Icon size={18} />
                      </Box>
                      <Typography variant='subtitle2' sx={{ color: 'text.primary', mb: 0.5 }}>
                        {step.title}
                      </Typography>
                      <Typography
                        variant='body2'
                        sx={{ color: 'text.secondary', fontSize: 13, flex: 1 }}
                      >
                        {step.body}
                      </Typography>
                      <Chip
                        label={step.detail}
                        size='small'
                        sx={{
                          mt: 2,
                          alignSelf: 'flex-start',
                          height: 22,
                          fontSize: 10,
                          fontWeight: 500,
                          bgcolor: 'action.hover',
                          color: 'text.secondary',
                        }}
                      />
                    </Paper>
                  </AnimatedCard>
                </Grid>
              );
            })}
          </Grid>

          {/* Interactive pipeline demo */}
          <PipelineDemo />
        </Box>

        {/* ─── FEATURES ─── */}
        <Box id='features' sx={{ mb: { xs: 8, md: 14 } }}>
          <AnimatedSection>
            <Box sx={{ mb: 5 }}>
              <Typography variant='overline' sx={{ color: 'text.secondary', letterSpacing: 2 }}>
                Features
              </Typography>
              <Typography variant='h4' sx={{ color: 'text.primary', mt: 0.5, maxWidth: 500 }}>
                Everything you need, nothing you don't.
              </Typography>
            </Box>
          </AnimatedSection>

          <Grid container spacing={2}>
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <Grid key={f.title} size={{ xs: 12, sm: 6, md: 4 }}>
                  <AnimatedCard index={i}>
                    <Paper
                      sx={{
                        p: 3,
                        height: '100%',
                        border: 1,
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                      }}
                    >
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 2,
                          bgcolor: 'action.hover',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                        }}
                      >
                        <Icon size={18} />
                      </Box>
                      <Typography variant='subtitle2' sx={{ color: 'text.primary', mb: 0.5 }}>
                        {f.title}
                      </Typography>
                      <Typography variant='body2' sx={{ color: 'text.secondary', fontSize: 13 }}>
                        {f.body}
                      </Typography>
                    </Paper>
                  </AnimatedCard>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* ─── BENEFITS ─── */}
        <Box id='benefits' sx={{ mb: { xs: 8, md: 14 } }}>
          <AnimatedSection>
            <Box sx={{ mb: 5 }}>
              <Typography variant='overline' sx={{ color: 'text.secondary', letterSpacing: 2 }}>
                Who it's for
              </Typography>
              <Typography variant='h4' sx={{ color: 'text.primary', mt: 0.5 }}>
                Designed for both sides of the classroom.
              </Typography>
            </Box>
          </AnimatedSection>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <AnimatedCard index={0}>
                <Paper
                  sx={{
                    p: 3,
                    height: '100%',
                    border: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1.5,
                        bgcolor: 'action.hover',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <BookOpen size={16} />
                    </Box>
                    <Typography variant='subtitle1' sx={{ color: 'text.primary' }}>
                      For Professors
                    </Typography>
                  </Box>
                  <Typography variant='body2' sx={{ color: 'text.secondary', mb: 2 }}>
                    Turn every lecture into an assessment — automatically.
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {[
                      'Auto-generate quizzes after each lecture',
                      'Map questions to learning outcomes',
                      'See which concepts need reteaching',
                      'Export to LMS or share with one click',
                    ].map((item) => (
                      <Box key={item} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <CheckCircle2 size={14} style={{ marginTop: 3, flexShrink: 0 }} />
                        <Typography variant='body2' sx={{ color: 'text.secondary', fontSize: 13 }}>
                          {item}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </AnimatedCard>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <AnimatedCard index={1}>
                <Paper
                  sx={{
                    p: 3,
                    height: '100%',
                    border: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1.5,
                        bgcolor: 'action.hover',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <GraduationCap size={16} />
                    </Box>
                    <Typography variant='subtitle1' sx={{ color: 'text.primary' }}>
                      For Students
                    </Typography>
                  </Box>
                  <Typography variant='body2' sx={{ color: 'text.secondary', mb: 2 }}>
                    Practice that follows the lecture, not the textbook.
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {[
                      'Quiz on exactly what you just watched',
                      'Focus on weak spots with targeted retries',
                      'Track progress across lectures and weeks',
                      'Revisit tricky segments with timestamps',
                    ].map((item) => (
                      <Box key={item} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <CheckCircle2 size={14} style={{ marginTop: 3, flexShrink: 0 }} />
                        <Typography variant='body2' sx={{ color: 'text.secondary', fontSize: 13 }}>
                          {item}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </AnimatedCard>
            </Grid>
          </Grid>
        </Box>

        {/* ─── CTA ─── */}
        <AnimatedSection>
          <Paper
            sx={{
              p: { xs: 3, md: 5 },
              border: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { md: 'center' },
              gap: 3,
            }}
          >
            <Box>
              <Typography variant='h5' sx={{ color: 'text.primary' }}>
                Ready to transform your lectures?
              </Typography>
              <Typography variant='body1' sx={{ color: 'text.secondary', mt: 0.5 }}>
                Start with a single module. Measure concept mastery. Scale with confidence.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, flexShrink: 0 }}>
              <Button component={Link} href='/register' size='large'>
                Get started free
                <ArrowRight size={16} style={{ marginLeft: 6 }} />
              </Button>
              <Button component={Link} href='/dashboard/professor' variant='outlined' size='large'>
                Try demo
              </Button>
            </Box>
          </Paper>
        </AnimatedSection>

        {/* ─── FOOTER ─── */}
        <Box
          component='footer'
          sx={{
            mt: 8,
            pt: 3,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'text.secondary',
          }}
        >
          <Typography variant='caption' sx={{ color: 'text.secondary' }}>
            &copy; {new Date().getFullYear()} LectureQuiz AI
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link href='#' style={{ color: 'inherit', textDecoration: 'none', fontSize: 12 }}>
              Privacy
            </Link>
            <Link href='#' style={{ color: 'inherit', textDecoration: 'none', fontSize: 12 }}>
              Terms
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
