import { createTheme, type PaletteMode } from "@mui/material";

export function buildTheme(mode: PaletteMode, accent: string) {
  return createTheme({
    palette: {
      mode,
      primary: { main: accent },
      background: {
        default: mode === "dark" ? "#0e0e11" : "#f5f5f7",
        paper: mode === "dark" ? "#18181c" : "#ffffff",
      },
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      h4: { fontWeight: 700, letterSpacing: "-0.5px" },
      body2: { fontSize: "0.8rem" },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
          * { box-sizing: border-box; }
        `,
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
    },
  });
}
