import React, { useState, useEffect } from "react";
import { firestore, storage } from "../../../refrence/storeConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {
  Button,
  Box,
  Typography,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material"; // for icon
import ClearIcon from "@mui/icons-material/Clear";
import SaveAltIcon from "@mui/icons-material/SaveAlt";

const AddProductDialog = ({ open, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState({
    title: "",
    price: "",
    category: "",
    moreDetails: "",
    ingredients: "",
    instructions: "",
    reviews: 1,
    discountedPrice: "",
    previews: [],
    thumbnails: [],
    discount: "",
    status: "",
    comingSoon: false,
  });
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const categoriesCollection = collection(firestore, "categories");
      const categorySnapshot = await getDocs(categoriesCollection);
      const categoryList = categorySnapshot.docs.map((doc) => doc.data().title);
      setCategories(categoryList);
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prevProduct) => ({
      ...prevProduct,
      [name]: value,
    }));
  };

  const handleImageChange = (e, type) => {
    const files = Array.from(e.target.files);
    const filePreviews = files.map((file) => ({
      id: crypto.randomUUID(),
      file: file,
      url: URL.createObjectURL(file),
    }));

    setProduct((prevProduct) => ({
      ...prevProduct,
      [type]: [
        ...(prevProduct[type] || []),
        ...filePreviews.map((item) => item.file),
      ],
      [`${type}Urls`]: [
        ...(prevProduct[`${type}Urls`] || []),
        ...filePreviews.map((item) => item.url),
      ],
    }));
  };

  const handleRemoveImage = (index, type) => {
    setProduct((prevProduct) => ({
      ...prevProduct,
      [type]: prevProduct[type].filter((_, i) => i !== index),
      [`${type}Urls`]: prevProduct[`${type}Urls`].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product.title || !product.price || !product.category) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      const uploadImages = async (files, folder) => {
        const uploadedUrls = [];
        for (let file of files) {
          const fileRef = ref(
            storage,
            `products/${product.category}/${file.name}`,
          );
          await uploadBytesResumable(fileRef, file);
          const downloadURL = await getDownloadURL(fileRef);
          uploadedUrls.push(downloadURL);
        }
        return uploadedUrls;
      };

      const previewUrls = await uploadImages(product.previews, "previews");
      const thumbnailUrls = await uploadImages(
        product.thumbnails,
        "thumbnails",
      );

      const productData = {
        title: product.title,
        price: Number(product.price),
        category: product.category,
        moreDetails: product.moreDetails,
        ingredients: product.ingredients,
        instructions: product.instructions,
        discountedPrice: Number(product.discountedPrice),
        reviews: product.reviews,
        timestamp: new Date(),
        status: Number(product.status),
        discount: Number(product.discount),
        comingSoon: product.comingSoon,
        imgs: {
          previews: previewUrls,
          thumbnails: thumbnailUrls,
        },
      };

      await addDoc(collection(firestore, "products"), productData);
      console.log("Product added successfully!");
      setLoading(false);
      setSnackbarOpen(true);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error adding product: ", error.message);
      alert("Error adding product");
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProduct({
      title: "",
      price: "",
      category: "",
      moreDetails: "",
      ingredients: "",
      instructions: "",
      reviews: 1,
      discount: 0,
      status: 0,
      comingSoon: false,
      discountedPrice: "",
      previews: [],
      thumbnails: [],
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent>
        <Typography variant="h5" gutterBottom>
          Бүтээгдэхүүн нэмэхs
        </Typography>

        {/* Form Fields */}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Нэр"
              name="title"
              value={product.title}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Үнэ (MNT)"
              name="price"
              value={product.price}
              onChange={handleChange}
              fullWidth
              required
              type="number"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Гишүүний үнэ (P)"
              name="discountedPrice"
              value={product.discountedPrice}
              onChange={handleChange}
              fullWidth
              type="number"
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Хямдарсан хувь"
              name="discount"
              value={product.discount}
              onChange={handleChange}
              fullWidth
              type="number"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              select
              label="Хямдарсан хувь"
              name="comingSoon"
              value={product.comingSoon}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value={false}> Бэлэн байгаа</MenuItem>
              <MenuItem value={true}> Тун удахгүй</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Агуулахын үлдэгдэл"
              name="status"
              value={product.status}
              onChange={handleChange}
              fullWidth
              type="number"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Ангилал</InputLabel>
              <Select
                name="category"
                value={product.category}
                onChange={handleChange}
                required
              >
                {categories.map((category, index) => (
                  <MenuItem key={index} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Тайлбар"
              name="moreDetails"
              value={product.moreDetails}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Найрлага"
              name="ingredients"
              value={product.ingredients}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Заавар"
              name="instructions"
              value={product.instructions}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
            />
          </Grid>
          <Grid item xs={12}>
            <input
              type="file"
              multiple
              onChange={(e) => handleImageChange(e, "thumbnails")}
              style={{ display: "none" }}
              id="thumbnail-image-input"
            />
            <label htmlFor="thumbnail-image-input">
              <Button
                variant="contained"
                component="span"
                startIcon={<CloudUploadIcon />}
              >
                Зураг оруулах
              </Button>
            </label>
            <Box mt={2}>
              {product.thumbnails.map((file, index) => (
                <Box
                  key={index}
                  display="inline-block"
                  position="relative"
                  mr={1}
                  mb={1}
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Thumbnail ${index}`}
                    style={{ width: 100, height: 100, objectFit: "cover" }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveImage(index, "thumbnails")}
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      color: "#fff",
                    }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Гарах
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <SaveAltIcon />}
        >
          Хадгалах
        </Button>
      </DialogActions>

      {/* Snackbar for Success Message */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert severity="success">Product added successfully!</Alert>
      </Snackbar>
    </Dialog>
  );
};

export default AddProductDialog;
