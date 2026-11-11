import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Typography,
  useTheme,
  styled,
  CircularProgress,
} from "@mui/material";
import { MdPhone, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Import react-router-dom for navigation

const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== "currentMode",
})(({ theme, currentMode }) => ({
  background:
    currentMode === "dark"
      ? "rgba(30, 30, 30, 0.95)"
      : "rgba(255, 255, 255, 0.9)",
  color: theme.palette.text.primary,
  borderRadius: 16,
  boxShadow:
    currentMode === "dark"
      ? "0 8px 32px rgba(0, 0, 0, 0.8)"
      : "0 8px 32px rgba(0, 0, 0, 0.5)",
  padding: theme.spacing(4),
  maxWidth: 450,
  width: "100%",
}));

const Background = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  background: theme.vars.palette.background.default,
  transition: "background 0.3s ease",
}));

const RegisterStepper = () => {
  const theme = useTheme();
  const navigate = useNavigate(); // Use the navigate function to navigate between pages
  const [activeStep, setActiveStep] = useState(0);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    registerNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const steps = ["Phone Number", "OTP Confirmation", "User Details"];

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate phone number
      if (!phone || phone.length !== 8) {
        setErrors({ phone: "Утасны дугаар 8 оронтой байх ёстой" });
        return;
      }
      setErrors({});
      setOtpSent(true);
    } else if (activeStep === 1) {
      // Validate OTP
      if (!otp || otp.length !== 6) {
        setErrors({ otp: "OTP 6 оронтой байх ёстой" });
        return;
      }
      setErrors({});
    } else if (activeStep === 2) {
      // Validate user details
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.registerNumber
      ) {
        setErrors({ userDetails: "Бүх талбарыг бөглөнө үү" });
        return;
      }
      setErrors({});
      console.log("Registration successful:", { phone, otp, ...formData });
      // If registration is successful, navigate to the login page
      navigate("/login");
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  return (
    <Background>
      <Container component="main" maxWidth="xs">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <StyledCard>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center">
                <img
                  src="https://firebasestorage.googleapis.com/v0/b/a4youandme-store.firebasestorage.app/o/789456.png?alt=media&token=f8572a7a-cf71-4de3-908d-66da285897a3"
                  style={{
                    width: 150,
                    height: 100,
                  }}
                />
                <Typography
                  component="h1"
                  variant="h4"
                  gutterBottom
                  sx={{ fontWeight: 700 }}
                >
                  Бүртгүүлэх
                </Typography>

                <Stepper activeStep={activeStep} alternativeLabel>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>

                <Box sx={{ mt: 3, width: "100%" }}>
                  {activeStep === 0 && (
                    <Box>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="phone"
                        label="Утас"
                        name="phone"
                        placeholder="Утас"
                        autoComplete="tel"
                        autoFocus
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        error={!!errors.phone}
                        helperText={errors.phone}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MdPhone />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Button
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3 }}
                        onClick={handleNext}
                      >
                        {loading ? (
                          <CircularProgress size={24} />
                        ) : (
                          "OTP Илгээх"
                        )}
                      </Button>
                    </Box>
                  )}

                  {activeStep === 1 && (
                    <Box>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="otp"
                        label="OTP"
                        name="otp"
                        placeholder="OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        error={!!errors.otp}
                        helperText={errors.otp}
                      />
                      <Button
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3 }}
                        onClick={handleNext}
                      >
                        {loading ? (
                          <CircularProgress size={24} />
                        ) : (
                          "Баталгаажуулах"
                        )}
                      </Button>
                    </Box>
                  )}

                  {activeStep === 2 && (
                    <Box>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="firstName"
                        label="Нэр"
                        name="firstName"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                        error={!!errors.userDetails}
                        helperText={errors.userDetails}
                      />
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="lastName"
                        label="Овог"
                        name="lastName"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        error={!!errors.userDetails}
                        helperText={errors.userDetails}
                      />
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="registerNumber"
                        label="Бүртгэлийн дугаар"
                        name="registerNumber"
                        value={formData.registerNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            registerNumber: e.target.value,
                          })
                        }
                        error={!!errors.userDetails}
                        helperText={errors.userDetails}
                      />
                      <Button
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3 }}
                        onClick={handleNext}
                      >
                        Бүртгүүлэх
                      </Button>
                    </Box>
                  )}

                  <Box sx={{ mt: 2 }}>
                    {activeStep > 0 && (
                      <Button variant="text" onClick={handleBack}>
                        Буцах
                      </Button>
                    )}
                    {activeStep === 3 && (
                      <Box sx={{ textAlign: "center", mt: 2 }}>
                        <Typography variant="body2">
                          Бүртгэл амжилттай дууссан бол{" "}
                          <Button
                            variant="text"
                            onClick={() => navigate("/login")}
                          >
                            Нэвтрэх
                          </Button>
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        </motion.div>
      </Container>
    </Background>
  );
};

export default RegisterStepper;
