import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  Stack,
  Box,
  Paper,
  Collapse,
  Pagination,
  Grid,
  Card,
  IconButton,
} from "@mui/material";
import {
  ArrowUpward,
  ArrowDownward,
  AccountBalanceWallet,
  ExpandMore,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import a4axios from "a4axios";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const getDateFilter = (days) =>
  dayjs().subtract(days, "day").format("YYYY-MM-DD");

const PaymentHistory = () => {
  const [dateFilter, setDateFilter] = useState("1970-01-01"); // Show all data by default
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [paymentData, setPaymentData] = useState([]);
  const navigation = useNavigate();
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchUserInfo = async () => {
      setLoading(true);
      const userPhone = localStorage.getItem("user");
      let pointId = null;
      // Check if the data exists
      if (userPhone) {
        // Parse the JSON string into an object
        const user = JSON.parse(userPhone);
        // Access the phone property and convert it to a number
        pointId = user.pointId;
      } else {
        console.log("No user data found in localStorage.");
      }
      try {
        const response = await a4axios.post(
          "/transactionHistory",
          { pointId }, // Sending phoneNumber in request body
        );
        console.log("response", response.data);
        setPaymentData(response.data);
        setLoading(false);
      } catch (err) {
        console.log(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);
  const handleBackWallet = () => {
    // Navigate to the wallet route
    navigation("/wallet");
  };
  const handleFilterChange = (days) => {
    setDateFilter(days === "all" ? "1970-01-01" : getDateFilter(days));
    setPage(1); // Reset to the first page when the filter changes
  };

  const handleToggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const filteredData = paymentData.filter((payment) =>
    dayjs(payment.date).isAfter(dateFilter),
  );

  const groupedPayments = filteredData.reduce((acc, payment) => {
    if (!acc[payment.date]) acc[payment.date] = [];
    acc[payment.date].push(payment);
    return acc;
  }, {});

  // Flatten grouped payments into a single array for pagination
  const flattenedPayments = Object.keys(groupedPayments).flatMap(
    (date) => groupedPayments[date],
  );

  // Paginate the flattened payments
  const paginatedPayments = flattenedPayments.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  // Re-group paginated payments by date
  const paginatedGroupedPayments = paginatedPayments.reduce((acc, payment) => {
    if (!acc[payment.date]) acc[payment.date] = [];
    acc[payment.date].push(payment);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <div className="relative flex flex-col items-center justify-center">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-t-transparent border-[#1976d2] dark:border-[#1976d2] rounded-full animate-spin" />
            <div className="absolute inset-2 border-4 border-t-transparent border-[#1976d2]/80 dark:border-[#1976d2]/80 rounded-full animate-spin-slow" />
            <div className="absolute inset-4 border-4 border-t-transparent border-[#1976d2]/60 dark:border-[#1976d2]/60 rounded-full animate-spin-slower" />
          </div>
        </div>
        <style jsx>{`
          @keyframes spin-slow {
            to {
              transform: rotate(360deg);
            }
          }
          @keyframes spin-slower {
            to {
              transform: rotate(-360deg);
            }
          }
          @keyframes morph {
            0% {
              border-radius: 60% 40% 30% 70%/60% 30% 70% 40%;
            }
            50% {
              border-radius: 30% 60% 70% 40%/50% 60% 30% 60%;
            }
            100% {
              border-radius: 60% 40% 30% 70%/60% 30% 70% 40%;
            }
          }
          .animate-spin-slow {
            animation: spin-slow 3s linear infinite;
          }
          .animate-spin-slower {
            animation: spin-slower 4s linear infinite;
          }
          .animate-morph {
            animation: morph 8s ease-in-out infinite;
          }
          .delay-100 {
            animation-delay: 100ms;
          }
          .delay-200 {
            animation-delay: 200ms;
          }
        `}</style>
      </div>
    );
  }
  return (
    <Container
      maxWidth="lg"
      sx={{
        mt: 3,
        p: 2,
        bgcolor: "#fff",
        color: "#000",
        borderRadius: 2,
        boxShadow: 3,
        paddingBottom: 15,
      }}
    >
      <IconButton
        edge="start"
        color="inherit"
        onClick={handleBackWallet}
        aria-label="back"
      >
        <ArrowBackIcon />
      </IconButton>
      <Typography
        variant="h6"
        fontWeight={600}
        sx={{ mb: 2, textAlign: "center" }}
      >
        <AccountBalanceWallet sx={{ verticalAlign: "middle", mr: 1 }} />
        Хуулга
      </Typography>
      <Grid sx={{ paddingBottom: 2 }} container spacing={2}>
        <Grid item xs={6} md={6}>
          <Card sx={{ padding: 2, boxShadow: "none" }}>
            <Typography
              variant="h6"
              color="textSecondary"
              sx={{ textAlign: "center" }}
            >
              Нийт Орлого
            </Typography>
            <Typography
              variant="h6"
              color="primary"
              sx={{ textAlign: "center" }}
            >
              {paymentData.length > 0 && paymentData[0].totalIncome
                ? paymentData[0].totalIncome.toLocaleString()
                : "0"}{" "}
              ₮
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} md={6}>
          <Card sx={{ padding: 2, boxShadow: "none" }}>
            <Typography
              variant="h6"
              color="textSecondary"
              sx={{ textAlign: "center" }}
            >
              Нийт Зарлага
            </Typography>
            <Typography variant="h6" color="error" sx={{ textAlign: "center" }}>
              {paymentData.length > 0 && paymentData[0].totalExpense
                ? paymentData[0].totalExpense.toLocaleString()
                : "0"}{" "}
              ₮
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Date Filters */}
      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
        <Button
          sx={{
            background: "linear-gradient(135deg, #0f509e 30%, #1399cd 100%)",
          }}
          variant="contained"
          onClick={() => handleFilterChange(7)}
        >
          7 хоног
        </Button>
        <Button
          sx={{
            background: "linear-gradient(135deg, #0f509e 30%, #1399cd 100%)",
          }}
          variant="contained"
          onClick={() => handleFilterChange(30)}
        >
          1 сар
        </Button>
        <Button
          sx={{
            background: "linear-gradient(135deg, #0f509e 30%, #1399cd 100%)",
          }}
          variant="contained"
          onClick={() => handleFilterChange(90)}
        >
          3 сар
        </Button>
        <Button
          sx={{
            background: "linear-gradient(135deg, #0f509e 30%, #1399cd 100%)",
          }}
          variant="contained"
          onClick={() => handleFilterChange("all")}
        >
          Бүх гүйлгээ
        </Button>
      </Stack>

      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {dayjs(dateFilter).format("YYYY-MM-DD")} →{" "}
          {dayjs().format("YYYY-MM-DD")}
        </Typography>
      </Box>

      {/* Transactions */}
      {Object.keys(paginatedGroupedPayments).map((date) => (
        <Box key={date} sx={{ mb: 2 }}>
          <Typography
            variant="body2"
            sx={{
              bgcolor: "#d1c4e9",
              p: 1,
              borderRadius: 1,
              display: "inline-block",
              fontWeight: 600,
            }}
          >
            {date}
          </Typography>
          {paginatedGroupedPayments[date].map((payment) => (
            <Paper
              key={payment.id}
              sx={{
                p: 2,
                mt: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "start",
                bgcolor: "#f5f5f5",
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {payment.method}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    {payment.date} {payment.time}
                  </Typography>
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color:
                      payment.types === "orlogo"
                        ? "green"
                        : payment.types === "zarlaga"
                          ? "red"
                          : "inherit",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {payment.amount > 0 ? (
                    <ArrowUpward sx={{ mr: 1 }} />
                  ) : (
                    <ArrowDownward sx={{ mr: 1 }} />
                  )}
                  {payment.amount.toLocaleString()} P
                </Typography>
              </Box>

              {/* More Information Button */}
              <Button
                onClick={() => handleToggleExpand(payment.id)}
                sx={{
                  mt: 1,
                  textTransform: "none",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <ExpandMore
                  sx={{
                    transform:
                      expandedId === payment.id
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    transition: "0.3s",
                  }}
                />
                Дэлгэрэнгүй
              </Button>

              {/* Collapsible Details */}
              <Collapse
                in={expandedId === payment.id}
                timeout="auto"
                unmountOnExit
              >
                <Box sx={{ mt: 1, p: 1, bgcolor: "#e3f2fd", borderRadius: 1 }}>
                  <Typography variant="body2">
                    <strong>Гүйлгээний ID:</strong> {payment.id}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Гүйлгээний утга:</strong> {payment.fullMethod}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Шимтэл:</strong> {payment.fee}P
                  </Typography>
                </Box>
              </Collapse>
            </Paper>
          ))}
        </Box>
      ))}

      {/* Pagination */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Pagination
          count={Math.ceil(flattenedPayments.length / itemsPerPage)}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Container>
  );
};

export default PaymentHistory;
