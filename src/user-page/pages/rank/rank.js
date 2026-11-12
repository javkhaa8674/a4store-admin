import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Modal,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/system";
import { useState } from "react";
import { FaSitemap, FaTimes, FaUserTie } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Import useNavigate for routing

const StyledCard = styled(Card)(() => ({
  width: "90%",
  maxHeight: "90vh",

  transition: "transform 0.2s",
  "&:hover": {
    transform: "translateY(-5px)",
  },
}));

const ProfileAvatar = styled(Avatar)(() => ({
  width: 120,
  height: 120,
  margin: "0 auto 20px",
  border: "4px solid #fff",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
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

const ModalContent = styled(Box)({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "#fff",
  padding: "32px",
  borderRadius: "8px",
  maxWidth: "90%",
  maxHeight: "90vh",
  overflow: "auto",
});

const UserProfile = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  const userData = {
    name: "Нарангэрэл Тэнгис",
    rank: "БАТ",
    role: "Борлуулалтын ахлах төлөөлөгч",
    phone: "+976 99001122",
    profileImage:
      "https://firebasestorage.googleapis.com/v0/b/a4mongolia.appspot.com/o/BAT.png?alt=media&token=4f229a70-291a-4106-834d-eb0999be80f1",
  };

  const handleImageError = (e) => {
    e.target.src =
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60";
  };

  const handleViewOrgChart = () => {
    // Navigate to the "OrgChart" route
    navigate("/orgchart");
  };

  return (
    <Box sx={{ backgroundColor: "#f5f5f5" }}>
      <StyledCard elevation={4}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4} sx={{ textAlign: "center" }}>
              <ProfileAvatar
                src={userData.profileImage}
                onError={handleImageError}
                alt={userData.name}
              />
              <Tooltip title={`${userData.rank} Level Professional`}>
                <RankBadge level={userData.rank}>{userData.rank}</RankBadge>
              </Tooltip>
            </Grid>

            <Grid item xs={12} md={8}>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{ fontWeight: "bold" }}
              >
                {userData.name}
              </Typography>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                {userData.role}
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph>
                Утас: {userData.phone}
              </Typography>

              {/* Update the button to navigate to the OrgChart route */}
              <Button
                variant="contained"
                color="primary"
                startIcon={<FaSitemap />}
                onClick={handleViewOrgChart} // Use the navigation handler
                sx={{ marginRight: "2px", mt: 2 }}
              >
                Багийн бүтэц
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<FaSitemap />}
                onClick={handleViewOrgChart} // Use the navigation handler
                sx={{ mt: 2 }}
              >
                Багт орох
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </StyledCard>

      {/* Modal remains unchanged but could be removed if no longer needed */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="org-chart-modal"
        aria-describedby="organizational-structure-view"
      >
        <ModalContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h5" component="h2">
              Organizational Structure
            </Typography>
            <IconButton onClick={() => setModalOpen(false)} size="small">
              <FaTimes />
            </IconButton>
          </Box>

          <Box sx={{ textAlign: "center" }}>
            <FaUserTie size={48} color="#1976d2" />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Organizational chart visualization would go here
            </Typography>
          </Box>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UserProfile;
