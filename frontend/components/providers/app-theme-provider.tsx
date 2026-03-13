"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "../../lib/theme";
import { Toaster } from "../ui/toaster";

export function AppThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
      <Toaster />
    </ThemeProvider>
  );
}

