import React, { useState, useMemo } from "react";
import {
  Button,
  Grid,
  Paper,
  TextField,
  CircularProgress,
  useTheme,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { db } from "refrence/realConfig";
import { ref, onValue } from "firebase/database";
import { MaterialReactTable } from "material-react-table";
import { mkConfig, generateCsv, download } from "export-to-csv";
import dayjs from "dayjs";

const BlackPromotionCalculation = () => {
  const [btAmount, setBtAmount] = useState(0);
  const [batAmount, setBatAmount] = useState(0);
  const [managerAmount, setManagerAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [exportData, setExportData] = useState([]);
  const globalTheme = useTheme();

  const tableTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: globalTheme.palette.mode,
          primary: globalTheme.palette.secondary,
        },
      }),
    [globalTheme],
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const userInfoRef = ref(db, "BlackMembers/VipUserInfo");

      onValue(userInfoRef, (snapshot) => {
        if (snapshot.exists()) {
          const fetchedUserInfo = [];

          snapshot.forEach((child) => {
            fetchedUserInfo.push({ id: child.key, ...child.val() });
          });

          // Process counts after data is fully loaded
          processCounts(fetchedUserInfo);
        } else {
          console.error("No data found");
        }
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const processCounts = (data) => {
    console.log("data", data);
    if (!data.length) {
      console.log("Data is not fully loaded yet");
      return;
    }

    const processedData = data.map((element1) => {
      let btCount = 0;
      let batCount = 0;
      let managerCount = 0;

      data.forEach((element2) => {
        if (element1.MemberId === element2.MemberId) {
          if (element2.RankName === "БТ") btCount++;
          if (element2.RankName === "БАТ") batCount++;
          if (element2.RankName === "БМ") managerCount++;
        }
      });

      return {
        id: element1.id,
        MemberId: element1.MemberId,
        QuantityName: element1.QuantityName,
        RankName: element1.RankName,
        btCount,
        batCount,
        managerCount,
        accName: element1.accName,
        accNumber: element1.accNumber,
        totalAmounts:
          btAmount * btCount +
          batAmount * batCount +
          managerAmount * managerCount,
      };
    });
    let testData = [];
    processedData.forEach((element1) => {
      if ((element1.RankName = "БТ")) {
        testData.push({ ...element1, list: 1 });
      }
      if ((element1.RankName = "БАТ")) {
        testData.push({ ...element1, list: 2 });
      }
      if ((element1.RankName = "БМ")) {
        testData.push({ ...element1, list: 3 });
      }
    });
    const uniqueSorted = (data) => {
      // Sort by `list` and keep only the first occurrence of each `MemberId`
      const sortedData = data.sort((a, b) => a.list - b.list);
      const uniqueData = [];

      // Add only unique `MemberId` values to the result
      sortedData.forEach((item) => {
        if (
          !uniqueData.some(
            (existingItem) => existingItem.MemberId === item.MemberId,
          )
        ) {
          uniqueData.push(item);
        }
      });

      return uniqueData;
    };

    // Call the function with testData
    const results = uniqueSorted(testData);
    setExportData(results);
  };

  const handleExport = () => {
    handleExportExcel(exportData);
  };

  const handleExportExcel = (data) => {
    const columnsToRemove = ["id"];
    // Function to exclude specific columns from the data
    const excludeColumns = (data, columnsToRemove) => {
      return data.map((item) => {
        const newItem = { ...item }; // Create a copy of the item
        columnsToRemove.forEach((column) => delete newItem[column]); // Delete unwanted columns
        return newItem;
      });
    };
    const removedId = excludeColumns(data, columnsToRemove);

    const csv = generateCsv(csvConfig)(removedId);
    download(csvConfig)(csv);
  };

  const csvConfig = mkConfig({
    filename: `Урамшуулал-тооцоолол-${dayjs().format("YYYY-MM-DD HH:mm:ss")}`,
    fieldSeparator: ",",
    decimalSeparator: ".",
    columnHeaders: [
      {
        key: "MemberId",
        displayLabel: "Утас",
      },
      {
        key: "QuantityName",
        displayLabel: "Нэр",
      },
      {
        key: "accNumber",
        displayLabel: "Дансны дугаар",
      },
      {
        key: "accName",
        displayLabel: "Банкны нэр",
      },
      {
        key: "btCount",
        displayLabel: "БТ",
      },
      {
        key: "batCount",
        displayLabel: "БАТ",
      },
      {
        key: "managerCount",
        displayLabel: "БМ",
      },
      {
        key: "totalAmounts",
        displayLabel: "Нийт мөнгөн дүн",
      },
    ],
  });

  const columns = useMemo(
    () => [
      { accessorKey: "MemberId", header: "Утас" },
      { accessorKey: "QuantityName", header: "Овог Нэр" },
      { accessorKey: "RankName", header: "Цол" },
      { accessorKey: "btCount", header: "БТ" },
      { accessorKey: "batCount", header: "БАТ" },
      { accessorKey: "managerCount", header: "БМ" },
      { accessorKey: "totalAmounts", header: "Нийт урамшуулал" },
      { accessorKey: "accName", header: "Банк нэр" },
      { accessorKey: "accNumber", header: "Дансны дугаар" },
    ],
    [],
  );

  return (
    <ThemeProvider theme={tableTheme}>
      <Paper sx={{ padding: 3, borderRadius: 2, boxShadow: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={1}>
            <TextField
              label="БТ₮"
              value={btAmount === 0 ? "" : btAmount}
              onChange={(e) => setBtAmount(Number(e.target.value))}
              type="number"
              fullWidth
            />
          </Grid>
          <Grid item xs={1}>
            <TextField
              label="БАТ₮"
              value={batAmount === 0 ? "" : batAmount}
              onChange={(e) => setBatAmount(Number(e.target.value))}
              type="number"
              fullWidth
            />
          </Grid>
          <Grid item xs={1}>
            <TextField
              label="БМ₮"
              value={managerAmount === 0 ? "" : managerAmount}
              onChange={(e) => setManagerAmount(Number(e.target.value))}
              type="number"
              fullWidth
            />
          </Grid>
          <Grid item xs={1}>
            <Button
              variant="contained"
              onClick={fetchData}
              disabled={loading}
              startIcon={loading && <CircularProgress size={24} />}
            >
              Тооцоолох
            </Button>
          </Grid>

          <Grid item xs={1}>
            <Button variant="contained" onClick={handleExport}>
              Татаж авах
            </Button>
          </Grid>
        </Grid>
        <MaterialReactTable columns={columns} data={exportData} />
      </Paper>
    </ThemeProvider>
  );
};

export default BlackPromotionCalculation;
