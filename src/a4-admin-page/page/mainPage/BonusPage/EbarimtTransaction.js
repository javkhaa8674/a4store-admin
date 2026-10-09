/* eslint-disable react/jsx-pascal-case */
import { useMemo, useState } from "react";
import {
  MRT_EditActionButtons,
  MaterialReactTable,
  // createRow,
  useMaterialReactTable,
} from "material-react-table";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
  ThemeProvider,
  createTheme,
  TextField,
} from "@mui/material";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { RiFileExcel2Fill } from "react-icons/ri";
import { read, utils } from "xlsx";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { mkConfig, generateCsv, download } from "export-to-csv";
import {
  ref,
  get,
  set,
  update,
  remove,
  push,
  child,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import { db } from "refrence/realConfig";
import dayjs from "dayjs";

const date = new Date();
const queryClient = new QueryClient();

const csvConfig = mkConfig({
  filename: `Е Баримт шивэлт-${date}`,
  fieldSeparator: ",",
  decimalSeparator: ".",
  columnHeaders: [
    {
      key: "ID",
      displayLabel: "Утас",
    },
    {
      key: "id",
      displayLabel: "id",
    },
    {
      key: "Date",
      displayLabel: "Огноо",
      Cell: ({ cell }) => dayjs(cell.getValue()).format("YYYY-MM-DD HH:mm:ss"),
      enableEditing: true,
    },
    {
      key: "Name",
      displayLabel: "Харилцагчийн нэр",
    },
    {
      key: "RegistrationNumber",
      displayLabel: "Регистрийн дугаар",
    },
    {
      key: "Count",
      displayLabel: "Дүн",
    },
  ],
});

const downloadUrl =
  "https://firebasestorage.googleapis.com/v0/b/a4mongolia.appspot.com/o/%D0%95%D0%B1%D0%B0%D1%80%D0%B8%D0%BC%D1%82%20%D1%88%D0%B8%D0%B2%D1%8D%D0%BB%D1%82%20%D0%B7%D0%B0%D0%B3%D0%B2%D0%B0%D1%80.xlsx?alt=media&token=b2213117-0b86-478b-8a8a-04bdfe0cae88";

const Example = () => {
  const [searchTerm, setSearchTerm] = useState(""); // User input for search
  const [fetchAll, setFetchAll] = useState(false);
  const columns = useMemo(
    () => [
      {
        accessorKey: "ID",
        header: "Утас",
      },
      {
        accessorKey: "id",
        header: "id",
        enableEditing: false,
      },
      {
        accessorKey: "Date",
        header: "Огноо",
        Cell: ({ cell }) =>
          dayjs(cell.getValue()).format("YYYY-MM-DD HH:mm:ss"),
        enableEditing: false,
      },
      {
        accessorKey: "Name",
        header: "Харилцагчийн нэр",
      },
      {
        accessorKey: "RegistrationNumber",
        header: "Регистрийн дугаар",
      },
      {
        accessorKey: "Count",
        header: "Дүн",
        muiTableBodyCellProps: {
          align: "right", // aligns the currency values to the right
        },
        Cell: ({ cell }) => {
          const formattedCurrency = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "MNT",
            minimumFractionDigits: 2,
          }).format(cell.getValue());
          return formattedCurrency;
        },
      },
    ],
    [],
  );
  const [importData, setImportData] = useState([]);
  //call CREATE hook
  const { mutateAsync: createUser, isPending: isCreatingUser } =
    useCreateUser();
  //call READ hook
  const {
    data: fetchedUsers = [],
    isError: isLoadingUsersError,
    isFetching: isFetchingUsers,
    isLoading: isLoadingUsers,
  } = useGetUsers();
  //call UPDATE hook
  const { mutateAsync: updateUser, isPending: isUpdatingUser } =
    useUpdateUser();
  //call DELETE hook
  const { mutateAsync: deleteUser, isPending: isDeletingUser } =
    useDeleteUser();

  //CREATE hook (post new user to api)
  function useCreateUser() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (user) => {
        for (const value of user) {
          const newPostKey = push(child(ref(db), "posts")).key;
          await set(ref(db, "ebarimtTransaction/" + newPostKey), value);
        }
        //send api update request here

        return Promise.resolve();
      },
      //client side optimistic update
      onMutate: (newUserInfo) => {
        queryClient.setQueryData(["promotion"], (prevUsers = []) => [
          ...prevUsers,
          {
            ...newUserInfo,
            id: (Math.random() + 1).toString(36).substring(7),
          },
        ]);
      },
      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: ["promotion"] }), //refetch users after mutation, disabled for demo
    });
  }

  //READ hook (get users from api)
  function useGetUsers() {
    return useQuery({
      queryKey: ["promotion", searchTerm, fetchAll],
      queryFn: async () => {
        try {
          let promoQuery;
          if (fetchAll) {
            // Fetch all data if fetchAll is true
            promoQuery = ref(db, "ebarimtTransaction");
          } else if (searchTerm.length === 8) {
            // Only query if searchTerm is defined
            promoQuery = query(
              ref(db, "ebarimtTransaction"),
              orderByChild("ID"),
              equalTo(Number(searchTerm)),
            );
          } else {
            // If fetchAll is false and searchTerm is not defined, return an empty array
            return [];
          }
          const snapshot = await get(promoQuery);

          if (!snapshot.exists()) return [];
          return Object.entries(snapshot.val())
            .map(([id, user]) => ({ id, ...user }))
            .reverse();
        } catch (error) {
          console.error("Error fetching users:", error);
          throw new Error("Failed to fetch users");
        }
      },
      enabled: fetchAll || Boolean(searchTerm), // Fetch only when searchTerm or fetchAll is set
      refetchOnWindowFocus: true,
    });
  }

  //UPDATE hook (put user in api)
  function useUpdateUser() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (user) => {
        //send api update request here
        const updatedData = {
          ...user, // Spread the original row data
          ID: Number(user.ID),
        };
        const userRef = ref(db, `ebarimtTransaction/${updatedData.id}`);
        await update(userRef, updatedData);
        return Promise.resolve();
      },
      //client side optimistic update
      onMutate: (newUserInfo) => {
        queryClient.setQueryData(["promotion"], (prevUsers) =>
          prevUsers?.map((prevUser) =>
            prevUser.id === newUserInfo.id ? newUserInfo : prevUser,
          ),
        );
      },
      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: ["promotion"] }), //refetch users after mutation, disabled for demo
    });
  }

  //DELETE hook (delete user in api)
  function useDeleteUser() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (userId) => {
        //send api update request here
        const userRef = ref(db, `ebarimtTransaction/${userId}`);
        await remove(userRef);
        return Promise.resolve();
      },
      //client side optimistic update
      onMutate: (userId) => {
        queryClient.setQueryData(["promotion"], (prevUsers) =>
          prevUsers?.filter((user) => user.id !== userId),
        );
      },
      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: ["promotion"] }), //refetch users after mutation, disabled for demo
    });
  }

  //CREATE action
  const handleCreateUser = async ({ values, table }) => {
    await createUser(importData);
    table.setCreatingRow(null); //exit creating mode
  };

  //UPDATE action
  const handleSaveUser = async ({ values, table }) => {
    await updateUser(values);
    table.setEditingRow(null); //exit editing mode
  };
  // Export CSV data
  const handleExportData = () => {
    const columnsToRemove = ["id"];
    // Function to exclude specific columns from the data
    const excludeColumns = (data, columnsToRemove) => {
      return data.map((item) => {
        const newItem = { ...item }; // Create a copy of the item
        columnsToRemove.forEach((column) => delete newItem[column]); // Delete unwanted columns
        return newItem;
      });
    };
    const removedId = excludeColumns(fetchedUsers, columnsToRemove);

    const csv = generateCsv(csvConfig)(removedId);
    download(csvConfig)(csv);
  };

  //DELETE action
  const openDeleteConfirmModal = (row) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUser(row.original.id);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      processExcelFile(file, event);
    }
  };

  const processExcelFile = async (file, table) => {
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
        const customHeader = [
          "Date",
          "Name",
          "RegistrationNumber",
          "Count",
          "ID",
        ];
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

  const table = useMaterialReactTable({
    columns,
    data: fetchedUsers,
    createDisplayMode: "modal", //default ('row', and 'custom' are also available)
    editDisplayMode: "modal", //default ('row', 'cell', 'table', and 'custom' are also available)
    enableEditing: true,
    getRowId: (row) => row.id,
    muiToolbarAlertBannerProps: isLoadingUsersError
      ? {
          color: "error",
          children: "Error loading data",
        }
      : undefined,
    muiTableContainerProps: {
      sx: {
        minHeight: "500px",
      },
    },
    onCreatingRowSave: handleCreateUser,
    onEditingRowSave: handleSaveUser,
    //optionally customize modal content
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">Мэдээлэл оруулах</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <MaterialReactTable
            columns={[
              {
                accessorKey: "ID",
                header: "Утас",
              },
              {
                accessorKey: "Date",
                header: "Огноо",
                Cell: ({ cell }) =>
                  dayjs(cell.getValue()).format("YYYY-MM-DD HH:mm:ss"),
                enableEditing: true,
              },
              {
                accessorKey: "Name",
                header: "Харилцагчийн нэр",
              },
              {
                accessorKey: "RegistrationNumber",
                header: "Регистрийн дугаар",
              },
              {
                accessorKey: "Count",
                header: "Дүн",
                Cell: ({ cell }) => {
                  const formattedCurrency = new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "MNT",
                    minimumFractionDigits: 2,
                  }).format(cell.getValue());
                  return formattedCurrency;
                },
              },
            ]}
            data={importData}
            enableSorting
            enableColumnOrdering
            initialState={{ showGlobalFilter: true }}
            dialogProps={{
              maxWidth: "sm", // Adjust the max width if needed
              fullWidth: true, // Make the dialog full width
            }}
          />
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),
    //optionally customize modal content
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">Edit User</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {internalEditComponents} {/* or render custom edit components here */}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Tooltip title="Edit">
          <IconButton onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Button
          variant="contained"
          startIcon={<RiFileExcel2Fill />}
          onClick={handleExportData}
        >
          Татаж авах
        </Button>
        <label htmlFor="file-upload">
          <Button
            variant="contained"
            component="span"
            startIcon={<RiFileExcel2Fill />}
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
            table.setCreatingRow(true);
          }}
        />
        <Button
          variant="contained"
          startIcon={<RiFileExcel2Fill />}
          onClick={() => window.open(downloadUrl, "_blank")}
        >
          Загвар файл татах
        </Button>
      </Box>
    ),
    initialState: { columnVisibility: { id: false } },
    state: {
      isLoading: isLoadingUsers,
      isSaving: isCreatingUser || isUpdatingUser || isDeletingUser,
      showAlertBanner: isLoadingUsersError,
      showProgressBars: isFetchingUsers,
    },
  });

  return (
    <Box>
      <Box sx={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <TextField
          label="ID оруулах"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            queryClient.invalidateQueries(["promotion"]);
          }}
          variant="filled"
          size="small"
        />
        <Button
          variant="outlined"
          onClick={() => {
            setFetchAll(true); // Fetch all data
            setSearchTerm(""); // Clear search term
            queryClient.invalidateQueries(["promotion"]);
          }}
        >
          Бүгд
        </Button>
      </Box>
      <MaterialReactTable table={table} />
    </Box>
  );
};

const EbarimtTransaction = () => {
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
  return (
    //Put this with your other react-query providers near root of your app
    <QueryClientProvider client={queryClient}>
      <Typography color="inherit" variant="h4">
        Е-Баримт шивэлт
      </Typography>
      <ThemeProvider theme={tableTheme}>
        <Example />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default EbarimtTransaction;
