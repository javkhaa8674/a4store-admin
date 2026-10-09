import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Paper,
} from "@mui/material";
import { styled } from "@mui/system";
import {
  BsTelephone,
  BsEnvelope,
  BsGeoAlt,
  BsLinkedin,
  BsTwitter,
  BsInstagram,
} from "react-icons/bs";

const StyledContactInfo = styled(Card)(({ theme }) => ({
  height: "100%",
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(10px)",
  borderRadius: theme.spacing(2),
}));

const SocialButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  borderRadius: "50%",
  minWidth: "50px",
  width: "50px",
  height: "50px",
}));

const MapContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  height: "400px",
  borderRadius: theme.spacing(1),
  overflow: "hidden",
  position: "relative",
  "& iframe": {
    border: 0,
    width: "100%",
    height: "100%",
  },
}));

const ContactPage = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <StyledContactInfo>
            <CardContent>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
                Get in Touch
              </Typography>
              <Box sx={{ my: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <BsGeoAlt size={24} />
                  <Typography variant="body1" sx={{ ml: 2 }}>
                    123 Business Street, Tech City, 12345
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <BsTelephone size={24} />
                  <Typography variant="body1" sx={{ ml: 2 }}>
                    +1 (555) 123-4567
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <BsEnvelope size={24} />
                  <Typography variant="body1" sx={{ ml: 2 }}>
                    contact@company.com
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Follow Us
                </Typography>
                <Box>
                  <SocialButton color="primary" aria-label="linkedin">
                    <BsLinkedin size={20} />
                  </SocialButton>
                  <SocialButton color="primary" aria-label="twitter">
                    <BsTwitter size={20} />
                  </SocialButton>
                  <SocialButton color="primary" aria-label="instagram">
                    <BsInstagram size={20} />
                  </SocialButton>
                </Box>
              </Box>
            </CardContent>
          </StyledContactInfo>
        </Grid>

        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, borderRadius: 2, boxShadow: theme.shadows[3] }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
              Our Location
            </Typography>
            <MapContainer>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387193.3059445135!2d-74.25986613799748!3d40.69714941774136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sin!4v1656241064979!5m2!1sen!2sin"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Company Location"
              />
            </MapContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ContactPage;
