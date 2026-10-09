import React, { useState, useEffect } from "react";
import axios from "axios";
import { TextField, Button, CircularProgress, Alert, Box } from "@mui/material";

const CancelReq = () => {
  const [searchId, setSearchId] = useState(""); // To store the entered ID
  const [refundCode, setRefundCode] = useState(""); // To store the entered ID
  const [result, setResult] = useState(null); // To store the API response
  const [loadingSearch, setLoadingSearch] = useState(false); // For search loading state
  const [loadingSubmit, setLoadingSubmit] = useState(false); // For submit loading state
  const [successMessage, setSuccessMessage] = useState(""); // For success message
  const [errorMessage, setErrorMessage] = useState(""); // For error message
  const [tworesult, setTworesult] = useState(null);
  useEffect(() => {
    if (searchId.length < 8) {
      setResult(null);
      setTworesult(null);
      setRefundCode(null);
    }
  }, [searchId, refundCode]);
  // Function to handle search button click
  const handleSearch = async () => {
    if (!searchId.trim()) {
      setErrorMessage("Please enter a valid ID");
      return;
    }

    setLoadingSearch(true);
    setErrorMessage(null);
    setResult(null);
    setErrorMessage(""); // Reset error message

    try {
      const response = await axios.post(
        `https://api-hw5amqni4q-uc.a.run.app/CancelContactRequest`,
        { phone: searchId },
      );

      if (response.data.data.type === "two") {
        setTworesult(response.data);
      } else if (
        response.data.data.type === "new" ||
        response.data.data.type === "old"
      ) {
        setResult(response.data);
      }
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
      if (tworesult) {
        await axios.post(
          `https://api-hw5amqni4q-uc.a.run.app/saveCancelContact`,
          { tworesult, refundCode: refundCode },
        );
      } else {
        const data = result.data;
        await axios.post(
          `https://api-hw5amqni4q-uc.a.run.app/saveCancelContact`,
          {
            MemberId: data.MemberId,
            type: data.type,
            refundCode: refundCode,
            Name: data.Name,
            CodeCount: data.CodeCount,
            inviteAmount: data.inviteAmount,
            bonusAmount: data.bonusAmount,
            totalAmount: data.totalAmount,
            Ebarimt: data.Ebarimt,
            Product: data.Product,
            accNumber: data.accNumber,
            accName: data.accName,
          },
        );
      }

      setSuccessMessage("Хүсэлт амжилттай илгээгдлээ!"); // Success message
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
        Буцаалт хийх хүсэлт
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
              label="Төрөл"
              variant="outlined"
              value={
                result.data.type === "old"
                  ? "Хуучин систем"
                  : result.data.type === "new"
                    ? "Шинэ систем"
                    : result.data.type // fallback to default value if needed
              }
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
              value={result.data.Name || ""}
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
              label="Нийт код тоо"
              variant="outlined"
              value={result.data.CodeCount || ""}
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
              label="Буцаах код тоо"
              variant="outlined"
              value={refundCode}
              onChange={(e) => setRefundCode(e.target.value)}
              fullWidth
              required
              type="number" // Only allows numbers
              error={refundCode === "" || isNaN(refundCode)} // Error if empty or not a number
              color="success"
              focused
              helperText={
                refundCode === "" || isNaN(refundCode)
                  ? "Буцаах код тоо оруулна уу"
                  : ""
              }
              sx={{
                marginBottom: "20px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "&.Mui-error": {
                    borderColor: "#ff9800", // Warning color (yellow-orange)
                  },
                },
                "& .MuiFormHelperText-root": {
                  color: "#ff9800", // Warning color for helper text
                },
              }}
            />

            <TextField
              label="Борлуулалтын урамшуулал авсан дүн"
              variant="outlined"
              value={
                result.data.bonusAmount
                  ? new Intl.NumberFormat("mn-MN", {
                      style: "currency",
                      currency: "MNT",
                    }).format(result.data.bonusAmount)
                  : 0
              }
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
              label="Урилтын урамшуулал авсан дүн"
              variant="outlined"
              value={
                result.data.inviteAmount
                  ? new Intl.NumberFormat("mn-MN", {
                      style: "currency",
                      currency: "MNT",
                    }).format(result.data.inviteAmount)
                  : 0
              }
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
              label="Нийт авсан урамшуулал"
              variant="outlined"
              value={
                result.data.totalAmount
                  ? new Intl.NumberFormat("mn-MN", {
                      style: "currency",
                      currency: "MNT",
                    }).format(result.data.totalAmount)
                  : 0
              }
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
              label="Е-Баримт авсан дүн"
              variant="outlined"
              value={
                result.data.Ebarimt
                  ? new Intl.NumberFormat("mn-MN", {
                      style: "currency",
                      currency: "MNT",
                    }).format(result.data.Ebarimt)
                  : 0
              }
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
              label="Бүтээгдэхүүн авсан тоо"
              variant="outlined"
              value={result.data.Product || "0"}
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
              label="Банк нэр"
              variant="outlined"
              value={result.data.accName || ""}
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
              label="Дансны дугаар"
              variant="outlined"
              value={result.data.accNumber || ""}
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
            disabled={!refundCode}
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
      {tworesult && (
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
              label="Төрөл"
              variant="outlined"
              value={
                tworesult.data.type === "two"
                  ? "Шинэ Болон Хуучин систем"
                  : tworesult.data.type
              }
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
              label="Утас"
              variant="outlined"
              value={tworesult.data.MemberId || ""}
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
              label=" Шинэ систем овог нэр"
              variant="outlined"
              value={tworesult.data.newName || ""}
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
              label=" Black vip систем овог нэр"
              variant="outlined"
              value={tworesult.data.oldName || ""}
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
              label="Шинэ систем код тоо"
              variant="outlined"
              value={tworesult.data.newCodeCount || ""}
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
              label="Black код тоо"
              variant="outlined"
              value={tworesult.data.oldCodeCount || ""}
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
              label="Нйит код тоо"
              variant="outlined"
              value={tworesult.data.totalCode || ""}
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
              label="Буцаах код тоо"
              variant="outlined"
              value={refundCode}
              onChange={(e) => setRefundCode(e.target.value)}
              fullWidth
              required
              error={!"123"} // or any condition to trigger error, like if value is empty
              color="warning"
              focused
              helperText={!"123" ? "This field is required" : ""}
              sx={{
                marginBottom: "20px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "&.Mui-error": {
                    borderColor: "#ff9800", // Warning color (yellow-orange)
                  },
                },
                "& .MuiFormHelperText-root": {
                  color: "#ff9800", // Warning color for helper text
                },
              }}
            />

            <TextField
              label="Борлуулалтын урамшуулал авсан дүн"
              variant="outlined"
              value={
                tworesult.data.bonusAmount
                  ? new Intl.NumberFormat("mn-MN", {
                      style: "currency",
                      currency: "MNT",
                    }).format(tworesult.data.bonusAmount)
                  : 0
              }
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
              label="Урилтын урамшуулал авсан дүн"
              variant="outlined"
              value={
                tworesult.data.inviteAmount
                  ? new Intl.NumberFormat("mn-MN", {
                      style: "currency",
                      currency: "MNT",
                    }).format(tworesult.data.inviteAmount)
                  : 0
              }
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
              label="Нийт авсан урамшуулал"
              variant="outlined"
              value={
                tworesult.data.totalAmount
                  ? new Intl.NumberFormat("mn-MN", {
                      style: "currency",
                      currency: "MNT",
                    }).format(tworesult.data.totalAmount)
                  : 0
              }
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
              label="Шинэ систем Е-Баримт авсан дүн"
              variant="outlined"
              value={
                tworesult.data.newEbarimt
                  ? new Intl.NumberFormat("mn-MN", {
                      style: "currency",
                      currency: "MNT",
                    }).format(tworesult.data.newEbarimt)
                  : 0
              }
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
              label="Black Е-Баримт авсан дүн"
              variant="outlined"
              value={
                tworesult.data.oldEbarimt
                  ? new Intl.NumberFormat("mn-MN", {
                      style: "currency",
                      currency: "MNT",
                    }).format(tworesult.data.oldEbarimt)
                  : 0
              }
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
              label="Шинэ систем бүтээгдэхүүн авсан тоо"
              variant="outlined"
              value={tworesult.data.newProducts}
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
              label="Black бүтээгдэхүүн авсан тоо"
              variant="outlined"
              value={tworesult.data.oldProducts}
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
              label="Шинэ систем банк нэр"
              variant="outlined"
              value={tworesult.data.newaccName || ""}
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
              label="Шинэ систем дансны дугаар"
              variant="outlined"
              value={tworesult.data.newaccNumber || ""}
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
              label="Black банк нэр"
              variant="outlined"
              value={tworesult.data.oldaccName || ""}
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
              label="Black дансны дугаар"
              variant="outlined"
              value={tworesult.data.oldaccNumber || ""}
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

export default CancelReq;
