import {
  Alert,
  Button,
  Card,
  CircularProgress,
  IconButton,
  InputAdornment,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { AppProvider } from "@toolpad/core/AppProvider";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  setPersistence,
} from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import * as React from "react";
import { auth } from "../../refrence/storeConfig";

import BadgeIcon from "@mui/icons-material/Badge";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import EmailIcon from "@mui/icons-material/Email";
import KeyIcon from "@mui/icons-material/Key";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
const BRANDING = {
  logo: (
    <img
      src="https://firebasestorage.googleapis.com/v0/b/a4youandme-store.firebasestorage.app/o/789456.png?alt=media&token=f8572a7a-cf71-4de3-908d-66da285897a3"
      alt="MUI logo"
      style={{ height: 120 }}
    />
  ),
};

export default function BrandingSignUpPage() {
  const theme = useTheme();
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [emailError, setEmailError] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");
  const [confirmPasswordError, setConfirmPasswordError] = React.useState("");
  const [firstNameError, setFirstNameError] = React.useState("");
  const [lastNameError, setLastNameError] = React.useState("");
  const [passwordVisible, setPasswordVisible] = React.useState(false);

  const signUp = async ({ firstName, lastName, email, password }) => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Set persistence to local storage (optional)
      await setPersistence(auth, browserLocalPersistence);
      // Create a new user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      console.log("User signed up successfully:", userCredential.user);

      const db = getFirestore();
      const userRef = doc(db, "users", userCredential.user.uid); // Use the UID as the document ID
      // Set user data in Firestore
      await setDoc(userRef, {
        firstName,
        lastName,
        email,
        createdAt: new Date(),
        role: "user",
      });

      console.log("User data saved to Firestore");
      // Optionally: You could save the user's first and last name in the database (Firestore, Realtime Database, etc.)
      // Example: firebase.firestore().collection('users').doc(userCredential.user.uid).set({ firstName, lastName });

      // Navigate to the home page after successful signup
    } catch (error) {
      // Provide a more user-friendly error message
      const errorCode = error.code;
      const errorMessage =
        errorCode === "auth/email-already-in-use"
          ? "This email is already in use."
          : errorCode === "auth/invalid-email"
            ? "Invalid email format."
            : "Signup failed. Please try again.";

      setError(errorMessage);
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFirstNameChange = (e) => {
    setFirstName(e.target.value);
    setFirstNameError(""); // Clear error when user starts typing
  };

  const handleLastNameChange = (e) => {
    setLastName(e.target.value);
    setLastNameError(""); // Clear error when user starts typing
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError(""); // Clear error when user starts typing
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError(""); // Clear error when user starts typing
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setConfirmPasswordError(""); // Clear error when user starts typing
  };

  const isEmailValid = () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };
  const togglePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };
  const isPasswordValid = (password) => {
    return password.length >= 6; // You can extend this check to require digits or special characters
  };

  return (
    <AppProvider branding={BRANDING} theme={theme}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100%",
          padding: "16px",
          boxSizing: "border-box",
          background: "#f4f4f4",
        }}
      >
        {/* Card with Shadow */}
        <Card
          elevation={10}
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            maxWidth: "400px",
            padding: "24px",
            boxSizing: "border-box",
            backgroundColor: "#fff",
            borderRadius: "8px",
          }}
        >
          {/* Branding Section */}
          <div
            style={{
              marginBottom: "24px",
              textAlign: "center",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            {BRANDING.logo}
            <div>{BRANDING.title}</div>
          </div>

          {/* Title */}
          <Typography
            variant="h5"
            component="div"
            style={{
              marginBottom: "16px",
              fontWeight: "bold",
              textAlign: "center",
              color: "#1769aa",
            }}
          >
            Бүртгүүлэх
          </Typography>

          {/* Name, Email, and Password Fields */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              gap: "16px",
            }}
          >
            <TextField
              label="Овог"
              variant="outlined"
              value={lastName}
              placeholder="Овог"
              onChange={handleLastNameChange}
              fullWidth
              required
              inputProps={{
                style: { fontSize: "14px", padding: "12px" },
              }}
              style={{ backgroundColor: "#fff" }}
              error={!!lastNameError}
              helperText={lastNameError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Нэр"
              variant="outlined"
              value={firstName}
              onChange={handleFirstNameChange}
              fullWidth
              required
              placeholder="Нэр"
              inputProps={{
                style: { fontSize: "14px", padding: "12px" },
              }}
              style={{ backgroundColor: "#fff" }}
              error={!!firstNameError}
              helperText={firstNameError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeOutlinedIcon />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="И-мэйл хаяг"
              variant="outlined"
              value={email}
              onChange={handleEmailChange}
              placeholder="Жишээ: example@gmail.com"
              fullWidth
              required
              autoFocus
              inputProps={{
                style: { fontSize: "14px", padding: "12px" },
              }}
              style={{ backgroundColor: "#fff" }}
              error={!!emailError || (email && !isEmailValid())}
              helperText={
                emailError ||
                (email && !isEmailValid() && "N-мэйл алдаатай байна")
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Нууц үг"
              variant="outlined"
              type={passwordVisible ? "text" : "password"} // Toggle between text and password
              value={password}
              onChange={handlePasswordChange}
              fullWidth
              placeholder="Нууц үг"
              required
              inputProps={{
                style: { fontSize: "14px", padding: "12px" },
              }}
              style={{ backgroundColor: "#fff" }}
              error={!!passwordError || !isPasswordValid(password)}
              helperText={
                passwordError || (password && !isPasswordValid(password))
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {passwordVisible ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
                startAdornment: (
                  <InputAdornment position="start">
                    <KeyIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Нууц үг баталгаажуулах"
              variant="outlined"
              type={passwordVisible ? "text" : "password"} // Toggle between text and password
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              fullWidth
              placeholder="Нууц үг"
              required
              inputProps={{
                style: { fontSize: "14px", padding: "12px" },
              }}
              style={{ backgroundColor: "#fff" }}
              error={
                !!confirmPasswordError || !isPasswordValid(confirmPassword)
              }
              helperText={
                confirmPasswordError ||
                (confirmPassword && !isPasswordValid(confirmPassword))
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {passwordVisible ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
                startAdornment: (
                  <InputAdornment position="start">
                    <KeyIcon />
                  </InputAdornment>
                ),
              }}
            />

            {/* Sign Up Button */}
            <Button
              variant="contained"
              color="primary"
              onClick={() => signUp({ firstName, lastName, email, password })}
              fullWidth
              disabled={
                loading ||
                !isEmailValid() ||
                password.length < 6 ||
                confirmPassword !== password
              }
              style={{
                marginTop: "16px",
                fontSize: "16px",
                fontWeight: "bold",
                padding: "12px",
                transition: "background-color 0.3s ease",
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Sign Up"
              )}
            </Button>
          </div>
        </Card>

        {/* Error Snackbar */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError("")}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert onClose={() => setError("")} severity="error">
            {error}
          </Alert>
        </Snackbar>
      </div>
    </AppProvider>
  );
}
