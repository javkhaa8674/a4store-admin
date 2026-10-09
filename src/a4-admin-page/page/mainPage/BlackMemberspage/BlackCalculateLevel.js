import React, { useState, useMemo } from "react";
import {
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  createTheme,
  useTheme,
  ThemeProvider,
} from "@mui/material";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { db } from "refrence/realConfig";
import { ref, onValue, set } from "firebase/database";
import { MaterialReactTable } from "material-react-table";
import * as XLSX from "xlsx";

dayjs.extend(localizedFormat);

const BlackCalculateLevel = () => {
  const [data, setData] = useState([]);
  const [exports, setExports] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
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

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleSubmit = () => {
    if (selectedDate) {
      const formattedDate = dayjs(selectedDate).format("MM/DD/YYYY hh:mm A");

      const dataRef = ref(db, "BlackMembers/userInfo");

      onValue(dataRef, (snapshot) => {
        const fetchedData = [];
        snapshot.forEach((childSnapshot) => {
          fetchedData.push({ id: childSnapshot.key, ...childSnapshot.val() });
        });
        setData(fetchedData);
      });

      alert(`Selected Date and Time: ${formattedDate}`);
    } else {
      alert("Please select a date and time");
    }
  };

  // Filter and process data based on selectedDate
  const processedData = useMemo(() => {
    if (!selectedDate) return [];

    let newData = [];
    const selectedDateTimestamp = dayjs(selectedDate).valueOf(); // Convert selectedDate to timestamp

    data.forEach((element) => {
      const elementTimestamp = dayjs(element.timeStamp).valueOf();
      // ★ Сонгосон өдөр эсвэл түүнээс хойшхи өгөгдлийг шүүх
      if (elementTimestamp >= selectedDateTimestamp) {
        newData.push(element);
      }
    });
    let oldData = [];

    data.forEach((element1) => {
      let count = 0;
      newData.forEach((element2) => {
        if (
          element1.MemberId + element1.QuantityName ===
          element2.MemberId + element2.QuantityName
        ) {
          count++;
        }
      });
      if (count < 1) {
        oldData.push({
          ...element1,
          Level: "4000",
          RankName: "Хүлээгдэж байна",
        });
      }
    });
    // user

    let users = [];
    newData.forEach((element1) => {
      let count = 0;
      newData.forEach((element2) => {
        if (
          element1.MemberId + element1.QuantityName ===
          element2.SponsorId + element2.SponsorName
        ) {
          count++;
        }
      });
      if (count < 5) {
        users.push({ ...element1, RankName: "БТ" });
      }
    });
    //bat
    let bat = [];
    newData.forEach((element1) => {
      let count = 0;
      newData.forEach((element2) => {
        if (
          element1.MemberId + element1.QuantityName ===
          element2.SponsorId + element2.SponsorName
        ) {
          count++;
        }
      });
      if (count > 4) {
        bat.push({ ...element1, RankName: "БАТ" });
      }
    });
    //manager
    let manager = [];
    bat.forEach((element1) => {
      let count = 0;
      bat.forEach((element2) => {
        if (
          element1.MemberId + element1.QuantityName ===
          element2.SponsorId + element2.SponsorName
        ) {
          count++;
        }
      });
      if (count > 6) {
        manager.push({ ...element1, RankName: "БМ" });
      }
    });
    //orignal bat
    let batInfo = [];
    bat.forEach((element1) => {
      let count = 0;
      manager.forEach((element2) => {
        if (
          element1.MemberId + element1.QuantityName ===
          element2.MemberId + element2.QuantityName
        ) {
          count++;
        }
      });
      if (count < 1) {
        batInfo.push({ ...element1, RankName: "БАТ" });
      }
    });
    // user
    //emanager
    let emanager = [];
    newData.forEach((element1) => {
      let count1 = 0;
      let count2 = 0;
      manager.forEach((element2) => {
        if (
          element1.MemberId + element1.QuantityName ===
          element2.SponsorId + element2.SponsorName
        ) {
          count1++;
        }
      });
      batInfo.forEach((element3) => {
        if (
          element1.MemberId + element1.QuantityName ===
          element3.SponsorId + element3.SponsorName
        ) {
          count2++;
        }
      });
      if (count1 > 4 && count2 > 9) {
        emanager.push({ ...element1, RankName: "БЕМ" });
      }
    });

    let managerinfo = [];
    manager.forEach((element1) => {
      let count = 0;
      emanager.forEach((element2) => {
        if (
          element1.MemberId + element1.QuantityName ===
          element2.MemberId + element2.QuantityName
        ) {
          count++;
        }
      });
      if (count < 1) {
        managerinfo.push({ ...element1, RankName: "БМ" });
      }
    });

    let zahiral = [];
    emanager.forEach((element1) => {
      let count = 0;
      emanager.forEach((element2) => {
        if (
          element1.MemberId + element1.QuantityName ===
          element2.SponsorId + element2.SponsorName
        ) {
          count++;
        }
      });
      if (count > 2) {
        zahiral.push({ ...element1, RankName: "БЗ" });
      }
    });

    let emanagerinfo = [];
    emanager.forEach((element1) => {
      let count = 0;
      zahiral.forEach((element2) => {
        if (
          element1.MemberId + element1.QuantityName ===
          element2.MemberId + element2.QuantityName
        ) {
          count++;
        }
      });
      if (count < 1) {
        emanagerinfo.push({ ...element1, RankName: "БEМ" });
      }
    });

    let ezahiral = [];
    zahiral.forEach((element1) => {
      let count = 0;
      zahiral.forEach((element2) => {
        if (
          element1.MemberId + element1.QuantityName ===
          element2.SponsorId + element2.SponsorName
        ) {
          count++;
        }
      });
      if (count > 2) {
        ezahiral.push({ ...element1, RankName: "БГЕ" });
      }
    });

    let zahiralInfo = [];
    zahiral.forEach((element1) => {
      let count = 0;
      ezahiral.forEach((element2) => {
        if (
          element1.MemberId + element1.QuantityName ===
          element2.MemberId + element2.QuantityName
        ) {
          count++;
        }
      });
      if (count < 1) {
        zahiralInfo.push({ ...element1, RankName: "БЗ" });
      }
    });
    setExports(true);
    let alldata = [
      ...users,
      ...batInfo,
      ...managerinfo,
      ...emanager,
      ...zahiralInfo,
      ...ezahiral,
      ...oldData,
    ];
    return alldata;
  }, [data, selectedDate]);

  const columns = useMemo(
    () => [
      { accessorKey: "MemberId", header: "ID" },
      { accessorKey: "Level", header: "Шат" },
      { accessorKey: "timeStamp", header: "Огноо" },
      { accessorKey: "RankName", header: "Зэрэглэл" },
      { accessorKey: "QuantityName", header: "Нэр" },
    ],
    [],
  );

  const handleExport = () => {
    if (exports === true) {
      const worksheet = XLSX.utils.json_to_sheet(processedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      XLSX.writeFile(workbook, "FirebaseData.xlsx");
    } else {
      alert("asd");
    }
  };

  const handleDataBase = async () => {
    const confirm = window.confirm(
      "Та бүх гишүүдийн зэрэглэлийг дэвшүүлэхдээ итгэлтэй байна уу? Энэ үйлдлийг хийснээр системд дэхь бүх гишүүдийн зэрэглэл автоматаар шинэчлэгдэх болно.",
    );

    if (confirm) {
      try {
        console.log("test");
        let sendData = {};
        processedData.forEach((element) => {
          let id = element.id;
          delete element.id;
          sendData[id] = element;
        });
        const falseFilteredData = data.filter((item) => !item.System);
        let sendVipUserInfoData = {};
        falseFilteredData.forEach((element) => {
          let ids = element.id;
          delete element.id;
          sendVipUserInfoData[ids] = element;
        });
        await set(ref(db, "BlackMembers/userInfo/"), sendData);
        await set(ref(db, "BlackMembers/VipUserInfo/"), sendVipUserInfoData);
        alert("Зэрэглэлийг амжилттай шинэчиллээ.");
      } catch (error) {
        console.log(error);
      }
    } else {
      alert("Үйлдлийг цуцаллаа.");
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
          Зэрэглэл дэвшүүлэх
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              type="datetime-local"
              value={selectedDate || ""}
              onChange={handleDateChange}
              variant="outlined"
              size="small"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ mb: 2 }} // Add margin at the bottom for better spacing
            />
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12} sm={6} md={1}>
            <Button
              variant="contained"
              color="primary"
              size="small" // Specify the button size
              onClick={handleSubmit}
              sx={{
                width: "100%",
                mb: 2,
                borderRadius: 1.5,
                padding: "8px 12px", // Adjust padding for size
                boxShadow: 2, // Add shadow for depth
                "&:hover": {
                  backgroundColor: "#1976d2", // Darker shade on hover
                  boxShadow: 4, // Increase shadow on hover
                },
              }}
            >
              Хайх
            </Button>
          </Grid>

          {/* Export to Excel Button */}
          <Grid item xs={12} sm={6} md={1}>
            <Button
              variant="contained"
              color="secondary"
              size="small" // Specify the button size
              onClick={handleExport}
              sx={{
                width: "100%",
                mb: 2,
                borderRadius: 1.5,
                padding: "8px 12px", // Adjust padding for size
                boxShadow: 2, // Add shadow for depth
                "&:hover": {
                  backgroundColor: "#f50057", // Darker shade on hover
                  boxShadow: 4, // Increase shadow on hover
                },
              }}
            >
              Татаж авах
            </Button>
          </Grid>

          {/* Add to Database Button */}
          <Grid item xs={12} sm={6} md={1}>
            <Button
              variant="contained"
              color="primary"
              size="small" // Specify the button size
              onClick={handleDataBase}
              sx={{
                width: "100%",
                mb: 2,
                borderRadius: 1.5,
                padding: "8px 12px", // Adjust padding for size
                boxShadow: 2, // Add shadow for depth
                "&:hover": {
                  backgroundColor: "#1976d2", // Darker shade on hover
                  boxShadow: 4, // Increase shadow on hover
                },
              }}
            >
              Зэрэглэл дэвшүүлэх
            </Button>
          </Grid>
        </Grid>

        <MaterialReactTable
          columns={columns}
          data={processedData}
          sx={{ marginTop: 3 }}
        />
      </Paper>
    </ThemeProvider>
  );
};

export default BlackCalculateLevel;
// IF(E2="БЗ","1БЗ",IF( E2="БЕМ","2БЕМ",IF(E2="БМ","3БМ",IF(E2="БАТ","4БАТ","5БТ"))))
