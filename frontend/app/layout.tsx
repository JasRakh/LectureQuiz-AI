import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { AppThemeProvider } from "../components/providers/app-theme-provider";

export const metadata: Metadata = {
  title: "LectureQuiz AI",
  description:
    "Turn lecture videos into adaptive quizzes powered by AI."
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppThemeProvider>{children}</AppThemeProvider>
      </body>
    </html>
  );
}

