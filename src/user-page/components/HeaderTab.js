import React, { useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Container,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  styled,
} from "@mui/material";
import { IoLogOutOutline } from "react-icons/io5";
import { logout } from "../auth/Logout"; // Import the reusable logout function
import { useNavigate } from "react-router-dom"; // Import useNavigate
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: "theme.palette.primary.main",
  marginBottom: "40px",
}));

const LogoContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  transition: "transform 0.2s",
  "&:hover": {
    transform: "scale(1.05)",
  },
});

const UserSection = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "20px",
});

const UserHeader = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLogout = logout(navigate); // Create the logout handler
  const getUserData = () => {
    try {
      const users = localStorage.getItem("user"); // Get the stored data
      if (users) {
        return JSON.parse(users); // Parse the JSON string into an object
      }
      return null; // Return null if no data exists
    } catch (error) {
      console.error("Error parsing localStorage.users:", error.message);
      return null; // Handle errors gracefully
    }
  };
  const userData = getUserData();

  return (
    <StyledAppBar position="static">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <LogoContainer>
            <img
              src={"assets/MyLogo-White.png"}
              alt="Credit Card Icon"
              style={{
                width: "60px",
                height: "60px",
                maxWidth: "100%",
                objectFit: "contain",
              }}
            />
          </LogoContainer>

          <Box sx={{ flexGrow: 1 }} />

          <UserSection>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {/* User Profile Section */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={handleMenu}
              >
                {/* Avatar */}
                <Avatar
                  src={userData?.avatarUrl || "https://via.placeholder.com/40"}
                  alt={userData?.lastName || "User Avatar"}
                  sx={{
                    width: 40,
                    height: 40,
                    marginRight: "10px",
                  }}
                >
                  {!userData?.avatarUrl &&
                    `${userData?.lastName?.charAt(0) || ""}${userData?.firstName?.charAt(0) || ""}`.toUpperCase()}
                </Avatar>
                {/* User Name */}
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: "white",
                    fontWeight: 500,
                    textTransform: "capitalize",
                  }}
                >
                  {userData?.lastName || userData?.firstName
                    ? `${userData?.lastName || ""} ${userData?.firstName || ""}`.trim()
                    : "Unknown User"}
                </Typography>
              </Box>

              {/* Dropdown Menu */}
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)} // Ensure menu closes on logout
                aria-label="User menu" // Accessibility improvement
              >
                <MenuItem onClick={handleLogout}>
                  <IoLogOutOutline style={{ marginRight: "8px" }} />
                  Гарах
                </MenuItem>
              </Menu>
            </Box>
          </UserSection>
        </Toolbar>
      </Container>
    </StyledAppBar>
  );
};

export default UserHeader;
