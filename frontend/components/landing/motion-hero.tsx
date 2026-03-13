"use client";

import { motion } from "framer-motion";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";

export const MotionHero = () => {
  return (
    <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: 2.5 }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Chip
          label="Quizzes that actually follow the lecture."
          size="small"
          sx={{
            bgcolor: "rgba(15,23,42,0.95)",
            borderRadius: 999,
            border: "1px solid rgba(129,140,248,0.6)",
            color: "rgba(226,232,240,0.9)",
            fontSize: 11,
            px: 1.5,
            boxShadow: "0 0 0 1px rgba(148,163,184,0.35)"
          }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.7 }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: 600,
            lineHeight: 1.1,
            color: "#e5e7eb",
            fontSize: { xs: 28, md: 34 }
          }}
        >
          Turn lecture videos into{" "}
          <Box
            component="span"
            sx={{
              background:
                "linear-gradient(90deg,#a5b4fc,#38bdf8,#4ade80)",
              WebkitBackgroundClip: "text",
              color: "transparent"
            }}
          >
            adaptive quizzes
          </Box>{" "}
          in minutes.
        </Typography>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.7 }}
      >
        <Typography
          variant="body2"
          sx={{
            maxWidth: 520,
            color: "rgba(148,163,184,0.95)"
          }}
        >
          LectureQuiz AI listens to your lectures, understands the concepts, and
          generates concept-aligned quizzes for every cohort. No more manual
          question writing. No more generic test banks.
        </Typography>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.7 }}
      >
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2, fontSize: 11 }}>
          <Chip
            label="Powered by Whisper + GPT / T5"
            variant="outlined"
            size="small"
            sx={{ borderRadius: 999, borderColor: "rgba(30,64,175,0.7)", color: "#e5e7eb" }}
          />
          <Chip
            label="Designed for professors & students"
            variant="outlined"
            size="small"
            sx={{ borderRadius: 999, borderColor: "rgba(15,118,110,0.7)", color: "#e5e7eb" }}
          />
          <Chip
            label="Works with long-form lectures"
            variant="outlined"
            size="small"
            sx={{ borderRadius: 999, borderColor: "rgba(59,130,246,0.7)", color: "#e5e7eb" }}
          />
        </Box>
      </motion.div>
    </Box>
  );
};

