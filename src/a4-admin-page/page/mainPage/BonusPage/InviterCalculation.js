import React, { useState, useMemo, useEffect } from "react";
import { Button, Typography, Paper, Grid, ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { db } from "refrence/realConfig";
import { ref, onValue } from "firebase/database";
import { MaterialReactTable } from "material-react-table";
import * as XLSX from "xlsx";
import "dayjs/locale/mn";
import { useTableTheme } from "../../../../theme/useTableTheme";

dayjs.extend(localizedFormat);

const InviterCalculation = () => {
  const [data, setData] = useState([]);
  const [membersData, setMembersData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const tableTheme = useTableTheme();

  // Handle Date change
  const handleDateChange = (newValue) => {
    setSelectedDate(newValue);
  };

  // Fetch data from Firebase on date selection change
  useEffect(() => {
    if (selectedDate) {
      const dataRef = ref(db, "userInfo");
      const membersRef = ref(db, "Members");

      Promise.all([
        new Promise((resolve) => {
          onValue(dataRef, (snapshot) => {
            const fetchedData = [];
            snapshot.forEach((childSnapshot) => {
              fetchedData.push({
                id: childSnapshot.key,
                ...childSnapshot.val(),
              });
            });
            setData(fetchedData);
            resolve();
          });
        }),
        new Promise((resolve) => {
          onValue(membersRef, (snapshot) => {
            const fetchedMembersData = [];
            snapshot.forEach((childSnapshot) => {
              fetchedMembersData.push({
                id: childSnapshot.key,
                ...childSnapshot.val(),
              });
            });
            setMembersData(fetchedMembersData);
            resolve();
          });
        }),
      ]);
    }
  }, [selectedDate]);

  // Process and filter data based on selected date
  const processedData = useMemo(() => {
    if (!selectedDate) return [];

    const selectedDateFormatted = dayjs(selectedDate).format("YYYY-MM-DD");

    // Filter data for matching date and not black members
    const filteredData = data.filter((item) => {
      const itemDateFormatted = dayjs(
        item.timeStamp,
        "YYYY-MM-DD HH:mm:ss",
      ).format("YYYY-MM-DD");
      return (
        itemDateFormatted === selectedDateFormatted &&
        !item.isBlackMember &&
        item.amount === 1500000
      );
    });

    let realData = [];
    filteredData.forEach((item1) => {
      membersData.forEach((item2) => {
        if (Number(item1.MemberId) === Number(item2.phoneNumber)) {
          realData.push({
            ...item1,
            userBankName: item2.bankName,
            userAccountNumber: item2.accountNumber,
          });
        }
      });
    });

    let finalData = [];
    realData.forEach((item1) => {
      membersData.forEach((item2) => {
        if (Number(item1.InviterId) === Number(item2.phoneNumber)) {
          finalData.push({
            ...item1,
            InviterBankName: item2.bankName,
            InviterAccountNumber: item2.accountNumber,
          });
        }
      });
    });

    let alldatas = [];
    let tenpersent = [];

    finalData.forEach((element) => {
      const inviterPercent = Number(element.InviterPercent); // Convert to number
      if (inviterPercent === 20) {
        alldatas.push({
          MemberId: element.InviterId,
          QuantityName: element.InviterName,
          InviterPercent: element.InviterPercent,
          timeStamp: element.timeStamp,
          userBankName: element.InviterBankName,
          userAccountNumber: element.InviterAccountNumber,
          amount: 272726,
        });
      }
      if (inviterPercent === 10) {
        tenpersent.push({
          MemberId: element.InviterId,
          QuantityName: element.InviterName,
          InviterPercent: element.InviterPercent,
          timeStamp: element.timeStamp,
          userBankName: element.InviterBankName,
          userAccountNumber: element.InviterAccountNumber,
          amount: 136363,
        });
        tenpersent.push({
          MemberId: element.MemberId,
          QuantityName: element.QuantityName,
          InviterPercent: element.InviterPercent,
          timeStamp: element.timeStamp,
          userBankName: element.userBankName,
          userAccountNumber: element.userAccountNumber,
          amount: 136363,
        });
      }
    });

    let finalAllData = [...alldatas, ...tenpersent];
    let finalAllData2 = [];

    let memberMap = new Map();

    finalAllData.forEach((element) => {
      const {
        MemberId,
        QuantityName,
        InviterPercent,
        timeStamp,
        userBankName,
        userAccountNumber,
        amount,
      } = element;

      const key = `${MemberId}_${QuantityName}`;

      if (memberMap.has(key)) {
        const existingData = memberMap.get(key);
        existingData.amount += amount;
      } else {
        memberMap.set(key, {
          MemberId,
          QuantityName,
          InviterPercent,
          timeStamp,
          userBankName,
          userAccountNumber,
          amount,
        });
      }
    });

    finalAllData2 = Array.from(memberMap.values());
    let finalAllData3 = [];

    finalAllData2.forEach((element1) => {
      const bankName = element1.userBankName
        ? element1.userBankName.trim().toLowerCase()
        : "";
      if (bankName === "хаан банк") {
        finalAllData3.push({
          ...element1,
          userBankName: "050000",
          Wallet: "MNT",
          orderwallet: "MNT",
          id: "10",
          utga: `${selectedDateFormatted} uriltiin uramshuulal ${element1.MemberId}`,
        });
      } else if (bankName === "төрийн банк") {
        finalAllData3.push({
          ...element1,
          userBankName: "340000",
          Wallet: "MNT",
          orderwallet: "MNT",
          id: "20",
          utga: `${selectedDateFormatted} uriltiin uramshuulal ${element1.MemberId}`,
        });
      } else if (bankName === "голомт банк") {
        finalAllData3.push({
          ...element1,
          userBankName: "150000",
          Wallet: "MNT",
          orderwallet: "MNT",
          id: "20",
          utga: `${selectedDateFormatted} uriltiin uramshuulal ${element1.MemberId}`,
        });
      } else if (bankName === "худалдаа хөгжлийн банк") {
        finalAllData3.push({
          ...element1,
          userBankName: "040000",
          Wallet: "MNT",
          orderwallet: "MNT",
          id: "20",
          utga: `${selectedDateFormatted} uriltiin uramshuulal ${element1.MemberId}`,
        });
      } else if (bankName === "капитал банк") {
        finalAllData3.push({
          ...element1,
          userBankName: "320000",
          Wallet: "MNT",
          orderwallet: "MNT",
          id: "20",
          utga: `${selectedDateFormatted} uriltiin uramshuulal ${element1.MemberId}`,
        });
      }
    });

    return finalAllData3;
  }, [data, selectedDate, membersData]);

  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "Гүйлгээний төрөл" },
      { accessorKey: "userBankName", header: "Хүлээн авагч банкны код" },
      { accessorKey: "userAccountNumber", header: "Хүлээн авагчийн данс" },
      { accessorKey: "Wallet", header: "Хүлээн авагчийн дансны валют" },
      { accessorKey: "QuantityName", header: "Хүлээн авагчийн нэр" },
      { accessorKey: "amount", header: "Гүйлгээний дүн" },
      { accessorKey: "orderwallet", header: "Гүйлгээний валют" },
      { accessorKey: "utga", header: "Гүйлгээний утга" },
    ],
    [],
  );
  // Export data to Excel
  const handleExport = () => {
    if (processedData.length > 0 && Array.isArray(processedData)) {
      try {
        // Explicit column headers (using accessorKey values directly)
        const columnHeaders = [
          "Гүйлгээний төрөл", // Transaction Type
          "Хүлээн авагч банкны код", // Receiver Bank Code
          "Хүлээн авагчийн данс", // Receiver Account
          "Хүлээн авагчийн дансны валют", // Receiver Account Currency
          "Хүлээн авагчийн нэр", // Receiver's Name
          "Гүйлгээний дүн", // Transaction Amount
          "Гүйлгээний валют", // Transaction Currency
          "Гүйлгээний утга", // Transaction Description
        ];

        // Ensure processedData matches the column order and structure
        const mappedData = processedData.map((item) => ({
          "Гүйлгээний төрөл": item.id,
          "Хүлээн авагч банкны код": item.userBankName,
          "Хүлээн авагчийн данс": item.userAccountNumber,
          "Хүлээн авагчийн дансны валют": item.Wallet,
          "Хүлээн авагчийн нэр": item.QuantityName,
          "Гүйлгээний дүн": item.amount,
          "Гүйлгээний валют": item.orderwallet,
          "Гүйлгээний утга": item.utga,
        }));

        // Create a worksheet from the mapped data
        const ws = XLSX.utils.json_to_sheet(mappedData, {
          header: columnHeaders,
        });

        // Create a new workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        // Write the workbook to an Excel buffer
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

        // Create a Blob with the binary data of the Excel file
        const file = new Blob([excelBuffer], {
          bookType: "xlsx",
          type: "application/octet-stream",
        });

        // Create a link to download the Excel file
        const link = document.createElement("a");
        link.href = URL.createObjectURL(file);
        link.download = `Урилтын-урамшуулал-${dayjs(selectedDate).format(
          "YYYY-MM-DD",
        )}.xlsx`;
        link.click();
      } catch (error) {
        console.error("Error exporting data:", error);
      }
    } else {
      console.error("No data available for export.");
    }
  };

  return (
    <ThemeProvider theme={tableTheme}>
      <Paper
        elevation={3}
        sx={{ padding: 4, borderRadius: 2, maxWidth: 2000, margin: "0 auto" }}
      >
        <Typography
          variant="h5"
          sx={{ mb: 5, textAlign: "center", fontWeight: "bold" }}
        >
          Урилтын урамшуулал
        </Typography>

        <Grid container spacing={2} alignItems="center">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid item xs={12} sm={6} md={2}>
              <DatePicker
                label="Select Date"
                locale="mn"
                value={selectedDate}
                onChange={handleDateChange}
              />
            </Grid>
          </LocalizationProvider>
          <Grid item xs={12} sm={6} md={1}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={handleExport}
            >
              Татаж авах
            </Button>
          </Grid>
        </Grid>
        <MaterialReactTable columns={columns} data={processedData} />
      </Paper>
    </ThemeProvider>
  );
};

export default InviterCalculation;
