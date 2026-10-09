import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Input,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextareaAutosize,
  FormLabel,
} from "@mui/material";
import { doc, updateDoc, collection, getDocs } from "firebase/firestore";
import { firestore } from "../../../refrence/storeConfig";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "../../../refrence/storeConfig";
import DeleteIcon from "@mui/icons-material/Delete";

const EditProductDialog = ({ product, onClose, onSave }) => {
  const [productName, setProductName] = useState(product.title);
  const [productDescription, setProductDescription] = useState(
    product.ingredients,
  );
  const [productPrice, setProductPrice] = useState(product.price);
  const discountedPrice = product.discountedPrice;

  const [moreDetails, setMoreDetails] = useState(product.moreDetails);
  const [instructions, setInstructions] = useState(product.instructions);
  const [images, setImages] = useState(product.imgs.thumbnails || []);
  const [deletedImages, setDeletedImages] = useState([]);
  // ★ uploadedImages устгасан
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(product.category || "");
  const [status, setStatus] = useState(product.status);
  const [discount, setDiscount] = useState(product.discount);
  const [comingSoon, setComingSoon] = useState(product.comingSoon);

  useEffect(() => {
    const fetchCategories = async () => {
      const categoriesCollection = collection(firestore, "categories");
      const categorySnapshot = await getDocs(categoriesCollection);
      const categoryList = categorySnapshot.docs.map((doc) => doc.data().title);
      setCategories(categoryList);
    };
    fetchCategories();
  }, []);

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    const newImageUrls = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imageRef = ref(storage, `products/thumbnails/${file.name}`);
      try {
        await uploadBytes(imageRef, file);
        const downloadURL = await getDownloadURL(imageRef);
        newImageUrls.push(downloadURL);
      } catch (error) {
        console.error("Зураг хуулахад алдаа гарлаа:", error);
      }
    }
    setImages((prevImages) => [...prevImages, ...newImageUrls]);
    // ★ setUploadedImages устгасан
  };

  const handleImageDelete = async (imageUrl) => {
    try {
      const decodedImageUrl = decodeURIComponent(imageUrl);
      const fileName = decodedImageUrl.split("/").pop().split("?")[0];
      const imageRef = ref(storage, `products/thumbnails/${fileName}`);
      const imageExists = await checkImageExists(imageRef);
      if (imageExists) {
        await deleteObject(imageRef);
        setImages((prevImages) => prevImages.filter((img) => img !== imageUrl));
        setDeletedImages((prevDeleted) => [...prevDeleted, imageUrl]);
        console.log("Зураг амжилттай устгагдлаа.");
      } else {
        console.log(`Зураг олдсонгүй, устгахаас болих: ${imageUrl}`);
      }
    } catch (error) {
      console.error("Зураг устгахад алдаа гарлаа:", error);
    }
  };

  const handleSave = async () => {
    try {
      const updatedProductData = {};
      if (product.title !== productName) updatedProductData.title = productName;
      if (product.ingredients !== productDescription)
        updatedProductData.ingredients = productDescription;
      if (product.price !== productPrice)
        updatedProductData.price = productPrice;
      if (Number(product.status) !== Number(status))
        updatedProductData.status = Number(status);
      if (Number(product.discount) !== Number(discount))
        updatedProductData.discount = Number(discount);
      if (product.discountedPrice !== discountedPrice)
        updatedProductData.discountedPrice = discountedPrice;
      if (product.moreDetails !== moreDetails)
        updatedProductData.moreDetails = moreDetails;
      if (product.instructions !== instructions)
        updatedProductData.instructions = instructions;
      // ★ Зассан: updatedProductData = comingSoon биш, updatedProductData.comingSoon = comingSoon
      if (product.comingSoon !== comingSoon)
        updatedProductData.comingSoon = comingSoon;
      if (product.category !== category) updatedProductData.category = category;
      if (
        product.imgs.thumbnails.length !== images.length ||
        !images.every((img, index) => img === product.imgs.thumbnails[index])
      ) {
        updatedProductData.imgs = { thumbnails: images };
      }

      if (Object.keys(updatedProductData).length > 0) {
        const productDocRef = doc(firestore, "products", product.id);
        await updateDoc(productDocRef, updatedProductData);
        console.log(`Бүтээгдэхүүний ID: ${product.id} амжилттай шинэчлэгдлээ.`);
      }

      for (const imageUrl of deletedImages) {
        let decodedImageUrl = decodeURIComponent(imageUrl);
        const fileName = decodedImageUrl.split("/").pop().split("?")[0];
        const imageRef = ref(storage, `products/thumbnails/${fileName}`);
        const imageExists = await checkImageExists(imageRef);
        if (imageExists) {
          await deleteObject(imageRef);
          console.log(
            `Firebase Storage-аас зураг амжилттай устгагдлаа: ${imageUrl}`,
          );
        } else {
          console.log(`Зураг олдсонгүй, устгахаас болих: ${imageUrl}`);
        }
      }

      onSave(product.id, {
        title: productName,
        ingredients: productDescription,
        price: productPrice,
        discountedPrice,
        moreDetails,
        instructions,
        imgs: { thumbnails: images },
        category,
      });
      onClose();
    } catch (error) {
      console.error(
        "Бүтээгдэхүүний мэдээллийг шинэчлэхэд алдаа гарлаа:",
        error,
      );
    }
  };

  const checkImageExists = async (imageRef) => {
    try {
      await getDownloadURL(imageRef);
      return true;
    } catch (error) {
      if (error.code === "storage/object-not-found") return false;
      throw error;
    }
  };

  return (
    <Dialog open={Boolean(product)} onClose={onClose}>
      <DialogTitle>Бүтээгдэхүүний мэдээллийг засварлах</DialogTitle>
      <DialogContent>
        <TextField
          label="Бүтээгдэхүүний нэр"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Үнэ"
          type="number"
          value={productPrice}
          onChange={(e) => setProductPrice(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          select
          label="Хямдарсан хувь"
          name="comingSoon"
          value={comingSoon}
          // ★ Зассан: e.target.vaue биш, e.target.value
          onChange={(e) => setComingSoon(e.target.value)}
          fullWidth
        >
          <MenuItem value={false}>Бэлэн байгаа</MenuItem>
          <MenuItem value={true}>Тун удахгүй</MenuItem>
        </TextField>
        <TextField
          label="агуулахын үлдэгдэл"
          type="number"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Хямдарсан хувь"
          type="number"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          fullWidth
          margin="normal"
        />
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Ангилал</InputLabel>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            label="Ангилал"
          >
            <MenuItem value="">Ангилал сонгох</MenuItem>
            {categories.map((cat, index) => (
              <MenuItem key={index} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <FormLabel>Найрлага</FormLabel>
          <TextareaAutosize
            minRows={3}
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              fontSize: "16px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </FormControl>

        <FormControl fullWidth margin="normal">
          <FormLabel>Тайлбар</FormLabel>
          <TextareaAutosize
            minRows={3}
            value={moreDetails}
            onChange={(e) => setMoreDetails(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              fontSize: "16px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </FormControl>

        <FormControl fullWidth margin="normal">
          <FormLabel>Заавар</FormLabel>
          <TextareaAutosize
            minRows={3}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              fontSize: "16px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </FormControl>
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          fullWidth
          margin="normal"
        />

        {images.length > 0 && (
          <div style={{ marginTop: "16px" }}>
            <h4>Зурагнууд:</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
              {images.map((img, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "8px",
                  }}
                >
                  <img
                    src={img}
                    alt={`Бүтээгдэхүүний зураг ${index}`}
                    width="100"
                    height="100"
                    style={{ objectFit: "cover", borderRadius: "4px" }}
                  />
                  <IconButton
                    onClick={() => handleImageDelete(img)}
                    color="error"
                    aria-label="delete"
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Цуцлах
        </Button>
        <Button onClick={handleSave} color="secondary">
          Хадгалах
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProductDialog;
