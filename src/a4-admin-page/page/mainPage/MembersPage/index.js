/* eslint-disable react/jsx-pascal-case */
import { useMemo, useState } from "react";
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
  useColorScheme,
  ThemeProvider,
  createTheme,
  Typography,
} from "@mui/material";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { RiFileExcel2Fill } from "react-icons/ri";
import dayjs from "dayjs";
import {
  ref,
  get,
  set,
  update,
  remove,
  orderByChild,
  equalTo,
  query,
} from "firebase/database";

import { db } from "refrence/realConfig"; // Adjust the import path as needed
import { AuthStore } from "store/AuthStore";

const csvConfig = mkConfig({
  filename: `Гишүүд-${dayjs().format("YYYY-MM-DD HH:mm:ss")}`,
  fieldSeparator: ",",
  decimalSeparator: ".",
  columnHeaders: [
    {
      key: "lastName",
      displayLabel: "Овог",
    },
    {
      key: "firstName",
      displayLabel: "Нэр",
    },
    {
      key: "phoneNumber",
      displayLabel: "ID",
    },
    {
      key: "bankName",
      displayLabel: "Банкны нэр",
    },
    {
      key: "accountNumber",
      displayLabel: "Дансны дугаар",
    },
    {
      key: "registrationNumber",
      displayLabel: "Регистрийн дугаар",
    },
    {
      key: "province",
      displayLabel: "Оршин сугаа хаяг",
    },
    {
      key: "centerName",
      displayLabel: "Төвийн нэр",
    },
  ],
});

// Validation functions
const validateRequired = (value) =>
  typeof value === "string" && value.trim().length > 0;

const validatePhone = (phone) => {
  const re = /^(\d{4})[- ]?(\d{4})$/;
  return re.test(phone);
};
function validateUser(user) {
  return {
    lastName: !validateRequired(user.lastName)
      ? "Овог нэр хоосон байж болохгүй"
      : "",
    firstName: !validateRequired(user.firstName)
      ? "Нэр хоосон байж болохгүй"
      : "",
    phoneNumber: !validatePhone(user.phoneNumber)
      ? "Утасны дугаар зөв форматтай байх ёстой"
      : "",
    bankName: !validateRequired(user.bankName)
      ? "Банк нэр хоосон байж болохгүй"
      : "",
    // accountNumber: !validateRequired(user.accountNumber) ? "Дансны дугаар хоосон байж болохгүй" : "",
    registrationNumber: !validateRequired(user.registrationNumber)
      ? "Регистрийн дугаар хоосон байж болохгүй"
      : "",
    province: !validateRequired(user.province)
      ? "Оршин сугаа хаяг хоосон байж болохгүй"
      : "",
    centerName: !validateRequired(user.centerName)
      ? "Center Name хоосон байж болохгүй"
      : "",
  };
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
  const { admin } = AuthStore.useState();

  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "id", size: 80, enableClickToCopy: true },
      { accessorKey: "lastName", header: "Овог" },
      { accessorKey: "firstName", header: "Нэр" },
      {
        accessorKey: "phoneNumber",
        header: "ID",
        size: 80,
        type: "number",
        enableClickToCopy: true,
      },
      { accessorKey: "bankName", header: "Банкны нэр" },
      { accessorKey: "accountNumber", header: "Дансны дугаар", type: "number" },
      {
        accessorKey: "registrationNumber",
        header: "Регистрийн дугаар",
        enableClickToCopy: true,
      },
      { accessorKey: "province", header: "Оршин сугаа хаяг" },
      { accessorKey: "centerName", header: "Төвийн нэр" },
    ],
    [],
  );

  const { mutateAsync: createUser, isPending: isCreatingUser } =
    useCreateUser();
  const { mutateAsync: updateUser, isPending: isUpdatingUser } =
    useUpdateUser();
  const { mutateAsync: deleteUser, isPending: isDeletingUser } =
    useDeleteUser();

  // CREATE hook (post new user to api)
  function useCreateUser() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (user) => {
        const newUserRef = ref(db, "Members");
        await set(newUserRef.push(), user);
        return Promise.resolve();
      },
      onMutate: (newUserInfo) => {
        queryClient.setQueryData(["Members"], (prevUsers) => [
          ...(prevUsers || []),
          {
            ...newUserInfo,
            id: (Math.random() + 1).toString(36).substring(7),
          },
        ]);
      },
    });
  }
  //READ hook (get users from api)
  function useGetUsers() {
    return useQuery({
      queryKey: ["Members", searchTerm, fetchAll],
      queryFn: async () => {
        try {
          let promoQuery;
          if (fetchAll) {
            // Fetch all data if fetchAll is true
            promoQuery = ref(db, "Members");
          } else if (searchTerm.length === 8) {
            // Only query if searchTerm is defined
            promoQuery = query(
              ref(db, "Members"),
              orderByChild("phoneNumber"),
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
          phoneNumber: Number(user.phoneNumber),
        };
        const userRef = ref(db, `Members/${updatedData.id}`);
        await update(userRef, updatedData);
        return Promise.resolve();
      },
      onMutate: (newUserInfo) => {
        queryClient.setQueryData(["Members"], (prevUsers) =>
          prevUsers?.map((prevUser) =>
            prevUser.id === newUserInfo.id ? newUserInfo : prevUser,
          ),
        );
      },
      onSettled: () => queryClient.invalidateQueries(["Members"]), // Refetch users after mutation
    });
  }

  // DELETE hook (delete user in api)
  function useDeleteUser() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (userId) => {
        const userRef = ref(db, `Members/${userId}`);
        await remove(userRef);
        return Promise.resolve();
      },
      onMutate: (userId) => {
        queryClient.setQueryData(["Members"], (prevUsers) =>
          prevUsers?.filter((user) => user.id !== userId),
        );
      },
      onSettled: () => queryClient.invalidateQueries(["Members"]), // Refetch users after mutation
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

  const table = useMaterialReactTable({
    columns,
    data: fetchedUsers,
    createDisplayMode: "modal",
    editDisplayMode: "modal",
    enableEditing: admin.userInfo.userRoles === "system",
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
    renderTopToolbarCustomActions: ({ table }) =>
      ["finance", "system"].includes(admin.userInfo.userRoles) && (
        <Box sx={{ display: "flex", gap: "1rem" }}>
          <Button
            variant="contained"
            startIcon={<RiFileExcel2Fill />}
            onClick={() => exportToExcel(fetchedUsers)}
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
      isLoading: isLoading,
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

const queryClient = new QueryClient();

const MemberRegistration = () => {
  const { mode } = useColorScheme(); //(optional) if you already have a theme defined in your app root, you can import here
  const tableTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode, //let's use the same dark/light mode as the global theme

          info: {
            main: "rgb(255,122,0)", //add in a custom color for the toolbar alert background stuff
          },
          background: {
            default:
              mode === "light"
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
    [mode],
  );
  return (
    <QueryClientProvider client={queryClient}>
      <Typography color="inherit" variant="h4">
        Аппликэйшн бүртгэл
      </Typography>
      <ThemeProvider theme={tableTheme}>
        <Example />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default MemberRegistration;
