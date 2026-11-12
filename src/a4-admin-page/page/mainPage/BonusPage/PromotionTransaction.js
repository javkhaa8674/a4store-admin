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
  child,
  equalTo,
  get,
  orderByChild,
  push,
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
import { read, utils } from "xlsx";
import { useTableTheme } from "../../../../theme/useTableTheme";

const date = new Date();

const csvConfig = mkConfig({
  filename: `Урамшуулал Олголт-${date}`,
  fieldSeparator: ",",
  decimalSeparator: ".",
  columnHeaders: [
    { key: "TranDate", displayLabel: "Гүйлгээний огноо" },
    { key: "Branch", displayLabel: "Салбар" },
    { key: "BeginningBalance", displayLabel: "Эхний үлдэгдэл" },
    { key: "Debit", displayLabel: "Дебит гүйлгээ" },
    { key: "Credit", displayLabel: "Кредит гүйлгээ" },
    { key: "EndingBalance", displayLabel: "Эцсийн үлдэгдэл" },
    { key: "TransactionRemarks", displayLabel: "Гүйлгээний утга" },
    { key: "ToAccNumber", displayLabel: "Харьцсан данс" },
    { key: "Type", displayLabel: "Төрөл" },
    { key: "ID", displayLabel: "Утас" },
  ],
});

const queryClient = new QueryClient();

const downloadUrl =
  "https://firebasestorage.googleapis.com/v0/b/a4mongolia.appspot.com/o/%D0%A3%D1%80%D0%B0%D0%BC%D1%88%D1%83%D1%83%D0%BB%D0%B0%D0%BB%20%D0%B7%D0%B0%D0%B3%D0%B2%D0%B0%D1%80.xlsx?alt=media&token=e70fabff-16b9-4200-b4dd-065f05017ca0";

const Example = () => {
  const [validationErrors, setValidationErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [fetchAll, setFetchAll] = useState(false);
  const [importData, setImportData] = useState([]);

  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "id", enableEditing: false },
      {
        accessorKey: "ID",
        header: "Утас",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.phone,
          helperText: validationErrors?.phone,
          onFocus: () =>
            setValidationErrors({ ...validationErrors, phone: undefined }),
        },
      },
      {
        accessorKey: "TranDate",
        header: "Гүйлгээний огноо",
        Cell: ({ cell }) =>
          dayjs(cell.getValue()).format("YYYY-MM-DD HH:mm:ss"),
        enableEditing: true,
      },
      {
        accessorKey: "Debit",
        header: "Дебит гүйлгээ",
        Cell: ({ cell }) => {
          const formattedCurrency = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "MNT",
            minimumFractionDigits: 2,
          }).format(cell.getValue());
          return formattedCurrency;
        },
      },
      { accessorKey: "TransactionRemarks", header: "Гүйлгээний утга" },
      { accessorKey: "ToAccNumber", header: "Харьцсан данс" },
      { accessorKey: "Type", header: "Төрөл" },
    ],
    [validationErrors],
  );

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

  function useCreateUser() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (user) => {
        for (const value of user) {
          const newPostKey = push(child(ref(db), "posts")).key;
          await set(ref(db, "promotionTransaction/" + newPostKey), value);
        }
        return Promise.resolve();
      },
      onMutate: (newUserInfo) => {
        queryClient.setQueryData(["promotion"], (prevUsers = []) => [
          ...prevUsers,
          { ...newUserInfo, id: (Math.random() + 1).toString(36).substring(7) },
        ]);
      },
      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: ["promotion"] }),
    });
  }

  function useGetUsers() {
    return useQuery({
      queryKey: ["promotion", searchTerm, fetchAll],
      queryFn: async () => {
        try {
          let promoQuery;
          if (fetchAll) {
            promoQuery = ref(db, "promotionTransaction");
          } else if (searchTerm.length === 8) {
            promoQuery = query(
              ref(db, "promotionTransaction"),
              orderByChild("ID"),
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
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (user) => {
        const updatedData = { ...user, ID: Number(user.ID) };
        const userRef = ref(db, `promotionTransaction/${updatedData.id}`);
        await update(userRef, updatedData);
        return Promise.resolve();
      },
      onMutate: (newUserInfo) => {
        queryClient.setQueryData(["promotion"], (prevUsers) =>
          prevUsers?.map((prevUser) =>
            prevUser.id === newUserInfo.id ? newUserInfo : prevUser,
          ),
        );
      },
      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: ["promotion"] }),
    });
  }

  function useDeleteUser() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (userId) => {
        const userRef = ref(db, `promotionTransaction/${userId}`);
        await remove(userRef);
        return Promise.resolve();
      },
      onMutate: (userId) => {
        queryClient.setQueryData(["promotion"], (prevUsers) =>
          prevUsers?.filter((user) => user.id !== userId),
        );
      },
      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: ["promotion"] }),
    });
  }

  const handleCreateUser = async ({ table }) => {
    await createUser(importData);
    table.setCreatingRow(null);
  };

  const handleSaveUser = async ({ values, table }) => {
    await updateUser(values);
    table.setEditingRow(null);
  };

  const handleExportData = () => {
    const columnsToRemove = ["id"];
    const excludeColumns = (data, columnsToRemove) => {
      return data.map((item) => {
        const newItem = { ...item };
        columnsToRemove.forEach((column) => delete newItem[column]);
        return newItem;
      });
    };
    const removedId = excludeColumns(fetchedUsers, columnsToRemove);
    const csv = generateCsv(csvConfig)(removedId);
    download(csvConfig)(csv);
  };

  const openDeleteConfirmModal = (row) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUser(row.original.id);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      processExcelFile(file, event);
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
        let data = utils.sheet_to_json(sheet, { header: 1 });
        const customHeader = [
          "TranDate",
          "Debit",
          "TransactionRemarks",
          "ToAccNumber",
          "Type",
          "ID",
        ];
        data[0] = customHeader;
        const updatedData = utils.sheet_to_json(utils.aoa_to_sheet(data), {
          header: customHeader,
          dateNF: "yyyy-mm-dd",
          defval: "",
        });
        if (updatedData.length > 0) {
          updatedData.splice(0, 1);
        }
        setImportData(updatedData);
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
    muiToolbarAlertBannerProps: isLoadingUsersError
      ? { color: "error", children: "Error loading data" }
      : undefined,
    muiTableContainerProps: { sx: { minHeight: "500px" } },

    // ★ Toolbar-д хэвтээ scroll нэмэх
    muiTopToolbarProps: {
      sx: {
        overflowX: "auto",
        overflowY: "hidden",
        flexWrap: "nowrap",
        WebkitOverflowScrolling: "touch",
        "&::-webkit-scrollbar": { height: "6px" },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(0,0,0,0.3)",
          borderRadius: "3px",
        },
      },
    },

    // ★ Paper-ийн overflow-ыг чөлөөлөх (scroll ажиллахын тулд)
    muiTablePaperProps: { sx: { overflow: "visible" } },

    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateUser,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveUser,

    renderCreateRowDialogContent: ({ table, row }) => (
      <>
        <DialogTitle variant="h3">Мэдээлэл оруулах</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <MaterialReactTable
            columns={[
              {
                accessorKey: "TranDate",
                header: "Гүйлгээний огноо",
                Cell: ({ cell }) =>
                  dayjs(cell.getValue()).format("YYYY-MM-DD HH:mm:ss"),
                enableEditing: true,
              },
              {
                accessorKey: "Debit",
                header: "Дебит гүйлгээ",
                Cell: ({ cell }) => {
                  const formattedCurrency = new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "MNT",
                    minimumFractionDigits: 2,
                  }).format(cell.getValue());
                  return formattedCurrency;
                },
              },
              { accessorKey: "TransactionRemarks", header: "Гүйлгээний утга" },
              { accessorKey: "ToAccNumber", header: "Харьцсан данс" },
              { accessorKey: "Type", header: "Төрөл" },
              { accessorKey: "ID", header: "Утас" },
            ]}
            data={importData}
            enableSorting
            enableColumnOrdering
            initialState={{ showGlobalFilter: true }}
            dialogProps={{ maxWidth: "sm", fullWidth: true }}
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

    // ★ Box-д flexWrap: nowrap + minWidth: max-content
    renderTopToolbarCustomActions: ({ table }) => (
      <Box
        sx={{
          display: "flex",
          gap: "1rem",
          flexWrap: "nowrap",
          minWidth: "max-content",
        }}
      >
        <Button
          variant="contained"
          startIcon={<RiFileExcel2Fill />}
          onClick={handleExportData}
        >
          Татаж авах
        </Button>
        <>
          <label htmlFor="file-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<RiFileExcel2Fill />}
            >
              Оруулах
            </Button>
          </label>
          <input
            type="file"
            id="file-upload"
            accept=".xlsx, .xls"
            style={{ display: "none" }}
            onChange={(e) => {
              handleFileChange(e);
              table.setCreatingRow(true);
            }}
          />
          <Button
            variant="contained"
            startIcon={<RiFileExcel2Fill />}
            onClick={() => window.open(downloadUrl, "_blank")}
          >
            Загвар файл татах
          </Button>
        </>
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
            queryClient.invalidateQueries({ queryKey: ["promotion"] });
          }}
          variant="filled"
          size="small"
        />
        <Button
          variant="outlined"
          onClick={() => {
            setFetchAll(true);
            setSearchTerm("");
            queryClient.invalidateQueries({ queryKey: ["promotion"] });
          }}
        >
          Бүгд
        </Button>
      </Box>
      <MaterialReactTable table={table} />
    </Box>
  );
};

const PromotionTransaction = () => {
  const tableTheme = useTableTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={tableTheme}>
        {/* ★ Typography-г ThemeProvider дотор зөөсөн */}
        <Typography color="inherit" variant="h4">
          Урамшуулал олголт
        </Typography>
        <Example />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default PromotionTransaction;
