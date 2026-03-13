import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { authRouter } from "./routes/authRoutes";
import { lectureRouter } from "./routes/lectureRoutes";
import { quizRouter } from "./routes/quizRoutes";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000"
  })
);
app.use(express.json());

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

