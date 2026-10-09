import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Stack,
} from "@mui/material";
import { styled } from "@mui/system";
import { FaCoins } from "react-icons/fa";
import { MdHistory } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore"; // Ensure you're importing firestore methods
import { auth, firestore } from "refrence/storeConfig";
import { FaShoppingCart } from "react-icons/fa";
import { MdOutlineSavings } from "react-icons/md";
import { getUserData } from "../../../utils/functions";

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  background: "linear-gradient(135deg, #0f509e 30%, #1399cd 100%)",
  position: "relative",
  overflow: "hidden",
  transition: "transform 0.3s ease-in-out",
  maxWidth: "1170px",
  margin: "auto",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[8],
  },
}));

const LogoWrapper = styled(Box)({
  position: "absolute",
  top: 0,
  right: 16,
});

const ContentWrapper = styled(CardContent)({
  padding: "32px 24px",
  color: "#fff",
});

const PointsWrapper = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginTop: 10,
});

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  color: "#fff",
  background: "linear-gradient(135deg, #0f509e 30%, #1399cd 100%)",
  padding: "8px 24px",
  fontSize: "0.875rem",
  textTransform: "none",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
}));

const HistoryButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  color: "#fff",
  background: "linear-gradient(135deg, #0f509e 30%, #1399cd 100%)",
  padding: "8px 24px",
  fontSize: "0.875rem",
  textTransform: "none",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  marginTop: 16,
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
}));

const SavingsButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  color: "#fff",
  background: "linear-gradient(135deg, #0f509e 30%, #1399cd 100%)",
  padding: "8px 24px",
  fontSize: "0.875rem",
  textTransform: "none",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  marginTop: 16,
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
}));

const RewardsCard = () => {
  const [balance, setBalance] = useState(null);
  const navigation = useNavigate();
  const user = auth.currentUser;

  const userData = getUserData();

  useEffect(() => {
    const balanceRef = doc(firestore, "users", user.uid, "point", "balance");
    const unsubscribe = onSnapshot(balanceRef, (docSnap) => {
      if (docSnap.exists()) {
        setBalance(docSnap.data().balance); // Update state with new balance
      } else {
        console.log("No such document!");
        setBalance(null);
      }
    });
    return () => {
      unsubscribe();
    };
  }, [user.uid]);

  return (
    <>
      <Box sx={{ margin: "10px", marginBottom: "70px" }}>
        <StyledCard>
          <LogoWrapper>
            <img
              src={"/assets/pointLogos.png"}
              alt="Credit Card Icon"
              style={{
                width: "130px",
                height: "60px",
                maxWidth: "100%",
                objectFit: "contain",
              }}
            />
          </LogoWrapper>

          <ContentWrapper>
            <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
              Овог нэр
            </Typography>
            <Typography variant="h5" sx={{ mt: 1, fontWeight: 600 }}>
              {`${userData.lastName} ${userData.firstName}`}
            </Typography>

            <PointsWrapper>
              <FaCoins size={24} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {balance}
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>
                pts
              </Typography>
            </PointsWrapper>

            <Typography
              variant="caption"
              sx={{ display: "block", mt: 1, opacity: 0.8 }}
            >
              1 point = 1₮
            </Typography>
          </ContentWrapper>
        </StyledCard>
        <Box sx={{ maxWidth: "1170px", margin: "auto", mt: 3 }}>
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <ActionButton fullWidth variant="contained">
              Цэнэглэх
            </ActionButton>
            <ActionButton
              onClick={() => navigation("/transaction")}
              fullWidth
              variant="contained"
            >
              Шилжүүлэх
            </ActionButton>
          </Stack>
          <HistoryButton
            fullWidth
            onClick={() => navigation("/transaction-history")}
            variant="contained"
            startIcon={<MdHistory />}
          >
            Хуулга
          </HistoryButton>
          <SavingsButton
            fullWidth
            onClick={() => navigation("/savings")}
            variant="contained"
            startIcon={<MdOutlineSavings />}
          >
            Бонус оноо авах
          </SavingsButton>
          <a href="https://a4store.mn/">
            <HistoryButton
              fullWidth
              variant="contained"
              startIcon={<FaShoppingCart />}
            >
              A4STORE
            </HistoryButton>
          </a>
        </Box>
      </Box>
    </>
  );
};

export default RewardsCard;
