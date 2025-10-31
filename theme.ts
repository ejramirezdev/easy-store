'use client';
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#0A0A0B', paper: '#0F0F12' },
    primary: { main: '#D81B9C' },     // magenta Easy Store
    secondary: { main: '#8A2BE2' },
    text: { primary: '#fff', secondary: '#c9c9d1' }
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'].join(','),
    h2: { fontWeight: 800, letterSpacing: -0.5 },
    button: { textTransform: 'none', fontWeight: 600 }
  },
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } }
  }
});