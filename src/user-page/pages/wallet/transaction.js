import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/system";
import { FiPhone, FiUser, FiCheck, FiX } from "react-icons/fi";
import { FaCoins } from "react-icons/fa";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, firestore } from "refrence/storeConfig";
import { MdOutlineDescription } from "react-icons/md";
import a4axios from "a4axios";
import { useNavigate } from "react-router-dom";

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  background: "linear-gradient(135deg, #0f509e 30%, #1399cd 100%)",
  position: "relative",
  overflow: "hidden",
  transition: "transform 0.3s ease-in-out",
  maxWidth: "1170px",
  margin: "auto",
  marginBottom: "20px",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[8],
  },
}));
const PointsWrapper = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginTop: 10,
});
const ContentWrapper = styled(CardContent)({
  padding: "32px 24px",
  color: "#fff",
});
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: "2rem",
  maxWidth: "1170px",
  margin: "2rem auto",
  borderRadius: "12px",
  marginBottom: "100px",
}));
const StyledButton = styled(Button)(({ theme }) => ({
  margin: "1rem 0.5rem",
  minWidth: "120px",
}));
const steps = ["Хүлээн авагч", "Шилжүүлэг", "Баталгаажуулалт"];

const PointTransferStepper = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    ReciverPhone: "",
    receiverName: "",
    TransactionPoint: "",
    description: "",
    receiverPointId: "",
  });
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState(null);
  const [token, setToken] = useState(null);
  const [success, setSuccess] = useState(false);
  const user = auth.currentUser;
  const [otpSent, setOtpSent] = useState(false);
  const navigation = useNavigate();

  // ==================== useEffect: localStorage-с user авах ====================
  useEffect(() => {
    const storedUserData = localStorage.getItem("user");

    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  // ==================== useEffect: Timer ====================
  useEffect(() => {
    let interval;
    if (activeStep === 2 && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [activeStep, timer]);

  // ==================== useEffect: Balance ====================
  useEffect(() => {
    if (!user?.uid) return;

    const balanceRef = doc(firestore, "users", user.uid, "point", "balance");

    // Subscribe to real-time updates with onSnapshot
    const unsubscribe = onSnapshot(balanceRef, (docSnap) => {
      if (docSnap.exists()) {
        setBalance(docSnap.data().balance);
      } else {
        console.log("No such document!");
        setBalance(null);
      }
    });
    return () => {
      unsubscribe();
    };
  }, [user?.uid]);

  // ==================== sendOtp: useCallback-аар боосон ====================
  const sendOtp = useCallback(async () => {
    const phone = Number(userData?.phone);
    if (!phone || isNaN(phone)) {
      console.warn("Invalid phone number");
      return;
    }
    const requestBody = {
      phoneNumber: phone,
      text: `Хэрвээ өөрөө биш бол баталгаажуулах кодоо нууцлан уу. Шилжүүлэг хийх дүн ${formData.TransactionPoint}P`,
      type: "transaction",
    };
    try {
      const response = await a4axios.post("/sendotp", requestBody);
      if (response.status === 200) {
        setToken(response.data.token);
        console.log("OTP sent successfully:", response.data.token);
      } else {
        console.log("Error sending OTP");
      }
    } catch (error) {
      console.error("Failed to send OTP:", error);
    }
  }, [userData?.phone, formData.TransactionPoint]);

  // ==================== useEffect: OTP илгээх ====================
  useEffect(() => {
    if (activeStep === 2 && !otpSent) {
      sendOtp();
      setOtpSent(true);
    }
  }, [activeStep, otpSent, sendOtp]);

  // ==================== validateStep ====================
  const validateStep = () => {
    const newErrors = {};

    if (activeStep === 0) {
      if (!formData.ReciverPhone) {
        newErrors.ReciverPhone = "Утасны дугаараа оруулна уу";
      } else if (formData.ReciverPhone.length !== 8) {
        newErrors.ReciverPhone = "Утас 8 оронтой байна";
      }

      if (Number(formData.TransactionPoint) + 100 < 10000) {
        newErrors.TransactionPoint = "Гүйлгээний доод дүн 10000p";
      }
      if (formData.TransactionPoint === "") {
        newErrors.TransactionPoint = "Шилжүүлэх дүн хоосон байж болохгүй";
      }
      if (Number(formData.TransactionPoint) < 0) {
        newErrors.TransactionPoint = "Хасах байж болохгүй";
      }
      if (Number(formData.TransactionPoint) + 100 > balance) {
        newErrors.TransactionPoint = "Үлдэгдэл хүрэлцэхгүй байна";
      }
      if (!formData.receiverName || formData.receiverName === "") {
        newErrors.ReciverPhone = "Бүртгэлгүй хэрэглэгч байна";
      }
    } else if (activeStep === 2) {
      if (!otp) {
        newErrors.otp = "Баталгаажуулах код оруулна уу";
      } else if (!/^\d{6}$/.test(otp)) {
        newErrors.otp = "Баталгаажуулах код 6 оронтой байна";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==================== handleVerifyOtp ====================
  const handleVerifyOtp = async () => {
    try {
      if (!token) {
        console.error("No authorization token found");
        return;
      }

      setIsLoading(true);

      const requestBody = {
        otpCode: otp,
        data: {
          senderId: userData.pointId,
          receiverId: formData.receiverPointId,
          TransactionPoint: formData.TransactionPoint,
          fee: 100,
          description: formData.description,
        },
      };

      const response = await a4axios.post("/verifyOtp", requestBody, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        console.log("OTP Verified!");
        setActiveStep((prevStep) => prevStep + 1);
        setSuccess(true);
      } else {
        console.error("OTP verification failed");
        setActiveStep((prevStep) => prevStep + 1);
      }
    } catch (error) {
      console.error("Error during OTP verification:", error);
      setActiveStep((prevStep) => prevStep + 1);
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== handleNext ====================
  const handleNext = () => {
    if (validateStep()) {
      if (activeStep === 2) {
        handleVerifyOtp();
      } else {
        setActiveStep((prevStep) => prevStep + 1);
      }
    }
  };

  // ==================== handleBack ====================
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // ==================== handleResendOTP ====================
  const handleResendOTP = () => {
    setTimer(60);
    sendOtp();
  };

  // ==================== handleChange ====================
  const handleChange = async (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, ReciverPhone: value }));
    // Reset error message when typing
    setErrors((prev) => ({ ...prev, ReciverPhone: "" }));

    if (value.length === 8) {
      const usersRef = collection(firestore, "users");
      const q = query(usersRef, where("phone", "==", value));

      try {
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const firstDoc = querySnapshot.docs[0].data();
          setFormData((prev) => ({
            ...prev,
            receiverName: `${firstDoc.lastName} ${firstDoc.firstName}`,
            receiverPointId: firstDoc.pointId,
          }));
          console.log("User found:", firstDoc);
        } else {
          setFormData((prev) => ({
            ...prev,
            receiverName: "",
            receiverPointId: "",
          }));
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        receiverName: "",
        receiverPointId: "",
      }));
    }
  };

  // ==================== renderStepContent ====================
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <StyledCard>
              <ContentWrapper>
                <PointsWrapper>
                  <FaCoins size={24} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {balance}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>
                    pts
                  </Typography>
                </PointsWrapper>

                <Typography
                  variant="caption"
                  sx={{ display: "block", mt: 1, opacity: 0.8 }}
                >
                  1 point = $1
                </Typography>
              </ContentWrapper>
            </StyledCard>
            <TextField
              fullWidth
              label="Хүлээн авагчийн утас"
              value={formData.ReciverPhone}
              onChange={handleChange}
              error={!!errors.ReciverPhone}
              helperText={errors.ReciverPhone}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiPhone />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
              type="number"
            />

            <TextField
              fullWidth
              label="Хүлээн авагчийн нэр"
              value={formData.receiverName}
              error={!!errors.receiverName}
              helperText={errors.receiverName}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiUser />
                  </InputAdornment>
                ),
                readOnly: true,
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Шилжүүлэх оноо"
              value={formData.TransactionPoint}
              onChange={(e) =>
                setFormData({ ...formData, TransactionPoint: e.target.value })
              }
              error={!!errors.TransactionPoint}
              helperText={errors.TransactionPoint}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FaCoins />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
              type="number"
            />
            <TextField
              fullWidth
              label="Гүйлгээний утга (заавал биш)"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MdOutlineDescription />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Харилцагч та гүйлгээний мэдээллээ дахин шалгана уу. Мэдээлэл буруу
              оруулснаас үүдэн гарах эрсдэлийг АЙ ФООР ЮҮ ЭНД МИ ХХК хариуцахгүй
              болно.
            </Alert>
            <Typography variant="body1" gutterBottom>
              Хүлээн авагчийн утас: {formData.ReciverPhone}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Хүлээн авагчийн нэр: {formData.receiverName}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Гүйлгээний утга: {formData.description}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Шилжүүлэх оноо: {formData.TransactionPoint}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Шимтгэл: 100
            </Typography>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              {userData?.phone} дугаарт баталгаажуулах код илгээгдлээ. Кодыг 60
              секундийн дотор оруулна уу.
            </Alert>
            <TextField
              fullWidth
              label="Код оруулна уу"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              error={!!errors.otp}
              helperText={errors.otp}
              type="password"
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" color="textSecondary">
              Үлдсэн хугацаа: {timer}s
            </Typography>
            {timer === 0 && (
              <Button onClick={handleResendOTP} color="primary">
                Код дахин илгээх
              </Button>
            )}
          </Box>
        );

      default:
        return (
          <Box
            sx={{
              mt: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: 3,
              borderRadius: 2,
              backgroundColor: "#fff",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            {success ? (
              <>
                <FiCheck size={60} color="green" style={{ marginBottom: 12 }} />
                <Typography
                  variant="h6"
                  sx={{ color: "green", fontWeight: "bold" }}
                  aria-live="polite"
                >
                  Гүйлгээ амжилттай хийгдлээ.
                </Typography>
              </>
            ) : (
              <>
                <FiX size={60} color="red" style={{ marginBottom: 12 }} />
                <Typography
                  variant="h6"
                  sx={{ color: "red", fontWeight: "bold" }}
                  aria-live="assertive"
                >
                  Гүйлгээ амжилтгүй. Та дахин оролдоно уу.
                </Typography>
                <Typography variant="body2" sx={{ color: "red", mt: 1 }}>
                  Асуудал хэвээр байвал бидэнтэй холбоо барина уу.
                </Typography>
              </>
            )}

            {/* Navigate Button */}
            <Button
              variant="contained"
              sx={{ mt: 3, width: "100%", maxWidth: 200 }}
              color="primary"
              onClick={() => navigation("/wallet")}
            >
              Болсон
            </Button>
          </Box>
        );
    }
  };

  // ==================== handleBackWallet ====================
  const handleBackWallet = () => {
    navigation("/wallet");
  };

  return (
    <>
      <StyledPaper elevation={3}>
        <IconButton
          edge="start"
          color="inherit"
          onClick={handleBackWallet}
          aria-label="back"
        >
          <ArrowBackIcon />
        </IconButton>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent()}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          {activeStep > 0 && activeStep < steps.length && (
            <StyledButton onClick={handleBack} variant="outlined">
              Буцах
            </StyledButton>
          )}

          {activeStep < steps.length && (
            <StyledButton
              onClick={handleNext}
              variant="contained"
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={24} />
              ) : activeStep === steps.length - 1 ? (
                "Баталгаажуулах"
              ) : (
                "Цааш"
              )}
            </StyledButton>
          )}
        </Box>
      </StyledPaper>
    </>
  );
};

export default PointTransferStepper;
