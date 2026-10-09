import React, { useState } from "react";
import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Stack,
  Paper,
} from "@mui/material";
import { styled } from "@mui/system";
import {
  FaFileContract,
  FaPhoneAlt,
  FaComments,
  FaGlobe,
  FaSignOutAlt,
} from "react-icons/fa";
import Contact from "../contact/contact";
const StyledButton = styled(Button)(({ theme }) => ({
  margin: "8px",
  padding: "10px 20px",
  borderRadius: "12px",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  background: "#1976d2",
  boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
  color: "white",
  "&:hover": {
    transform: "translateY(-3px) scale(1.02)",
    boxShadow: "0 6px 12px rgba(33, 203, 243, .5)",
  },
}));

const ModalContent = styled(Box)({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: "500px",
  backgroundColor: "#fff",
  borderRadius: "16px",
  padding: "32px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
  backdropFilter: "blur(8px)",
  border: "1px solid rgba(255, 255, 255, 0.18)",
});

const ContainerWrapper = styled(Paper)({
  padding: "24px",
  borderRadius: "20px",
  background: "linear-gradient(145deg, #ffffff, #f5f5f5)",
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
});

const ButtonSet = () => {
  const [contactModal, setContactModal] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [languageMenu, setLanguageMenu] = useState(null);
  const [feedback, setFeedback] = useState("");

  const languages = ["English", "Spanish", "French", "German", "Chinese"];

  const handleLanguageClick = (event) => {
    setLanguageMenu(event.currentTarget);
  };

  const handleLanguageClose = () => {
    setLanguageMenu(null);
  };

  const handleLogout = () => {
    setLogoutDialog(false);
  };

  const handleFeedbackSubmit = () => {
    setFeedbackModal(false);
    setFeedback("");
  };

  return (
    <>
      <Contact />
      <ContainerWrapper>
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 1, sm: 2, md: 3 }}
            alignItems="center"
            justifyContent="center"
            flexWrap="wrap"
            sx={{
              gap: { xs: "12px", sm: "16px" },
              transition: "all 0.3s ease",
            }}
          >
            <Tooltip title="View Contracts">
              <StyledButton
                variant="contained"
                color="inherit"
                startIcon={<FaFileContract />}
                aria-label="contracts"
              >
                Contracts
              </StyledButton>
            </Tooltip>

            <Tooltip title="Contact Us">
              <StyledButton
                variant="outlined"
                color="inherit"
                startIcon={<FaPhoneAlt />}
                onClick={() => setContactModal(true)}
                aria-label="contact"
              >
                Contact
              </StyledButton>
            </Tooltip>

            <Tooltip title="Send Feedback">
              <StyledButton
                variant="contained"
                color="inherit"
                startIcon={<FaComments />}
                onClick={() => setFeedbackModal(true)}
                aria-label="feedback"
              >
                Feedback
              </StyledButton>
            </Tooltip>

            <Tooltip title="Select Language">
              <StyledButton
                variant="text"
                color="inherit"
                startIcon={<FaGlobe />}
                onClick={handleLanguageClick}
                aria-label="language"
              >
                Language
              </StyledButton>
            </Tooltip>

            <Tooltip title="Logout">
              <StyledButton
                color="inherit"
                variant="outlined"
                startIcon={<FaSignOutAlt />}
                onClick={() => setLogoutDialog(true)}
                aria-label="logout"
              >
                Logout
              </StyledButton>
            </Tooltip>
          </Stack>

          <Modal
            open={contactModal}
            onClose={() => setContactModal(false)}
            sx={{
              backdropFilter: "blur(4px)",
              backgroundColor: "rgba(0,0,0,0.2)",
            }}
          >
            <ModalContent>
              <Typography
                variant="h5"
                gutterBottom
                sx={{ color: "#1976d2", fontWeight: 600 }}
              >
                Contact Information
              </Typography>
              <Box sx={{ mt: 3, mb: 3 }}>
                <Typography
                  sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}
                >
                  <FaPhoneAlt /> +1 (555) 123-4567
                </Typography>
                <Typography sx={{ mb: 2 }}>
                  Email: support@example.com
                </Typography>
                <Typography>
                  Address: 123 Business Street, City, Country
                </Typography>
              </Box>
              <Box sx={{ mt: 3, textAlign: "right" }}>
                <Button
                  onClick={() => setContactModal(false)}
                  variant="contained"
                  sx={{ borderRadius: "8px" }}
                >
                  Close
                </Button>
              </Box>
            </ModalContent>
          </Modal>

          <Modal open={feedbackModal} onClose={() => setFeedbackModal(false)}>
            <ModalContent>
              <Typography variant="h6" gutterBottom>
                Submit Feedback
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Your feedback here..."
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                <Button onClick={() => setFeedbackModal(false)}>Cancel</Button>
                <Button variant="contained" onClick={handleFeedbackSubmit}>
                  Submit
                </Button>
              </Box>
            </ModalContent>
          </Modal>

          <Menu
            anchorEl={languageMenu}
            open={Boolean(languageMenu)}
            onClose={handleLanguageClose}
          >
            {languages.map((lang) => (
              <MenuItem key={lang} onClick={handleLanguageClose}>
                {lang}
              </MenuItem>
            ))}
          </Menu>

          <Dialog open={logoutDialog} onClose={() => setLogoutDialog(false)}>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogContent>
              <Typography>Are you sure you want to logout?</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setLogoutDialog(false)}>Cancel</Button>
              <Button variant="contained" color="error" onClick={handleLogout}>
                Logout
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </ContainerWrapper>
    </>
  );
};

export default ButtonSet;
