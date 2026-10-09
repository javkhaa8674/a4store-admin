import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Modal,
  IconButton,
  useTheme,
  useMediaQuery,
  TextField, // ★ НЭМЭХ
  Chip,
} from "@mui/material";
import { styled } from "@mui/system";
import { FaTimes, FaGlobe, FaEnvelope, FaBuilding } from "react-icons/fa";

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.2s, box-shadow 0.2s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[4],
  },
}));

const ModalContent = styled(Box)({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  maxWidth: "600px",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "8px",
  backgroundColor: "#fff",
});

const partnersData = [
  {
    id: 1,
    name: "Tech Innovators Inc",
    logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623",
    description:
      "Leading technology solutions provider specializing in AI and ML",
    category: "Technology",
    location: "San Francisco, USA",
    email: "contact@techinnovators.com",
    website: "www.techinnovators.com",
    year: 2018,
  },
  {
    id: 2,
    name: "Green Solutions Co",
    logo: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0",
    description: "Sustainable energy solutions and environmental consulting",
    category: "Environmental",
    location: "Berlin, Germany",
    email: "info@greensolutions.co",
    website: "www.greensolutions.co",
    year: 2019,
  },
  {
    id: 3,
    name: "Global Health Partners",
    logo: "https://images.unsplash.com/photo-1576267423048-15c0040fec78",
    description: "Healthcare innovation and medical research collaboration",
    category: "Healthcare",
    location: "London, UK",
    email: "partners@globalhealth.org",
    website: "www.globalhealth.org",
    year: 2020,
  },
];

const PartnerOrganizations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const filteredPartners = partnersData.filter(
    (partner) =>
      partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCardClick = (partner) => {
    setSelectedPartner(partner);
    setModalOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* ★ Хайлтын TextField нэмсэн */}
      <TextField
        fullWidth
        label="Хайх"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 4 }}
      />

      <Grid container spacing={4}>
        {filteredPartners.map((partner) => (
          <Grid item key={partner.id} xs={12} sm={6} md={4}>
            <StyledCard onClick={() => handleCardClick(partner)}>
              <CardMedia
                component="img"
                height="200"
                image={partner.logo}
                alt={partner.name}
                sx={{ objectFit: "cover" }}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {partner.name}
                </Typography>
                <Chip label={partner.category} size="small" sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary" paragraph>
                  {partner.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ mt: "auto" }}>
                <Button size="small" startIcon={<FaGlobe />}>
                  Visit Website
                </Button>
              </CardActions>
            </StyledCard>
          </Grid>
        ))}
      </Grid>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="partner-modal"
      >
        <ModalContent>
          {selectedPartner && (
            <Box>
              <IconButton
                sx={{ position: "absolute", right: 8, top: 8 }}
                onClick={() => setModalOpen(false)}
              >
                <FaTimes />
              </IconButton>
              <Typography variant="h4" gutterBottom>
                {selectedPartner.name}
              </Typography>
              <CardMedia
                component="img"
                height="300"
                image={selectedPartner.logo}
                alt={selectedPartner.name}
                sx={{ borderRadius: 1, mb: 2 }}
              />
              <Typography variant="body1" paragraph>
                {selectedPartner.description}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="body2"
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <FaBuilding style={{ marginRight: 8 }} />
                    {selectedPartner.location}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="body2"
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <FaEnvelope style={{ marginRight: 8 }} />
                    {selectedPartner.email}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default PartnerOrganizations;
