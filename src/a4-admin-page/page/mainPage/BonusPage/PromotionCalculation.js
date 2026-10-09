import React, { useState, useMemo } from "react";
import {
  Button,
  Grid,
  Paper,
  CircularProgress,
  useTheme,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { db } from "refrence/realConfig";
import { ref, onValue } from "firebase/database";
import { MaterialReactTable } from "material-react-table";
import { RiFileExcel2Fill } from "react-icons/ri";
import { read, utils } from "xlsx";
import { mkConfig, generateCsv, download } from "export-to-csv";
import dayjs from "dayjs";

const PromotionCalculation = () => {
  const [realData, setRealData] = useState([]); // RealData to export
  const zahiralamount = 500000;
  const btamount = 5000;
  const batamount = 20000;
  const manageramount = 50000;
  const emanageramount = 150000;

  const [importData, setImportData] = useState(null); // Import data from excel

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
  const [loading, setLoading] = useState(false);
  const downloadUrl =
    "https://firebasestorage.googleapis.com/v0/b/a4mongolia.appspot.com/o/%D0%97%D0%B0%D0%B3%D0%B2%D0%B0%D1%80%20%D1%84%D0%B0%D0%B9%D0%BB.xlsx?alt=media&token=06cc77a3-286e-4bc2-802c-e9686e1db624";
  const fetchData = async () => {
    setLoading(true); // Start loading
    try {
      const userInfoRef = ref(db, "userInfo");
      const membersRef = ref(db, "Members");
      const BlackRef = ref(db, "BlackMembers/VipUserInfo");
      const userInfoDataPromise = new Promise((resolve, reject) => {
        onValue(userInfoRef, (snapshot) => {
          if (snapshot.exists()) {
            const fetchedUserInfoData = [];
            snapshot.forEach((childSnapshot) => {
              fetchedUserInfoData.push({
                id: childSnapshot.key,
                ...childSnapshot.val(),
              });
            });
            resolve(fetchedUserInfoData); // Resolve with fetched data
          } else {
            reject("UserInfo data is empty or not found");
          }
        });
      });
      const membersDataPromise = new Promise((resolve, reject) => {
        onValue(membersRef, (snapshot) => {
          if (snapshot.exists()) {
            const fetchedMembersData = [];
            snapshot.forEach((childSnapshot) => {
              fetchedMembersData.push({
                id: childSnapshot.key,
                ...childSnapshot.val(),
              });
            });
            resolve(fetchedMembersData); // Resolve with fetched data
          } else {
            reject("Members data is empty or not found");
          }
        });
      });
      const BlackDataPromise = new Promise((resolve, reject) => {
        onValue(BlackRef, (snapshot) => {
          if (snapshot.exists()) {
            const BlackRef = [];
            snapshot.forEach((childSnapshot) => {
              BlackRef.push({
                id: childSnapshot.key,
                ...childSnapshot.val(),
              });
            });
            resolve(BlackRef); // Resolve with fetched data
          } else {
            reject("black Members data is empty or not found");
          }
        });
      });
      // Wait for both promises to resolve
      const [userInfoData, membersData, blackData] = await Promise.all([
        userInfoDataPromise,
        membersDataPromise,
        BlackDataPromise,
      ]);
      processCounts(userInfoData, membersData, blackData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false); // Stop loading after data is fetched and processed
    }
  };
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      processExcelFile(file, event);
    }
  };

  const processExcelFile = async (file) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const workbook = read(event.target.result, {
          type: "array",
          cellDates: true,
          cellNF: false,
          cellText: false,
        });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        let data = utils.sheet_to_json(sheet, {
          header: 1,
        });
        const customHeader = ["phoneNumber"];
        data[0] = customHeader;

        const updatedData = utils.sheet_to_json(utils.aoa_to_sheet(data), {
          header: customHeader,
          dateNF: "yyyy-mm-dd",
          defval: "", // Handle empty cells if needed
        });

        // Remove the first entry only if it exists
        if (updatedData.length > 0) {
          updatedData.splice(0, 1); // Remove the first element
        }
        console.log(updatedData);
        // if (formattedData.length > 0) {
        //   await saveData2(formattedData); // Ensure saveData2 is defined and used
        //   console.log("Data saved successfully");
        // } else {
        //   console.log("No data to save");
        // }

        setImportData(updatedData);
      } catch (error) {
        console.error("Error processing file:", error);
      }
    };

    reader.readAsArrayBuffer(file);
  };
  const processCountsBlack = (data) => {
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
          20000 * btCount + 100000 * batCount + 300000 * managerCount,
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
    return results;
  };
  const processCounts = (userInfoData, membersData, blackData) => {
    if (!userInfoData.length || !membersData.length) {
      return; // Exit early if data isn't fully loaded
    }
    let btCount = Number(btamount) || 0;
    let batCount = Number(batamount) || 0; // Ensure it's a number
    let managerCount = Number(manageramount) || 0; // Ensure it's a number
    let emanagerCount = Number(emanageramount) || 0; // Ensure it's a number
    let zahiralCount = Number(zahiralamount) || 0;
    const newExportData = userInfoData.map((element1) => {
      let userBtCount = 0;
      let userBatCount = 0;
      let userManagerCount = 0;
      let userEmanagerCount = 0;
      let userZahiralCount = 0;
      userInfoData.forEach((element2) => {
        if (element1.MemberId === element2.MemberId) {
          if (element2.RankName === "БТ") {
            userBtCount++;
          } else if (element2.RankName === "БАТ") {
            userBatCount++;
          } else if (element2.RankName === "БМ") {
            userManagerCount++;
          } else if (element2.RankName === "БEМ") {
            userEmanagerCount++;
          } else if (element2.RankName === "БЗ") {
            userZahiralCount++;
          }
        }
      });
      btCount += userBtCount;
      batCount += userBatCount;
      managerCount += userManagerCount;
      emanagerCount += userEmanagerCount;
      zahiralCount += userZahiralCount;
      return {
        ...element1,
        BatCount: userBatCount,
        ManagerCount: userManagerCount,
        EManagerCount: userEmanagerCount,
        BtCount: userBtCount,
        zahiralCount: userZahiralCount,
      };
    });
    const blackDataProcessed = processCountsBlack(blackData);

    processFinalRealData(newExportData, membersData, blackDataProcessed); // Pass data here to ensure it's processed after it's available
  };

  const processFinalRealData = (newExportData, membersData, blackData) => {
    const processedRealData = [];

    membersData.forEach((member) => {
      newExportData.forEach((user) => {
        if (
          member.phoneNumber + member.lastName + member.firstName ===
          user.MemberId + user.QuantityName
        ) {
          processedRealData.push({
            ...member,
            Level: user.Level,

            RankName: user.RankName,
            BtCount: user.BtCount,
            BatCount: user.BatCount,
            ManagerCount: user.ManagerCount,
            EManagerCount: user.EManagerCount,
            zahiralCount: user.zahiralCount,
          });
        }
      });
    });
    let totaldata = [];
    processedRealData.forEach((element) => {
      const totalAmount =
        btamount * Number(element.BtCount) +
        batamount * Number(element.BatCount) +
        manageramount * Number(element.ManagerCount) +
        emanageramount * Number(element.EManagerCount) +
        zahiralamount * Number(element.zahiralCount);

      totaldata.push({
        ...element,
        totalAmounts: totalAmount,
      });
    });

    const filteredTotalData = totaldata.filter((item) => {
      return item.totalAmounts !== 0;
    });
    console.log("filteredTotalData", filteredTotalData);
    console.log(importData);
    let orgData = [];
    importData.forEach((element1) => {
      filteredTotalData.forEach((element2) => {
        if (Number(element1.phoneNumber) === Number(element2.phoneNumber)) {
          orgData.push(element2);
        }
      });
    });
    console.log("orgData", orgData);

    let ortRealData = [];

    // Create a map from blackData for fast lookups
    const blackDataMap = new Map();
    blackData.forEach((element2) => {
      blackDataMap.set(Number(element2.MemberId), element2);
    });

    orgData.forEach((element1) => {
      const matchedElement = blackDataMap.get(Number(element1.phoneNumber));
      if (matchedElement) {
        ortRealData.push({
          ...element1,
          blackBT: matchedElement.btCount,
          blackBAT: matchedElement.batCount,
          blackManager: matchedElement.managerCount,
          blackTotalAmounts: matchedElement.totalAmounts,
          alltotalAmounts: element1.totalAmounts + matchedElement.totalAmounts,
        });
      } else {
        ortRealData.push({
          ...element1,
          blackBT: 0,
          blackBAT: 0,
          blackManager: 0,
          blackTotalAmounts: 0,
          alltotalAmounts: element1.totalAmounts,
        });
      }
    });

    const fieldsToDelete = [
      "id",
      "accountNumber",
      "bankName",
      "centerName",
      "newMarketing",
      "password",
      "phoneNumber2",
      "province",
      "registrationNumber",
      "signatureURL",
      "Level",
      "RankName",
    ];

    // Create a new array without the specified fields
    const updatedArray = ortRealData.map((item) => {
      const updatedItem = { ...item };
      fieldsToDelete.forEach((field) => delete updatedItem[field]);
      return updatedItem;
    });
    setRealData(updatedArray);
  };

  // Columns for MaterialReactTable
  const columns = useMemo(
    () => [
      { accessorKey: "firstName", header: "Овог" },
      { accessorKey: "lastName", header: "Нэр" },
      { accessorKey: "RankName", header: "Цол" },
      { accessorKey: "Level", header: "Шат" },
      { accessorKey: "BtCount", header: "БТ" },
      { accessorKey: "BatCount", header: "БАТ" },
      { accessorKey: "ManagerCount", header: "БМ" },
      { accessorKey: "EManagerCount", header: "БЕМ" },
      { accessorKey: "zahiralCount", header: "БЗ" },
      { accessorKey: "totalAmounts", header: "Нийт урамшуулал" },
    ],
    [],
  );

  // Handle Excel export
  const handleExportExcel = () => {
    if (realData.length === 0) {
      alert("Хоосон байна!");
      return;
    }

    const csv = generateCsv(csvConfig)(realData);
    download(csvConfig)(csv);
  };
  const csvConfig = mkConfig({
    filename: `Урамшуулал-тооцоолол-${dayjs().format("YYYY-MM-DD HH:mm:ss")}`,
    fieldSeparator: ",",
    decimalSeparator: ".",
    columnHeaders: [
      {
        key: "firstName",
        displayLabel: "Овог",
      },
      {
        key: "lastName",
        displayLabel: "Нэр",
      },
      {
        key: "phoneNumber",
        displayLabel: "Утас",
      },
      {
        key: "BtCount",
        displayLabel: "Reset БТ",
      },
      {
        key: "BatCount",
        displayLabel: "Reset БАТ",
      },
      {
        key: "ManagerCount",
        displayLabel: "Reset БМ",
      },
      {
        key: "EManagerCount",
        displayLabel: "Reset БЕМ",
      },
      {
        key: "zahiralCount",
        displayLabel: "Reset БЗ",
      },
      {
        key: "totalAmounts",
        displayLabel: "Reset Нийт урамшуулал",
      },
      {
        key: "blackBT",
        displayLabel: "Black БТ",
      },
      {
        key: "blackBAT",
        displayLabel: "Black БАТ",
      },
      {
        key: "blackManager",
        displayLabel: "Black БМ",
      },
      {
        key: "blackTotalAmounts",
        displayLabel: "Black Нийт урамшуулал",
      },
      {
        key: "alltotalAmounts",
        displayLabel: "Нийт урамшуулал",
      },
    ],
  });
  return (
    <ThemeProvider theme={tableTheme}>
      <Paper sx={{ padding: 3, borderRadius: 2, boxShadow: 3 }}>
        <Grid container spacing={3} direction="row" alignItems="center">
          {/* Bat Amount, Manager Amount, Emanager Amount */}
          {/* <Grid item xs={1}>
            <TextField
              label="БТ₮"
              value={btamount === 0 ? "" : btamount}
              onChange={(event) => setBtamount(event.target.value)}
              type="number"
              inputProps={{ min: 0 }}
              fullWidth
            />
          </Grid>

          <Grid item xs={1}>
            <TextField
              label="БАТ₮"
              value={batamount === 0 ? "" : batamount}
              onChange={(event) => setBatamount(event.target.value)}
              type="number"
              inputProps={{ min: 0 }}
              fullWidth
            />
          </Grid>

          <Grid item xs={1}>
            <TextField
              label="БМ₮"
              value={manageramount === 0 ? "" : manageramount}
              onChange={(event) => setManageramount(event.target.value)}
              type="number"
              inputProps={{ min: 0 }}
              fullWidth
            />
          </Grid>

          <Grid item xs={1}>
            <TextField
              label="БЕМ₮"
              value={emanageramount === 0 ? "" : emanageramount}
              onChange={(event) => setEmanageramount(event.target.value)}
              type="number"
              inputProps={{ min: 0 }}
              fullWidth
            />
          </Grid>
          <Grid item xs={1}>
            <TextField
              label="БЗ₮"
              value={zahiralamount === 0 ? "" : zahiralamount}
              onChange={(event) => setZahiralamount(event.target.value)}
              type="number"
              inputProps={{ min: 0 }}
              fullWidth
            />
          </Grid> */}

          {/* Buttons */}
          <Grid item xs={1}>
            <label htmlFor="file-upload">
              <Button
                variant="contained"
                component="span"
                disabled={loading} // Disable button while loading
                startIcon={loading ? <CircularProgress size={24} /> : null}
              >
                Оруулах
              </Button>
            </label>
            <input
              type="file"
              id="file-upload"
              accept=".xlsx, .xls"
              style={{ display: "none" }}
              onChange={(e) => {
                handleFileChange(e);
              }}
            />
          </Grid>
          <Grid item xs={2}>
            <Button
              variant="contained"
              startIcon={<RiFileExcel2Fill />}
              onClick={() => window.open(downloadUrl, "_blank")}
            >
              Загвар файл татах
            </Button>
          </Grid>
          <Grid item xs={1}>
            <Button
              variant="contained"
              onClick={fetchData} // Fetch data and process counts
              disabled={loading || !importData} // Disable button while loading
              startIcon={loading ? <CircularProgress size={24} /> : null} // Show loader on button
            >
              Тооцоолох
            </Button>
          </Grid>

          <Grid item xs={1}>
            <Button
              variant="contained"
              disabled={realData.length === 0}
              onClick={handleExportExcel}
            >
              Татаж авах
            </Button>
          </Grid>
        </Grid>
        <MaterialReactTable columns={columns} data={realData} />
      </Paper>
    </ThemeProvider>
  );
};

export default PromotionCalculation;
