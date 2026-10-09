import React, { useState, useEffect } from "react";
import axios from "axios";
import { TextField, Button, CircularProgress, Alert, Box } from "@mui/material";

const BlackTransactionReq = () => {
  const [searchId, setSearchId] = useState(""); // To store the entered ID
  const [result, setResult] = useState(null); // To store the API response
  const [loadingSearch, setLoadingSearch] = useState(false); // For search loading state
  const [loadingSubmit, setLoadingSubmit] = useState(false); // For submit loading state
  const [successMessage, setSuccessMessage] = useState(""); // For success message
  const [errorMessage, setErrorMessage] = useState(""); // For error message

  useEffect(() => {
    if (searchId.length < 8) {
      setResult(null);
    }
  }, [searchId]);

  // Function to handle search button click
  const handleSearch = async () => {
    if (!searchId.trim()) {
      setErrorMessage("Please enter a valid ID");
      return;
    }

    setLoadingSearch(true);
    setResult(null);
    setErrorMessage(""); // Reset error message

    try {
      const response = await axios.get(
        `http://127.0.0.1:5001/a4mongolia/us-central1/api/vip?memberId=${searchId}`,
      );
      setResult(response.data); // Set the response data
      console.log(response.data); // Log the response
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || "An error occurred while searching",
      );
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleSubmit = async () => {
    setLoadingSubmit(true);
    setErrorMessage(""); // Reset error message
    setSuccessMessage(""); // Reset success message
    try {
      const response = await axios.post(
        `https://api-hw5amqni4q-uc.a.run.app/Save-vip`,
        {
          VipName: result.data.name,
          VipMemberId: result.data.MemberId,
          timeStamp: new Date().toLocaleString("mn-MN"),
          totalEbarimtCount: result.data.totalEbarimtCount,
          totalPromotionDebit: result.data.totalPromotionDebit,
        },
      );
      setSuccessMessage("Хүсэлт амжилттай илгээгдлээ!"); // Success message
      setResult(response.data); // Set the response data
      console.log(response.data); // Log the response
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || "An error occurred while saving",
      );
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Auto-hide the alert after 5 seconds
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 5000); // 5 seconds

      return () => clearTimeout(timer); // Cleanup timer on unmount
    }
  }, [successMessage, errorMessage]);

  return (
    <Box
      sx={{
        padding: "40px",
        maxWidth: "600px", // Limit the width to make it larger on desktop
        margin: "auto",
        backgroundColor: "#f4f4f4",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", // Adding a soft shadow
        "@media (max-width: 768px)": {
          maxWidth: "500px", // For slightly smaller desktop/tablet screens
        },
      }}
    >
      <h2
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          color: "#0B6BCB",
          textAlign: "center",
        }}
      >
        Вип шилжих хүсэлт
      </h2>

      <div style={{ marginBottom: "20px" }}>
        <TextField
          label="Утас"
          variant="outlined"
          fullWidth
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          sx={{
            marginBottom: "30px",
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px", // Rounded corners for input
            },
            "& .MuiInputLabel-root": {
              fontSize: "1.1rem", // Larger label font size
            },
            "@media (max-width: 768px)": {
              fontSize: "1.2rem", // Slightly larger font size for mobile
            },
          }}
        />
      </div>

      <Button
        variant="contained"
        color="primary"
        onClick={handleSearch}
        fullWidth
        sx={{
          padding: "15px",
          fontSize: "1.2rem", // Bigger button text
          backgroundColor: "#0B6BCB",
          color: "#fff",
          borderRadius: "8px",
          fontWeight: "bold",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Shadow for button
          "&:hover": {
            backgroundColor: "#0B6BCB",
          },
        }}
      >
        {loadingSearch ? (
          <CircularProgress size={30} color="secondary" thickness={5} />
        ) : (
          "Хайх"
        )}
      </Button>

      {errorMessage && (
        <Alert severity="error" sx={{ marginTop: "20px" }}>
          {errorMessage}
        </Alert>
      )}

      {result && (
        <div style={{ marginTop: "40px" }}>
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <TextField
              label="Утас"
              variant="outlined"
              value={result.data.MemberId || ""}
              fullWidth
              readOnly
              sx={{
                marginBottom: "20px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
            />
            <TextField
              label="Овог нэр"
              variant="outlined"
              value={result.data.name || ""}
              fullWidth
              readOnly
              sx={{
                marginBottom: "20px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
            />
          </div>
          <Button
            variant="contained"
            color="success"
            onClick={handleSubmit}
            fullWidth
            sx={{
              padding: "15px",
              fontSize: "1.2rem",
              backgroundColor: "#4caf50",
              color: "#fff",
              borderRadius: "8px",
              fontWeight: "bold",
              marginTop: "30px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              "&:hover": {
                backgroundColor: "#388e3c",
              },
            }}
          >
            {loadingSubmit ? (
              <CircularProgress size={30} color="secondary" thickness={5} />
            ) : (
              "Хүсэлт илгээх"
            )}
          </Button>
        </div>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ marginTop: "20px" }}>
          {successMessage}
        </Alert>
      )}
    </Box>
  );
};

export default BlackTransactionReq;
