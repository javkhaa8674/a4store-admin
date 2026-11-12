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
  Typography,
  useColorScheme,
  ThemeProvider,
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
import { mkConfig, generateCsv, download } from "export-to-csv";
import { db } from "refrence/realConfig";
import dayjs from "dayjs";
import { RiFileExcel2Fill } from "react-icons/ri";
import { useTableTheme } from "../../../../theme/useTableTheme";

// ---------- Firebase зам ----------
const PRODUCT_PATH = "BlackMembers/ProductDelivery";

const csvConfig = mkConfig({
  filename: `Бүтээгдэхүүн-Олголт-${dayjs().format("YYYY-MM-DD HH:mm:ss")}`,
  fieldSeparator: ",",
  decimalSeparator: ".",
  columnHeaders: [
    { key: "MemberId", displayLabel: "Утас" },
    { key: "QuantityName", displayLabel: "Нэр" },
    { key: "ProductName", displayLabel: "Бүтээгдэхүүний нэр" },
    { key: "272Code", displayLabel: "272 Code" },
    { key: "OldCode", displayLabel: "Old Code" },
    { key: "ProductReceivedCode", displayLabel: "Product Received Code" },
    { key: "totalCode", displayLabel: "Total Code" },
    { key: "Check", displayLabel: "Check" },
    { key: "HospitalTimeStamp", displayLabel: "Hospital TimeStamp" },
    { key: "ReceivedDate", displayLabel: "Хүлээн авсан огноо" },
    { key: "Description", displayLabel: "Тайлбар" },
  ],
});

const Example = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [fetchAll, setFetchAll] = useState(false);

  // 🔹 Dark горим
  const { mode } = useColorScheme();
  const isDark = mode === "dark";

  // ---------- Columns ----------
  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "id", enableEditing: false, size: 80 },
      {
        accessorKey: "MemberId",
        header: "Утас",
        size: 100,
        enableClickToCopy: true,
        muiEditTextFieldProps: { type: "number" },
      },
      { accessorKey: "QuantityName", header: "Нэр" },
      {
        accessorKey: "ProductName",
        header: "Бүтээгдэхүүний нэр",
        muiEditTextFieldProps: { type: "text" },
      },
      {
        accessorKey: "272Code",
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
        accessorKey: "OldCode",
        header: "Old Code",
        size: 90,
        muiEditTextFieldProps: { type: "number" },
      },
      {
        accessorKey: "ProductReceivedCode",
        header: "Тоо хэмжээ",
        size: 130,
        muiEditTextFieldProps: { type: "number" },
      },
      {
        accessorKey: "totalCode",
        header: "Нийт кодны тоо",
        size: 90,
        muiEditTextFieldProps: { type: "number" },
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
        accessorKey: "HospitalTimeStamp",
        header: "Hospital TimeStamp",
        size: 100,
        muiEditTextFieldProps: { type: "text" },
      },
      {
        accessorKey: "ReceivedDate",
        header: "Хүлээн авсан огноо",
        size: 150,
        Cell: ({ cell }) => {
          const v = cell.getValue();
          if (!v) return "—";
          return dayjs(v).format("YYYY-MM-DD HH:mm:ss");
        },
      },
      { accessorKey: "Description", header: "Тайлбар" },
    ],
    [],
  );

  // ---------- CREATE ----------
  function useCreateUser() {
    return useMutation({
      mutationFn: async (values) => {
        const newData = {
          "272Code": Number(values["272Code"]) || 0,
          Check: !!values.Check,
          Description: values.Description ?? "",
          HospitalTimeStamp: Number(values.HospitalTimeStamp) || 0,
          MemberId: Number(values.MemberId),
          OldCode: Number(values.OldCode) || 0,
          ProductName: values.ProductName ?? "",
          ProductReceivedCode: Number(values.ProductReceivedCode) || 0,
          QuantityName: values.QuantityName ?? "",
          ReceivedDate: values.ReceivedDate
            ? new Date(values.ReceivedDate).toISOString()
            : new Date().toISOString(),
          totalCode: Number(values.totalCode) || 0,
        };
        await push(ref(db, PRODUCT_PATH), newData);
        return Promise.resolve();
      },
      onMutate: (newUserInfo) => {
        queryClient.setQueryData(
          ["productdelivery", searchTerm, fetchAll],
          (prevUsers) => [
            ...(prevUsers || []),
            {
              ...newUserInfo,
              id: (Math.random() + 1).toString(36).substring(7),
            },
          ],
        );
      },
      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: ["productdelivery"] }),
    });
  }

  // ---------- READ ----------
  function useGetUsers() {
    return useQuery({
      queryKey: ["productdelivery", searchTerm, fetchAll],
      queryFn: async () => {
        try {
          let promoQuery;
          if (fetchAll) {
            promoQuery = ref(db, PRODUCT_PATH);
          } else if (searchTerm.length === 8) {
            promoQuery = query(
              ref(db, PRODUCT_PATH),
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

  // ---------- UPDATE ----------
  function useUpdateUser() {
    return useMutation({
      mutationFn: async (values) => {
        if (!values?.id) {
          throw new Error("id байхгүй — update хийх боломжгүй");
        }
        const updatedData = {
          "272Code": Number(values["272Code"]) || 0,
          Check:
            values.Check === true ||
            values.Check === "true" ||
            values.Check === 1,
          Description: values.Description ?? "",
          HospitalTimeStamp: Number(values.HospitalTimeStamp) || 0,
          MemberId: Number(values.MemberId),
          OldCode: Number(values.OldCode) || 0,
          ProductName: values.ProductName ?? "",
          ProductReceivedCode: Number(values.ProductReceivedCode) || 0,
          QuantityName: values.QuantityName ?? "",
          ReceivedDate: values.ReceivedDate
            ? dayjs(values.ReceivedDate).isValid()
              ? dayjs(values.ReceivedDate).toISOString()
              : new Date().toISOString()
            : new Date().toISOString(),
          totalCode: Number(values.totalCode) || 0,
        };
        await update(ref(db, `${PRODUCT_PATH}/${values.id}`), updatedData);
        return Promise.resolve();
      },

      // 🔹 Бүх productdelivery query-д optimistic update
      onMutate: (newUserInfo) => {
        queryClient.setQueriesData(
          { queryKey: ["productdelivery"] },
          (prevUsers) =>
            prevUsers?.map((prevUser) =>
              prevUser.id === newUserInfo.id ? newUserInfo : prevUser,
            ),
        );
      },

      // 🔹 refetch — бүх query
      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: ["productdelivery"] }),
    });
  }

  // ---------- DELETE ----------
  function useDeleteUser() {
    return useMutation({
      mutationFn: async (userId) => {
        await remove(ref(db, `${PRODUCT_PATH}/${userId}`));
        return Promise.resolve();
      },
      onMutate: async (userId) => {
        await queryClient.cancelQueries({ queryKey: ["productdelivery"] });
        const previousData = queryClient.getQueriesData({
          queryKey: ["productdelivery"],
        });
        queryClient.setQueriesData(
          { queryKey: ["productdelivery"] },
          (oldData) => oldData?.filter((user) => user.id !== userId),
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
      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: ["productdelivery"] }),
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

  // 🔹 id-аар давхардлыг арилгах
  const dedupedUsers = useMemo(() => {
    const map = new Map();
    for (const u of fetchedUsers) {
      map.set(u.id, u);
    }
    return Array.from(map.values());
  }, [fetchedUsers]);

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

  // ---------- CSV Export ----------
  const handleExportData = () => {
    const cleaned = dedupedUsers.map((item) => {
      const newItem = {
        ...item,
        ReceivedDate: item.ReceivedDate
          ? dayjs(item.ReceivedDate).format("YYYY-MM-DD HH:mm:ss")
          : "",
      };
      delete newItem.id;
      return newItem;
    });
    const csv = generateCsv(csvConfig)(cleaned);
    download(csvConfig)(csv);
  };

  // 🔹 Dark горимд хүснэгтийн өнгө
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
  };

  const table = useMaterialReactTable({
    columns,
    data: dedupedUsers,
    createDisplayMode: "modal",
    editDisplayMode: "modal",
    enableEditing: true,
    getRowId: (row) => row.id,
    muiToolbarAlertBannerProps: isLoadingUsersError
      ? { color: "error", children: "Error loading data" }
      : undefined,

    // 🔹 Хүснэгтийн цаас
    muiTablePaperProps: {
      sx: {
        backgroundColor: isDark ? darkColors.paper : undefined,
        backgroundImage: "none",
        color: isDark ? darkColors.text : undefined,
      },
    },
    muiTableContainerProps: {
      sx: {
        minHeight: "500px",
        backgroundColor: isDark ? darkColors.paper : undefined,
      },
    },
    // 🔹 Толгой
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
    // 🔹 Мөр
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
    // 🔹 Toolbar
    muiTopToolbarProps: {
      sx: {
        backgroundColor: isDark ? darkColors.toolbar : undefined,
        color: isDark ? darkColors.text : undefined,
      },
    },
    muiBottomToolbarProps: {
      sx: {
        backgroundColor: isDark ? darkColors.toolbar : undefined,
        color: isDark ? darkColors.text : undefined,
        borderTop: isDark ? `1px solid ${darkColors.divider}` : undefined,
      },
    },

    onCreatingRowSave: handleCreateUser,
    onEditingRowSave: handleSaveUser,
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">Бүтээгдэхүүн олголт нэмэх</DialogTitle>
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
        <DialogTitle variant="h3">Бүтээгдэхүүн олголт засварлах</DialogTitle>
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
        totalCode: false,
        OldCode: false,
        HospitalTimeStamp: false,
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

const BlackProductDelivery = () => {
  const tableTheme = useTableTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <CssBaseline />
      <Typography color="inherit" variant="h4" sx={{ mb: 2 }}>
        Блэк Бүтээгдэхүүн олголт
      </Typography>
      <ThemeProvider theme={tableTheme}>
        <Example />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default BlackProductDelivery;
