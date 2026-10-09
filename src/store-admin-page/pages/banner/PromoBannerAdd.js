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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // This will hold the Firebase Storage URL
  const [sale, setSale] = useState("");
  const [imageFile, setImageFile] = useState(null); // To hold the selected file
  const [previewUrl, setPreviewUrl] = useState(""); // For image preview
  const [loading, setLoading] = useState(false); // Loading state

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

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Create a preview URL
    }
  };

  // Upload image to Firebase Storage
  const handleImageUpload = async () => {
    if (!imageFile) return null;
    const storageRef = ref(storage, `banners/promoBanner/${imageFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);
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
      let downloadURL = imageUrl; // Default to the current imageUrl
      // If a new image file is selected, upload it and get the URL
      if (imageFile) {
        downloadURL = await handleImageUpload();
        if (!downloadURL) return; // Stop if upload fails
      }
      if (!imageUrl && !title && !description) {
        return alert(`failed`);
      }
      // Reference to the heroBanner document in the "banners" collection
      const heroBannerRef = doc(firestore, "banners/promoBanner");
      // Update the document by appending to the mainBanners or sideBanners array
      await updateDoc(heroBannerRef, {
        [`banners`]: arrayUnion({
          imageUrl: downloadURL, // Use the updated image URL
          id: uuidv4(),
        }),
      });

      onClose(); // Close the dialog
      // Reset form fields
      setTitle("");
      setDescription("");
      setImageUrl("");
      setImageFile(null); // Clear the selected file
      setPreviewUrl(""); // Clear the preview URL
      setSale("");
    } catch (error) {
      console.error("Error adding banner:", error);
    } finally {
      setLoading(false); // Set loading to false after submitting
    }
  };

  // Delete the selected image
  const handleDeleteImage = () => {
    setImageFile(null);
    setPreviewUrl("");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{ textAlign: "center", fontWeight: "bold", fontSize: "1.5rem" }}
      >
        Promo Banner Нэмэх
      </DialogTitle>
      <DialogContent>
        {/* Form Fields */}
        <TextField
          label="Нэр"
          fullWidth
          margin="normal"
          value={title}
          required
          onChange={(e) => setTitle(e.target.value)}
          variant="outlined"
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
        />
        <TextField
          label="Тайлбар"
          fullWidth
          required
          margin="normal"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          variant="outlined"
          multiline
          rows={3}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
        />
        <TextField
          label="Sale (%)"
          fullWidth
          margin="normal"
          value={sale}
          onChange={(e) => setSale(e.target.value)}
          variant="outlined"
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
        />

        {/* Image Upload Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mt: 2,
            justifyContent: "center",
            gap: 2,
          }}
        >
          <label htmlFor="upload-image">
            <Tooltip title="Upload Image">
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
                  Зураг оруулах
                </Typography>
              </IconButton>
            </Tooltip>
          </label>
          <input
            id="upload-image"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageSelect}
          />
          {previewUrl ? (
            <StyledImagePreview>
              <img src={previewUrl} alt="Preview" />
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
                  onClick={handleDeleteImage}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </StyledImagePreview>
          ) : (
            <StyledImagePreview>
              <Typography variant="body2" color="textSecondary">
                No Image Selected
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
