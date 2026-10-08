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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { mkConfig, generateCsv, download } from "export-to-csv";
import {
  ref,
  get,
  update,
  remove,
  orderByChild,
  equalTo,
  query,
} from "firebase/database";
import { db } from "refrence/realConfig";
import dayjs from "dayjs";
import { RiFileExcel2Fill } from "react-icons/ri";

const csvConfig = mkConfig({
  filename: `Ебаримт-${dayjs().format("YYYY-MM-DD HH:mm:ss")}`,
  fieldSeparator: ",",
  decimalSeparator: ".",
  columnHeaders: [
    {
      key: "ID",
      displayLabel: "Утас",
    },
    {
      key: "Name",
      displayLabel: "Нэр",
    },
    {
      key: "Count",
      displayLabel: "Тоо хэмжээ",
    },
    {
      key: "TimeStamps",
      displayLabel: "Шийдвэрлэсэн огноо",
    },
    {
      key: "Requester_TimeStamps",
      displayLabel: "Хүсэлт гаргасан огноо",
    },
    {
      key: "Description",
      displayLabel: "Тайлбар",
    },
  ],
});

const Example = () => {
  const [validationErrors, setValidationErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState(""); // User input for search
  const [fetchAll, setFetchAll] = useState(false); // Flag to control data fetching
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "id",
        enableEditing: false,
        size: 80,
      },
      {
        accessorKey: "Name",
        header: "Нэр",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.firstName,
          helperText: validationErrors?.firstName,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              firstName: undefined,
            }),
          //optionally add validation checking for onBlur or onChange
        },
      },
      {
        accessorKey: "ID",
        header: "Утас",
        size: 80,
        enableClickToCopy: true,
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.phone,
          helperText: validationErrors?.phone,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              phone: undefined,
            }),
        },
      },
      {
        accessorKey: "Count",
        header: "Тоо хэмжээ",
        size: 80,
        muiEditTextFieldProps: {
          type: "number",
        },
      },
      {
        accessorKey: "TimeStamps",
        header: "Шийдвэрлэсэн огноо",
        size: 80,
        Cell: ({ cell }) => {
          const unixTimestamp = cell.getValue();
          return dayjs(unixTimestamp).format("YYYY-MM-DD HH:mm:ss"); // Format using dayjs
        },
      },
      {
        accessorKey: "Requester_TimeStamps",
        header: "Хүсэлт гаргасан огноо",
        size: 80,
        Cell: ({ cell }) => {
          const unixTimestamp = cell.getValue();
          return dayjs(unixTimestamp).format("YYYY-MM-DD HH:mm:ss"); // Format using dayjs
        },
      },
      {
        accessorKey: "Description",
        header: "Тайлбар",
      },
    ],
    [validationErrors],
  );

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
        //send api update request here
        await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
        return Promise.resolve();
      },
      //client side optimistic update
      onMutate: (newUserInfo) => {
        queryClient.setQueryData(["ebarimt"], (prevUsers) => [
          ...prevUsers,
          {
            ...newUserInfo,
            id: (Math.random() + 1).toString(36).substring(7),
          },
        ]);
      },
      // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
    });
  }

  //READ hook (get users from api)
  function useGetUsers() {
    return useQuery({
      queryKey: ["ebarimt", searchTerm, fetchAll],
      queryFn: async () => {
        try {
          let promoQuery;
          if (fetchAll) {
            // Fetch all data if fetchAll is true
            promoQuery = ref(db, "ebarimt");
          } else if (searchTerm.length === 8) {
            // Only query if searchTerm is defined
            promoQuery = query(
              ref(db, "ebarimt"),
              orderByChild("ID"),
              equalTo(searchTerm),
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
        console.log("user", user);
        const userRef = ref(db, `ebarimt/${user.id}`);
        await update(userRef, user);
        return Promise.resolve();
      },
      //client side optimistic update
      onMutate: (newUserInfo) => {
        queryClient.setQueryData(["ebarimt"], (prevUsers) =>
          prevUsers?.map((prevUser) =>
            prevUser.id === newUserInfo.id ? newUserInfo : prevUser,
          ),
        );
      },
      // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
    });
  }

  //DELETE hook (delete user in api)
  function useDeleteUser() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (userId) => {
        const userRef = ref(db, `ebarimt/${userId}`);
        await remove(userRef);
        return Promise.resolve();
      },
      // ★ Client тал дээр optimistic update
      onMutate: async (userId) => {
        // ★ Бүх "ebarimt" query-г цуцлах
        await queryClient.cancelQueries({ queryKey: ["ebarimt"] });

        // ★ Өмнөх өгөгдлийг хадгалах (алдаа гарвал буцаах)
        const previousData = queryClient.getQueriesData({
          queryKey: ["ebarimt"],
        });

        // ★ Бүх "ebarimt" query-с устгасан хэрэглэгчийг хасах
        queryClient.setQueriesData({ queryKey: ["ebarimt"] }, (oldData) =>
          oldData?.filter((user) => user.id !== userId),
        );

        return { previousData };
      },
      // ★ Алдаа гарвал өмнөх өгөгдлийг буцаах
      onError: (err, userId, context) => {
        if (context?.previousData) {
          context.previousData.forEach(([queryKey, data]) => {
            queryClient.setQueryData(queryKey, data);
          });
        }
      },
      // ★ Амжилттай эсвэл алдаа гарсны дараа Firebase-с дахин татах
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["ebarimt"] });
      },
    });
  }

  //CREATE action
  const handleCreateUser = async ({ values, table }) => {
    await createUser(values);
    table.setCreatingRow(null); //exit creating mode
  };

  //UPDATE action
  const handleSaveUser = async ({ values, table }) => {
    await updateUser(values);
    table.setEditingRow(null); //exit editing mode
  };

  //DELETE action
  const openDeleteConfirmModal = (row) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUser(row.original.id);
    }
  };

  const handleExportData = () => {
    const columnsToRemove = ["id"];
    // Function to exclude specific columns from the data
    const excludeColumns = (data, columnsToRemove) => {
      return data.map((item) => {
        const newItem = {
          ...item,
          TimeStamps: dayjs(item.TimeStamps).format("YYYY-MM-DD HH:mm:ss"),
          Requester_TimeStamps: dayjs(item.Requester_TimeStamps).format(
            "YYYY-MM-DD HH:mm:ss",
          ),
        }; // Create a copy of the item
        columnsToRemove.forEach((column) => delete newItem[column]); // Delete unwanted columns
        return newItem;
      });
    };
    const removedId = excludeColumns(fetchedUsers, columnsToRemove);

    const csv = generateCsv(csvConfig)(removedId);
    download(csvConfig)(csv);
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
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateUser,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveUser,
    //optionally customize modal content
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">Худалдан авалт нэмэх</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          {internalEditComponents} {/* or render custom edit components here */}
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

const Ebarimt = () => {
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
        Е Баримт
      </Typography>
      <ThemeProvider theme={tableTheme}>
        <Example />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default Ebarimt;
