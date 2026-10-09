import React, { useState } from "react";
import {
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  Badge,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/system";
import { FaUser, FaWallet } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const StyledBottomNav = styled(Paper)(({ theme }) => ({
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  paddingBottom: "env(safe-area-inset-bottom)",
  zIndex: 1000,
  "& .MuiBottomNavigationAction-root": {
    minWidth: "auto",
    padding: "6px 12px",
    "@media (max-width: 600px)": {
      padding: "6px 8px",
    },
    "&.Mui-selected": {
      color: theme.palette.primary.main,
    },
  },
  "& .MuiBottomNavigationAction-label": {
    fontSize: "0.75rem",
    transition: "font-size 0.2s, opacity 0.2s",
    "&.Mui-selected": {
      fontSize: "0.875rem",
    },
  },
  "& svg": {
    fontSize: "1.5rem",
    transition: "transform 0.2s",
  },
  "& .Mui-selected svg": {
    transform: "scale(1.1)",
  },
}));

const BottomNavigationBar = () => {
  const [value, setValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const navigationItems = [
    {
      label: "Хэтэвч",
      icon: <FaWallet />,
      ariaLabel: "Open search",
      navigate: "/wallet",
    },
    {
      label: "Миний",
      icon: <FaUser />,
      ariaLabel: "Go to profile",
      navigate: "/myaccount",
    },
  ];
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    console.log(path);
    navigate(path);
  };
  return (
    <StyledBottomNav elevation={3}>
      <BottomNavigation
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        showLabels={!isMobile}
        sx={{
          height: isMobile ? 56 : 64,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        {navigationItems.map((item, index) => (
          <BottomNavigationAction
            key={item.label}
            label={item.label}
            icon={item.icon}
            aria-label={item.ariaLabel}
            onClick={() => handleNavigate(item.navigate)} // Fix applied here
            sx={{
              minWidth: isMobile ? "auto" : 80,
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
              "&:focus-visible": {
                outline: `2px solid ${theme.palette.primary.main}`,
                outlineOffset: -2,
              },
            }}
          />
        ))}
      </BottomNavigation>
    </StyledBottomNav>
  );
};

export default BottomNavigationBar;
