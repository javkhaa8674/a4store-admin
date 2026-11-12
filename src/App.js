import { Box, ThemeProvider, createTheme } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import { onAuthStateChanged } from "firebase/auth";
import { PrimeReactProvider } from "primereact"; // Adjust the import path as needed
import { useEffect, useState } from "react";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useNavigate,
} from "react-router-dom";
import A4Header from "./a4-admin-page/header";
import Admin from "./Admin";
import "./index.css";
import ProtectedRoute from "./ProtectedRoute";
import ProtectedRouteAdmin from "./ProtectedRouteAdmin";
import { auth } from "./refrence/storeConfig"; // Use the pre-configured Firebase auth instance
import AdminStore from "./store-admin-page/StoreAdmin";
import Signin from "./user-page/auth/signin";
import BottomTab from "./user-page/components/BottomTab";
import Header from "./user-page/components/HeaderTab";
import Loading from "./user-page/components/Loading";
import MyAccount from "./user-page/pages/myAccount/myAccount";
import Organizations from "./user-page/pages/organizations/organizations";
import OrgChart from "./user-page/pages/OrgChart/OrgChart";
import Savings from "./user-page/pages/savings";
import Settings from "./user-page/pages/settings/settings";
import Transaction from "./user-page/pages/wallet/transaction";
import TransactionHistory from "./user-page/pages/wallet/transactionHisory";
import Wallet from "./user-page/pages/wallet/wallet";

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: "data", // 'data' attribute ашиглана
  },
  colorSchemes: {
    light: {
      palette: {
        info: { main: "rgb(255,122,0)" },
        background: { default: "rgb(254,255,244)" },
      },
    },
    dark: {
      palette: {
        info: { main: "rgb(255,122,0)" },
        background: { default: "#000" },
      },
    },
  },
  typography: { button: { textTransform: "none", fontSize: "1.2rem" } },
  components: {
    MuiTooltip: { styleOverrides: { tooltip: { fontSize: "1.1rem" } } },
    MuiSwitch: { styleOverrides: { thumb: { color: "pink" } } },
  },
});

const AppContent = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Use navigate hook here
  const token = new URLSearchParams(window.location.search).get("token");
  // Listen to authentication state changes

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (!token) {
          // If user is signed in, navigate to home page (only once)
          if (window.location.pathname === "/signin") {
            navigate("/wallet");
          }
        }
      } else {
        //console.log("No user is signed in.");
      }
      setLoading(false); // Stop showing loading state once auth state is determined
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [navigate, token]);

  if (loading) {
    return <Loading />;
  }

  return (
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
          <Route
            path="/admin"
            element={
              <ProtectedRouteAdmin redirectTo="/home">
                <Admin />
              </ProtectedRouteAdmin>
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
  );
};

const App = () => {
  return (
    <ThemeProvider theme={theme} defaultMode="dark">
      <InitColorSchemeScript defaultMode="dark" attribute="data" />
      <CssBaseline />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
};

export default App;
