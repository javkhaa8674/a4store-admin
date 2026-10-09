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
  useTheme,
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
import { doc, deleteDoc } from "firebase/firestore";
import { firestore } from "../../../../refrence/storeConfig";
import { getDocs, collection } from "firebase/firestore";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const csvConfig = mkConfig({
  filename: `Төлбөрийн-түүх-${dayjs().format("YYYY-MM-DD HH:mm:ss")}`,
  fieldSeparator: ",",
  decimalSeparator: ".",
  columnHeaders: [
    {
      key: "phone",
      displayLabel: "Утас",
    },
    {
      key: "inviterPhone",
      displayLabel: "Урсан хүний утас",
    },
    {
      key: "timestamp",
      displayLabel: "Огноо",
    },
  ],
});

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
  // ★ useQueryClient hook ашиглах
  const queryClient = useQueryClient();

  const [validationErrors, setValidationErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [fetchAll, setFetchAll] = useState(false);
  const { data: fetchedUsers = [], isError, isLoading } = useGetUsers(fetchAll);

  // ★ useMemo-д хоосон dependency array нэмсэн
  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "id", size: 80 },
      {
        accessorKey: "phone",
        filterVariant: "autocomplete",
        header: "Утас",
        size: 80,
        enableClickToCopy: true,
      },
      {
        accessorKey: "inviterPhone",
        filterVariant: "autocomplete",
        header: "Урьсан хүний утас",
        size: 80,
        enableClickToCopy: true,
      },
      {
        accessorKey: "timestamp",
        id: "timestamp",
        header: "Огноо",
        filterVariant: "date",
        size: 250,
        sortingFn: "datetime",
        Cell: ({ cell }) => {
          const value = cell.getValue();
          return value
            ? dayjs(value).format("YYYY-MM-DD HH:mm:ss")
            : "Огноо байхгүй";
        },
        filterFn: (row, columnId, filterValue) => {
          const rowValue = dayjs(row.getValue(columnId)).format("YYYY-MM-DD");
          const filterDate = dayjs(filterValue, "MM/DD/YYYY").format(
            "YYYY-MM-DD",
          );
          return rowValue === filterDate;
        },
      },
    ],
    [], // ★ Хоосон dependency array
  );

  const { mutateAsync: deleteUser } = useDeleteUser();

  // READ hook (get users from api)
  function useGetUsers(fetchAll = true) {
    return useQuery({
      queryKey: ["Members", fetchAll],
      queryFn: async () => {
        try {
          if (!fetchAll) return [];

          const usersRef = collection(firestore, "inviteFriend");
          const querySnapshot = await getDocs(usersRef);

          const data = querySnapshot.docs.map((doc) => {
            const timestamp = doc.data().timestamp?.toDate() || null;
            const docData = doc.data();
            return {
              ...docData,
              id: doc.id,
              timestamp: timestamp ? timestamp.toISOString() : null,
            };
          });

          data.sort((a, b) => {
            const dateA = a.timestamp ? new Date(a.timestamp) : null;
            const dateB = b.timestamp ? new Date(b.timestamp) : null;
            return dateB - dateA;
          });

          return data;
        } catch (error) {
          console.error("Error fetching users:", error);
          throw new Error("Failed to fetch users");
        }
      },
      enabled: fetchAll,
      refetchOnWindowFocus: true,
    });
  }

  // DELETE hook (delete user in api)
  function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (id) => {
        const userRef = doc(firestore, "inviteFriend", id);
        await deleteDoc(userRef);
      },
      onMutate: async (id) => {
        // ★ Бүх "Members" query-г цуцлах
        await queryClient.cancelQueries({ queryKey: ["Members"] });

        // ★ Өмнөх өгөгдлийг хадгалах
        const previousData = queryClient.getQueriesData({
          queryKey: ["Members"],
        });

        // ★ Бүх "Members" query-с устгасан хэрэглэгчийг хасах
        queryClient.setQueriesData({ queryKey: ["Members"] }, (oldData) =>
          oldData?.filter((user) => user.id !== id),
        );

        return { previousData };
      },
      onError: (err, id, context) => {
        // ★ Алдаа гарвал өмнөх өгөгдлийг буцаах
        if (context?.previousData) {
          context.previousData.forEach(([queryKey, data]) => {
            queryClient.setQueryData(queryKey, data);
          });
        }
      },
      onSettled: () => queryClient.invalidateQueries({ queryKey: ["Members"] }),
    });
  }

  const openDeleteConfirmModal = async (row) => {
    if (window.confirm("Та энэ хэрэглэгчийг устгахдаа итгэлтэй байна уу?")) {
      try {
        await deleteUser(row.original.id);
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
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
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",

    muiSearchTextFieldProps: {
      size: "small",
      variant: "outlined",
    },
    muiPaginationProps: {
      color: "primary",
      rowsPerPageOptions: [10, 50, 100, 200],
      shape: "rounded",
      variant: "outlined",
    },
    getRowId: (row) => row.id,
    muiToolbarAlertBannerProps: isError
      ? { color: "error", children: "Error loading data" }
      : undefined,
    muiTableContainerProps: { sx: { minHeight: "500px" } },
    onCreatingRowCancel: () => setValidationErrors({}),
    onEditingRowCancel: () => setValidationErrors({}),
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
          sx={{ fontSize: "0.8rem" }}
          disabled={!fetchedUsers || fetchedUsers.length === 0}
        >
          Татаж авах
        </Button>
      </Box>
    ),
    initialState: {
      density: "compact",
      columnVisibility: {
        id: false,
      },
    },

    state: {
      isLoading: isLoading,
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
            // ★ queryKey-г "Members" болгож зассан
            queryClient.invalidateQueries({ queryKey: ["Members"] });
          }}
          variant="filled"
          size="small"
        />
        <Button
          onClick={() => {
            setFetchAll(true);
            setSearchTerm("");
            // ★ queryKey-г "Members" болгож зассан
            queryClient.invalidateQueries({ queryKey: ["Members"] });
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
  const globalTheme = useTheme();
  const tableTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: globalTheme.palette.mode,
          primary: globalTheme.palette.secondary,
          info: {
            main: "rgb(255,122,0)",
          },
          background: {
            default:
              globalTheme.palette.mode === "light"
                ? "rgb(254,255,244)"
                : "#000",
          },
        },
        typography: {
          button: {
            textTransform: "none",
            fontSize: "1.2rem",
          },
        },
        components: {
          MuiTooltip: {
            styleOverrides: {
              tooltip: {
                fontSize: "1.1rem",
              },
            },
          },
          MuiSwitch: {
            styleOverrides: {
              thumb: {
                color: "pink",
              },
            },
          },
        },
      }),
    [globalTheme],
  );
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <QueryClientProvider client={queryClient}>
        <Typography color="inherit" variant="h4" align="center">
          Төлбөрийн түүх
        </Typography>
        <Box marginLeft={"2rem"}>
          <ThemeProvider theme={tableTheme}>
            <Example />
          </ThemeProvider>
        </Box>
      </QueryClientProvider>
    </LocalizationProvider>
  );
};

export default MemberRegistration;
