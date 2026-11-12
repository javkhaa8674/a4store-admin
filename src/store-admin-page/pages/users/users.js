import { useMemo, useState } from "react";
// MRT Imports
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
// Material UI Imports
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
// Firestore Imports
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
// Date Picker Imports
import EditIcon from "@mui/icons-material/Edit";
import { CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import TugrikFormatter from "components/TugrikFormatter";
import dayjs from "dayjs";
import { RiFileExcel2Fill } from "react-icons/ri";
import { firestore } from "refrence/storeConfig"; // Adjust the path to your Firestore config

const Example = () => {
  // State to hold the table data
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tableDataLength, setTableDataLength] = useState(0);
  const { mutateAsync: updateUser, isPending: isUpdatingUser } =
    useUpdateUser();

  // Function to fetch all data`
  const handleFetchAllData = async () => {
    try {
      setIsLoading(true); // Start loading
      setError(null); // Reset error state
      const newData = await fetchDataFromAPI();
      setTableData(newData);
    } catch (err) {
      setError("Failed to fetch data. Please try again.");
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  // Simulated API call function
  const fetchDataFromAPI = async () => {
    try {
      // Reference to the "users" collection
      const usersCollection = collection(firestore, "users");
      const querySnapshot = await getDocs(usersCollection);

      // Extract data from the documents and store it in an array
      const usersData = querySnapshot.docs.map((doc) => ({
        id: doc.id, // Document ID
        ...doc.data(), // Document data
      }));

      // Fetch wallet and point data concurrently for all users
      const combinedData = await Promise.all(
        usersData.map(async (user) => {
          const [walletSnapshot, pointSnapshot] = await Promise.all([
            getDocs(collection(firestore, `users/${user.id}/wallet`)),
            getDocs(collection(firestore, `users/${user.id}/point`)),
          ]);

          const walletsData = walletSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          const pointsData = pointSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          return {
            ...user,
            wallets: walletsData ?? 0,
            points: pointsData ?? 0,
          };
        }),
      );

      let realData = [];
      combinedData.forEach((element) => {
        const timestamp = element.createdAt?.toDate() || null;
        // Format as a readable string
        realData.push({
          ...element,
          createdAt: timestamp ? timestamp.toISOString() : null,
        });
      });
      realData.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : null;
        const dateB = b.createdAt ? new Date(b.createdAt) : null;
        return (dateB?.getTime() || 0) - (dateA?.getTime() || 0); // Descending order
      });
      setTableDataLength(realData.length);
      return realData;
    } catch (error) {
      console.error("Error fetching data from Firestore:", error);
      throw error; // Re-throw the error to handle it in the calling function
    }
  };

  // UPDATE hook (put user in api)
  function useUpdateUser() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (user) => {
        let updatedData = {
          ...user, // Spread the original row data
          createdAt: new Date(user.createdAt),
          lastName: user.name.split(" ")[0],
          firstName: user.name.split(" ")[1],
        };

        const userRef = doc(firestore, `users/${updatedData.id}`);
        const { ...rest } = updatedData; // Destructure to remove id
        console.log("updatedData", rest);
        await updateDoc(userRef, rest);
        return Promise.resolve();
      },
      onMutate: (newUserInfo) => {
        queryClient.setQueryData(["users"], (prevUsers) =>
          prevUsers?.map((prevUser) =>
            prevUser.id === newUserInfo.id ? newUserInfo : prevUser,
          ),
        );
      },
      onSettled: () => queryClient.invalidateQueries(["users"]), // Refetch users after mutation
    });
  }

  const handleSearch = async (e) => {
    if (e.length === 8) {
      setIsLoading(true);

      try {
        const usersCollection = collection(firestore, "users");
        const q = query(usersCollection, where("phone", "==", e));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setIsLoading(false);
          return null;
        }

        const users = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch wallets and points in parallel
        const combinedData = await Promise.all(
          users.map(async (user) => {
            const userRef = doc(firestore, "users", user.id); // ✅ Corrected this line

            const [walletSnapshot, pointSnapshot] = await Promise.all([
              getDocs(collection(userRef, "wallet")), // ✅ Now correctly referencing the subcollection
              getDocs(collection(userRef, "point")),
            ]);

            return {
              ...user,
              wallets: walletSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              })),
              points: pointSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              })),
            };
          }),
        );

        setTableData(combinedData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  // Dynamic columns for wallet and point data

  const theme = createTheme({
    components: {
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: "1px solid rgba(51, 46, 46, 0.51)", // Subtle border for the grid
            borderRadius: "8px", // Rounded corners for a modern look
            overflow: "hidden", // Ensures no overflow issues
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", // Adds depth with a soft shadow
          },
          columnHeaders: {
            // Vibrant blue for headers
            textAlign: "center", // Center-align text
            justifyContent: "center", // Center content horizontally
            fontSize: "14px", // Slightly smaller font for balance
            fontWeight: "bold", // Bold text for emphasis
            borderBottom: "2px solid #1976d2", // Stronger border under headers
            "& .MuiDataGrid-columnHeaderTitle": {
              textTransform: "uppercase", // Uppercase titles for a clean look
              letterSpacing: "0.5px", // Adds spacing between letters
            },
          },
          cell: {
            fontSize: "14px", // Consistent font size
            padding: "12px", // Increased padding for better readability
            borderBottom: "1px solid rgba(224, 224, 224, 0.5)", // Subtle row divider
            "&:nth-of-type(odd)": {
              backgroundColor: "#fafafa", // Light gray for alternating rows
            },
            "&:hover": {
              backgroundColor: "#f0f8ff", // Light blue hover effect for interactivity
            },
          },
          row: {
            "&:hover": {
              backgroundColor: "#e3f2fd", // Soft blue background on row hover
            },
          },
          footerContainer: {
            borderTop: "1px solid rgba(224, 224, 224, 0.5)", // Divider above pagination
            backgroundColor: "#ffffff", // Clean white background for footer
          },
        },
      },
    },
  });

  const TotalMemberCount = useMemo(() => {
    const realData = tableData.filter((item) => item.isMember === true).length;
    return realData;
  }, [tableData]);

  const totalWalletBalance = useMemo(() => {
    return tableData.reduce((total, user) => {
      return total + (user.wallets?.[0] ? Number(user.wallets[0].balance) : 0);
    }, 0);
  }, [tableData]);

  const totalPointBalance = useMemo(() => {
    return tableData.reduce((total, user) => {
      return total + (user.points?.[0] ? Number(user.points[0].balance) : 0);
    }, 0);
  }, [tableData]);

  const columns = useMemo(
    () => [
      {
        id: "employee",
        header: "Хэрэглэгч",
        columns: [
          {
            accessorKey: "id",
            enableClickToCopy: true,
            header: "id",
            size: "auto",
          },
          {
            accessorKey: "pointId",
            enableClickToCopy: true,
            header: "pointId",
            size: "auto",
          },
          {
            accessorFn: (row) =>
              `${row.lastName ?? ""} ${row.firstName ?? ""}`.trim(),
            id: "name",
            header: "Овог нэр",
            filterVariant: "autocomplete",
            size: "auto",
            Cell: ({ renderedCellValue }) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span>{renderedCellValue}</span>
              </Box>
            ),
            Footer: () => (
              <Stack>
                Нийт бүртгүүлсэн хүн:
                <Box color="warning.main">
                  {TugrikFormatter(tableDataLength)}
                </Box>
              </Stack>
            ),
          },
          {
            accessorKey: "phone",
            enableClickToCopy: true,
            filterVariant: "autocomplete",
            header: "Утас",
            size: "auto",
            Footer: () => (
              <Stack>
                Нийт гишүүн:
                <Box color="warning.main">
                  {TugrikFormatter(TotalMemberCount)}
                </Box>
              </Stack>
            ),
          },
          {
            accessorKey: "package",
            header: "Багын бүтцэд орох эрх",
            size: "50",
          },
          {
            accessorKey: "email",
            enableClickToCopy: true,
            filterVariant: "autocomplete",
            header: "И-мэйл",
            size: "auto",
          },
          {
            accessorFn: (row) => row.points?.[0]?.balance ?? 0,
            header: "Оноо",
            size: "auto",
            Cell: ({ cell }) => {
              const value = cell.getValue() ?? 0;
              const formatted = value
                .toFixed(0)
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
              return (
                <Box
                  component="span"
                  sx={(theme) => ({
                    backgroundColor:
                      value < 1
                        ? theme.palette.success.dark // No background when value < 1
                        : value >= 200000
                          ? theme.palette.warning.dark // Orange for values >= 200,000
                          : theme.palette.success.dark, // Green for values > 1 and < 200,000
                    borderRadius: "0.25rem",
                    color: "#fff",
                    maxWidth: "9ch",
                    p: "0.25rem",
                  })}
                >
                  {formatted} P
                </Box>
              );
            },
            Footer: () => (
              <Stack>
                Нийт оноо:
                <Box color="warning.main">
                  {TugrikFormatter(totalPointBalance)}P
                </Box>
              </Stack>
            ),
          },
          {
            accessorFn: (row) => row.wallets?.[0]?.balance ?? 0,
            header: "Хэтэвч",
            size: "auto",
            Cell: ({ cell }) => {
              const value = cell.getValue() ?? 0;
              return (
                <Box
                  component="span"
                  sx={(theme) => ({
                    backgroundColor:
                      value < 1
                        ? theme.palette.success.dark // No background when value < 1
                        : value >= 200000
                          ? theme.palette.warning.dark // Orange for values >= 200,000
                          : theme.palette.success.dark, // Green for values > 1 and < 200,000
                    borderRadius: "0.25rem",
                    color: "#fff",
                    maxWidth: "9ch",
                    p: "0.25rem",
                  })}
                >
                  {value.toLocaleString("MN-mn", {
                    style: "currency",
                    currency: "MNT",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </Box>
              );
            },
            Footer: () => (
              <Stack>
                Нийт мөнгө:
                <Box color="warning.main">
                  {TugrikFormatter(totalWalletBalance)}₮
                </Box>
              </Stack>
            ),
          },

          {
            accessorKey: "createdAt",
            id: "createdAt",
            header: "Бүргүүлсэн огноо",
            filterVariant: "date",
            size: 250,
            sortingFn: "datetime",
            Cell: ({ cell }) => {
              const value = cell.getValue();
              return value
                ? dayjs(value).format("YYYY-MM-DD HH:mm:ss")
                : "Огноо байхгүй";
            },
            filterFn: (row, columnId, filterValue) => {
              const rowValue = dayjs(row.getValue(columnId)).format(
                "YYYY-MM-DD",
              );
              const filterDate = dayjs(filterValue, "MM/DD/YYYY").format(
                "YYYY-MM-DD",
              );
              return rowValue === filterDate;
            },
          },
          {
            accessorKey: "isMember",
            filterVariant: "select",
            filterSelectOptions: [
              { value: "true", label: "Гишүүн" },
              { value: "false", label: "Хэрэглэгч" },
            ],
            header: "Төрөл",
            size: "auto",
            Cell: ({ cell }) => {
              const value = cell.getValue();
              return value ? (
                <span style={{ color: "green" }}>Гишүүн</span>
              ) : (
                <span style={{ color: "orange" }}>Хэрэглэгч</span>
              );
            },
          },
        ],
      },
    ],
    [tableDataLength, TotalMemberCount, totalWalletBalance, totalPointBalance],
  );

  const columnsTransaction = [
    {
      field: "tranAmount",
      headerName: "Мөнгөн дүн",
      width: 150,
      valueFormatter: (params) => {
        if (params == null) {
          return ""; // Display empty string for null or undefined values
        }
        return params.toLocaleString("mn-MN", {
          style: "currency",
          currency: "MNT",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        });
      },
    },
    {
      field: "type",
      headerName: "Төрөл",
      width: 150,
      renderCell: (params) => {
        const value = params.row.type;
        return (
          <span
            style={{
              color:
                value === "Debit"
                  ? "orange"
                  : value === "Credit"
                    ? "green"
                    : "black",
            }}
          >
            {value === "Debit" ? "Зарлага" : value === "Credit" ? "Орлого" : ""}
          </span>
        );
      },
    },
    {
      field: "date",
      headerName: "Огноо",
      width: "auto",
      valueGetter: (params) => {
        try {
          // Handle missing or invalid row
          if (!params) {
            console.error("Row data is missing or undefined");
            return "N/A";
          }

          // Handle missing or invalid date
          const dateField = params;
          if (!dateField) {
            console.error("Date field is missing or undefined");
            return "N/A";
          }

          // Case 1: Firestore Timestamp
          if (
            dateField &&
            typeof dateField === "object" &&
            typeof dateField.seconds === "number"
          ) {
            const { seconds, nanoseconds } = dateField;
            return dayjs
              .unix(seconds)
              .add(nanoseconds / 1_000_000, "millisecond")
              .format("YYYY-MM-DD HH:mm:ss");
          }

          // Default fallback
          return "N/A";
        } catch (error) {
          console.error("Error processing date:", error);
          return "N/A";
        }
      },
    },
  ];

  const handleSaveUser = async ({ values, table }) => {
    if (!values) {
      console.error("User values are undefined");
      return;
    }

    try {
      await updateUser(values);
    } catch (error) {
      console.error("Error updating user:", error);
    }

    table.setEditingRow(null);
  };

  const table = useMaterialReactTable({
    columns,
    data: tableData, // Use state-managed data
    enableColumnFilterModes: false,
    enableColumnOrdering: false,
    enableGrouping: false,
    enableColumnPinning: false,
    enableFacetedValues: true,
    enableRowActions: true,
    enableRowSelection: false,
    initialState: {
      showColumnFilters: false,
      showGlobalFilter: false,
      columnVisibility: {
        id: false,
        pointId: false,
        email: false,
        package: false,
      },
      columnPinning: {
        right: ["mrt-row-expand", "mrt-row-select"],
        left: ["mrt-row-actions"],
      },
    },
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    muiSearchTextFieldProps: {
      size: "small",
      variant: "outlined",
    },
    muiPaginationProps: {
      color: "secondary",
      rowsPerPageOptions: [10, 20, 30, 50, 100],
      shape: "rounded",
      variant: "outlined",
    },
    getRowId: (row) => row.id,
    onEditingRowSave: handleSaveUser,
    state: {
      isLoading,
      isSaving: isUpdatingUser,
      showProgressBars: isLoading,
    },
    renderDetailPanel: ({ row }) => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ marginLeft: "90px", height: "auto", width: "28%" }}>
          <DataGrid
            rows={
              row.original.wallets?.[0]?.transactionHistory?.map(
                (transaction, index) => ({
                  ...transaction,
                  id: transaction.statementId || index, // Ensure there's a unique id for each row
                }),
              ) || []
            }
            columns={columnsTransaction}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 5,
                },
              },
            }}
            pageSizeOptions={[5]}
          />
        </Box>
      </ThemeProvider>
    ),
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Tooltip title="Edit">
          <IconButton onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <TextField
          variant="outlined"
          placeholder="Хайх..."
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: "flex", gap: "0.5rem" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleFetchAllData}
            disabled={isLoading}
            sx={{
              // Default button styles
              backgroundColor: "primary.main",
              color: "white",
              "&:hover": {
                // Hover effect styles
                color: "primary.main",
                backgroundColor: "white", // Darker shade of primary color
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)", // Add a subtle shadow
              },
              "&:disabled": {
                // Disabled state styles
                backgroundColor: "grey.400",
                color: "grey.700",
                cursor: "not-allowed",
              },
            }}
          >
            {isLoading ? <CircularProgress size={24} /> : "Бүгд"}
          </Button>
          <Button
            color="primary"
            disabled={tableData.length < 1}
            startIcon={<RiFileExcel2Fill />}
            onClick={handleExport}
            variant="outlined"
          >
            Татаж авах
          </Button>
        </Box>
      </Box>
    ),
    renderEmptyRowsFallback: () => (
      <Typography variant="body1" align="center">
        {error || (isLoading ? "Loading data..." : "No data available")}
      </Typography>
    ),
  });

  const handleExport = () => {
    // Convert tableData to an array of objects
    const data = tableData.map((user) => ({
      id: user.id,
      Овог: user.lastName,
      Нэр: user.firstName,
      pointId: user.pointId,
      "И-мэйл": user.email,
      Утас: user.phone,
      Хэтэвч: user.wallets?.[0]?.balance || 0, // Handle undefined wallets
      Оноо: user.points?.[0]?.balance || 0, // Handle undefined points
      "Бүртгүүлсэн огноо": user.createdAt ? new Date(user.createdAt) : null,
      Төрөл: user.isMember ? "Гишүүн" : "Хэрэглэгч",
      inviteNumber: user.inviteNumber,
      package: user.package,
    }));
    // Convert the data to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Export the workbook as an Excel file
    XLSX.writeFile(workbook, "data.xlsx");
  };
  return <MaterialReactTable table={table} />;
};

const queryClient = new QueryClient();

// Wrap the component with LocalizationProvider
const ExampleWithLocalizationProvider = () => (
  <QueryClientProvider client={queryClient}>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Example />
    </LocalizationProvider>
  </QueryClientProvider>
);

export default ExampleWithLocalizationProvider;
