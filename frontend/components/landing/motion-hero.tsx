'use client';

import { motion } from 'framer-motion';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import {
  Video,
  AudioLines,
  Brain,
  FileQuestion,
  ArrowRight,
} from 'lucide-react';

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
});

const pipelineNodes = [
  { icon: Video, label: 'Lecture Video', sub: 'MP4 / Zoom / LMS' },
  { icon: AudioLines, label: 'Whisper ASR', sub: 'Speech → Text' },
  { icon: Brain, label: 'AI Analysis', sub: 'OpenAI GPT' },
  { icon: FileQuestion, label: 'Adaptive Quiz', sub: 'Personalized MCQs' },
];

const techStack = [
  'OpenAI Whisper',
  'OpenAI GPT',
  'Next.js',
  'Prisma',
  'TypeScript',
  'PostgreSQL',
];

export const MotionHero = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Badge */}
      <motion.div {...fadeUp(0)}>
        <Chip
          label='AI-Powered Education Platform'
          size='small'
          variant='outlined'
          sx={{
            borderColor: 'divider',
            color: 'text.secondary',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: 0.5,
          }}
        />
      </motion.div>

      {/* Headline */}
      <motion.div {...fadeUp(0.1)}>
        <Typography
          variant='h3'
          sx={{
            color: 'text.primary',
            fontSize: { xs: 34, sm: 42, md: 52 },
            lineHeight: 1.08,
            maxWidth: 620,
          }}
        >
          From lecture to quiz
          <br />
          <Box component='span' sx={{ color: 'secondary.main' }}>
            in minutes, not hours
          </Box>
        </Typography>
      </motion.div>

      {/* Subtitle */}
      <motion.div {...fadeUp(0.2)}>
        <Typography
          variant='body1'
          sx={{
            color: 'text.secondary',
            maxWidth: 520,
            lineHeight: 1.7,
            fontSize: { xs: 15, md: 16 },
          }}
        >
          Upload any lecture video. Our AI pipeline transcribes speech with
          OpenAI Whisper, extracts key concepts, and generates adaptive
          multiple-choice quizzes — tailored to each student's level.
        </Typography>
      </motion.div>

      {/* Pipeline Diagram */}
      <motion.div {...fadeUp(0.35)}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 0.5, sm: 1 },
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
            mt: 1,
          }}
        >
          {pipelineNodes.map((node, i) => {
            const Icon = node.icon;
            return (
              <Box key={node.label} sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.15, duration: 0.4, ease: 'easeOut' }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      px: { xs: 1, sm: 1.5 },
                      py: 1,
                      borderRadius: 2,
                      border: 1,
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                      minWidth: { xs: 'auto', sm: 120 },
                    }}
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 1.5,
                        bgcolor: 'action.hover',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={14} />
                    </Box>
                    <Box sx={{ display: { xs: 'none', sm: 'block' }, minWidth: 0 }}>
                      <Typography
                        variant='caption'
                        sx={{ color: 'text.primary', fontWeight: 600, fontSize: 11, display: 'block', lineHeight: 1.2 }}
                      >
                        {node.label}
                      </Typography>
                      <Typography
                        variant='caption'
                        sx={{ color: 'text.secondary', fontSize: 10, display: 'block', lineHeight: 1.2 }}
                      >
                        {node.sub}
                      </Typography>
                    </Box>
                  </Box>
                </motion.div>

                {i < pipelineNodes.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.65 + i * 0.15, duration: 0.3 }}
                  >
                    <ArrowRight size={14} style={{ color: 'var(--mui-palette-text-secondary, #999)', flexShrink: 0 }} />
                  </motion.div>
                )}
              </Box>
            );
          })}
        </Box>
      </motion.div>

      {/* Tech Stack */}
      <motion.div {...fadeUp(0.5)}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant='caption' sx={{ color: 'text.secondary', mr: 0.5, fontSize: 11 }}>
            Built with
          </Typography>
          {techStack.map((tech, i) => (
            <motion.div
              key={tech}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.07, duration: 0.3 }}
            >
              <Chip
                label={tech}
                size='small'
                sx={{
                  height: 24,
                  fontSize: 11,
                  fontWeight: 500,
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                  color: 'text.secondary',
                }}
              />
            </motion.div>
          ))}
        </Box>
      </motion.div>
    </Box>
  );
};
