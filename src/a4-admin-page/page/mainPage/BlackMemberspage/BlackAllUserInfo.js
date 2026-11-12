/* eslint-disable react/jsx-pascal-case */
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  ThemeProvider,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import dayjs from "dayjs";
import { download, generateCsv, mkConfig } from "export-to-csv";
import {
  equalTo,
  get,
  orderByChild,
  query,
  ref,
  remove,
  set,
  update,
} from "firebase/database";
import {
  MRT_EditActionButtons,
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { useMemo, useState } from "react";
import { RiFileExcel2Fill } from "react-icons/ri";
import { db } from "refrence/realConfig";
import { useTableTheme } from "../../../../theme/useTableTheme";

const csvConfig = mkConfig({
  filename: `Блэк бүх худалдан авалт-${dayjs().format("YYYY-MM-DD HH:mm:ss")}`,
  fieldSeparator: ",",
  decimalSeparator: ".",
  columnHeaders: [
    { key: "MemberId", displayLabel: "Утас" },
    { key: "QuantityName", displayLabel: "Нэр" },
    { key: "RankName", displayLabel: "Цол" },
    { key: "SponsorId", displayLabel: "Спонсор Id" },
    { key: "SponsorName", displayLabel: "Спонсорын нэр" },
    { key: "accNumber", displayLabel: "Дансны дугаар" },
    { key: "accName", displayLabel: "Банкны нэр" },
    { key: "System", displayLabel: "Шилжсэн" },
  ],
});

function validateUser() {
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
      { accessorKey: "id", header: "id" },
      {
        accessorKey: "MemberId",
        header: "ID",
        muiEditTextFieldProps: { type: "number" },
      },

      {
        accessorKey: "QuantityName",
        header: "Нэр",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.name,
          helperText: validationErrors?.name,
          onFocus: () =>
            setValidationErrors({ ...validationErrors, name: undefined }),
        },
      },
      { accessorKey: "RankName", header: "Зэрэглэлийн нэр", size: 80 },
      {
        accessorKey: "SponsorId",
        header: "Спонсор ID",
        muiEditTextFieldProps: { type: "number" },
      },
      { accessorKey: "SponsorName", header: "Спонсор нэр" },
      { accessorKey: "accName", header: "Банкны нэр" },
      {
        accessorKey: "accNumber",
        header: "Дансны дугаар",
        muiEditTextFieldProps: { type: "number" },
      },
      {
        accessorKey: "System",
        header: "Төрөл",
        Cell: ({ cell }) => (cell.getValue() ? "Шилжсэн" : "Шилжээгүй"),
      },
    ],
    [validationErrors],
  );
  // CREATE hook (post new user to api)
  const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (user) => {
        const newUserRef = ref(db, "BlackMembers/userInfo");
        await set(newUserRef.push(), user);
        return Promise.resolve();
      },
      onMutate: (newUserInfo) => {
        queryClient.setQueryData(["BlackMembers/userInfo"], (prevUsers) => [
          ...(prevUsers || []),
          { ...newUserInfo, id: (Math.random() + 1).toString(36).substring(7) },
        ]);
      },
    });
  };
  function useGetUsers() {
    return useQuery({
      queryKey: ["BlackMembers/userInfo", searchTerm, fetchAll],
      queryFn: async () => {
        try {
          let promoQuery;
          if (fetchAll) {
            // Fetch all data if fetchAll is true
            promoQuery = ref(db, "BlackMembers/userInfo");
          } else if (searchTerm.length === 8) {
            console.log(searchTerm);
            // Only query if searchTerm is defined
            promoQuery = query(
              ref(db, "BlackMembers/userInfo"),
              orderByChild("MemberId"),
              equalTo(Number(searchTerm)),
            );
          } else {
            // If fetchAll is false and searchTerm is not defined, return an empty array
            return [];
          }
          const snapshot = await get(promoQuery);

          if (!snapshot.exists()) return [];
          return Object.entries(snapshot.val()).map(([id, user]) => ({
            id,
            ...user,
          }));
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
  const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (user) => {
        const updatedData = {
          ...user, // Spread the original row data
          MemberId: Number(user.MemberId),
        };
        // remove undefined values
        const sendData = Object.fromEntries(
          Object.entries(updatedData).filter(
            ([_, value]) => value !== undefined,
          ),
        );
        const userRef = ref(db, `BlackMembers/userInfo/${sendData.id}`);
        await update(userRef, sendData);
        return Promise.resolve();
      },
      onMutate: (newUserInfo) => {
        queryClient.setQueryData(["BlackMembers/userInfo"], (prevUsers) =>
          prevUsers?.map((prevUser) =>
            prevUser.id === newUserInfo.id ? newUserInfo : prevUser,
          ),
        );
      },
      onSettled: () => queryClient.invalidateQueries(["BlackMembers/userInfo"]), // Refetch users after mutation
    });
  };
  // DELETE hook (delete user in api)
  const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (userId) => {
        const userRef = ref(db, `BlackMembers/userInfo/${userId}`);
        await remove(userRef);
        return Promise.resolve();
      },
      onMutate: (userId) => {
        queryClient.setQueryData(["BlackMembers/userInfo"], (prevUsers) =>
          prevUsers?.filter((user) => user.id !== userId),
        );
      },

      onSettled: () => queryClient.invalidateQueries(["BlackMembers/userInfo"]), // Refetch users after mutation
    });
  };
  const { mutateAsync: createUser, isPending: isCreatingUser } =
    useCreateUser();
  const { mutateAsync: updateUser, isPending: isUpdatingUser } =
    useUpdateUser();
  const { mutateAsync: deleteUser, isPending: isDeletingUser } =
    useDeleteUser();

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
    renderTopToolbarCustomActions: () => (
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
        id: false,
        ResidentRegistrationNumber: false,

        amount: false,
        inviterId: false,
        iniviterName: false,
        accName: false,
        accNumber: false,
        // SponsorId:false,
        // SponsorName:false,
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

const BlackAllUserInfo = () => {
  const tableTheme = useTableTheme();
  return (
    <QueryClientProvider client={queryClient}>
      <Typography color="inherit" variant="h4">
        Блэк бүх худалдан авалт
      </Typography>
      <ThemeProvider theme={tableTheme}>
        <Example />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default BlackAllUserInfo;
