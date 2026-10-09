import React, { useState } from "react";
import { CircularProgress, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import HeroBannerAdd from "./HeroBannerAdd";
import PromoBannerAdd from "./PromoBannerAdd";

const BannerList = () => {
  // State for managing dialog visibility
  const [isHeroBannerDialogOpen, setIsHeroBannerDialogOpen] = useState(false);
  const [isPromoBannerDialogOpen, setIsPromoBannerDialogOpen] = useState(false);

  // Handlers for opening and closing dialogs
  const handleHeroBannerDialogOpen = () => setIsHeroBannerDialogOpen(true);
  const handleHeroBannerDialogClose = () => setIsHeroBannerDialogOpen(false);

  const handlePromoBannerDialogOpen = () => setIsPromoBannerDialogOpen(true);
  const handlePromoBannerDialogClose = () => setIsPromoBannerDialogOpen(false);

  return (
    <>
      {/* Buttons for Adding Banners */}
      <Button
        size="large"
        sx={{ margin: "2vh" }}
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleHeroBannerDialogOpen}
      >
        Add Hero Banner
      </Button>

      <Button
        size="large"
        sx={{ margin: "2vh" }}
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handlePromoBannerDialogOpen}
      >
        Add Promo Banner
      </Button>

      {/* Dialog for Adding Hero Banner */}
      {isHeroBannerDialogOpen && (
        <HeroBannerAdd
          open={isHeroBannerDialogOpen}
          onClose={handleHeroBannerDialogClose}
        />
      )}

      {/* Dialog for Adding Promo Banner */}
      {isPromoBannerDialogOpen && (
        <PromoBannerAdd
          open={isPromoBannerDialogOpen}
          onClose={handlePromoBannerDialogClose}
        />
      )}
    </>
  );
};

export default BannerList;
