/* eslint-disable react/jsx-pascal-case */
import React, { useMemo, useState } from "react";
import {
  MRT_EditActionButtons,
  MaterialReactTable,
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
  TextField,
  Typography,
  useTheme,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { RiFileExcel2Fill } from "react-icons/ri";
import { mkConfig, generateCsv, download } from "export-to-csv";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import dayjs from "dayjs";
import { ref, get, set, update, remove, push } from "firebase/database";
import { db } from "refrence/realConfig"; // Adjust the import path as needed
import { read, utils } from "xlsx";
import "dayjs/locale/mn";

const status = ["Active", "Inactive"];

const csvConfig = mkConfig({
  filename: `Санал хүсэлт-${dayjs().format("YYYY-MM-DD HH:mm:ss")}`,
  fieldSeparator: ",",
  decimalSeparator: ".",
  columnHeaders: [
    {
      key: "Status",
      displayLabel: "Төлөв",
    },
    {
      key: "timeStamp",
      displayLabel: "Огноо",
    },
    {
      key: "RequestMemberId",
      displayLabel: "Хүсэлт гаргагчийн утас",
    },
    {
      key: "RequestName",
      displayLabel: "Хүсэлт гаргагчийн нэр",
    },
    {
      key: "VipMemberId",
      displayLabel: "Утас",
    },
    {
      key: "VipName",
      displayLabel: "Нэр",
    },
    {
      key: "totalEbarimt",
      displayLabel: "Е-баримтын дүн",
    },
    {
      key: "totalPromotion",
      displayLabel: "Урамшууллын дүн",
    },
    {
      key: "FeedBack",
      displayLabel: "Тайлбар",
    },
  ],
});

function validateUser(user) {
  return {};
}

// CREATE hook (post new user to api)
function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user) => {
      const newUserRef = ref(db, "VipFeedback");
      await set(newUserRef.push(), user);
      return Promise.resolve();
    },
    onMutate: (newUserInfo) => {
      queryClient.setQueryData(["feedBack"], (prevUsers) => [
        ...(prevUsers || []),
        { ...newUserInfo, id: (Math.random() + 1).toString(36).substring(7) },
      ]);
    },
  });
}

// READ hook (get users from api)
function useGetUsers() {
  return useQuery({
    queryKey: ["feedBack"],
    queryFn: async () => {
      try {
        const snapshot = await get(ref(db, "VipFeedback"));
        if (!snapshot.exists()) return [];
        return Object.entries(snapshot.val())
          .map(([id, user]) => ({ id, ...user }))
          .reverse();
      } catch (error) {
        console.error("Error fetching users:", error);
        throw new Error("Failed to fetch users");
      }
    },
    refetchOnWindowFocus: true,
  });
}

// UPDATE hook (put user in api)
function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user) => {
      const updatedData = {
        ...user, // Spread the original row data
      };
      console.log("updatedData", updatedData);
      const userRef = ref(db, `VipFeedback/${updatedData.id}`);
      await update(userRef, updatedData);
      return Promise.resolve();
    },
    onMutate: (newUserInfo) => {
      queryClient.setQueryData(["feedBack"], (prevUsers) =>
        prevUsers?.map((prevUser) =>
          prevUser.id === newUserInfo.id ? newUserInfo : prevUser,
        ),
      );
    },
    onSettled: () => queryClient.invalidateQueries(["feedBack"]), // Refetch users after mutation
  });
}

// DELETE hook (delete user in api)
function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId) => {
      const userRef = ref(db, `VipFeedback/${userId}`);
      await remove(userRef);
      return Promise.resolve();
    },
    onMutate: (userId) => {
      queryClient.setQueryData(["feedBack"], (prevUsers) =>
        prevUsers?.filter((user) => user.id !== userId),
      );
    },
    onSettled: () => queryClient.invalidateQueries(["feedBack"]), // Refetch users after mutation
  });
}

// Export CSV data
const exportToExcel = (data) => {
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

const Example = () => {
  const [validationErrors, setValidationErrors] = useState({});
  const { data: mydata = [], isError, isLoading } = useGetUsers();

  const columns = useMemo(
    () => [
      {
        accessorKey: "Status",
        header: "Төлөв",
        editVariant: "select",
        editSelectOptions: status,
        muiEditTextFieldProps: {
          select: true,
        },
      },
      {
        accessorKey: "timeStamp",
        header: "Огноо",
        Cell: ({ cell }) =>
          dayjs(cell.getValue()).format("YYYY-MM-DD HH:mm:ss"),
        enableEditing: true,
      },
      {
        accessorKey: "RequestMemberId",
        header: "Хүсэлт гаргагчийн утас",
        enableEditing: true,
      },
      {
        accessorKey: "RequestName",
        header: "Хүсэлт гаргагчийн нэр",
        enableEditing: true,
      },
      {
        accessorKey: "VipMemberId",
        header: "Утас",
        enableEditing: true,
      },
      {
        accessorKey: "VipName",
        header: "Нэр",
        enableEditing: true,
      },
      {
        accessorKey: "totalEbarimt",
        header: "Е-баримтын дүн",
        enableEditing: true,
        Cell: ({ cell }) => {
          const formattedCurrency = new Intl.NumberFormat("mn-MN", {
            style: "currency",
            currency: "MNT",
            minimumFractionDigits: 2,
          }).format(cell.getValue());
          return formattedCurrency;
        },
      },
      {
        accessorKey: "totalPromotion",
        header: "Урамшууллын дүн",
        enableEditing: true,
        Cell: ({ cell }) => {
          const formattedCurrency = new Intl.NumberFormat("mn-MN", {
            style: "currency",
            currency: "MNT",
            minimumFractionDigits: 2,
          }).format(cell.getValue());
          return formattedCurrency;
        },
      },
      {
        accessorKey: "FeedBack",
        header: "Тайлбар",
        enableEditing: true,
      },
      {
        accessorKey: "id",
        header: "id",
        enableEditing: true,
      },
    ],
    [],
  );

  const { mutateAsync: createUser, isPending: isCreatingUser } =
    useCreateUser();
  const { mutateAsync: updateUser, isPending: isUpdatingUser } =
    useUpdateUser();
  const { mutateAsync: deleteUser, isPending: isDeletingUser } =
    useDeleteUser();
  const { mutateAsync: saveData2 } = useSaveData2();

  const handleCreateUser = async ({ values, table }) => {
    if (!values) {
      console.error("User values are undefined");
      return;
    }

    const newValidationErrors = validateUser(values);

    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});

    try {
      await createUser(values);
    } catch (error) {
      console.error("Error creating user:", error);
    }

    table.setCreatingRow(null);
  };

  const handleSaveUser = async ({ values, table }) => {
    if (!values) {
      console.error("User values are undefined");
      return;
    }

    const newValidationErrors = validateUser(values);

    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});

    try {
      await updateUser(values);
    } catch (error) {
      console.error("Error updating user:", error);
    }

    table.setEditingRow(null);
  };

  const openDeleteConfirmModal = (row) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUser(row.original.id);
    }
  };

  const renderValidationErrors = (errors) => {
    return Object.entries(errors).map(([key, message]) =>
      message ? (
        <Typography color="error" key={key}>
          {message}
        </Typography>
      ) : null,
    );
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
        const data = utils.sheet_to_json(sheet, {
          dateNF: "yyyy-mm-dd",
          defval: "",
        });

        const formattedData = data.map((item) => ({
          ...item,
          date:
            item.date instanceof Date
              ? dayjs(item.date).toISOString()
              : item.date,
        }));

        if (formattedData.length > 0) {
          await saveData2(formattedData); // Ensure saveData2 is defined and used
          console.log("Data saved successfully");
        } else {
          console.log("No data to save");
        }
      } catch (error) {
        console.error("Error processing file:", error);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const table = useMaterialReactTable({
    columns,
    data: mydata,
    createDisplayMode: "modal",
    editDisplayMode: "modal",
    enableEditing: true,
    getRowId: (row) => row.id,
    muiToolbarAlertBannerProps: isError
      ? { color: "error", children: "Error loading data" }
      : undefined,
    muiTableContainerProps: { sx: { minHeight: "500px" } },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateUser,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveUser,

    renderCreateRowDialogContent: ({ table, row }) => (
      <>
        <DialogTitle variant="h3">Худалдан авалт нэмэх</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          {renderValidationErrors(validationErrors)}
          <TextField
            label="ID"
            variant="outlined"
            fullWidth
            value={row.original?.id || ""}
            onChange={(e) =>
              row.table.setRowEditing({ ...row.original, id: e.target.value })
            }
            inputProps={{
              maxLength: 8,
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
          />
          {/* Add more fields here as needed */}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">Худалдан авалт засварлах</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {internalEditComponents}
          {renderValidationErrors(validationErrors)}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Tooltip title="Edit">
          <IconButton color="success" onClick={() => table.setEditingRow(row)}>
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
          onClick={() => exportToExcel(mydata)}
        >
          Татаж авах
        </Button>
      </Box>
    ),
    initialState: {
      columnVisibility: {
        id: false, // Hide the unixTime column by default
      },
    },
    state: {
      isLoading,
      isSaving: isCreatingUser || isUpdatingUser || isDeletingUser,
      showAlertBanner: isError,
    },
  });

  return <MaterialReactTable table={table} />;
};

const queryClient = new QueryClient();

const VipFeedBack = () => {
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
    <QueryClientProvider client={queryClient}>
      <Typography variant="h4">VIP хүсэлт</Typography>
      <ThemeProvider theme={tableTheme}>
        <Example />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

function useSaveData2() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const usersRef = ref(db, "VipFeedback");
      try {
        const snapshot = await get(usersRef);
        const existingData = snapshot.exists()
          ? Object.values(snapshot.val())
          : [];

        const existingDates = new Set(existingData.map((item) => item.date));

        const promises = data
          .filter((item) => !existingDates.has(item.date))
          .map((item) => {
            const newItemRef = push(usersRef);
            return set(newItemRef, item);
          });

        await Promise.all(promises);
      } catch (error) {
        console.error("Error saving data:", error);
        throw new Error("Failed to save data");
      }
    },
    onSettled: () => queryClient.invalidateQueries(["statements"]),
  });
}

export default VipFeedBack;
