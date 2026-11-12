import React from "react";
import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";
import ResolveRequestTable from "../../components/tables/ResolveRequestTable";
import { Box, ThemeProvider } from "@mui/material";
import { useTableTheme } from "../../../../theme/useTableTheme";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function ResolveApproval({ open, setOpen, data }) {
  const tableTheme = useTableTheme();

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
              Шийдвэрлэж буй хүсэлт
            </Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ height: "90vh" }}>
          <ThemeProvider theme={tableTheme}>
            <ResolveRequestTable data={data} />
          </ThemeProvider>
        </Box>
      </Dialog>
    </React.Fragment>
  );
}
