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

        {/* HOW IT WORKS */}
        <Box id="how-it-works" sx={{ mt: 8 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Box>
              <Typography
                variant="caption"
                sx={{
                  letterSpacing: ".2em",
                  textTransform: "uppercase",
                  color: "#7dd3fc"
                }}
              >
                HOW IT WORKS
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  mt: 1,
                  color: "#e5e7eb",
                  fontWeight: 600,
                  fontSize: { xs: 18, md: 22 }
                }}
              >
                From lecture video to adaptive quiz in three steps.
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2.5}>
            {[
              {
                step: "01",
                title: "Ingest lecture video",
                body: "Upload from your LMS, Zoom, or local files. We normalise audio and prepare it for transcription."
              },
              {
                step: "02",
                title: "Transcribe & understand",
                body: "Whisper converts speech into text while NLP models map key concepts, definitions, and relationships."
              },
              {
                step: "03",
                title: "Generate adaptive quiz",
                body: "GPT / T5 generate concept-anchored questions tuned to student proficiency and learning goals."
              }
            ].map((item, idx) => (
              <Grid key={item.step} size={{ xs: 12, md: 4 }}>
                <Paper
                  elevation={10}
                  sx={{
                    position: "relative",
                    p: 2.5,
                    borderRadius: 3,
                    overflow: "hidden",
                    bgcolor: "rgba(15,23,42,0.96)",
                    border: "1px solid rgba(148,163,184,0.35)",
                    transform: "translateY(0px)",
                    transition: "transform 180ms ease-out, box-shadow 180ms ease-out",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 18px 50px rgba(15,23,42,0.9)"
                    }
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "radial-gradient(circle at top,rgba(56,189,248,0.25),transparent 60%)",
                      opacity: 0.4,
                      pointerEvents: "none"
                    }}
                  />
                  <Box sx={{ position: "relative" }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: 10,
                        letterSpacing: ".3em",
                        textTransform: "uppercase",
                        color: "#9ca3af"
                      }}
                    >
                      STEP {item.step}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      sx={{ mt: 1, color: "#e5e7eb", fontWeight: 600 }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ mt: 1, fontSize: 12, color: "#9ca3af" }}
                    >
                      {item.body}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* FEATURES */}
        <Box id="features" sx={{ mt: 10 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              gap: 2,
              mb: 3
            }}
          >
            <Box>
              <Typography
                variant="caption"
                sx={{
                  letterSpacing: ".2em",
                  textTransform: "uppercase",
                  color: "#a5b4fc"
                }}
              >
                PLATFORM FEATURES
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  mt: 1,
                  color: "#e5e7eb",
                  fontWeight: 600,
                  fontSize: { xs: 18, md: 22 }
                }}
              >
                Built for real lecture workflows, not generic quizzes.
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2.5}>
            {[
              {
                title: "Concept-aware question generation",
                body: "Questions are anchored to core concepts, not random sentences. Every item knows exactly which learning outcome it targets."
              },
              {
                title: "Difficulty-curved quizzes",
                body: "Start with warm-up questions, then ramp up to deeper application and synthesis using prior performance data."
              },
              {
                title: "LMS-friendly & privacy-first",
                body: "Designed to plug into existing LMS workflows and keep student data encrypted and under institutional control."
              }
            ].map((item, idx) => (
              <Grid key={item.title} size={{ xs: 12, md: 4 }}>
                <Paper
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    bgcolor: "rgba(15,23,42,0.96)",
                    border: "1px solid rgba(148,163,184,0.35)",
                    height: "100%"
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ color: "#e5e7eb", fontWeight: 600 }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mt: 1, fontSize: 12, color: "#9ca3af" }}
                  >
                    {item.body}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* BENEFITS */}
        <Grid
          id="benefits"
          container
          spacing={2.5}
          sx={{ mt: 10 }}
        >
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: "rgba(15,23,42,0.96)",
                border: "1px solid rgba(129,140,248,0.45)"
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  letterSpacing: ".2em",
                  textTransform: "uppercase",
                  color: "#a5b4fc"
                }}
              >
                FOR PROFESSORS
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{ mt: 1, color: "#e5e7eb", fontWeight: 600 }}
              >
                Turn lectures into assessments without extra prep time.
              </Typography>
              <Box
                component="ul"
                sx={{
                  mt: 2,
                  pl: 2,
                  fontSize: 12,
                  color: "#cbd5f5",
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5
                }}
              >
                <li>Auto-generate quizzes minutes after each lecture.</li>
                <li>Map questions to learning outcomes and modules.</li>
                <li>See which concepts need reteaching at a glance.</li>
                <li>Export to LMS or share links with one click.</li>
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: "rgba(15,23,42,0.96)",
                border: "1px solid rgba(52,211,153,0.55)"
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  letterSpacing: ".2em",
                  textTransform: "uppercase",
                  color: "#6ee7b7"
                }}
              >
                FOR STUDENTS
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{ mt: 1, color: "#e5e7eb", fontWeight: 600 }}
              >
                Adaptive practice that follows the lecture, not the textbook.
              </Typography>
              <Box
                component="ul"
                sx={{
                  mt: 2,
                  pl: 2,
                  fontSize: 12,
                  color: "#cbd5f5",
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5
                }}
              >
                <li>Quiz directly on what you just watched.</li>
                <li>Focus on weak spots with targeted retries.</li>
                <li>Track progress across lectures and weeks.</li>
                <li>Revisit tricky segments with time-stamped links.</li>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* DEMO */}
        <Paper
          id="demo"
          sx={{
            mt: 10,
            p: 3,
            borderRadius: 3,
            bgcolor: "rgba(15,23,42,0.96)",
            border: "1px solid rgba(148,163,184,0.35)",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2.5
          }}
        >
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Typography
              variant="caption"
              sx={{
                letterSpacing: ".2em",
                textTransform: "uppercase",
                color: "#7dd3fc"
              }}
            >
              INTERACTIVE DEMO
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ color: "#e5e7eb", fontWeight: 600 }}
            >
              Experience the professor and student dashboards.
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontSize: 12, color: "#9ca3af" }}
            >
              Explore how LectureQuiz AI visualises lecture coverage, question quality, and student
              performance with live dashboards.
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 1 }}>
              <Button
                component={Link}
                href="/dashboard/professor"
                size="small"
              >
                Professor dashboard
              </Button>
              <Button
                component={Link}
                href="/dashboard/student"
                size="small"
                variant="outlined"
              >
                Student dashboard
              </Button>
            </Box>
          </Box>
          <Box
            sx={{
              flex: 1,
              borderRadius: 3,
              border: "1px solid rgba(148,163,184,0.4)",
              bgcolor: "#020617",
              p: 2,
              fontSize: 12,
              color: "#9ca3af"
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ color: "#e5e7eb", fontWeight: 500 }}
            >
              This is where a real product demo or embedded video would live.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1.5, fontSize: 12 }}>
              In production, this surface can showcase AI-generated quiz flows: upload a short
              lecture sample, watch Whisper transcribe it, then preview generated questions live.
            </Typography>
          </Box>
        </Paper>

        {/* CTA + FOOTER */}
        <Paper
          sx={{
            mt: 10,
            p: 3,
            borderRadius: 3,
            bgcolor: "rgba(15,23,42,0.96)",
            border: "1px solid rgba(148,163,184,0.35)",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            gap: 2
          }}
        >
          <Box>
            <Typography
              variant="caption"
              sx={{
                letterSpacing: ".2em",
                textTransform: "uppercase",
                color: "#a5b4fc"
              }}
            >
              READY TO TRY
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ mt: 1, color: "#e5e7eb", fontWeight: 600 }}
            >
              Pilot LectureQuiz AI with your next course.
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 1, fontSize: 12, color: "#9ca3af" }}
            >
              Start with a single module, measure concept mastery, and scale to your entire program
              with confidence.
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 1.5
            }}
          >
            <Button
              component={Link}
              href="/register"
              size="large"
            >
              Create educator account
            </Button>
            <Button
              component="a"
              href="#demo"
              size="large"
              variant="outlined"
            >
              View live demo
            </Button>
          </Box>
        </Paper>

        <Box
          component="footer"
          sx={{
            mt: 4,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 11,
            color: "#6b7280",
            gap: 1.5
          }}
        >
          <Typography variant="caption">
            © {new Date().getFullYear()} LectureQuiz AI. All rights reserved.
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Link href="#" style={{ color: "inherit", textDecoration: "none" }}>
              Privacy
            </Link>
            <Link href="#" style={{ color: "inherit", textDecoration: "none" }}>
              Terms
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
