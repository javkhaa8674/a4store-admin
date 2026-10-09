import * as React from "react";
import PropTypes from "prop-types";

import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { useDemoRouter } from "@toolpad/core/internal";
import { Menu, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import InventoryIcon from "@mui/icons-material/Inventory";
import Category from "../Category/category";
import TotalProducts from "../products/totalProduct";
import OrderHistory from "../Order/OrderHistory";
import PaymentIcon from "@mui/icons-material/Payment";
import PaymentHistory from "../Order/paymentHistory";
import ViewCarouselIcon from "@mui/icons-material/ViewCarousel";
import ListSharpIcon from "@mui/icons-material/ListSharp";
import Banner from "../banner/Banner";
import Dashboard from "../dashboard/Dashboard";
import FeedIcon from "@mui/icons-material/Feed";
import Blog from "../blog/blog";
import Users from "../users/users";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { logout } from "../../../user-page/auth/Logout";
import Invite from "../users/invite";
// Navigation structure
const NAVIGATION = [
  {
    kind: "header",
    title: "Main items",
  },
  {
    segment: "dashboard",
    title: "Dashboard",
    icon: <DashboardIcon />,
  },
  {
    segment: "users",
    title: "Хэрэглэгч",
    icon: <PeopleAltIcon />,
  },
  {
    segment: "invite",
    title: "Урилт",
    icon: <PeopleAltIcon />,
  },
  {
    segment: "order",
    title: "Захиалга",
    icon: <ShoppingCartIcon />,
    children: [
      {
        segment: "orderhistory",
        title: "Захиалгын түүх",
        icon: <CheckCircleIcon />,
      },
      {
        segment: "paymenthistory",
        title: "Төлбөрийн түүх",
        icon: <PaymentIcon />,
      },
    ],
  },
  {
    segment: "totalProduct",
    title: "Бүтээгдэхүүн",
    icon: <InventoryIcon />,
  },
  {
    segment: "category",
    title: "Ангилал",
    icon: <ListSharpIcon />,
  },
  {
    segment: "banner",
    title: "Зарлалын самбар",
    icon: <ViewCarouselIcon />,
  },
  {
    segment: "blog",
    title: "Мэдээ мэдээлэл",
    icon: <FeedIcon />,
  },
];

// Custom theme
const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: "data-toolpad-color-scheme",
  },
  colorSchemes: {
    light: {
      palette: {
        mode: "light",
        primary: {
          main: "#1976d2", // Example primary color
        },
      },
    },
    dark: {
      palette: {
        mode: "dark",
        primary: {
          main: "#bb86fc", // Example primary color for dark mode
        },
      },
    },
  },
});

// Page content based on route
function DemoPageContent({ pathname }) {
  return (
    <div>
      {pathname === "/dashboard" && <Dashboard />}
      {pathname === "/totalProduct" && <TotalProducts />}
      {pathname === "/order/orderhistory" && <OrderHistory />}
      {pathname === "/order/paymenthistory" && <PaymentHistory />}
      {pathname === "/category" && <Category />}
      {pathname === "/banner" && <Banner />}
      {pathname === "/blog" && <Blog />}
      {pathname === "/users" && <Users />}
      {pathname === "/invite" && <Invite />}
    </div>
  );
}
DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};

// Toolbar actions (search, profile menu, theme switcher)
function ToolbarActionsSearch() {
  const userData = JSON.parse(localStorage.getItem("user"));
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setIsMenuOpen(true);
  };

  const navigate = useNavigate();
  const handleLogout = logout(navigate); // Create the logout handler

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const renderMenu = (
    <>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        id="menu-id"
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={isMenuOpen}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleLogout}>Гарах</MenuItem>
      </Menu>
      <Typography
        variant="subtitle1"
        sx={{
          color: "inherit",
          fontWeight: 500,
          textTransform: "capitalize",
        }}
      >
        {userData?.lastName || userData?.firstName
          ? `${userData?.lastName || ""} ${userData?.firstName || ""}`.trim()
          : "Unknown User"}
      </Typography>
    </>
  );

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      {/* User's Name */}
      {/* Avatar or Account Icon to trigger the menu */}
      <Avatar
        src={userData?.avatarUrl || "https://via.placeholder.com/40"}
        alt={userData?.lastName || "User Avatar"}
        onClick={handleMenuOpen}
        sx={{
          width: 40,
          height: 40,
          marginRight: "10px",
          backgroundColor: "primary.main",
        }}
      >
        {!userData?.avatarUrl &&
          `${userData?.lastName?.charAt(0) || ""}${userData?.firstName?.charAt(0) || ""}`.toUpperCase()}
      </Avatar>
      {renderMenu}
      {/* ThemeSwitcher Component */}
    </Stack>
  );
}

// Theme switcher component
// function ThemeSwitcher() {
//   const { mode, setMode } = useColorScheme();

//   const toggleMode = () => {
//     setMode(mode === "light" ? "dark" : "light");
//   };

//   React.useEffect(() => {
//     const root = document.documentElement;
//     root.setAttribute("data-toolpad-color-scheme", mode);
//   }, [mode]);

//   return (
//     <IconButton onClick={toggleMode} color="inherit">
//       {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
//     </IconButton>
//   );
// }

// Sidebar footer component
function SidebarFooter({ mini }) {
  return (
    <Typography
      variant="caption"
      sx={{
        m: 1,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textAlign: "center", // Centers text horizontally
      }}
    >
      {mini ? "A4" : `A4STORE ${new Date().getFullYear()}`}
    </Typography>
  );
}
SidebarFooter.propTypes = {
  mini: PropTypes.bool.isRequired,
};

// Custom app title component
function CustomAppTitle() {
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      {/* Image with link */}
      {/* Chip Label */}
      <Chip size="medium" label="A4 STORE" color="info" />
    </Stack>
  );
}

// Main dashboard layout component
function DashboardLayoutSlots(props) {
  const { window } = props;
  const router = useDemoRouter("/dashboard");
  const demoWindow = window !== undefined ? window() : undefined;

  return (
    <ThemeProvider theme={demoTheme}>
      <AppProvider
        navigation={NAVIGATION}
        router={router}
        theme={demoTheme}
        window={demoWindow}
      >
        <DashboardLayout
          slots={{
            appTitle: CustomAppTitle,
            toolbarActions: ToolbarActionsSearch,
            sidebarFooter: SidebarFooter,
          }}
        >
          <DemoPageContent pathname={router.pathname} />
        </DashboardLayout>
      </AppProvider>
    </ThemeProvider>
  );
}
DashboardLayoutSlots.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window: PropTypes.func,
};

export default DashboardLayoutSlots;
