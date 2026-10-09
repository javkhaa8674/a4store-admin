import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Avatar,
  Typography,
  Button,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Modal,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Pagination,
} from "@mui/material";
import { styled } from "@mui/system";
import { FaSitemap } from "react-icons/fa";
import { MdExpandMore, MdWork } from "react-icons/md";
import { TbCurrencyTugrik } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import a4axios from "a4axios";

const StyledModal = styled(Modal)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const ModalContent = styled(Box)(({ theme }) => ({
  backgroundColor: "#fff",
  borderRadius: 8,
  padding: 24,
  maxWidth: 500,
  width: "90%",
  maxHeight: "90vh",
  overflow: "auto",
}));
const RankBadge = styled(Box)(({ level }) => ({
  padding: "4px 12px",
  borderRadius: "15px",
  display: "inline-block",
  backgroundColor:
    level === "Senior" ? "#4caf50" : level === "Mid" ? "#2196f3" : "#ff9800",
  color: "#fff",
  fontWeight: "bold",
  marginBottom: "10px",
}));
const UserProfile = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  // Calculate the total number of pages
  const totalPages = Math.ceil(profileData?.userInfo?.length / itemsPerPage);

  // Get the data for the current page
  const paginatedData = profileData?.userInfo?.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const handlePageChange = (event, value) => {
    setPage(value);
  };
  useEffect(() => {
    const fetchUserInfo = async () => {
      setLoading(true);
      const userPhone = localStorage.getItem("user");
      let phoneNumber = null;
      // Check if the data exists
      if (userPhone) {
        // Parse the JSON string into an object
        const user = JSON.parse(userPhone);
        // Access the phone property and convert it to a number
        phoneNumber = Number(user.phone);
        console.log("Phone number:", phoneNumber);
      } else {
        console.log("No user data found in localStorage.");
      }
      try {
        const response = await a4axios.post(
          "/userInfo",
          { phoneNumber }, // Sending phoneNumber in request body
        );
        console.log("response", response.data);
        setProfileData(response.data);
        setLoading(false);
      } catch (err) {
        console.log(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleModalClose = () => {
    setIsEditModalOpen(false);
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };
  const handleViewOrgChart = () => {
    // Navigate to the "OrgChart" route
    // navigate("/orgchart");
  };
  console.log(profileData);
  const PaymentHistory = () => (
    <Grid item xs={12}>
      <Accordion>
        <AccordionSummary expandIcon={<MdExpandMore />}>
          <Typography
            variant="h6"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <TbCurrencyTugrik sx={{ mr: 2 }} /> Гүйлгээний түүх
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {profileData &&
            profileData.statements &&
            profileData.statements.length > 0 ? (
              profileData.statements.map((statement) => (
                <ListItem key={statement.id} divider>
                  <ListItemText
                    primary={statement.tranDesc}
                    secondary={statement.tranDate}
                  />
                  <ListItemSecondaryAction>
                    <Typography variant="subtitle1" color="primary">
                      {statement.tranAmount}
                    </Typography>
                  </ListItemSecondaryAction>
                </ListItem>
              ))
            ) : (
              <Typography color="textSecondary">Мэдээлэл олдсонгүй</Typography>
            )}
          </List>
        </AccordionDetails>
      </Accordion>
    </Grid>
  );
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <div className="relative flex flex-col items-center justify-center">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-t-transparent border-[#1976d2] dark:border-[#1976d2] rounded-full animate-spin" />
            <div className="absolute inset-2 border-4 border-t-transparent border-[#1976d2]/80 dark:border-[#1976d2]/80 rounded-full animate-spin-slow" />
            <div className="absolute inset-4 border-4 border-t-transparent border-[#1976d2]/60 dark:border-[#1976d2]/60 rounded-full animate-spin-slower" />
          </div>
        </div>
        <style jsx>{`
          @keyframes spin-slow {
            to {
              transform: rotate(360deg);
            }
          }
          @keyframes spin-slower {
            to {
              transform: rotate(-360deg);
            }
          }
          @keyframes morph {
            0% {
              border-radius: 60% 40% 30% 70%/60% 30% 70% 40%;
            }
            50% {
              border-radius: 30% 60% 70% 40%/50% 60% 30% 60%;
            }
            100% {
              border-radius: 60% 40% 30% 70%/60% 30% 70% 40%;
            }
          }
          .animate-spin-slow {
            animation: spin-slow 3s linear infinite;
          }
          .animate-spin-slower {
            animation: spin-slower 4s linear infinite;
          }
          .animate-morph {
            animation: morph 8s ease-in-out infinite;
          }
          .delay-100 {
            animation-delay: 100ms;
          }
          .delay-200 {
            animation-delay: 200ms;
          }
        `}</style>
      </div>
    );
  }
  if (profileData === null) {
    return (
      <div className="max-h-4xl bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full text-center">
          <div className="relative">
            <h1 className="text-8xl md:text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse mb-8">
              404
            </h1>
          </div>

          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
            Уучлаарай, таны мэдээлэл олдсонгүй
          </h2>
          <p className="text-gray-600 mb-8">
            Та дахин оролдоно уу эсвэл админтай холбогдоно уу
          </p>
        </div>

        <style jsx>{`
          @keyframes float {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-20px);
            }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }
  return (
    <Container maxWidth="lg" sx={{ py: 4, backgroundColor: "#f5f5f5" }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: "center" }}>
              <Box position="relative" display="inline-block">
                <Avatar
                  src={profileData.avatar}
                  alt={profileData.fullName}
                  sx={{ width: 150, height: 150, mb: 2, margin: "0 auto" }}
                />
                <input
                  accept="image/*"
                  type="file"
                  id="avatar-upload"
                  hidden
                  onChange={handleAvatarChange}
                />
                <Tooltip title={`${profileData.Rank} Level Professional`}>
                  <RankBadge level={profileData.Rank}>
                    {profileData.Rank}
                  </RankBadge>
                </Tooltip>
              </Box>
              <Typography variant="h5" gutterBottom>
                {profileData.Name}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Утас: {profileData.Phone}
              </Typography>
              <Button
                variant="contained"
                startIcon={<FaSitemap />}
                onClick={handleViewOrgChart}
                sx={{ mt: 2 }}
              >
                Багийн бүтэц
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<MdExpandMore />}>
                  <Typography
                    variant="h6"
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <MdWork sx={{ mr: 2 }} /> Худалдан авалтын түүх
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {paginatedData?.length > 0 ? (
                    paginatedData.map((userInfo, id) => (
                      <Box key={id} mb={2}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {userInfo.ProductName}
                        </Typography>
                        <Typography color="textSecondary">
                          {userInfo.QuantityName} | {userInfo.RankName} |{" "}
                          {userInfo.timeStamp}
                        </Typography>
                        <Typography color="textSecondary">
                          Огноо:{userInfo.timeStamp}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography color="textSecondary">
                      Мэдээлэл олдсонгүй
                    </Typography>
                  )}
                  {/* Pagination Component */}
                  {totalPages > 1 && (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mt: 3 }}
                    >
                      <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                      />
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            </Grid>

            <PaymentHistory />
            <Box sx={{ paddingTop: 15 }}></Box>
          </Grid>
        </Grid>
      </Grid>

      <StyledModal open={isEditModalOpen} onClose={handleModalClose}>
        <ModalContent>
          <Typography variant="h6" gutterBottom>
            Edit Profile
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={profileData.firstName}
                onChange={(e) =>
                  setProfileData({ ...profileData, firstName: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={profileData.lastName}
                onChange={(e) =>
                  setProfileData({ ...profileData, lastName: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="User ID"
                value={profileData.userId}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bank Name"
                value={profileData.bankName}
                onChange={(e) =>
                  setProfileData({ ...profileData, bankName: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Account ID"
                value={profileData.accountId}
                onChange={(e) =>
                  setProfileData({ ...profileData, accountId: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Occupation"
                value={profileData.occupation}
                onChange={(e) =>
                  setProfileData({ ...profileData, occupation: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Department"
                value={profileData.department}
                onChange={(e) =>
                  setProfileData({ ...profileData, department: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Employee ID"
                value={profileData.employeeId}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Designation"
                value={profileData.designation}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    designation: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={2}
                value={profileData.address}
                onChange={(e) =>
                  setProfileData({ ...profileData, address: e.target.value })
                }
              />
            </Grid>
          </Grid>
          <Box
            sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}
          >
            <Button variant="outlined" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleModalClose}>
              Save Changes
            </Button>
          </Box>
        </ModalContent>
      </StyledModal>
    </Container>
  );
};

export default UserProfile;
