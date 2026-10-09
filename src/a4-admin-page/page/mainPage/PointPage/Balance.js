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
import { mkConfig, generateCsv, download } from "export-to-csv";
import { RiFileExcel2Fill } from "react-icons/ri";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import dayjs from "dayjs";
import { ref, remove } from "firebase/database";
import { db, auth } from "refrence/realConfig";
import axios from "storeaxios";

const csvConfig = mkConfig({
  filename: `Худалдан Авалт-${dayjs().format("YYYY-MM-DD HH:mm:ss")}`,
  fieldSeparator: ",",
  decimalSeparator: ".",
  columnHeaders: [
    {
      key: "pointId",
      displayLabel: "id",
    },
    {
      key: "balance",
      displayLabel: "Баланс",
    },
    {
      key: "phone",
      displayLabel: "Утас",
    },
    {
      key: "email",
      displayLabel: "И-Мэйл",
    },
    {
      key: "lastName",
      displayLabel: "Овог",
    },
    {
      key: "firstName",
      displayLabel: "Нэр",
    },
  ],
  quoteStrings: '"',
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
      const newItem = {
        ...item,
        pointId: item.pointId ? `="${item.pointId}"` : "",
      }; // Create a copy of the item
      columnsToRemove.forEach((column) => delete newItem[column]); // Delete unwanted columns
      return newItem;
    });
  };
  const removedId = excludeColumns(data, columnsToRemove);

  const csv = generateCsv(csvConfig)(removedId);
  download(csvConfig)(csv);
};

const Example = () => {
  // ★ useQueryClient hook ашиглах
  const queryClient = useQueryClient();

  const [validationErrors, setValidationErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState(""); // User input for search
  const [fetchAll, setFetchAll] = useState(false); // Flag to control data fetching
  const { data: fetchedUsers = [], isError, isLoading } = useGetUsers();

  const columns = useMemo(
    () => [
      {
        accessorKey: "pointId",
        header: "id",
        enableClickToCopy: true,
      },
      {
        accessorKey: "balance",
        header: "Баланс",
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
                maxWidth: "12ch",
                p: "0.25rem",
              })}
            >
              {value.toLocaleString("MN-mn") + "₮"}
            </Box>
          );
        },
        enableClickToCopy: true,
      },
      {
        accessorKey: "phone",
        header: "Утас",
      },
      {
        accessorKey: "email",
        header: "И-Мэйл",
      },
      {
        accessorKey: "lastName",
        header: "Овог",
      },
      {
        accessorKey: "firstName",
        header: "Нэр",
      },
    ],
    [],
  );

  // CREATE hook (post new user to api)
  const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (user) => {
        // const newUserRef = ref(db, "userInfo");
        // await set(newUserRef.push(), user);
        return Promise.resolve();
      },
      onMutate: (newUserInfo) => {
        // queryClient.setQueryData(["balance"], (prevUsers) => [
        //   ...(prevUsers || []),
        //   {
        //     ...newUserInfo,
        //     id: (Math.random() + 1).toString(36).substring(7),
        //   },
        // ]);
      },
      onSettled: () => queryClient.invalidateQueries({ queryKey: ["balance"] }),
    });
  };

  // READ hook (get users from api)
  function useGetUsers() {
    return useQuery({
      queryKey: ["balance", searchTerm, fetchAll],
      queryFn: async () => {
        try {
          const user = auth.currentUser;
          const token = await user.getIdToken();
          if (fetchAll) {
            console.log("fetch All worked");
            const result = await axios.post(
              "/getUsersBalance",
              { data: null },
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              },
            );
            console.log(result.data);
            return result.data;
          } else if (searchTerm.length === 8) {
            console.log(searchTerm);
            console.log("token", token);
            const result = await axios.post(
              `/getUserBalanceById?phone=${searchTerm}`,
              { data: null },
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              },
            );
            return [result.data];
          } else {
            // If fetchAll is false and searchTerm is not defined, return an empty array
            return [];
          }
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
        // const updatedData = {
        //   ...user, // Spread the original row data
        //   MemberId: Number(user.MemberId),
        // };
        // // remove undefined values
        // const sendData = Object.fromEntries(
        //   Object.entries(updatedData).filter(
        //     ([_, value]) => value !== undefined
        //   )
        // );
        // const userRef = ref(db, `userInfo/${sendData.id}`);
        // await update(userRef, sendData);
        return Promise.resolve();
      },
      onMutate: (newUserInfo) => {
        // queryClient.setQueryData(["balance"], (prevUsers) =>
        //   prevUsers?.map((prevUser) =>
        //     prevUser.id === newUserInfo.id ? newUserInfo : prevUser
        //   )
        // );
      },
      onSettled: () => queryClient.invalidateQueries({ queryKey: ["balance"] }),
    });
  };

  // DELETE hook (delete user in api)
  const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (userId) => {
        const userRef = ref(db, `userInfo/${userId}`);
        await remove(userRef);
        return Promise.resolve();
      },
      onMutate: async (userId) => {
        // ★ Бүх "balance" query-г цуцлах
        await queryClient.cancelQueries({ queryKey: ["balance"] });

        // ★ Өмнөх өгөгдлийг хадгалах
        const previousData = queryClient.getQueriesData({
          queryKey: ["balance"],
        });

        // ★ Бүх "balance" query-с устгасан хэрэглэгчийг хасах
        queryClient.setQueriesData({ queryKey: ["balance"] }, (oldData) =>
          oldData?.filter((user) => user.id !== userId),
        );

        return { previousData };
      },
      onError: (err, userId, context) => {
        // ★ Алдаа гарвал өмнөх өгөгдлийг буцаах
        if (context?.previousData) {
          context.previousData.forEach(([queryKey, data]) => {
            queryClient.setQueryData(queryKey, data);
          });
        }
      },
      onSettled: () => queryClient.invalidateQueries({ queryKey: ["balance"] }),
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
    if (window.confirm("Та энэ хэрэглэгчийг устгахдаа итгэлтэй байна уу?")) {
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
        <DialogTitle variant="h3">Засах</DialogTitle>
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
        <Tooltip title="Засах">
          <IconButton onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Устгах">
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
      </Box>
    ),
    initialState: {
      columnVisibility: {
        pointId: false,
        email: false,
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
          label="Утасны дугаар оруулах"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setFetchAll(false);
            // ★ queryKey-г "balance" болгож зассан
            queryClient.invalidateQueries({ queryKey: ["balance"] });
          }}
          variant="filled"
          size="small"
        />
        <Button
          variant="outlined"
          onClick={() => {
            setFetchAll(true); // Fetch all data
            setSearchTerm(""); // Clear search term
            // ★ queryKey-г "balance" болгож зассан
            queryClient.invalidateQueries({ queryKey: ["balance"] });
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

const Balance = () => {
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
        Пойнт баланс
      </Typography>
      <ThemeProvider theme={tableTheme}>
        <Example />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default Balance;
