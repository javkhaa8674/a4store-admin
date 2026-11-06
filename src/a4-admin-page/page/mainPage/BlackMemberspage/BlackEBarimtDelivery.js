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
  Typography,
  useTheme,
  ThemeProvider,
  createTheme,
  TextField,
  CssBaseline,
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
  push,
  update,
  remove,
  orderByChild,
  equalTo,
  query,
} from "firebase/database";
import { db } from "refrence/realConfig";
import dayjs from "dayjs";
import { RiFileExcel2Fill } from "react-icons/ri";

const EBARIMT_PATH = "BlackMembers/EbarimtDelivery";

const csvConfig = mkConfig({
  filename: `Ебаримт-${dayjs().format("YYYY-MM-DD HH:mm:ss")}`,
  fieldSeparator: ",",
  decimalSeparator: ".",
  columnHeaders: [
    { key: "MemberId", displayLabel: "Утас" },
    { key: "QuantityName", displayLabel: "Нэр" },
    { key: "272Amount", displayLabel: "272 Amount" },
    { key: "OldEbarimt", displayLabel: "Old Ebarimt" },
    { key: "ebarimtCode", displayLabel: "Ебаримт код" },
    { key: "totalAmount", displayLabel: "Нийт дүн" },
    { key: "Check", displayLabel: "Check" },
    { key: "TimeStamp", displayLabel: "Огноо" },
    { key: "Description", displayLabel: "Тайлбар" },
  ],
});

const Example = () => {
  const queryClient = useQueryClient();
  const [validationErrors, setValidationErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [fetchAll, setFetchAll] = useState(false);

  // 🔹 Dark горимыг эндээс шалгана
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "id", enableEditing: false, size: 80 },
      {
        accessorKey: "MemberId",
        header: "Утас",
        size: 100,
        enableClickToCopy: true,
        muiEditTextFieldProps: {
          required: true,
          type: "number",
          error: !!validationErrors?.MemberId,
          helperText: validationErrors?.MemberId,
          onFocus: () =>
            setValidationErrors({ ...validationErrors, MemberId: undefined }),
        },
      },
      {
        accessorKey: "QuantityName",
        header: "Нэр",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.QuantityName,
          helperText: validationErrors?.QuantityName,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              QuantityName: undefined,
            }),
        },
      },
      {
        accessorKey: "272Amount",
        header: "Эхний 272 хүн эсэх",
        size: 90,
        muiEditTextFieldProps: { type: "number" },
        Cell: ({ cell }) => {
          const v = cell.getValue();
          if (v === undefined || v === null || v === "") return "—";
          return Number(v) === 1 ? "Тийм" : "Үгүй";
        },
      },
      {
        accessorKey: "OldEbarimt",
        header: "Old Ebarimt",
        size: 100,
        muiEditTextFieldProps: { type: "number" },
        Cell: ({ cell }) => {
          const v = cell.getValue();
          return v !== undefined && v !== null
            ? Number(v).toLocaleString()
            : "—";
        },
      },
      {
        accessorKey: "ebarimtCode",
        header: "Ебаримтын дүн",
        size: 100,
        muiEditTextFieldProps: { type: "number" },
        Cell: ({ cell }) => {
          const v = cell.getValue();
          return v !== undefined && v !== null
            ? Number(v).toLocaleString()
            : "—";
        },
      },
      {
        accessorKey: "totalAmount",
        header: "Нийт дүн",
        size: 100,
        muiEditTextFieldProps: { type: "number" },
        Cell: ({ cell }) => {
          const v = cell.getValue();
          return v !== undefined && v !== null
            ? Number(v).toLocaleString()
            : "—";
        },
      },
      {
        accessorKey: "Check",
        header: "Шалгасан эсэх",
        size: 80,
        Cell: ({ cell }) => {
          const v = cell.getValue();
          if (v === undefined || v === null || v === "") return "—";
          return Number(v) === 1 ? "Тийм" : "Үгүй";
        },
      },
      {
        accessorKey: "TimeStamp",
        header: "Огноо",
        size: 150,
        Cell: ({ cell }) => {
          const unixTimestamp = cell.getValue();
          if (!unixTimestamp) return "—";
          return dayjs(unixTimestamp).format("YYYY-MM-DD HH:mm:ss");
        },
      },
      { accessorKey: "Description", header: "Тайлбар" },
    ],
    [validationErrors],
  );

  function useCreateUser() {
    return useMutation({
      mutationFn: async (values) => {
        const newData = {
          "272Code": Number(values["272Code"]) || 0,
          Check: !!values.Check,
          Description: values.Description ?? "",
          MemberId: Number(values.MemberId),
          OldEbarimt: Number(values.OldEbarimt) || 0,
          QuantityName: values.QuantityName ?? "",
          TimeStamp: values.TimeStamp
            ? new Date(values.TimeStamp).toISOString()
            : new Date().toISOString(),
          ebarimtCode: Number(values.ebarimtCode) || 0,
          totalAmount: Number(values.totalAmount) || 0,
        };
        await push(ref(db, EBARIMT_PATH), newData);
        return Promise.resolve();
      },
      onMutate: (newUserInfo) => {
        queryClient.setQueryData(
          ["ebarimt", searchTerm, fetchAll],
          (prevUsers) => [
            ...(prevUsers || []),
            {
              ...newUserInfo,
              id: (Math.random() + 1).toString(36).substring(7),
            },
          ],
        );
      },
      onSettled: () => queryClient.invalidateQueries({ queryKey: ["ebarimt"] }),
    });
  }

  function useGetUsers() {
    return useQuery({
      queryKey: ["ebarimt", searchTerm, fetchAll],
      queryFn: async () => {
        try {
          let promoQuery;
          if (fetchAll) {
            promoQuery = ref(db, EBARIMT_PATH);
          } else if (searchTerm.length === 8) {
            promoQuery = query(
              ref(db, EBARIMT_PATH),
              orderByChild("MemberId"),
              equalTo(Number(searchTerm)),
            );
          } else {
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
      enabled: fetchAll || Boolean(searchTerm),
      refetchOnWindowFocus: true,
    });
  }

  function useUpdateUser() {
    return useMutation({
      mutationFn: async (values) => {
        const updatedData = {
          "272Code": Number(values["272Code"]) || 0,
          Check: !!values.Check,
          Description: values.Description ?? "",
          MemberId: Number(values.MemberId),
          OldEbarimt: Number(values.OldEbarimt) || 0,
          QuantityName: values.QuantityName ?? "",
          TimeStamp: values.TimeStamp
            ? new Date(values.TimeStamp).toISOString()
            : new Date().toISOString(),
          ebarimtCode: Number(values.ebarimtCode) || 0,
          totalAmount: Number(values.totalAmount) || 0,
        };
        await update(ref(db, `${EBARIMT_PATH}/${values.id}`), updatedData);
        return Promise.resolve();
      },
      onMutate: (newUserInfo) => {
        queryClient.setQueryData(
          ["ebarimt", searchTerm, fetchAll],
          (prevUsers) =>
            prevUsers?.map((prevUser) =>
              prevUser.id === newUserInfo.id ? newUserInfo : prevUser,
            ),
        );
      },
      onSettled: () => queryClient.invalidateQueries({ queryKey: ["ebarimt"] }),
    });
  }

  function useDeleteUser() {
    return useMutation({
      mutationFn: async (userId) => {
        await remove(ref(db, `${EBARIMT_PATH}/${userId}`));
        return Promise.resolve();
      },
      onMutate: async (userId) => {
        await queryClient.cancelQueries({ queryKey: ["ebarimt"] });
        const previousData = queryClient.getQueriesData({
          queryKey: ["ebarimt"],
        });
        queryClient.setQueriesData({ queryKey: ["ebarimt"] }, (oldData) =>
          oldData?.filter((user) => user.id !== userId),
        );
        return { previousData };
      },
      onError: (err, userId, context) => {
        if (context?.previousData) {
          context.previousData.forEach(([queryKey, data]) => {
            queryClient.setQueryData(queryKey, data);
          });
        }
      },
      onSettled: () => queryClient.invalidateQueries({ queryKey: ["ebarimt"] }),
    });
  }

  const { mutateAsync: createUser, isPending: isCreatingUser } =
    useCreateUser();
  const {
    data: fetchedUsers = [],
    isError: isLoadingUsersError,
    isFetching: isFetchingUsers,
    isLoading: isLoadingUsers,
  } = useGetUsers();
  const { mutateAsync: updateUser, isPending: isUpdatingUser } =
    useUpdateUser();
  const { mutateAsync: deleteUser, isPending: isDeletingUser } =
    useDeleteUser();

  const handleCreateUser = async ({ values, table }) => {
    await createUser(values);
    table.setCreatingRow(null);
  };

  const handleSaveUser = async ({ values, table }) => {
    await updateUser(values);
    table.setEditingRow(null);
  };

  const openDeleteConfirmModal = (row) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUser(row.original.id);
    }
  };

  const handleExportData = () => {
    const cleaned = fetchedUsers.map((item) => {
      const newItem = {
        ...item,
        TimeStamp: item.TimeStamp
          ? dayjs(item.TimeStamp).format("YYYY-MM-DD HH:mm:ss")
          : "",
      };
      delete newItem.id;
      return newItem;
    });
    const csv = generateCsv(csvConfig)(cleaned);
    download(csvConfig)(csv);
  };

  // 🔹 Dark горимд хүснэгтийн бүх element-ийн өнгө
  const darkColors = {
    paper: "#1e1e1e",
    head: "#141414",
    headText: "#ffffff",
    rowEven: "#1e1e1e",
    rowOdd: "#232323",
    rowHover: "#2e2e2e",
    text: "#eaeaea",
    divider: "rgba(255,255,255,0.12)",
    toolbar: "#1e1e1e",
    pagination: "#1e1e1e",
  };

  const table = useMaterialReactTable({
    columns,
    data: fetchedUsers,
    createDisplayMode: "modal",
    editDisplayMode: "modal",
    enableEditing: true,
    getRowId: (row) => row.id,
    muiToolbarAlertBannerProps: isLoadingUsersError
      ? { color: "error", children: "Error loading data" }
      : undefined,

    // 🔹 Хүснэгтийн цаас (background)
    muiTablePaperProps: {
      sx: {
        backgroundColor: isDark ? darkColors.paper : undefined,
        backgroundImage: "none",
        color: isDark ? darkColors.text : undefined,
      },
    },

    // 🔹 Хүснэгтийн container
    muiTableContainerProps: {
      sx: {
        minHeight: "500px",
        backgroundColor: isDark ? darkColors.paper : undefined,
      },
    },

    // 🔹 Толгойн мөр
    muiTableHeadCellProps: {
      sx: {
        backgroundColor: isDark ? darkColors.head : undefined,
        color: isDark ? darkColors.headText : undefined,
        borderBottom: isDark ? `1px solid ${darkColors.divider}` : undefined,
        "& .MuiTableSortLabel-root": {
          color: isDark ? darkColors.headText : undefined,
        },
        "& .MuiTableSortLabel-root:hover": {
          color: isDark ? "#90caf9" : undefined,
        },
        "& .MuiSvgIcon-root": {
          color: isDark ? darkColors.headText : undefined,
        },
      },
    },

    // 🔹 Биеийн мөр
    muiTableBodyRowProps: {
      sx: {
        backgroundColor: isDark ? darkColors.rowEven : undefined,
        "&:nth-of-type(odd)": {
          backgroundColor: isDark ? darkColors.rowOdd : undefined,
        },
        "&:hover": {
          backgroundColor: isDark
            ? `${darkColors.rowHover} !important`
            : undefined,
        },
        "& td": {
          color: isDark ? darkColors.text : undefined,
          borderBottom: isDark ? `1px solid ${darkColors.divider}` : undefined,
        },
      },
    },

    // 🔹 Footer (pagination)
    muiBottomToolbarProps: {
      sx: {
        backgroundColor: isDark ? darkColors.toolbar : undefined,
        color: isDark ? darkColors.text : undefined,
        borderTop: isDark ? `1px solid ${darkColors.divider}` : undefined,
      },
    },

    // 🔹 Дээд toolbar (хайлт, татах гэх мэт)
    muiTopToolbarProps: {
      sx: {
        backgroundColor: isDark ? darkColors.toolbar : undefined,
        color: isDark ? darkColors.text : undefined,
      },
    },

    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateUser,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveUser,
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">Ебаримт нэмэх</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          {internalEditComponents}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">Ебаримт засах</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {internalEditComponents}
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
          onClick={handleExportData}
        >
          Татаж авах
        </Button>
      </Box>
    ),
    initialState: {
      columnVisibility: {
        id: false,
        totalAmount: false,
        OldEbarimt: false,
        "272Amount": false,
      },
    },
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
          }}
          variant="filled"
          size="small"
        />
        <Button
          variant="outlined"
          onClick={() => {
            setFetchAll(true);
            setSearchTerm("");
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

const BlackEBarimtDelivery = () => {
  const globalTheme = useTheme();
  const isDark = globalTheme.palette.mode === "dark";

  const tableTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: globalTheme.palette.mode,
          primary: {
            main: isDark ? "#90caf9" : globalTheme.palette.primary.main,
          },
          secondary: globalTheme.palette.secondary,
          info: { main: "rgb(255,122,0)" },
          background: {
            default: isDark ? "#0b0b0b" : "rgb(254,255,244)",
            paper: isDark ? "#1e1e1e" : "#ffffff",
          },
          text: {
            primary: isDark ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.87)",
            secondary: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
          },
          divider: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
        },
        typography: {
          button: { textTransform: "none", fontSize: "1.2rem" },
        },
        components: {
          MuiTooltip: {
            styleOverrides: { tooltip: { fontSize: "1.1rem" } },
          },
          MuiSwitch: {
            styleOverrides: { thumb: { color: "pink" } },
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                backgroundImage: "none",
                backgroundColor: isDark ? "#1e1e1e" : "#fff",
              },
            },
          },
        },
      }),
    [globalTheme, isDark],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <CssBaseline />
      <Typography color="inherit" variant="h4" sx={{ mb: 2 }}>
        Е Баримт
      </Typography>
      <ThemeProvider theme={tableTheme}>
        <Example />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default BlackEBarimtDelivery;
