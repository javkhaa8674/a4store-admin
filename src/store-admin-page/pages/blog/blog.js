import React, { useState, useEffect } from "react";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddBlog from "./addblog";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/system";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { firestore } from "../../../refrence/storeConfig";
import EditBlog from "./editBlog";

const Blog = () => {
  const [openAddBlogDialog, setOpenAddBlogDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [blogsData, setBlogsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editBlogData, setEditBlogData] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const blogCollection = collection(firestore, "blog");
        const unsubscribe = onSnapshot(blogCollection, (snapshot) => {
          const blogList = snapshot.docs.map((doc) => {
            const data = doc.data();

            // Convert Firestore Timestamp to a date string (if it exists)
            if (data.timestamp && data.timestamp.toDate) {
              data.timestamp = data.timestamp.toDate().toLocaleString();
            }

            return {
              id: doc.id,
              ...data,
            };
          });
          setBlogsData(blogList);
          setLoading(false);
        });
        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching blogs: ", error);
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const handleAddBlog = () => {
    setOpenAddBlogDialog(true);
  };

  const handleCloseAddBlog = () => {
    setOpenAddBlogDialog(false);
  };

  const handleSaveBlog = (newBlogData) => {
    // Add logic to save new blog data (e.g., upload to Firestore or Firebase Storage)
    console.log("New blog data:", newBlogData);
    setOpenAddBlogDialog(false);
  };

  const handleDeleteBlog = async (blogId) => {
    const confirmDelete = window.confirm(
      "Та энэ блогийг устгахдаа итгэлтэй байна уу?",
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(firestore, "blog", blogId));
      setBlogsData(blogsData.filter((blog) => blog.id !== blogId));
    } catch (error) {
      console.error("Error deleting blog: ", error);
    }
  };

  const handleEditBlog = (blog) => {
    console.log("Edit blog:", blog);
    setEditBlogData(blog);
  };

  const handleCloseEditBlog = () => {
    setEditBlogData(null);
  };

  const filteredBlogs = blogsData.filter((blog) =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <>
      <Button
        size="large"
        sx={{ margin: "2vh" }}
        onClick={handleAddBlog}
        variant="contained"
        startIcon={<AddIcon />}
      >
        Мэдээ оруулах
      </Button>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {filteredBlogs.map((blog) => (
            <Grid item key={blog.id} xs={12} sm={6} md={4}>
              <StyledCard>
                <CardMedia
                  component="img"
                  sx={{
                    aspectRatio: "4/3",
                    objectFit: "cover",
                    width: "100%",
                  }}
                  image={blog.imageUrl || "/default-image.jpg"}
                  alt={blog.title}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {blog.title}
                  </Typography>
                  <Chip label={blog.category} size="small" sx={{ mb: 2 }} />
                  <Typography variant="caption" color="text.secondary">
                    {blog.timestamp}
                  </Typography>
                  <Box
                    sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}
                  >
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditBlog(blog);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBlog(blog.id);
                      }}
                    >
                      <DeleteIcon sx={{ color: "red" }} />
                    </IconButton>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {openAddBlogDialog && (
        <AddBlog
          open={openAddBlogDialog}
          onClose={handleCloseAddBlog}
          onSave={handleSaveBlog}
        />
      )}
      {editBlogData && (
        <EditBlog
          open={true}
          onClose={handleCloseEditBlog}
          onSave={() => {}}
          blog={editBlogData}
        />
      )}
    </>
  );
};

export default Blog;
