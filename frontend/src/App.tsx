import { CssBaseline, ThemeProvider, type PaletteMode } from "@mui/material";
import "./App.css";
import Router from "./router";
import { useMemo, useState } from "react";
import { buildTheme } from "./theme/factory";
import StorageStateContextProvider from "./context/StorageState";

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
      <StorageStateContextProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router />
        </ThemeProvider>
      </StorageStateContextProvider>
    </>
  );
}

export default App;
