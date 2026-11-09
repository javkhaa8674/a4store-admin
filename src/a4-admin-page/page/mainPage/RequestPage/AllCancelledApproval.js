import React, { useMemo } from "react";
import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";
import { Box, ThemeProvider, createTheme } from "@mui/material";
import AllCancelledRequestTable from "../../components/tables/AllCancelledRequestTable";
import { useColorScheme } from "@mui/material/styles";
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function AllCancelledApproval({ open, setOpen, data }) {
  const { mode } = useColorScheme();

  const tableTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          info: {
            main: "rgb(255,122,0)",
          },
          background: {
            default: mode === "light" ? "rgb(254,255,244)" : "#000",
          },
        },
        typography: {
          button: {
            textTransform: "none",
            fontSize: "1.2rem",
          },
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
              },
            },
          },
          MuiTooltip: {
            styleOverrides: {
              tooltip: {
                fontSize: "1.1rem",
              },
            },
          },
          MuiSwitch: {
            styleOverrides: {
              thumb: {
                color: "pink",
              },
            },
          },
        },
      }),
    [mode],
  );

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon sx={{ color: "inherit" }} />
            </IconButton>
            <Typography
              sx={{ ml: 2, flex: 1 }}
              variant="h6"
              component="div"
              color="inherit"
            >
              Бүх цуцлагдсан хүсэлт
            </Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ height: "90vh" }}>
          <ThemeProvider theme={tableTheme}>
            <AllCancelledRequestTable data={data} />
          </ThemeProvider>
        </Box>
      </Dialog>
    </React.Fragment>
  );
}
