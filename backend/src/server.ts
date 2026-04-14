import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";
import path from "path";
import { mkdirSync } from "fs";
import { env } from "./config/env";
import { authRouter } from "./routes/authRoutes";
import { lectureRouter } from "./routes/lectureRoutes";
import { quizRouter } from "./routes/quizRoutes";

const app = express();

const uploadRoot = path.resolve(env.uploadDir);
mkdirSync(uploadRoot, { recursive: true });

app.use(
  cors({
    origin: env.frontendOrigin
  })
);
app.use(express.json());
app.use("/uploads", express.static(uploadRoot));

const uploadDir = path.join(process.cwd(), env.uploadDir);
fs.mkdirSync(uploadDir, { recursive: true });
app.use("/uploads", express.static(uploadDir));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/lectures", lectureRouter);
app.use("/quizzes", quizRouter);

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`LectureQuiz API listening on http://localhost:${env.port}`);
});

