'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  Video,
  AudioLines,
  Brain,
  FileQuestion,
  CheckCircle2,
  Play,
  RotateCcw,
} from 'lucide-react';
import IconButton from '@mui/material/IconButton';

const STEP_DURATION = 5000;

const steps = [
  { Icon: Video, label: 'Upload', description: 'Professor uploads a 60-minute lecture video' },
  { Icon: AudioLines, label: 'Transcribe', description: 'Whisper converts speech to text in real-time' },
  { Icon: Brain, label: 'Analyze', description: 'AI identifies key concepts and learning outcomes' },
  { Icon: FileQuestion, label: 'Generate', description: 'Concept-anchored quiz questions are created' },
  { Icon: CheckCircle2, label: 'Ready', description: 'Adaptive quiz is ready for students' },
];

function UploadIllustration() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 2 }}>
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Box
          sx={{
            width: 64,
            height: 48,
            borderRadius: 2,
            bgcolor: 'action.hover',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Play size={20} />
        </Box>
      </motion.div>
      <Box sx={{ width: '80%', maxWidth: 240 }}>
        <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 4, ease: 'easeInOut' }}
            style={{ height: '100%', borderRadius: 6 }}
          >
            <Box sx={{ height: '100%', borderRadius: 3, bgcolor: 'secondary.main' }} />
          </motion.div>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
          <Typography variant='caption' sx={{ color: 'text.secondary', fontSize: 10 }}>
            lecture_09.mp4
          </Typography>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.5 }}
          >
            <Typography variant='caption' sx={{ color: 'text.secondary', fontSize: 10 }}>
              100%
            </Typography>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
}

function WaveBar({ i, total }: { i: number; total: number }) {
  const center = total / 2;
  const dist = Math.abs(i - center) / center;
  const maxH = 36;
  const minH = 6;
  const baseH = maxH - dist * (maxH - minH);

  return (
    <motion.div
      animate={{ height: [baseH * 0.3, baseH, baseH * 0.5, baseH * 0.9, baseH * 0.3] }}
      transition={{
        duration: 1.2,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: i * 0.06,
      }}
      style={{ width: 3, borderRadius: 2, originY: '50%' }}
    >
      <Box sx={{ width: '100%', height: '100%', borderRadius: 2, bgcolor: 'secondary.main', opacity: 0.7 + (1 - dist) * 0.3 }} />
    </motion.div>
  );
}

function TranscribeIllustration() {
  const barCount = 32;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '3px', height: 44 }}>
        {Array.from({ length: barCount }).map((_, i) => (
          <WaveBar key={i} i={i} total={barCount} />
        ))}
      </Box>
      <Box sx={{ width: '80%', maxWidth: 260 }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {[
              '"...and the key property of eigenvalues..."',
              '"...which leads us to the decomposition..."',
              '"...this is fundamental for PCA analysis..."',
            ].map((text, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + i * 1, duration: 0.4 }}
              >
                <Typography
                  variant='caption'
                  sx={{ color: 'text.secondary', fontSize: 10, fontStyle: 'italic', display: 'block' }}
                >
                  {text}
                </Typography>
              </motion.div>
            ))}
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
}

function AnalyzeIllustration() {
  const concepts = ['Eigenvalues', 'Matrix Decomposition', 'PCA', 'Linear Transforms', 'Covariance'];
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, py: 2 }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      >
        <Brain size={28} />
      </motion.div>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', maxWidth: 280 }}>
        {concepts.map((c, i) => (
          <motion.div
            key={c}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.6, type: 'spring', stiffness: 300 }}
          >
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 1.5,
                bgcolor: 'action.hover',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant='caption' sx={{ fontSize: 11, fontWeight: 500 }}>
                {c}
              </Typography>
            </Box>
          </motion.div>
        ))}
      </Box>
    </Box>
  );
}

function GenerateIllustration() {
  const questions = [
    'What is the primary purpose of eigenvalue decomposition?',
    'Which matrix property is essential for PCA?',
    'How does covariance relate to linear transforms?',
  ];
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, py: 1 }}>
      {questions.map((q, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20, rotateX: -15 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ delay: 0.4 + i * 0.8, duration: 0.5, ease: 'easeOut' }}
          style={{ width: '100%', maxWidth: 300 }}
        >
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.default',
            }}
          >
            <Typography variant='caption' sx={{ color: 'text.secondary', fontSize: 10, display: 'block', mb: 0.5 }}>
              Q{i + 1}
            </Typography>
            <Typography variant='body2' sx={{ fontSize: 11, lineHeight: 1.3 }}>
              {q}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
              {['A', 'B', 'C', 'D'].map((opt) => (
                <Box
                  key={opt}
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography sx={{ fontSize: 9, color: 'text.secondary' }}>{opt}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </motion.div>
      ))}
    </Box>
  );
}

function ReadyIllustration() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, py: 2 }}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: 'action.hover',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <motion.div
            initial={{ pathLength: 0 }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ delay: 0.5, duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <CheckCircle2 size={28} />
          </motion.div>
        </Box>
      </motion.div>
      {['3 quiz questions generated', '5 key concepts identified', 'Adaptive difficulty: enabled'].map(
        (text, i) => (
          <motion.div
            key={text}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.4, duration: 0.3 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CheckCircle2 size={12} />
              <Typography variant='caption' sx={{ fontSize: 11, color: 'text.secondary' }}>
                {text}
              </Typography>
            </Box>
          </motion.div>
        ),
      )}
    </Box>
  );
}

const illustrations = [
  UploadIllustration,
  TranscribeIllustration,
  AnalyzeIllustration,
  GenerateIllustration,
  ReadyIllustration,
];

export function PipelineDemo() {
  const [active, setActive] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const advance = useCallback(
    (step: number) => {
      if (step >= steps.length) {
        setPlaying(false);
        return;
      }
      setActive(step);
      timerRef.current = setTimeout(() => advance(step + 1), STEP_DURATION);
    },
    [],
  );

  const startDemo = useCallback(() => {
    clearTimer();
    setPlaying(true);
    advance(0);
  }, [advance, clearTimer]);

  const clickStep = useCallback(
    (i: number) => {
      clearTimer();
      setActive(i);
      setPlaying(true);
      timerRef.current = setTimeout(() => advance(i + 1), STEP_DURATION);
    },
    [advance, clearTimer],
  );

  useEffect(() => clearTimer, [clearTimer]);

  const ActiveIllustration = active >= 0 ? illustrations[active] : null;

  return (
    <Box
      sx={{
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        alignItems: 'center',
        mt: 4,
        gap: 0,
      }}
    >
      {/* Step nodes */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 3,
          py: 1.5,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          position: 'relative',
        }}
      >
        {steps.map((node, i) => (
          <Box key={node.label} sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              onClick={() => clickStep(i)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5,
                px: 2.5,
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <motion.div animate={active === i ? { scale: [1, 1.12, 1] } : { scale: 1 }} transition={{ duration: 0.6, repeat: active === i ? Infinity : 0, ease: 'easeInOut' }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: active === i ? 'secondary.main' : 'action.hover',
                    color: active === i ? 'secondary.contrastText' : 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.3s, color 0.3s',
                    border: '1px solid',
                    borderColor: active === i ? 'secondary.main' : 'divider',
                  }}
                >
                  <node.Icon size={22} />
                </Box>
              </motion.div>
              <Typography
                variant='body2'
                sx={{
                  fontSize: 11,
                  fontWeight: active === i ? 700 : 500,
                  color: active === i ? 'text.primary' : 'text.secondary',
                  transition: 'all 0.3s',
                }}
              >
                {node.label}
              </Typography>
            </Box>

            {i < steps.length - 1 && (
              <Box sx={{ display: 'flex', alignItems: 'center', px: 0.5 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 2,
                    borderRadius: 1,
                    bgcolor: i < active ? 'secondary.main' : 'divider',
                    transition: 'background-color 0.5s',
                  }}
                />
              </Box>
            )}
          </Box>
        ))}

        {active < 0 && (
          <IconButton
            onClick={startDemo}
            size='small'
            sx={{ ml: 2, border: '1px solid', borderColor: 'divider', width: 36, height: 36 }}
          >
            <Play size={16} />
          </IconButton>
        )}

        {active >= 0 && !playing && (
          <IconButton
            onClick={startDemo}
            size='small'
            sx={{ ml: 2, border: '1px solid', borderColor: 'divider', width: 36, height: 36 }}
          >
            <RotateCcw size={14} />
          </IconButton>
        )}
      </Box>

      {/* Illustration panel */}
      <AnimatePresence mode='wait'>
        {active >= 0 && ActiveIllustration && (
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            style={{ width: '100%', maxWidth: 420, overflow: 'hidden' }}
          >
            <Box
              sx={{
                mt: 2,
                p: 3,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                textAlign: 'center',
                minHeight: 160,
              }}
            >
              <Typography
                variant='body2'
                sx={{ fontWeight: 600, mb: 1.5, fontSize: 13 }}
              >
                {steps[active].description}
              </Typography>
              <ActiveIllustration />

              {/* Progress bar */}
              {playing && (
                <Box sx={{ mt: 2, height: 3, borderRadius: 2, bgcolor: 'action.hover', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: STEP_DURATION / 1000, ease: 'linear' }}
                    style={{ height: '100%' }}
                  >
                    <Box sx={{ height: '100%', bgcolor: 'secondary.main', borderRadius: 2, opacity: 0.6 }} />
                  </motion.div>
                </Box>
              )}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
