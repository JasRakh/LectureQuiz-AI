import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#020617',
      paper: '#020617',
    },
    primary: {
      main: '#4f46e5',
    },
    secondary: {
      main: '#06b6d4',
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Roboto", sans-serif',
  },
});
