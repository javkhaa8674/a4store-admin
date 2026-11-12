// src/theme/useTableTheme.js
import { useMemo } from "react";
import { useColorScheme, createTheme } from "@mui/material/styles";

/**
 * MRT болон хүснэгтэд зориулсан theme үүсгэх hook.
 * useColorScheme-ээр горимыг тодорхойлж, "system" үед systemMode-ийг ашиглана.
 */
export const useTableTheme = () => {
  const { mode, systemMode } = useColorScheme();

  const paletteMode = (mode === "system" ? systemMode : mode) || "light";

  return useMemo(
    () =>
      createTheme({
        palette: {
          mode: paletteMode,
          info: { main: "rgb(255,122,0)" },
          background: {
            default: paletteMode === "light" ? "rgb(254,255,244)" : "#000",
          },
        },
        typography: { button: { textTransform: "none", fontSize: "1.2rem" } },
        components: {
          MuiTooltip: { styleOverrides: { tooltip: { fontSize: "1.1rem" } } },
          MuiSwitch: { styleOverrides: { thumb: { color: "pink" } } },
        },
      }),
    [paletteMode],
  );
};
