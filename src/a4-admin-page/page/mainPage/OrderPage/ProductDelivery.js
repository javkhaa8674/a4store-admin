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
  useTheme,
  ThemeProvider,
  createTheme,
  TextField,
  CssBaseline,
  Checkbox,
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
import AddIcon from "@mui/icons-material/Add";
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

// ---------- Firebase замууд ----------
const RESET_PATH = "productdelivery";
const BLACK_PATH = "BlackMembers/ProductDelivery";

// ---------- CSV config (нэгтгэсэн) ----------
const csvConfig = mkConfig({
  filename: `Бүтээгдэхүүн-Олголт-${dayjs().format("YYYY-MM-DD HH:mm:ss")}`,
  fieldSeparator: ",",
  decimalSeparator: ".",
  columnHeaders: [
    { key: "phase", displayLabel: "Phase" },
    { key: "MemberId", displayLabel: "Утас" },
    { key: "QuantityName", displayLabel: "Нэр" },
    { key: "ProductName", displayLabel: "Бүтээгдэхүүний нэр" },
    { key: "ProductReceivedCode", displayLabel: "Тоо хэмжээ" },
    { key: "ReceivedDate", displayLabel: "Огноо" },
    { key: "Description", displayLabel: "Тайлбар" },
    { key: "272Code", displayLabel: "272-н эрх" },
    { key: "OldCode", displayLabel: "Үлдсэн код" },
    { key: "totalCode", displayLabel: "Total Code" },
    { key: "Check", displayLabel: "Тулгалт" },
    { key: "HospitalTimeStamp", displayLabel: "Эмнэлэг огноо" },
    { key: "Requester_TimeStamps", displayLabel: "Хүсэлт гаргасан огноо" },
  ],
});

const Example = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [fetchAll, setFetchAll] = useState(false);

  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // ---------- Fetch: хоёр замаас зэрэг татаж нэгтгэнэ ----------
  function useGetUsers() {
    return useQuery({
      queryKey: ["combinedProductDelivery", searchTerm, fetchAll],
      queryFn: async () => {
        try {
          const fetchFrom = async (path, phase, sourceKey) => {
            let promoQuery;
            if (fetchAll) {
              promoQuery = ref(db, path);
            } else if (searchTerm.length === 8) {
              const childKey = phase === "black" ? "MemberId" : "ID";
              promoQuery = query(
                ref(db, path),
                orderByChild(childKey),
                equalTo(phase === "black" ? Number(searchTerm) : searchTerm),
              );
            } else {
              return [];
            }
            const snapshot = await get(promoQuery);
            if (!snapshot.exists()) return [];
            return Object.entries(snapshot.val()).map(([id, user]) => {
              if (phase === "black") {
                return {
                  id,
                  phase: "black",
                  _source: sourceKey,
                  MemberId: user.MemberId,
                  QuantityName: user.QuantityName,
                  ProductName: user.ProductName,
                  ProductReceivedCode: user.ProductReceivedCode,
                  ReceivedDate: user.ReceivedDate,
                  Description: user.Description,
                  "272Code": user["272Code"],
                  OldCode: user.OldCode,
                  totalCode: user.totalCode,
                  Check: user.Check,
                  HospitalTimeStamp: user.HospitalTimeStamp,
                  Requester_TimeStamps: undefined,
                };
              } else {
                return {
                  id,
                  phase: "reset",
                  _source: sourceKey,
                  MemberId: user.ID,
                  QuantityName: user.Name,
                  ProductName: user.ProductName,
                  ProductReceivedCode: user.Count,
                  ReceivedDate: user.TimeStamps,
                  Description: user.Description,
                  "272Code": undefined,
                  OldCode: undefined,
                  totalCode: undefined,
                  Check: undefined,
                  HospitalTimeStamp: undefined,
                  Requester_TimeStamps: user.Requester_TimeStamps,
                };
              }
            });
          };

          if (!fetchAll && searchTerm.length !== 8) return [];

          const [resetUsers, blackUsers] = await Promise.all([
            fetchFrom(RESET_PATH, "reset", "reset"),
            fetchFrom(BLACK_PATH, "black", "black"),
          ]);

          // 🔹 ReceivedDate-ээр буурах дарааллаар эрэмбэлэх
          const combined = [...resetUsers, ...blackUsers];

          combined.sort((a, b) => {
            const ta = a.ReceivedDate ? dayjs(a.ReceivedDate).valueOf() : 0;
            const tb = b.ReceivedDate ? dayjs(b.ReceivedDate).valueOf() : 0;
            if (isNaN(ta) && isNaN(tb)) return 0;
            if (isNaN(ta)) return 1;
            if (isNaN(tb)) return -1;
            return tb - ta;
          });

          return combined;
        } catch (error) {
          console.error("Error fetching users:", error);
          throw new Error("Failed to fetch users");
        }
      },
      enabled: fetchAll || Boolean(searchTerm),
      refetchOnWindowFocus: true,
    });
  }

  const {
    data: fetchedUsers = [],
    isError: isLoadingUsersError,
    isFetching: isFetchingUsers,
    isLoading: isLoadingUsers,
  } = useGetUsers();

  const dedupedUsers = useMemo(() => {
    const map = new Map();
    for (const u of fetchedUsers) {
      map.set(u.id, u);
    }
    return Array.from(map.values());
  }, [fetchedUsers]);

  // ---------- Columns ----------
  const columns = useMemo(
    () => [
      // 🔹 id багана — enableHiding: true (initialState-аар нуугдана)
      {
        accessorKey: "id",
        header: "id",
        enableEditing: false,
        Edit: () => null,
        size: 80,
        enableHiding: true,
      },

      // 🔹 phase
      {
        accessorKey: "phase",
        header: "Phase",
        size: 120,
        editVariant: "select",
        editSelectOptions: ["reset", "black"],
        muiEditTextFieldProps: {
          select: true,
          required: true,
          defaultValue: "reset",
        },
        Cell: ({ cell }) => {
          const v = cell.getValue();
          if (v === "black") return "black";
          if (v === "reset") return "reset";
          return "—";
        },
      },

      // ===== Ижил утгатай нэгтгэсэн баганууд =====
      {
        accessorKey: "MemberId",
        header: "Утас",
        size: 100,
        enableClickToCopy: true,
        muiEditTextFieldProps: { required: true },
      },
      {
        accessorKey: "QuantityName",
        header: "Нэр",
        muiEditTextFieldProps: { required: true, type: "text" },
      },
      {
        accessorKey: "ProductName",
        header: "Бүтээгдэхүүний нэр",
        muiEditTextFieldProps: { type: "text" },
      },
      {
        accessorKey: "ProductReceivedCode",
        header: "Тоо хэмжээ",
        size: 120,
        muiEditTextFieldProps: { type: "number" },
      },
      {
        accessorKey: "ReceivedDate",
        header: "Огноо",
        size: 150,
        muiEditTextFieldProps: {
          type: "datetime-local",
          InputLabelProps: { shrink: true },
        },

        Cell: ({ cell }) => {
          const v = cell.getValue();
          if (!v) return "—";
          const d = dayjs(v);
          return d.isValid() ? d.format("YYYY-MM-DD HH:mm:ss") : "—";
        },
      },
      { accessorKey: "Description", header: "Тайлбар" },

      // ===== Зөвхөн Black-д байдаг баганууд =====
      {
        accessorKey: "272Code",
        header: "Эхний 272 хүн эсэх",
        size: 100,
        muiEditTextFieldProps: { type: "number" },
        Cell: ({ cell }) => {
          const v = cell.getValue();
          if (v === undefined || v === null || v === "") return "—";
          return Number(v) === 1 ? "Тийм" : "Үгүй";
        },
      },
      {
        accessorKey: "OldCode",
        header: "Үлдсэн код",
        size: 90,
        muiEditTextFieldProps: { type: "number" },
      },
      {
        accessorKey: "totalCode",
        header: "Нийт кодны тоо",
        size: 100,
        muiEditTextFieldProps: { type: "number" },
      },

      // 🔹 Check багана — ЗӨВХӨН CHECKBOX UI
      {
        accessorKey: "Check",
        header: "Тулгасан эсэх",
        size: 80,
        // засварлах боломжтой checkbox
        muiEditTextFieldProps: {
          type: "checkbox",
        },
        // харуулах хэсэг — checkbox
        Cell: ({ cell }) => {
          const v = cell.getValue();
          const checked = v === true || v === 1 || v === "true";
          return <Checkbox checked={checked} size="small" sx={{ p: 0 }} />;
        },
      },

      {
        accessorKey: "HospitalTimeStamp",
        header: "Эмнэлэг огноо",
        size: 120,
        muiEditTextFieldProps: { type: "text" },
      },

      // ===== Зөвхөн reset-д байдаг багана =====
      {
        accessorKey: "Requester_TimeStamps",
        header: "Хүсэлт гаргасан огноо",
        size: 150,
        muiEditTextFieldProps: {
          type: "datetime-local",
          InputLabelProps: { shrink: true },
        },
        Cell: ({ cell }) => {
          const v = cell.getValue();
          if (!v) return "—";
          const d = dayjs(v);
          return d.isValid() ? d.format("YYYY-MM-DD HH:mm:ss") : "—";
        },
      },
    ],
    [],
  );

  // ---------- CREATE ----------
  function useCreateUser() {
    return useMutation({
      mutationFn: async (values) => {
        const isBlack = values.phase === "black" || values._source === "black";
        const path = isBlack ? BLACK_PATH : RESET_PATH;
        const { _source, phase, ...rest } = values;

        let data;
        if (isBlack) {
          data = {
            "272Code": Number(rest["272Code"]) || 0,
            Check:
              rest.Check === true || rest.Check === "true" || rest.Check === 1,
            Description: rest.Description ?? "",
            HospitalTimeStamp: Number(rest.HospitalTimeStamp) || 0,
            MemberId: Number(rest.MemberId),
            OldCode: Number(rest.OldCode) || 0,
            ProductName: rest.ProductName ?? "",
            ProductReceivedCode: Number(rest.ProductReceivedCode) || 0,
            QuantityName: rest.QuantityName ?? "",
            ReceivedDate: rest.ReceivedDate
              ? dayjs(rest.ReceivedDate).isValid()
                ? dayjs(rest.ReceivedDate).toISOString()
                : new Date().toISOString()
              : new Date().toISOString(),
            totalCode: Number(rest.totalCode) || 0,
          };
        } else {
          data = {
            ID: String(rest.MemberId ?? ""),
            Name: rest.QuantityName ?? "",
            ProductName: rest.ProductName ?? "",
            Count: Number(rest.ProductReceivedCode) || 0,
            TimeStamps: rest.ReceivedDate
              ? dayjs(rest.ReceivedDate).isValid()
                ? dayjs(rest.ReceivedDate).toISOString()
                : new Date().toISOString()
              : new Date().toISOString(),
            Requester_TimeStamps: rest.Requester_TimeStamps
              ? dayjs(rest.Requester_TimeStamps).isValid()
                ? dayjs(rest.Requester_TimeStamps).toISOString()
                : new Date().toISOString()
              : new Date().toISOString(),
            Description: rest.Description ?? "",
          };
        }

        const newRef = await push(ref(db, path), data);
        return {
          ...values,
          id: newRef.key,
          _source: isBlack ? "black" : "reset",
        };
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["combinedProductDelivery"],
        });
      },
    });
  }

  // ---------- UPDATE ----------
  function useUpdateUser() {
    return useMutation({
      mutationFn: async (values) => {
        if (!values?.id) {
          throw new Error("id байхгүй — update хийх боломжгүй");
        }
        const isBlack = values._source === "black" || values.phase === "black";
        const path = isBlack
          ? `${BLACK_PATH}/${values.id}`
          : `${RESET_PATH}/${values.id}`;

        let updatedData;
        if (isBlack) {
          updatedData = {
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
        } else {
          updatedData = {
            ID: String(values.MemberId ?? ""),
            Name: values.QuantityName ?? "",
            ProductName: values.ProductName ?? "",
            Count: Number(values.ProductReceivedCode) || 0,
            TimeStamps: values.ReceivedDate
              ? dayjs(values.ReceivedDate).isValid()
                ? dayjs(values.ReceivedDate).toISOString()
                : new Date().toISOString()
              : new Date().toISOString(),
            Requester_TimeStamps: values.Requester_TimeStamps
              ? dayjs(values.Requester_TimeStamps).isValid()
                ? dayjs(values.Requester_TimeStamps).toISOString()
                : new Date().toISOString()
              : new Date().toISOString(),
            Description: values.Description ?? "",
          };
        }

        await update(ref(db, path), updatedData);
        return Promise.resolve();
      },
      onMutate: (newUserInfo) => {
        queryClient.setQueriesData(
          { queryKey: ["combinedProductDelivery"] },
          (prevUsers) =>
            prevUsers?.map((prevUser) =>
              prevUser.id === newUserInfo.id ? newUserInfo : prevUser,
            ),
        );
      },
      onSettled: () =>
        queryClient.invalidateQueries({
          queryKey: ["combinedProductDelivery"],
        }),
    });
  }

  // ---------- DELETE ----------
  function useDeleteUser() {
    return useMutation({
      mutationFn: async (user) => {
        const path =
          user._source === "black"
            ? `${BLACK_PATH}/${user.id}`
            : `${RESET_PATH}/${user.id}`;
        await remove(ref(db, path));
        return Promise.resolve();
      },
      onMutate: async (user) => {
        await queryClient.cancelQueries({
          queryKey: ["combinedProductDelivery"],
        });
        const previousData = queryClient.getQueriesData({
          queryKey: ["combinedProductDelivery"],
        });
        queryClient.setQueriesData(
          { queryKey: ["combinedProductDelivery"] },
          (oldData) => oldData?.filter((u) => u.id !== user.id),
        );
        return { previousData };
      },
      onError: (err, user, context) => {
        if (context?.previousData) {
          context.previousData.forEach(([queryKey, data]) => {
            queryClient.setQueryData(queryKey, data);
          });
        }
      },
      onSettled: () =>
        queryClient.invalidateQueries({
          queryKey: ["combinedProductDelivery"],
        }),
    });
  }

  const { mutateAsync: createUser, isPending: isCreatingUser } =
    useCreateUser();
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
    if (window.confirm("Та энэ мэдээллийг устгахдаа итгэлтэй байна уу?")) {
      deleteUser(row.original);
    }
  };

  // ---------- CSV Export ----------
  const handleExportData = () => {
    const cleaned = dedupedUsers.map((item) => {
      const newItem = {
        ...item,
        Check:
          item.Check === true || item.Check === 1 || item.Check === "true"
            ? "Тийм"
            : "Үгүй",
        ReceivedDate: item.ReceivedDate
          ? dayjs(item.ReceivedDate).isValid()
            ? dayjs(item.ReceivedDate).format("YYYY-MM-DD HH:mm:ss")
            : ""
          : "",
        Requester_TimeStamps: item.Requester_TimeStamps
          ? dayjs(item.Requester_TimeStamps).isValid()
            ? dayjs(item.Requester_TimeStamps).format("YYYY-MM-DD HH:mm:ss")
            : ""
          : "",
      };
      delete newItem.id;
      delete newItem._source;
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
    enableRowActions: true,
    enableCreateRow: true,
    getRowId: (row) => row.id,
    muiToolbarAlertBannerProps: isLoadingUsersError
      ? { color: "error", children: "Error loading data" }
      : undefined,

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
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => table.setCreatingRow(true)}
        >
          Нэмэх
        </Button>
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
        id: false, // 🔹 id багана харагдахгүй
        "272Code": false,
        OldCode: false,
        totalCode: false,
        HospitalTimeStamp: false,
        _source: false,
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

const CombinedProductDelivery = () => {
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
        Бүтээгдэхүүн олголт
      </Typography>
      <ThemeProvider theme={tableTheme}>
        <Example />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default CombinedProductDelivery;
