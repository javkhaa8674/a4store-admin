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
  useColorScheme,
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
import { db } from "refrence/realConfig";

// ---------- Black мөрүүдэд автоматаар оноох утгууд ----------
const BLACK_DEFAULT_PRODUCT = "Скийнбүүстер";
const BLACK_DEFAULT_AMOUNT = 1500000;

// ---------- CSV config (бүх баганатай) ----------
const csvConfig = mkConfig({
  filename: `Худалдан Авалт-${dayjs().format("YYYY-MM-DD HH:mm:ss")}`,
  fieldSeparator: ",",
  decimalSeparator: ".",
  columnHeaders: [
    { key: "phase", displayLabel: "Phase" },
    { key: "MemberId", displayLabel: "Утас" },
    { key: "QuantityName", displayLabel: "Нэр" },
    { key: "timeStamp", displayLabel: "Огноо" },
    { key: "ProductName", displayLabel: "Бүтээгдэхүүн сонголт" },
    { key: "Level", displayLabel: "Шат" },
    { key: "RankName", displayLabel: "Цол" },
    { key: "InviterPercent", displayLabel: "Уригчид олгох хувь" },
    { key: "SponsorId", displayLabel: "Спонсор Id" },
    { key: "SponsorName", displayLabel: "Спонсорын нэр" },
    { key: "amount", displayLabel: "Мөнгөн дүн" },
    { key: "InviterId", displayLabel: "Уригчийн Id" },
    { key: "InviterName", displayLabel: "Уригчийн нэр" },
    { key: "accNumber", displayLabel: "Дансны дугаар" },
    { key: "accName", displayLabel: "Банкны нэр" },
    { key: "System", displayLabel: "Шилжсэн" },
    { key: "isBlackMember", displayLabel: "BlackVIP" },
  ],
});

function validateUser() {
  return {};
}

// ---------- helpers ----------
const exportToExcel = (data) => {
  const cleaned = data.map((item) => {
    const newItem = { ...item };
    delete newItem.id;
    delete newItem._source;
    return newItem;
  });
  const csv = generateCsv(csvConfig)(cleaned);
  download(csvConfig)(csv);
};

const renderValidationErrors = (errors) =>
  Object.entries(errors).map(([key, message]) =>
    message ? (
      <Typography color="error" key={key}>
        {message}
      </Typography>
    ) : null,
  );

// ============================================================
//  Combined table (phase = reset | black)
// ============================================================
const Example = () => {
  const queryClient = useQueryClient();
  const [validationErrors, setValidationErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [fetchAll, setFetchAll] = useState(false);

  // --- Fetch: хоёр эх сурвалжаас зэрэг татаж нэгтгэнэ ---
  const useGetUsers = () =>
    useQuery({
      queryKey: ["combinedUsers", searchTerm, fetchAll],
      queryFn: async () => {
        try {
          const fetchFrom = async (path, phase, sourceKey) => {
            let promoQuery;
            if (fetchAll) {
              promoQuery = ref(db, path);
            } else if (searchTerm.length === 8) {
              promoQuery = query(
                ref(db, path),
                orderByChild("MemberId"),
                equalTo(Number(searchTerm)),
              );
            } else {
              return [];
            }
            const snapshot = await get(promoQuery);
            if (!snapshot.exists()) return [];
            return Object.entries(snapshot.val()).map(([id, user]) => {
              // 🔹 Black эх сурвалжийн мөрүүдэд автомат утга оноох
              const isBlack = phase === "black";
              return {
                id,
                ...user,
                // auto-fill: ProductName, amount (зөвхөн black)
                ...(isBlack
                  ? {
                      ProductName: user.ProductName ?? BLACK_DEFAULT_PRODUCT,
                      amount: user.amount ?? BLACK_DEFAULT_AMOUNT,
                    }
                  : {}),
                phase,
                _source: sourceKey,
              };
            });
          };

          if (!fetchAll && searchTerm.length !== 8) return [];

          const [resetUsers, blackUsers] = await Promise.all([
            fetchFrom("userInfo", "reset", "purchase"),
            fetchFrom("BlackMembers/VipUserInfo", "black", "black"),
          ]);

          return [...resetUsers, ...blackUsers].reverse();
        } catch (error) {
          console.error("Error fetching users:", error);
          throw new Error("Failed to fetch users");
        }
      },
      enabled: fetchAll || Boolean(searchTerm),
      refetchOnWindowFocus: true,
    });

  const { data: fetchedUsers = [], isError, isLoading } = useGetUsers();

  // --- CREATE ---
  const useCreateUser = () => {
    return useMutation({
      mutationFn: async (user) => {
        const isBlack = user.phase === "black" || user._source === "black";
        const path = isBlack ? "BlackMembers/VipUserInfo" : "userInfo";
        const { _source, ...rest } = user;

        // 🔹 Black бол phase, автомат утгуудыг баталгаажуулна
        const data = isBlack
          ? {
              ...rest,
              phase: "black",
              ProductName: rest.ProductName || BLACK_DEFAULT_PRODUCT,
              amount:
                rest.amount !== undefined && rest.amount !== ""
                  ? rest.amount
                  : BLACK_DEFAULT_AMOUNT,
            }
          : { ...rest, phase: "reset" };

        await set(ref(db, path).push(), data);
        return Promise.resolve();
      },
      onMutate: (newUserInfo) => {
        queryClient.setQueryData(
          ["combinedUsers", searchTerm, fetchAll],
          (prevUsers) => [
            ...(prevUsers || []),
            {
              ...newUserInfo,
              id: (Math.random() + 1).toString(36).substring(7),
            },
          ],
        );
      },
    });
  };

  // --- UPDATE ---
  const useUpdateUser = () => {
    return useMutation({
      mutationFn: async (user) => {
        const isBlack = user._source === "black" || user.phase === "black";
        const path = isBlack
          ? `BlackMembers/VipUserInfo/${user.id}`
          : `userInfo/${user.id}`;

        const updatedData = {
          ...user,
          MemberId: Number(user.MemberId),
          ...(isBlack
            ? {
                ProductName: user.ProductName || BLACK_DEFAULT_PRODUCT,
                amount:
                  user.amount !== undefined && user.amount !== ""
                    ? user.amount
                    : BLACK_DEFAULT_AMOUNT,
              }
            : {}),
        };

        const { _source, ...sendData } = Object.fromEntries(
          Object.entries(updatedData).filter(
            ([, value]) => value !== undefined,
          ),
        );
        await update(ref(db, path), sendData);
        return Promise.resolve();
      },
      onMutate: (newUserInfo) => {
        queryClient.setQueryData(
          ["combinedUsers", searchTerm, fetchAll],
          (prevUsers) =>
            prevUsers?.map((prevUser) =>
              prevUser.id === newUserInfo.id ? newUserInfo : prevUser,
            ),
        );
      },
      onSettled: () => queryClient.invalidateQueries(["combinedUsers"]),
    });
  };

  // --- DELETE ---
  const useDeleteUser = () => {
    return useMutation({
      mutationFn: async (user) => {
        const path =
          user._source === "black"
            ? `BlackMembers/VipUserInfo/${user.id}`
            : `userInfo/${user.id}`;
        await remove(ref(db, path));
        return Promise.resolve();
      },
      onMutate: (user) => {
        queryClient.setQueryData(
          ["combinedUsers", searchTerm, fetchAll],
          (prevUsers) => prevUsers?.filter((u) => u.id !== user.id),
        );
      },
      onSettled: () => queryClient.invalidateQueries(["combinedUsers"]),
    });
  };

  const { mutateAsync: createUser, isPending: isCreatingUser } =
    useCreateUser();
  const { mutateAsync: updateUser, isPending: isUpdatingUser } =
    useUpdateUser();
  const { mutateAsync: deleteUser, isPending: isDeletingUser } =
    useDeleteUser();

  const handleCreateUser = async ({ values, table }) => {
    if (!values) return;
    const newValidationErrors = validateUser(values);
    if (Object.values(newValidationErrors).some((e) => e)) {
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
    if (!values) return;
    const newValidationErrors = validateUser(values);
    if (Object.values(newValidationErrors).some((e) => e)) {
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
      deleteUser(row.original);
    }
  };

  // --- Columns (бүх багана; ижил талбарууд нэгтгэгдэнэ) ---
  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "id" },

      // 🔹 phase (ялгах багана)
      {
        accessorKey: "phase",
        header: "Phase",
        Cell: ({ cell }) => {
          const v = cell.getValue();
          return v === "black" ? "black" : v === "reset" ? "reset" : "—";
        },
      },

      // ===== Buy хуудасны баганууд =====
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
      { accessorKey: "timeStamp", header: "Бүртгүүлсэн огноо", size: 80 },
      {
        accessorKey: "ProductName",
        header: "Бүтээгдэхүүн сонголт",
        size: 80,
        // 🔹 black мөрүүдэд default утга харуулна
        Cell: ({ cell, row }) => {
          const v = cell.getValue();
          if (row.original.phase === "black" && !v) {
            return BLACK_DEFAULT_PRODUCT;
          }
          return v ?? "—";
        },
      },
      { accessorKey: "Level", header: "Шат" },
      {
        accessorKey: "InviterPercent",
        header: "Уригчид олгох хувь",
        Cell: ({ cell }) => cell.getValue() ?? "N/A",
      },
      { accessorKey: "RankName", header: "Зэрэглэлийн нэр", size: 80 },
      {
        accessorKey: "SponsorId",
        header: "Спонсор ID",
        muiEditTextFieldProps: { type: "number" },
      },
      { accessorKey: "SponsorName", header: "Спонсор нэр" },
      {
        accessorKey: "amount",
        header: "Мөнгөн дүн",
        // 🔹 black мөрүүдэд default утга харуулна
        Cell: ({ cell, row }) => {
          const v = cell.getValue();
          if (
            row.original.phase === "black" &&
            (v === undefined || v === null || v === "")
          ) {
            return BLACK_DEFAULT_AMOUNT.toLocaleString();
          }
          return v !== undefined && v !== null
            ? Number(v).toLocaleString()
            : "—";
        },
      },
      {
        accessorKey: "InviterId",
        header: "Урьсан хүн ID",
        muiEditTextFieldProps: { type: "number" },
      },
      { accessorKey: "InviterName", header: "Урьсан хүн нэр" },
      {
        accessorKey: "isBlackMember",
        header: "Black to Reset",
        Cell: ({ cell }) => {
          const v = cell.getValue();
          if (v === undefined || v === null) return "false";
          return v ? "true" : "false";
        },
      },

      // ===== BlackOrignalUserInfo хуудасны нэмэлт баганууд =====
      { accessorKey: "accName", header: "Банкны нэр" },
      {
        accessorKey: "accNumber",
        header: "Дансны дугаар",
        muiEditTextFieldProps: { type: "number" },
      },
      {
        accessorKey: "System",
        header: "Төрөл",
        Cell: ({ cell }) => {
          const v = cell.getValue();
          if (v === undefined || v === null) return "—";
          return v ? "Шилжсэн" : "Шилжээгүй";
        },
      },
    ],
    [validationErrors],
  );

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
    muiTopToolbarProps: {
      sx: {
        overflowX: "auto",
        overflowY: "hidden",
        flexWrap: "nowrap",
        // Гар утасны scroll-ыг гөлгөр болгох
        WebkitOverflowScrolling: "touch",
        // Scrollbar-ыг нимгэн болгох (сонголтоор)
        "&::-webkit-scrollbar": {
          height: "6px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(0,0,0,0.3)",
          borderRadius: "3px",
        },
      },
    },
    initialState: {
      columnVisibility: {
        id: false,
        Level: false,
        InviterPercent: false,
        SponsorId: false,
        SponsorName: false,
        InviterId: false,
        InviterName: false,
        accName: false,
        accNumber: false,
        CenterName: false,
        System: false,
        // phase, ProductName, isBlackMember харагдана
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

const CombinedUserInfo = () => {
  const { mode } = useColorScheme();
  const tableTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,

          info: { main: "rgb(255,122,0)" },
          background: {
            default: mode === "light" ? "rgb(254,255,244)" : "#000",
          },
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
        },
      }),
    [mode],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Typography color="inherit" variant="h4">
        Худалдан авалт
      </Typography>
      <ThemeProvider theme={tableTheme}>
        <Example />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default CombinedUserInfo;
