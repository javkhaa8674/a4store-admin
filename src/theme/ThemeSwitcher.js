// src/theme/ThemeSwitcher.js
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useColorScheme } from "@mui/material/styles";

export const ThemeSwitcher = () => {
  const { mode, setMode, systemMode } = useColorScheme();

  // mode undefined байж болзошгүй тул systemMode-ийг fallback болгон ашиглана
  const currentMode = mode ?? systemMode ?? "light";

  const toggleMode = () => {
    setMode(currentMode === "light" ? "dark" : "light");
  };

  return (
    <IconButton onClick={toggleMode} color="inherit">
      {currentMode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
    </IconButton>
  );
};
