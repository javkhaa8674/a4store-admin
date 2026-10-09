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
  TextField,
  Typography,
  ThemeProvider,
  useTheme,
  createTheme,
  IconButton, // ★ НЭМЭХ
  Tooltip, // ★ НЭМЭХ
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit"; // ★ НЭМЭХ
import DeleteIcon from "@mui/icons-material/Delete"; // ★ НЭМЭХ
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { RiFileExcel2Fill } from "react-icons/ri";
import dayjs from "dayjs";
import {
  ref,
  get,
  set,
  update,
  remove,
  push,
  orderByChild,
  equalTo,
  query,
} from "firebase/database";
import { db } from "refrence/realConfig"; // Adjust the import path as needed
import { read, utils } from "xlsx";

const csvConfig = mkConfig({
  filename: `Гүйлгээний мэдээлэл-${dayjs().format("YYYY-MM-DD HH:mm:ss")}`,
  fieldSeparator: ",",
  decimalSeparator: ".",
  columnHeaders: [
    {
      key: "tranPostedDate",
      displayLabel: "Гүйлгээний огноо",
    },
    {
      key: "tranDescEdit",
      displayLabel: "Тайлбар",
    },
    {
      key: "memberId",
      displayLabel: "Утас",
    },
    {
      key: "tranDesc",
      displayLabel: "Гүйлгээний утга",
    },
    {
      key: "accName",
      displayLabel: "Харьцсан дансны нэр",
    },
    {
      key: "accNum",
      displayLabel: "Харьцсан данс",
    },
    {
      key: "tranAmount",
      displayLabel: "Мөнгөн дүн",
    },
  ],
});

function validateUser(user) {
  return {};
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
  const [searchTerm, setSearchTerm] = useState(""); // User input for search
  const [fetchAll, setFetchAll] = useState(false); // Flag to control data fetching
  const { data: fetchedUsers = [], isError, isLoading } = useGetUsers();

  const columns = useMemo(
    () => [
      {
        accessorKey: "deletedAt",
        header: "Устгасан огноо",
        Cell: ({ cell }) =>
          dayjs(cell.getValue()).format("YYYY-MM-DD HH:mm:ss"),
      },
      {
        accessorKey: "tranPostedDate",
        header: "Гүйлгээний огноо",
        Cell: ({ cell }) =>
          dayjs(cell.getValue()).format("YYYY-MM-DD HH:mm:ss"),
      },

      {
        accessorKey: "tranDescEdit",
        header: "Тайлбар",
        enableEditing: true,
      },
      {
        accessorKey: "memberId",
        header: "Утас",
        type: "number",
        enableEditing: true,
      },
      {
        accessorKey: "tranDesc",
        header: "Гүйлгээний утга",
        enableEditing: true,
      },
      {
        accessorKey: "accName",
        header: "Харьцсан дансны нэр",
        enableEditing: true,
      },
      {
        accessorKey: "accNum",
        header: "Харьцсан данс",
        type: "number",
        enableEditing: true,
      },
      {
        accessorKey: "tranAmount",
        header: "Мөнгөн дүн",
        type: "number",
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

  // CREATE hook (post new user to api)
  function useCreateUser() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (user) => {
        const newUserRef = ref(db, "delete/statements");
        await set(newUserRef.push(), user);
        return Promise.resolve();
      },
      onMutate: (newUserInfo) => {
        queryClient.setQueryData(["delete/statements"], (prevUsers) => [
          ...(prevUsers || []),
          { ...newUserInfo, id: (Math.random() + 1).toString(36).substring(7) },
        ]);
      },
    });
  }

  //READ hook (get users from api)
  function useGetUsers() {
    return useQuery({
      queryKey: ["delete/statements", searchTerm, fetchAll],
      queryFn: async () => {
        try {
          let promoQuery;
          if (fetchAll) {
            // Fetch all data if fetchAll is true
            promoQuery = ref(db, "delete/statements");
          } else if (searchTerm.length === 8) {
            console.log(searchTerm);
            // Only query if searchTerm is defined
            promoQuery = query(
              ref(db, "delete/statements"),
              orderByChild("memberId"),
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

  // UPDATE hook (put user in api)
  function useUpdateUser() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (user) => {
        const updatedData = {
          ...user, // Spread the original row data
          memberId: Number(user.memberId),
          tranAmount: Number(user.tranAmount),
        };
        const userRef = ref(db, `delete/statements/${updatedData.id}`);
        await update(userRef, updatedData);
        return Promise.resolve();
      },
      onMutate: (newUserInfo) => {
        queryClient.setQueryData(["delete/statements"], (prevUsers) =>
          prevUsers?.map((prevUser) =>
            prevUser.id === newUserInfo.id ? newUserInfo : prevUser,
          ),
        );
      },
      onSettled: () => queryClient.invalidateQueries(["delete/statements"]), // Refetch users after mutation
    });
  }

  // DELETE hook (delete user in api)
  function useDeleteUser() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (userId) => {
        const userRef = ref(db, `delete/statements/${userId}`);
        await remove(userRef);
        return Promise.resolve();
      },
      onMutate: (userId) => {
        queryClient.setQueryData(["delete/statements"], (prevUsers) =>
          prevUsers?.filter((user) => user.id !== userId),
        );
      },
      onSettled: () => queryClient.invalidateQueries(["delete/statements"]), // Refetch users after mutation
    });
  }

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
    if (window.confirm("Та энэ мэдээллийг устгахдаа итгэлтэй байна уу?")) {
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

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      processExcelFile(file);
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
    data: fetchedUsers,
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
        <DialogTitle variant="h3">Edit User</DialogTitle>
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
          onClick={() => exportToExcel(fetchedUsers)}
        >
          Татаж авах
        </Button>
        <label htmlFor="file-upload">
          <Button
            variant="contained"
            startIcon={<RiFileExcel2Fill />}
            component="span"
          >
            Файл оруулах
          </Button>
        </label>
        <input
          type="file"
          id="file-upload"
          accept=".xlsx, .xls"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
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

  return (
    <Box>
      <Box sx={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <TextField
          label="ID оруулах"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setFetchAll(false);
            queryClient.invalidateQueries(["delete/statements"]);
          }}
          variant="filled"
          size="small"
        />
        <Button
          variant="outlined"
          onClick={() => {
            setFetchAll(true); // Fetch all data
            setSearchTerm(""); // Clear search term
            queryClient.invalidateQueries(["delete/statements"]);
          }}
        >
          Бүгд
        </Button>
      </Box>
      <MaterialReactTable table={table} />
    </Box>
  );
};

const queryClient = new QueryClient();

const DeleteStatements = () => {
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
      <Typography color="inherit" variant="h4">
        Устгасан дансны хуулга
      </Typography>
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
      const usersRef = ref(db, "delete/statements");
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
    onSettled: () => queryClient.invalidateQueries(["delete/statements"]),
  });
}

export default DeleteStatements;
