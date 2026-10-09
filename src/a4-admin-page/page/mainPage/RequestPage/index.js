import { Button, Typography, Fab, Grid } from "@mui/material";
import Badge from "@mui/material/Badge";
import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Add from "@mui/icons-material/Add";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import DoDisturbAltIcon from "@mui/icons-material/DoDisturbAlt";
import AddTaskIcon from "@mui/icons-material/AddTask";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DoneIcon from "@mui/icons-material/Done";
import CreateApproval from "./CreateApproval";
import { AuthStore, readPost } from "store/AuthStore";
import RefreshIcon from "@mui/icons-material/Refresh";
import CircularProgress from "@mui/material/CircularProgress";
import PendingApproval from "./PendingApproval";
import ResolveApproval from "./ResolveApproval";
import CancelledApproval from "./CancelledApproval";
import CancelApproval from "./CancelApproval";
import ConfirmedApproval from "./ConfirmedApproval";
import ReturnedApproval from "./ReturnedApproval";
import AllResolveApproval from "./AllResolveApproval";
import AllConfirmedApproval from "./AllConfirmedApproval";
import AllCancelledApproval from "./AllCancelledApproval";

const Item = styled(Paper)(({ theme }) => ({
  marginBottom: theme.spacing(1),
}));

const Approval = () => {
  const [openCreateApproval, setOpenCreateApproval] = useState(false);
  const [openPendingApproval, setOpenPendingApproval] = useState(false);
  const [openResolveApproval, setOpenResolveApproval] = useState(false);
  const [allOpenResolveApproval, setAllOpenResolveApproval] = useState(false);
  const [allOpenConfirmedApproval, setAllOpenConfirmedApproval] =
    useState(false);
  const [allOpenCancelledApproval, setAllOpenCancelledApproval] =
    useState(false);
  const [openConfirmedApproval, setOpenConfirmedApproval] = useState(false);
  const [openCancelledApproval, setOpenCancelledApproval] = useState(false);
  const [openCancelApproval, setOpenCancelApproval] = useState(false);
  const [openReturnedApproval, setOpenReturnedApproval] = useState(false);
  const { loading } = AuthStore.useState();
  const [sumData, setSumData] = useState({
    Resolving_Request: [],
    Closed_Request: [],
    Declined_Request: [],
  });
  const [userData, setUserData] = useState({
    Resolving_Request: [],
    Pending_Request: [],
    Reasigned_Request: [],
    Sent_Request: [],
    Closed_Request: [],
    Cancelled_Request: [],
  });

  const getData = async () => {
    AuthStore.update((store) => {
      store.loading = true;
    });
    try {
      const result = await readPost(`request`);
      let total = {
        Resolving_Request: [],
        Closed_Request: [],
        Declined_Request: [],
      };
      let userTotal = {
        Resolving_Request: [],
        Pending_Request: [],
        Reasigned_Request: [],
        Sent_Request: [],
        Closed_Request: [],
        Cancelled_Request: [],
      };
      result.forEach((el) => {
        // Only corresponding level is displayed
        if (el.Status === "Шийдвэрлэж байна") {
          total.Resolving_Request.push(el);
        }
        if (el.Status === "Шийдвэрлэсэн") {
          total.Closed_Request.push(el);
        }
        if (el.Status === "Цуцалсан") {
          total.Declined_Request.push(el);
        }

        // ★ Шатлал болон userRoles шалгахгүйгээр бүх хүсэлтийг харуулах
        if (el.Requester_Status === "Шийдвэрлэж байна") {
          userTotal.Resolving_Request.push(el);
        } else if (el.Requester_Status === "Хүлээгдэж байна") {
          userTotal.Pending_Request.push(el);
        } else if (el.Requester_Status === "Илгээсэн") {
          userTotal.Sent_Request.push(el);
        } else if (el.Requester_Status === "Шийдвэрлэсэн") {
          userTotal.Closed_Request.push(el);
        } else if (el.Requester_Status === "Цуцалсан") {
          userTotal.Cancelled_Request.push(el); // ★ Closed биш Cancelled-д нэмэх
        }
      });
      setSumData(total);
      setUserData(userTotal);
      AuthStore.update((store) => {
        store.requestData = result;
      });
    } catch (error) {
      AuthStore.update((store) => {
        store.error = error;
      });
    } finally {
      AuthStore.update((store) => {
        store.loading = false;
      });
    }
  };

  return (
    <Box sx={{ marginLeft: 2 }}>
      <Typography color="inherit" variant="h4">
        Хүсэлтийн бүртгэл
      </Typography>
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ marginTop: 2 }}>
        <Grid item xs={12} sm={4} md={4}>
          <Box>
            <Typography variant="h5">Хариуцаж авсан хүсэлт</Typography>
          </Box>
          <Item>
            <Button
              variant="contained"
              fullWidth
              startIcon={<Add />}
              onClick={() => setOpenCreateApproval(!openCreateApproval)}
              sx={{ justifyContent: "flex-start" }}
            >
              Хүсэлт үүсгэх
            </Button>
          </Item>
          <Item>
            <Button
              variant="contained"
              fullWidth
              startIcon={
                <Badge
                  badgeContent={userData.Resolving_Request.length}
                  color="secondary"
                >
                  <AddTaskIcon />
                </Badge>
              }
              sx={{ justifyContent: "flex-start" }}
              onClick={() => setOpenResolveApproval(!openResolveApproval)}
            >
              Шийдвэрлэж буй хүсэлт
            </Button>
          </Item>
          <Item>
            <Button
              variant="contained"
              fullWidth
              startIcon={
                <Badge
                  badgeContent={userData.Pending_Request.length}
                  color="secondary"
                >
                  <HourglassEmptyIcon />
                </Badge>
              }
              sx={{ justifyContent: "flex-start" }}
              onClick={() => setOpenPendingApproval(!openPendingApproval)}
            >
              Хүлээгдэж буй хүсэлт
            </Button>
          </Item>
          <Item>
            <Button
              variant="contained"
              fullWidth
              sx={{ justifyContent: "flex-start" }}
              startIcon={
                <Badge
                  badgeContent={userData.Reasigned_Request.length}
                  color="secondary"
                >
                  <ArrowBackIcon />
                </Badge>
              }
              onClick={() => setOpenReturnedApproval(!openReturnedApproval)}
            >
              Буцаагдсан хүсэлт
            </Button>
          </Item>
          <Item>
            <Button
              variant="contained"
              fullWidth
              sx={{ justifyContent: "flex-start" }}
              startIcon={
                <Badge
                  badgeContent={userData.Cancelled_Request.length}
                  color="secondary"
                >
                  <DoDisturbAltIcon />
                </Badge>
              }
              onClick={() => setOpenCancelledApproval(!openCancelledApproval)}
            >
              Цуцлагдсан хүсэлт
            </Button>
          </Item>
          <Item>
            <Button
              variant="contained"
              fullWidth
              sx={{ justifyContent: "flex-start" }}
              startIcon={
                <Badge
                  badgeContent={userData.Cancelled_Request.length}
                  color="secondary"
                >
                  <DoDisturbAltIcon />
                </Badge>
              }
              onClick={() => setOpenCancelApproval(!openCancelApproval)}
            >
              Цуцалсан хүсэлт
            </Button>
          </Item>
          <Item>
            <Button
              variant="contained"
              fullWidth
              sx={{ justifyContent: "flex-start" }}
              startIcon={
                <Badge
                  badgeContent={userData.Closed_Request.length}
                  color="secondary"
                >
                  <DoneIcon />
                </Badge>
              }
              onClick={() => setOpenConfirmedApproval(!openConfirmedApproval)}
            >
              Шийдвэрлэсэн хүсэлт
            </Button>
          </Item>
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <Box>
            <Typography variant="h5">Нийт</Typography>
          </Box>
          <Item>
            <Button
              variant="contained"
              fullWidth
              sx={{ justifyContent: "flex-start" }}
              startIcon={
                <Badge
                  badgeContent={sumData.Resolving_Request.length}
                  color="secondary"
                >
                  <HourglassEmptyIcon />
                </Badge>
              }
              onClick={() => setAllOpenResolveApproval(!allOpenResolveApproval)}
            >
              Шийдвэрлэж буй хүсэлт
            </Button>
          </Item>
          <Item>
            <Button
              variant="contained"
              fullWidth
              sx={{ justifyContent: "flex-start" }}
              startIcon={
                <Badge
                  badgeContent={sumData.Declined_Request.length}
                  color="secondary"
                >
                  <DoDisturbAltIcon />
                </Badge>
              }
              onClick={() =>
                setAllOpenCancelledApproval(!allOpenCancelledApproval)
              }
            >
              Цуцалсан хүсэлт
            </Button>
          </Item>
          <Item>
            <Button
              variant="contained"
              fullWidth
              sx={{ justifyContent: "flex-start" }}
              startIcon={
                <Badge
                  badgeContent={sumData.Closed_Request.length}
                  color="secondary"
                >
                  <DoneIcon />
                </Badge>
              }
              onClick={() =>
                setAllOpenConfirmedApproval(!allOpenConfirmedApproval)
              }
            >
              Шийдвэрлэсэн хүсэлт
            </Button>
          </Item>
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <Box>
            <Typography variant="h5">Шинэчлэх</Typography>
          </Box>
          <Grid sx={{ m: 1, position: "relative", marginLeft: 5 }}>
            <Fab aria-label="save" color="primary" onClick={getData}>
              <RefreshIcon />
            </Fab>
            {loading && (
              <CircularProgress
                size={68}
                sx={{
                  position: "absolute",
                  top: -6,
                  left: -6,
                  zIndex: 1,
                }}
              />
            )}
          </Grid>
        </Grid>
      </Grid>
      <Grid container>
        <CreateApproval
          open={openCreateApproval}
          setOpen={setOpenCreateApproval}
        />
        <ResolveApproval
          open={openResolveApproval}
          setOpen={setOpenResolveApproval}
          data={userData.Resolving_Request}
        />
        <PendingApproval
          open={openPendingApproval}
          setOpen={setOpenPendingApproval}
          data={userData.Pending_Request}
        />
        <ConfirmedApproval
          open={openConfirmedApproval}
          setOpen={setOpenConfirmedApproval}
          data={userData.Pending_Request}
        />
        <CancelledApproval
          open={openCancelledApproval}
          setOpen={setOpenCancelledApproval}
          data={userData.Pending_Request}
        />
        <CancelApproval
          open={openCancelApproval}
          setOpen={setOpenCancelApproval}
          data={userData.Pending_Request}
        />
        <ReturnedApproval
          open={openReturnedApproval}
          setOpen={setOpenReturnedApproval}
          data={userData.Pending_Request}
        />
        <AllResolveApproval
          open={allOpenResolveApproval}
          setOpen={setAllOpenResolveApproval}
          data={userData.Pending_Request}
        />
        <AllConfirmedApproval
          open={allOpenConfirmedApproval}
          setOpen={setAllOpenConfirmedApproval}
          data={userData.Pending_Request}
        />
        <AllCancelledApproval
          open={allOpenCancelledApproval}
          setOpen={setAllOpenCancelledApproval}
          data={userData.Pending_Request}
        />
      </Grid>
    </Box>
  );
};

export default Approval;
