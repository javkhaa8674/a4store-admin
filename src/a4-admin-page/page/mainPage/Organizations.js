import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  Grid,
  Card,
  CardMedia,
  CircularProgress,
  useTheme,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import {
  ref as dbRef,
  set,
  update,
  remove,
  onValue,
  push,
} from "firebase/database";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "refrence/realConfig"; // Assuming Firebase is initialized
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const Organizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOrg, setEditOrg] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
    address: "",
    bonus: "",
    facebooklink: "",
    logo: "",
    images: [],
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [logoFile, setLogoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState(null);
  const globalTheme = useTheme(); //(optional) if you already have a theme defined in your app root, you can import here
  const tableTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: globalTheme.palette.mode, //let's use the same dark/light mode as the global theme
          primary: globalTheme.palette.secondary, //swap in the secondary color as the primary for the table
          info: {
            main: "rgb(255,122,0)", //add in a custom color for the toolbar alert background stuff
          },
          background: {
            default:
              globalTheme.palette.mode === "light"
                ? "rgb(254,255,244)" //random light yellow color for the background in light mode
                : "#000", //pure black table in dark mode for fun
          },
        },
        typography: {
          button: {
            textTransform: "none", //customize typography styles for all buttons in table by default
            fontSize: "1.2rem",
          },
        },
        components: {
          MuiTooltip: {
            styleOverrides: {
              tooltip: {
                fontSize: "1.1rem", //override to make tooltip font size larger
              },
            },
          },
          MuiSwitch: {
            styleOverrides: {
              thumb: {
                color: "pink", //change the color of the switch thumb in the columns show/hide menu to pink
              },
            },
          },
        },
      }),
    [globalTheme],
  );

  const fetchOrganizations = () => {
    const orgsRef = dbRef(db, "organizations");
    onValue(orgsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const orgList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setOrganizations(orgList);
      } else {
        setOrganizations([]);
      }
    });
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleEditClick = (org) => {
    setEditOrg(org);
    setFormData(org);
    setDialogOpen(true);
    setLogoPreview(org.logo);
    setImagePreviews(org.images || []);
  };

  const uploadImages = async (files) => {
    if (!files.length) return [];

    const uploadPromises = files.map(async (file) => {
      try {
        const imageRef = storageRef(storage, `images/${file.name}`);
        await uploadBytes(imageRef, file);
        return await getDownloadURL(imageRef);
      } catch (error) {
        console.error("Image upload failed:", error);
        return null; // Return null if upload fails
      }
    });

    return await Promise.all(uploadPromises);
  };

  const handleSave = async () => {
    setUploading(true);

    let logoUrl = formData.logo;
    if (logoFile) {
      try {
        const logoRef = storageRef(storage, `logos/${logoFile.name}`);
        await uploadBytes(logoRef, logoFile);
        logoUrl = await getDownloadURL(logoRef);
      } catch (error) {
        console.error("Logo upload failed:", error);
        setUploading(false);
        return; // Exit if logo upload fails
      }
    }

    let imageUrls = formData.images;
    if (selectedFiles.length) {
      const uploadedImageUrls = await uploadImages(selectedFiles);
      const failedUploads = uploadedImageUrls.filter((url) => url === null);

      if (failedUploads.length > 0) {
        // Inform the user about failed uploads
        console.warn(`${failedUploads.length} image(s) failed to upload.`);
      }

      imageUrls = uploadedImageUrls.filter((url) => url !== null); // Filter out failed uploads
    }

    const orgData = { ...formData, logo: logoUrl, images: [...imageUrls] };

    try {
      if (editOrg) {
        await update(dbRef(db, `organizations/${editOrg.id}`), orgData);
      } else {
        const newOrgRef = push(dbRef(db, "organizations"));
        await set(newOrgRef, orgData);
      }
    } catch (error) {
      console.error("Failed to save organization data:", error);
    } finally {
      setUploading(false);
      setDialogOpen(false);
      setFormData({
        name: "",
        phone: "",
        location: "",
        address: "",
        bonus: "",
        facebooklink: "",
        logo: "",
        images: [],
      });
      setSelectedFiles([]);
      setLogoFile(null);
      setLogoPreview(null);
      setImagePreviews([]);
      setEditOrg(null);

      fetchOrganizations();
    }
  };

  const handleDelete = async (id, imagePreviews) => {
    const deletePromises = imagePreviews.map(async (url) => {
      try {
        const fileRef = storageRef(storage, url);
        await deleteObject(fileRef);
      } catch (error) {
        console.log(error);
      }
    });

    await Promise.all(deletePromises);
    remove(dbRef(db, `organizations/${id}`));
    setDeleteDialogOpen(false);
  };

  const openDeleteDialog = (id) => {
    setOrgToDelete(id);
    setDeleteDialogOpen(true);
  };

  return (
    <ThemeProvider theme={tableTheme}>
      <Box sx={{ padding: 4, minHeight: "100vh" }}>
        <Typography variant="h4" gutterBottom color="inherit">
          Хамтрагч байгууллага
        </Typography>
        <Button
          variant="contained"
          onClick={() => setDialogOpen(true)}
          sx={{ mb: 2 }}
        >
          Хамтрагч байгууллага нэмэх
        </Button>
        <Grid container spacing={2}>
          {organizations.length > 0 ? (
            organizations.map((org) => (
              <Grid item xs={12} sm={6} md={4} key={org.id}>
                <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                  {org.logo && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={org.logo}
                      alt={`${org.name} Logo`}
                      sx={{ objectFit: "contain", padding: 1 }}
                    />
                  )}
                  <Box sx={{ padding: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {org.name}
                    </Typography>
                    <Typography color="textSecondary">
                      <span style={{ fontWeight: "bold" }}>Утас:</span>{" "}
                      {org.phone}
                    </Typography>
                    <Typography color="textSecondary">
                      <span style={{ fontWeight: "bold" }}>Хаяг:</span>{" "}
                      {org.address}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: 2,
                      }}
                    >
                      <IconButton
                        color="primary"
                        onClick={() => handleEditClick(org)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="secondary"
                        onClick={() => openDeleteDialog(org.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography variant="body1" color="textSecondary">
              Мэдээлэл байхгүй байна
            </Typography>
          )}
        </Grid>

        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>{editOrg ? "Засах" : "Байгууллага нэмэх"}</DialogTitle>
          <DialogContent>
            <TextField
              label="Байгууллагын нэр"
              name="name"
              fullWidth
              margin="dense"
              value={formData.name}
              onChange={handleChange}
            />
            <TextField
              label="Утас"
              name="phone"
              fullWidth
              margin="dense"
              value={formData.phone}
              onChange={handleChange}
            />
            <TextField
              label="Байршил"
              name="location"
              fullWidth
              margin="dense"
              value={formData.location}
              onChange={handleChange}
            />
            <TextField
              label="Хаяг"
              name="address"
              fullWidth
              margin="dense"
              value={formData.address}
              onChange={handleChange}
            />
            <TextField
              label="Хөнгөлөлт"
              name="bonus"
              fullWidth
              margin="dense"
              value={formData.bonus}
              onChange={handleChange}
            />
            <TextField
              label="Facebook Link"
              name="facebooklink"
              fullWidth
              margin="dense"
              value={formData.facebooklink}
              onChange={handleChange}
            />
            <Box sx={{ mt: 2 }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                style={{ display: "none" }}
                id="logo-upload"
              />
              <label htmlFor="logo-upload">
                <Button
                  variant="contained"
                  component="span"
                  color="primary"
                  sx={{ mb: 2 }}
                >
                  Лого оруулах
                </Button>
              </label>
              {logoPreview && (
                <img
                  src={logoPreview}
                  alt="Logo Preview"
                  style={{ width: "100%", height: "auto", marginTop: "8px" }}
                />
              )}
            </Box>
            <Box sx={{ mt: 2 }}>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                style={{ display: "none" }}
                id="image-upload"
              />
              <label htmlFor="image-upload">
                <Button variant="contained" component="span" color="primary">
                  Зураг оруулах
                </Button>
              </label>
              <Box sx={{ display: "flex", flexWrap: "wrap", marginTop: 2 }}>
                {imagePreviews.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Preview ${index}`}
                    style={{ width: "100px", height: "100px", margin: "4px" }}
                  />
                ))}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleSave} color="primary" disabled={uploading}>
              {uploading ? <CircularProgress size={24} /> : "Save"}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Байгууллага устгах</DialogTitle>
          <DialogContent>
            <Typography>Та байгууллага устгахад итгэлтэй байна уу?</Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              color="secondary"
            >
              Буцах
            </Button>
            <Button
              onClick={() => handleDelete(orgToDelete, imagePreviews)}
              color="primary"
            >
              устгах
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default Organizations;
