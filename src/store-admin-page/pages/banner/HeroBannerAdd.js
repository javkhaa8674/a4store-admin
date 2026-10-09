import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/system";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { firestore, storage } from "../../../refrence/storeConfig"; // Ensure this is correctly set up
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { v4 as uuidv4 } from "uuid";

const HeroBannerAdd = ({ open, onClose }) => {
  const [url, setUrl] = useState("");
  const [desktopImageFile, setDesktopImageFile] = useState(null); // Desktop image file
  const [mobileImageFile, setMobileImageFile] = useState(null); // Mobile image file
  const [desktopPreviewUrl, setDesktopPreviewUrl] = useState(""); // Desktop image preview
  const [mobilePreviewUrl, setMobilePreviewUrl] = useState(""); // Mobile image preview
  const [loading, setLoading] = useState(false);

  // Styled Components
  const StyledButton = styled(Button)(({ theme }) => ({
    padding: "10px 20px",
    borderRadius: "8px",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "scale(1.05)",
      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
    },
  }));

  const StyledImagePreview = styled(Box)(({ theme }) => ({
    width: "120px",
    height: "120px",
    borderRadius: "8px",
    border: "2px dashed #ddd",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
    cursor: "pointer",
    "& img": {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    "&:hover": {
      borderColor: theme.palette.primary.main,
    },
  }));

  // Handle image selection (Desktop)
  const handleDesktopImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDesktopImageFile(file);
      setDesktopPreviewUrl(URL.createObjectURL(file)); // Create a preview URL
    }
  };

  // Handle image selection (Mobile)
  const handleMobileImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMobileImageFile(file);
      setMobilePreviewUrl(URL.createObjectURL(file)); // Create a preview URL
    }
  };

  // Upload image to Firebase Storage
  const handleImageUpload = async (file) => {
    if (!file) return null;
    const storageRef = ref(storage, `banners/herobanner/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    try {
      await uploadTask;
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL; // Return the download URL
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image.");
      return null;
    }
  };

  // Submit form data
  const handleSubmit = async () => {
    setLoading(true); // Set loading to true while submitting
    try {
      let desktopImageUrl = null;
      let mobileImageUrl = null;

      // Upload desktop image if selected
      if (desktopImageFile) {
        desktopImageUrl = await handleImageUpload(desktopImageFile);
        if (!desktopImageUrl) return; // Stop if upload fails
      }

      // Upload mobile image if selected
      if (mobileImageFile) {
        mobileImageUrl = await handleImageUpload(mobileImageFile);
        if (!mobileImageUrl) return; // Stop if upload fails
      }

      // Validate required fields
      if (!desktopImageUrl && !mobileImageUrl) {
        alert("Please provide a URL and at least one image.");
        return;
      }

      // Reference to the heroBanner document in the "banners" collection
      const heroBannerRef = doc(firestore, "banners/heroBanner");

      // Update the document by appending to the sideBanners array
      await updateDoc(heroBannerRef, {
        mainBanners: arrayUnion({
          url: url || "",
          desktopImageUrl: desktopImageUrl || "", // Use empty string if not provided
          mobileImageUrl: mobileImageUrl || "", // Use empty string if not provided
          id: uuidv4(),
        }),
      });

      onClose(); // Close the dialog
      // Reset form fields
      setUrl("");
      setDesktopImageFile(null);
      setMobileImageFile(null);
      setDesktopPreviewUrl("");
      setMobilePreviewUrl("");
    } catch (error) {
      console.error("Error adding banner:", error);
    } finally {
      setLoading(false); // Set loading to false after submitting
    }
  };

  // Delete the selected image (Desktop)
  const handleDeleteDesktopImage = () => {
    setDesktopImageFile(null);
    setDesktopPreviewUrl("");
  };

  // Delete the selected image (Mobile)
  const handleDeleteMobileImage = () => {
    setMobileImageFile(null);
    setMobilePreviewUrl("");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{ textAlign: "center", fontWeight: "bold", fontSize: "1.5rem" }}
      >
        Hero Banner Нэмэх
      </DialogTitle>
      <DialogContent>
        {/* URL Field */}
        <TextField
          label="URL"
          fullWidth
          margin="normal"
          value={url}
          required
          onChange={(e) => setUrl(e.target.value)}
          variant="outlined"
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
        />

        {/* Desktop Image Upload Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mt: 2,
            justifyContent: "center",
            gap: 2,
          }}
        >
          <label htmlFor="upload-desktop-image">
            <Tooltip title="Upload Desktop Image">
              <IconButton
                component="span"
                color="primary"
                sx={{
                  backgroundColor: "#f0f8ff",
                  "&:hover": { backgroundColor: "#e0f7fa" },
                }}
              >
                <CloudUploadIcon />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  Desktop Зураг оруулах
                </Typography>
              </IconButton>
            </Tooltip>
          </label>
          <input
            id="upload-desktop-image"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleDesktopImageSelect}
          />
          {desktopPreviewUrl ? (
            <StyledImagePreview>
              <img src={desktopPreviewUrl} alt="Desktop Preview" />
              <Tooltip title="Delete Image">
                <IconButton
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    color: "#fff",
                    "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.9)" },
                  }}
                  onClick={handleDeleteDesktopImage}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </StyledImagePreview>
          ) : (
            <StyledImagePreview>
              <Typography variant="body2" color="textSecondary">
                No Desktop Image Selected
              </Typography>
            </StyledImagePreview>
          )}
        </Box>

        {/* Mobile Image Upload Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mt: 2,
            justifyContent: "center",
            gap: 2,
          }}
        >
          <label htmlFor="upload-mobile-image">
            <Tooltip title="Upload Mobile Image">
              <IconButton
                component="span"
                color="primary"
                sx={{
                  backgroundColor: "#f0f8ff",
                  "&:hover": { backgroundColor: "#e0f7fa" },
                }}
              >
                <CloudUploadIcon />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  Mobile Зураг оруулах
                </Typography>
              </IconButton>
            </Tooltip>
          </label>
          <input
            id="upload-mobile-image"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleMobileImageSelect}
          />
          {mobilePreviewUrl ? (
            <StyledImagePreview>
              <img src={mobilePreviewUrl} alt="Mobile Preview" />
              <Tooltip title="Delete Image">
                <IconButton
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    color: "#fff",
                    "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.9)" },
                  }}
                  onClick={handleDeleteMobileImage}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </StyledImagePreview>
          ) : (
            <StyledImagePreview>
              <Typography variant="body2" color="textSecondary">
                No Mobile Image Selected
              </Typography>
            </StyledImagePreview>
          )}
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 3 }}>
          <StyledButton
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={24} /> : <AddIcon />}
            disabled={loading} // Disable button while loading
          >
            {loading ? "Saving..." : "Submit"}
          </StyledButton>
          <StyledButton
            onClick={onClose}
            variant="outlined"
            color="secondary"
            startIcon={<DeleteIcon />}
          >
            Cancel
          </StyledButton>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default HeroBannerAdd;
