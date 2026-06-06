import { CssBaseline, ThemeProvider, type PaletteMode } from "@mui/material";
import "./App.css";
import Router from "./router";
import { useMemo, useState } from "react";
import { buildTheme } from "./theme/factory";

function App() {
  const defaultMode = "dark";
  const accentColor = "#7c6af7";
  const [mode] = useState<PaletteMode>(defaultMode);
  const theme = useMemo(
    () => buildTheme(mode, accentColor),
    [mode, accentColor],
  );
  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router />
      </ThemeProvider>
    </>
  );
}

export default App;
