import React from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import { useColorScheme } from "@mui/material/styles";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import SettingsBrightnessIcon from "@mui/icons-material/SettingsBrightness";

export default function ColorModeIconDropdown() {
  const { mode, setMode } = useColorScheme();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode); // ★ setMode ашиглаж байна
    handleClose();
  };

  if (!mode) {
    return (
      <Box
        data-screenshot="toggle-mode"
        sx={(theme) => ({
          verticalAlign: "bottom",
          display: "inline-flex",
          width: "2.25rem",
          height: "2.25rem",
          borderRadius: (theme.vars || theme).shape.borderRadius,
          border: "1px solid",
          borderColor: (theme.vars || theme).palette.divider,
        })}
      />
    );
  }

  return (
    <React.Fragment>
      <Tooltip title="Горим солих">
        <IconButton
          onClick={handleClick}
          size="small"
          aria-label="Горим солих"
          aria-controls={open ? "color-mode-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          {mode === "light" && <LightModeIcon />}
          {mode === "dark" && <DarkModeIcon />}
          {mode === "system" && <SettingsBrightnessIcon />}
        </IconButton>
      </Tooltip>

      <Menu
        id="color-mode-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "color-mode-button",
        }}
      >
        <MenuItem
          onClick={() => handleModeChange("light")}
          selected={mode === "light"}
        >
          <LightModeIcon fontSize="small" sx={{ mr: 1 }} />
          Гэрэлтэй
        </MenuItem>
        <MenuItem
          onClick={() => handleModeChange("dark")}
          selected={mode === "dark"}
        >
          <DarkModeIcon fontSize="small" sx={{ mr: 1 }} />
          Харанхуй
        </MenuItem>
        <MenuItem
          onClick={() => handleModeChange("system")}
          selected={mode === "system"}
        >
          <SettingsBrightnessIcon fontSize="small" sx={{ mr: 1 }} />
          Системийн
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}
