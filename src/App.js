import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { auth } from "./refrence/storeConfig"; // Use the pre-configured Firebase auth instance
import { onAuthStateChanged } from "firebase/auth";
import ProtectedRoute from "./ProtectedRoute";
import Signin from "./user-page/auth/signin";
import AdminStore from "./store-admin-page/StoreAdmin";
import { ThemeProvider, createTheme, Box } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import ProtectedRouteAdmin from "./ProtectedRouteAdmin";
import { PrimeReactProvider } from "primereact"; // Adjust the import path as needed
import BottomTab from "./user-page/components/BottomTab";
import Header from "./user-page/components/HeaderTab";
import Wallet from "./user-page/pages/wallet/wallet";
import Savings from "./user-page/pages/savings";
import Transaction from "./user-page/pages/wallet/transaction";
import MyAccount from "./user-page/pages/myAccount/myAccount";
import Organizations from "./user-page/pages/organizations/organizations";
import Settings from "./user-page/pages/settings/settings";
import A4Header from "./a4-admin-page/header";
import OrgChart from "./user-page/pages/OrgChart/OrgChart";
import TransactionHistory from "./user-page/pages/wallet/transactionHisory";
import Loading from "./user-page/components/Loading";
import "./index.css";

const AppContent = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Use navigate hook here
  const token = new URLSearchParams(window.location.search).get("token");
  // Listen to authentication state changes

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (!token) {
          console.log("User is signed in:", user);
          // If user is signed in, navigate to home page (only once)
          if (window.location.pathname === "/signin") {
            navigate("/wallet");
          }
        }
      } else {
        console.log("No user is signed in.");
      }
      setLoading(false); // Stop showing loading state once auth state is determined
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [navigate, token]);
  const theme = createTheme({
    cssVariables: true,
    palette: {
      // mode: darkMode ? "dark" : "light",
    },
  });
  if (loading) {
    return <Loading />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PrimeReactProvider>
        <Box sx={{ position: "relative", zIndex: 3, overflow: "auto" }}>
          <Routes>
            {/* Public routes */}
            <Route path="/signin" element={<Signin />} />
            {/* <Route path="/signup" element={<Signup />} /> */}
            {/* Protected routes */}
            <Route
              path="/myaccount"
              element={
                <ProtectedRoute redirectTo="/signin">
                  <Header />
                  <BottomTab />
                  <MyAccount />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transaction"
              element={
                <ProtectedRoute redirectTo="/signin">
                  <Header />
                  <BottomTab />
                  <Transaction />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transaction-history"
              element={
                <ProtectedRoute redirectTo="/signin">
                  <Header />
                  <BottomTab />
                  <TransactionHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wallet"
              element={
                <ProtectedRoute redirectTo="/signin">
                  <Header />
                  <BottomTab />
                  <Wallet />
                </ProtectedRoute>
              }
            />
            <Route
              path="/savings"
              element={
                <ProtectedRoute redirectTo="/signin">
                  <Header />
                  <BottomTab />
                  <Savings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute redirectTo="/signin">
                  <Header />
                  <BottomTab />
                  <Wallet />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizations"
              element={
                <ProtectedRoute redirectTo="/signin">
                  <Header />
                  <BottomTab />
                  <Organizations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute redirectTo="/signin">
                  <Header />
                  <BottomTab />
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orgchart"
              element={
                <ProtectedRoute redirectTo="/signin">
                  <Header />
                  <BottomTab />
                  <OrgChart />
                </ProtectedRoute>
              }
            />
            {/*  STORE Admin routes */}
            <Route
              path="/admin/store"
              element={
                <ProtectedRouteAdmin redirectTo="/home">
                  <AdminStore />
                </ProtectedRouteAdmin>
              }
            />
            <Route
              path="/admin/a4"
              element={
                <ProtectedRouteAdmin redirectTo="/home">
                  <A4Header />
                </ProtectedRouteAdmin>
              }
            />
            {/*  A4 Admin routes */}

            {/* Error route */}
            <Route
              path="*"
              element={
                <ProtectedRoute redirectTo="/signin">
                  <Header />
                  <BottomTab />
                  <Wallet />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Box>
      </PrimeReactProvider>
    </ThemeProvider>
  );
};
const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};
export default App;
