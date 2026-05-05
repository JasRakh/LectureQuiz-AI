import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { authRouter } from "./routes/authRoutes";
import { courseRouter } from "./routes/courseRoutes";
import { lectureRouter } from "./routes/lectureRoutes";
import { quizRouter } from "./routes/quizRoutes";
import { notificationRouter } from "./routes/notificationRoutes";

const app = express();

const uploadDir = path.resolve(env.uploadDir);
fs.mkdirSync(uploadDir, { recursive: true });

app.use(
  cors({
    origin: env.frontendOrigin,
  }),
);
app.use(express.json());
app.use("/uploads", express.static(uploadDir));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/courses", courseRouter);
app.use("/lectures", lectureRouter);
app.use("/quizzes", quizRouter);
app.use("/notifications", notificationRouter);

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`LectureQuiz API listening on http://localhost:${env.port}`);
});
