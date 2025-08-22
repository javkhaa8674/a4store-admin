/* eslint-disable react/jsx-pascal-case */
import { useMemo, useState, useRef } from "react";
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
  Chip,
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
import { ref, set, update, remove } from "firebase/database";
import { db, auth } from "refrence/realConfig";
import { read, utils } from "xlsx";
import axiosA4 from "storeaxios";
import axios from "axios";
const csvConfig = mkConfig({
  filename: `Худалдан Авалт-${dayjs().format("YYYY-MM-DD HH:mm:ss")}`,

  columnHeaders: [
    {
      key: "id",
      displayLabel: "id",
    },
    {
      key: "type",
      displayLabel: "Төрөл",
    },
    {
      key: "amount",
      displayLabel: "Шилжүүлсэн дүн",
    },
    {
      key: "description",
      displayLabel: "Гүйлгээний утга",
    },
    {
      key: "fee",
      displayLabel: "Шимтгэл",
    },
    {
      key: "receiverId",
      displayLabel: "Хүлээн авагч",
    },
    {
      key: "senderId",
      displayLabel: "Шилжүүлэгч",
    },
    {
      key: "timestamp",
      displayLabel: "Огноо",
    },
    {
      key: "totalDeduction",
      displayLabel: "Нийт дүн",
    },
  ],
  quoteStrings: '"',
});

function validateUser(user) {
  return {};
}

// Export CSV data
const exportToExcel = (data) => {
  console.log(data);
  const convertedData = data.map((element) => ({
    ...element,
    timestamp: dayjs(element.timestamp).format("YYYY-MM-DD HH:mm:ss"),
    id: `="${element.id}"`, // 👈 Excel-д текст болно
    senderId: `="${element.senderId}"`,
    receiverId: `="${element.receiverId}"`,
  }));
  // First, convert your data to CSV string using your csvConfig
  const csv = generateCsv(csvConfig)(convertedData);

  // Then, trigger download
  download(csvConfig)(csv);
};

const Example = () => {
  const [validationErrors, setValidationErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState(""); // User input for search
  const [fetchAll, setFetchAll] = useState(false); // Flag to control data fetching
  const { data: fetchedUsers = [], isError, isLoading } = useGetUsers();
  const [importData, setImportData] = useState([]);
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "id",
      },
      {
        accessorKey: "type",
        header: "Төрөл",
        Cell: ({ cell }) => {
          const value = cell.getValue();

          const getStatusProps = (type) => {
            switch (type) {
              case "promotion":
                return { label: "Урамшуулал", color: "success" };
              case "payment":
                return { label: "Худалдан авалт", color: "error" };
              case "transaction":
                return { label: "Шилжүүлэг", color: "primary" };
              case "credit":
                return { label: "Цэнэглэлт", color: "secondary" };
              default:
                return { label: type, color: "default" };
            }
          };

          const { label, color } = getStatusProps(value);
          return <Chip label={label} color={color} size="small" />;
        },
      },
      {
        accessorKey: "amount",
        header: "Шилжүүлсэн дүн",
      },
      {
        accessorKey: "description",
        header: "Гүйлгээний утга",
      },
      {
        accessorKey: "fee",
        header: "Шимтгэл",
      },
      {
        accessorKey: "receiverId",
        header: "Хүлээн авагч",
      },
      {
        accessorKey: "senderId",
        header: "Шилжүүлэгч",
      },
      {
        accessorKey: "timestamp",
        header: "Огноо",
        Cell: ({ cell }) => {
          const value = cell.getValue();
          return dayjs(value).format("YYYY-MM-DD HH:mm:ss");
        },
      },
      {
        accessorKey: "totalDeduction",
        header: "Нийт дүн",
      },
    ],
    []
  );
  // CREATE hook (post new user to api)
  const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (user) => {
        const newUserRef = ref(db, "userInfo");
        await set(newUserRef.push(), user);
        return Promise.resolve();
      },
      onMutate: (newUserInfo) => {
        queryClient.setQueryData(["userInfo"], (prevUsers) => [
          ...(prevUsers || []),
          {
            ...newUserInfo,
            id: (Math.random() + 1).toString(36).substring(7),
          },
        ]);
      },
    });
  };

  function useGetUsers() {
    return useQuery({
      queryKey: ["transactions", searchTerm, fetchAll],
      queryFn: async () => {
        try {
          const user = auth.currentUser;
          const token = await user.getIdToken();
          console.log("token", token);
          if (fetchAll) {
            console.log("fetchAll enabled");
            const result = await axiosA4.post(
              `/getTransactions`,
              {
                senderId: null,
              },
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            console.log("result", result.data);
            return result.data.transactions;
          } else if (searchTerm.length === 8) {
            console.log(searchTerm);
            const result = await axiosA4.post(
              `/getTransactionById?phone=${searchTerm}`,
              {
                senderId: null,
              },
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            console.log("result", result.data);
            return result.data.transactions;
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
        const updatedData = {
          ...user, // Spread the original row data
          MemberId: Number(user.MemberId),
        };
        // remove undefined values
        const sendData = Object.fromEntries(
          Object.entries(updatedData).filter(
            ([_, value]) => value !== undefined
          )
        );
        const userRef = ref(db, `userInfo/${sendData.id}`);
        await update(userRef, sendData);
        return Promise.resolve();
      },
      onMutate: (newUserInfo) => {
        queryClient.setQueryData(["userInfo"], (prevUsers) =>
          prevUsers?.map((prevUser) =>
            prevUser.id === newUserInfo.id ? newUserInfo : prevUser
          )
        );
      },
      onSettled: () => queryClient.invalidateQueries(["userInfo"]), // Refetch users after mutation
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
      onMutate: (userId) => {
        queryClient.setQueryData(["userInfo"], (prevUsers) =>
          prevUsers?.filter((user) => user.id !== userId)
        );
      },
      onSettled: () => queryClient.invalidateQueries(["userInfo"]), // Refetch users after mutation
    });
  };
  const { mutateAsync: createUser, isPending: isCreatingUser } =
    useCreateUser();
  const { mutateAsync: updateUser, isPending: isUpdatingUser } =
    useUpdateUser();
  const { mutateAsync: deleteUser, isPending: isDeletingUser } =
    useDeleteUser();
  const handleCreateTransactions = async ({ values, table }) => {
    if (!importData) {
      alert("Файл оруулаагүй байна.");
      return;
    }
    try {
      const response = await axios.post(
        "https://api-jrbocynobq-uc.a.run.app/transactions/add-multiple",
        importData
      );

      if (response.status === 200) {
        alert("Амжилттай");
      } else {
        alert("Алдаа гарлаа. Та дахин оролдоно уу.");
      }

      table.setCreatingRow(null);
    } catch (error) {
      console.error("Error creating transactions:", error);
      alert("Сүлжээний алдаа гарлаа. Та дахин оролдоно уу.");
    }
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
      ) : null
    );
  };
  const fileUrl =
    "https://firebasestorage.googleapis.com/v0/b/a4youandme-store.firebasestorage.app/o/%D0%97%D0%B0%D0%B3%D0%B2%D0%B0%D1%80_%D0%A4%D0%B0%D0%B9%D0%BB%20(4).xlsx?alt=media&token=130c1663-7be3-4541-975d-ad0903950532";

  const handleDownloadExel = () => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.setAttribute("download", "Загвар_Файл.xlsx"); // Optional: renames the file
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        // Эхний мөрийг headers болгож, үлдсэн мөрүүдийг өгөгдөл болгоно
        const data = utils.sheet_to_json(sheet, {
          defval: "", // Хоосон нүдэнд default утга
        });
        let realData = [];
        data.forEach((element) => {
          if (element.register > 0) {
            realData.push({
              senderId: element.senderId,
              receiverId: element.receiverId,
              amount: element.register,
              description: "Бүртгүүлсэн 5000p",
              type: "promotion",
              fee: 0,
            });
          }
          if (element.invite > 0) {
            realData.push({
              senderId: element.senderId,
              receiverId: element.receiverId,
              amount: element.invite,
              description: "Урьсан 5000p",
              type: "promotion",
              fee: 0,
            });
          }
          if (element.rank > 0) {
            realData.push({
              senderId: element.senderId,
              receiverId: element.receiverId,
              amount: element.rank,
              description: "Зэрэглэл Point",
              type: "promotion",
              fee: 0,
            });
          }
          if (element.member > 0) {
            realData.push({
              senderId: element.senderId,
              receiverId: element.receiverId,
              amount: element.member,
              description: "Гишүүн 50000p",
              type: "promotion",
              fee: 0,
            });
          }
        });

        setImportData(realData);
      } catch (error) {
        console.error("Error processing file:", error);
      }
    };
    reader.readAsArrayBuffer(file);
  };
  const inputRef = useRef(null);
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
    onCreatingRowSave: handleCreateTransactions,
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
                accessorKey: "senderId",
                header: "sender id",
              },
              {
                accessorKey: "receiverId",
                header: "receiver Id",
              },
              {
                accessorKey: "amount",
                header: "amount",
              },
              {
                accessorKey: "description",
                header: "description",
              },
              {
                accessorKey: "type",
                header: "type",
              },
              {
                accessorKey: "fee",
                header: "fee",
              },
            ]}
            data={importData}
            enableSorting
            enableColumnOrdering
            initialState={{ showGlobalFilter: true }}
            dialogProps={{
              maxWidth: "sm", // Adjust the max width if needed
              fullWidth: true, // Make the dialog full width
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
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Button
          variant="contained"
          startIcon={<RiFileExcel2Fill />}
          onClick={() => exportToExcel(fetchedUsers)}
        >
          Татаж авах
        </Button>

        <Button
          variant="contained"
          startIcon={<RiFileExcel2Fill />}
          onClick={() => inputRef.current && inputRef.current.click()}
        >
          Оруулах
        </Button>
        <input
          type="file"
          accept=".xlsx, .xls"
          ref={inputRef}
          style={{ display: "none" }}
          onChange={(e) => {
            handleFileChange(e);
            table.setCreatingRow(true);
          }}
        />
        <Button
          variant="contained"
          startIcon={<RiFileExcel2Fill />}
          onClick={handleDownloadExel}
        >
          Загвар файл татах
        </Button>
      </Box>
    ),
    initialState: {
      columnVisibility: {
        id: false,
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

const Transactions = () => {
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
    [globalTheme]
  );
  return (
    <QueryClientProvider client={queryClient}>
      <Typography color="inherit" variant="h4">
        Шилжүүлэгийн мэдээлэл
      </Typography>
      <ThemeProvider theme={tableTheme}>
        <Example />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default Transactions;
