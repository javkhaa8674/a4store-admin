/* eslint-disable react/jsx-pascal-case */
import AddIcon from "@mui/icons-material/Add";
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
  push,
  query,
  ref,
  remove,
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
// ---------- Firebase зам ----------
const EBARIMT_PATH = "ebarimt";

// ---------- CSV config ----------
const csvConfig = mkConfig({
  filename: `Ебаримт-${dayjs().format("YYYY-MM-DD HH:mm:ss")}`,
  fieldSeparator: ",",
  decimalSeparator: ".",
  columnHeaders: [
    { key: "ID", displayLabel: "Утас" },
    { key: "Name", displayLabel: "Нэр" },
    { key: "Count", displayLabel: "Тоо хэмжээ" },
    { key: "TimeStamps", displayLabel: "Шийдвэрлэсэн огноо" },
    { key: "Requester_TimeStamps", displayLabel: "Хүсэлт гаргасан огноо" },
    { key: "Description", displayLabel: "Тайлбар" },
  ],
});

const Example = () => {
  const queryClient = useQueryClient();
  const [validationErrors, setValidationErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [fetchAll, setFetchAll] = useState(false);

  // ---------- Columns ----------
  const columns = useMemo(
    () => [
      // 🔹 id багана — хүснэгтэд болон modal-д харагдахгүй
      {
        accessorKey: "id",
        header: "id",
        enableEditing: false,
        Edit: () => null, // modal дотор рендэрлэхгүй
        size: 80,
        enableHiding: true,
      },
      {
        accessorKey: "Name",
        header: "Нэр",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.firstName,
          helperText: validationErrors?.firstName,
          onFocus: () =>
            setValidationErrors({ ...validationErrors, firstName: undefined }),
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
          onFocus: () =>
            setValidationErrors({ ...validationErrors, phone: undefined }),
        },
      },
      {
        accessorKey: "Count",
        header: "Тоо хэмжээ",
        size: 80,
        muiEditTextFieldProps: { type: "number" },
      },
      {
        accessorKey: "TimeStamps",
        header: "Шийдвэрлэсэн огноо",
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
      { accessorKey: "Description", header: "Тайлбар" },
    ],
    [validationErrors],
  );

  // ---------- CREATE ----------
  function useCreateUser() {
    return useMutation({
      mutationFn: async (values) => {
        const { ...rest } = values;
        const data = {
          ID: String(rest.ID ?? ""),
          Name: rest.Name ?? "",
          Count: Number(rest.Count) || 0,
          TimeStamps: rest.TimeStamps
            ? dayjs(rest.TimeStamps).isValid()
              ? dayjs(rest.TimeStamps).toISOString()
              : new Date().toISOString()
            : new Date().toISOString(),
          Requester_TimeStamps: rest.Requester_TimeStamps
            ? dayjs(rest.Requester_TimeStamps).isValid()
              ? dayjs(rest.Requester_TimeStamps).toISOString()
              : new Date().toISOString()
            : new Date().toISOString(),
          Description: rest.Description ?? "",
        };
        const newRef = await push(ref(db, EBARIMT_PATH), data);
        return { ...data, id: newRef.key };
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["ebarimt"] });
      },
    });
  }

  // ---------- READ ----------
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
              orderByChild("ID"),
              equalTo(searchTerm),
            );
          } else {
            return [];
          }
          const snapshot = await get(promoQuery);
          if (!snapshot.exists()) return [];

          const combined = Object.entries(snapshot.val()).map(([id, user]) => ({
            id,
            ...user,
          }));

          // 🔹 TimeStamps-ээр буурах дарааллаар эрэмбэлэх (хамгийн сүүлийн нь хамгийн дээр)
          combined.sort((a, b) => {
            const ta = a.TimeStamps ? dayjs(a.TimeStamps).valueOf() : 0;
            const tb = b.TimeStamps ? dayjs(b.TimeStamps).valueOf() : 0;
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

  // ---------- UPDATE ----------
  function useUpdateUser() {
    return useMutation({
      mutationFn: async (user) => {
        if (!user?.id) {
          throw new Error("id байхгүй — update хийх боломжгүй");
        }
        const { id, ...rest } = user;
        const updatedData = {
          ID: String(rest.ID ?? ""),
          Name: rest.Name ?? "",
          Count: Number(rest.Count) || 0,
          TimeStamps: rest.TimeStamps
            ? dayjs(rest.TimeStamps).isValid()
              ? dayjs(rest.TimeStamps).toISOString()
              : new Date().toISOString()
            : new Date().toISOString(),
          Requester_TimeStamps: rest.Requester_TimeStamps
            ? dayjs(rest.Requester_TimeStamps).isValid()
              ? dayjs(rest.Requester_TimeStamps).toISOString()
              : new Date().toISOString()
            : new Date().toISOString(),
          Description: rest.Description ?? "",
        };
        await update(ref(db, `${EBARIMT_PATH}/${id}`), updatedData);
        return { ...updatedData, id };
      },
      onMutate: (newUserInfo) => {
        queryClient.setQueriesData({ queryKey: ["ebarimt"] }, (prevUsers) =>
          prevUsers?.map((prevUser) =>
            prevUser.id === newUserInfo.id ? newUserInfo : prevUser,
          ),
        );
      },
      onSettled: () => queryClient.invalidateQueries({ queryKey: ["ebarimt"] }),
    });
  }

  // ---------- DELETE ----------
  function useDeleteUser() {
    return useMutation({
      mutationFn: async (userId) => {
        await remove(ref(db, `${EBARIMT_PATH}/${userId}`));
        return userId;
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

  // ---------- Hooks дуудлага ----------
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

  // ---------- Actions ----------
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
      deleteUser(row.original.id);
    }
  };

  // ---------- Export ----------
  const handleExportData = () => {
    const cleaned = fetchedUsers.map((item) => {
      const newItem = {
        ...item,
        TimeStamps: item.TimeStamps
          ? dayjs(item.TimeStamps).isValid()
            ? dayjs(item.TimeStamps).format("YYYY-MM-DD HH:mm:ss")
            : ""
          : "",
        Requester_TimeStamps: item.Requester_TimeStamps
          ? dayjs(item.Requester_TimeStamps).isValid()
            ? dayjs(item.Requester_TimeStamps).format("YYYY-MM-DD HH:mm:ss")
            : ""
          : "",
      };
      delete newItem.id;
      return newItem;
    });
    const csv = generateCsv(csvConfig)(cleaned);
    download(csvConfig)(csv);
  };

  // ---------- Table ----------
  const table = useMaterialReactTable({
    columns,
    data: fetchedUsers,
    createDisplayMode: "modal",
    editDisplayMode: "modal",
    enableEditing: true,
    enableRowActions: true,
    enableCreateRow: true, // 🔹 CREATE идэвхжүүлэх
    getRowId: (row) => row.id,
    muiToolbarAlertBannerProps: isLoadingUsersError
      ? { color: "error", children: "Error loading data" }
      : undefined,
    muiTableContainerProps: { sx: { minHeight: "500px" } },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateUser,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveUser,
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">Худалдан авалт нэмэх</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          {internalEditComponents.filter(
            (el) => el?.props?.column?.id !== "id",
          )}
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
          {internalEditComponents.filter(
            (el) => el?.props?.column?.id !== "id",
          )}
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
    // 🔹 Toolbar: Нэмэх + Татах
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
    muiTopToolbarProps: {
      sx: {
        overflowX: "auto",
        overflowY: "hidden",
        flexWrap: "nowrap",
        // Гар утасны scroll-ыг гөлгөр болгох
        WebkitOverflowScrolling: "touch",
        // Scrollbar-ыг нимгэн болгох (сонголтоор)
        "&::-webkit-scrollbar": { height: "6px" },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(0,0,0,0.3)",
          borderRadius: "3px",
        },
      },
    },
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

const Ebarimt = () => {
  const tableTheme = useTableTheme();

  return (
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
