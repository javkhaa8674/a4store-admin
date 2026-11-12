/* eslint-disable react/jsx-pascal-case */
import React, { useMemo, useState, useEffect } from "react";

// Material React Table Imports
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_GlobalFilterTextField,
  MRT_ToggleFiltersButton,
} from "material-react-table";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import axios from "axios";

import {
  Box,
  Button,
  MenuItem,
  TextField,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  Snackbar,
  ThemeProvider,
} from "@mui/material";
import { useTableTheme } from "../../../../theme/useTableTheme";
// ---------------------------------------------------------------------------
// Туслах функцууд
// ---------------------------------------------------------------------------
const formatCurrency = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "₮0";
  return new Intl.NumberFormat("mn-MN", {
    style: "currency",
    currency: "MNT",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

const parseNumeric = (str) => {
  if (str === null || str === undefined) return 0;
  const digits = String(str).replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
};

const Example = () => {
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [financeAmount, setFinanceAmount] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [data, setData] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleOpenDialog = (rowOriginal) => {
    setSelectedRow(rowOriginal);
    setFinanceAmount("");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setFinanceAmount("");
    setSelectedRow(null);
    setOpenDialog(false);
  };

  useEffect(() => {
    axios
      .post("https://api-hw5amqni4q-uc.a.run.app/CancelContactfinanceData")
      .then((response) => {
        setData(response.data.data);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setErrorMessage("Алдаа гарлаа, та дахин оролдно уу");
      });
  }, []);

  const columns = useMemo(
    () => [
      {
        id: "employee",
        header: "Employee",
        columns: [
          {
            accessorFn: (row) => String(row.Name ?? ""),
            id: "name",
            header: "Name",
            size: 250,
            Cell: ({ row }) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span>{row.original.Name ?? ""}</span>
              </Box>
            ),
          },
          {
            accessorFn: (row) => String(row.MemberId ?? ""),
            id: "MemberId",
            enableClickToCopy: true,
            filterVariant: "autocomplete",
            header: "Утас",
            size: 300,
            Cell: ({ row }) => row.original.MemberId ?? "",
          },
          {
            accessorFn: (row) => String(row.type ?? ""),
            id: "type",
            filterVariant: "autocomplete",
            header: "Буцаалт хийх систем",
            size: 300,
            Cell: ({ row }) => {
              const value = row.original.type;
              return value === "new"
                ? "Шинэ"
                : value === "old"
                  ? "Хуучин"
                  : value === "two"
                    ? "Шинэ болон Хуучин"
                    : (value ?? "");
            },
          },
          {
            accessorFn: (row) => Number(row.totalAmount) || 0,
            id: "totalAmount",
            filterFn: "between",
            header: "Нийт авсан урамшуулал",
            size: 200,
            Cell: ({ cell, table }) => {
              const value = Number(cell.getValue()) || 0;
              const pal = table.options.theme?.palette ?? {};
              return (
                <Box
                  component="span"
                  sx={{
                    backgroundColor:
                      value < 500000
                        ? (pal.error?.dark ?? "#d32f2f")
                        : value >= 500000 && value < 1500000
                          ? (pal.warning?.dark ?? "#ed6c02")
                          : (pal.success?.dark ?? "#2e7d32"),
                    borderRadius: "0.25rem",
                    color: "#fff",
                    maxWidth: "9ch",
                    p: "0.25rem",
                  }}
                >
                  {formatCurrency(value)}
                </Box>
              );
            },
          },
          {
            accessorFn: (row) =>
              row.createRequestTimeStamp
                ? new Date(row.createRequestTimeStamp)
                : null,
            id: "createRequestTimeStamp",
            header: "Хүсэлт үүсгэсэн огноо",
            filterVariant: "date",
            filterFn: "lessThan",
            sortingFn: "datetime",
            Cell: ({ cell }) => cell.getValue()?.toLocaleDateString() ?? "",
            Header: ({ column }) => <em>{column.columnDef.header}</em>,
            muiFilterTextFieldProps: { sx: { minWidth: "250px" } },
          },
        ],
      },
    ],
    [],
  );

  const handleSubmit = async (rowOriginal) => {
    const amount = parseNumeric(financeAmount);
    if (!amount) {
      setErrorMessage("Шилжүүлэх эцсийн дүнг зөв оруулна уу");
      return;
    }

    setLoadingSubmit(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const efundCode = rowOriginal?.type === "two" ? 456 : 456;

      await axios.post(
        "https://api-hw5amqni4q-uc.a.run.app/saveCancelContact",
        { efundCode, amount, memberId: rowOriginal?.MemberId },
      );

      setSuccessMessage("Хүсэлт амжилттай илгээгдлээ!");
      handleCloseDialog();
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || "Алдаа гарлаа та дахин оролдно уу",
      );
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleChange = (e) => {
    const digits = e.target.value.replace(/[^\d]/g, "");
    setFinanceAmount(digits);
  };

  const table = useMaterialReactTable({
    columns,
    data,
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableGrouping: true,
    enableColumnPinning: true,
    enableFacetedValues: true,
    enableRowActions: true,
    enableRowSelection: true,
    initialState: {
      showColumnFilters: false,
      showGlobalFilter: false,
      columnPinning: {
        left: ["mrt-row-expand", "mrt-row-select"],
        right: ["mrt-row-actions"],
      },
    },
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    muiSearchTextFieldProps: { size: "small", variant: "outlined" },
    muiPaginationProps: {
      color: "secondary",
      rowsPerPageOptions: [10, 20, 30],
      shape: "rounded",
      variant: "outlined",
    },

    // -----------------------------------------------------------------------
    // PromotionTransaction-той ижил: зөвхөн muiTableContainerProps
    // -----------------------------------------------------------------------
    muiTableContainerProps: { sx: { minHeight: "500px" } },

    renderRowActionMenuItems: ({ closeMenu, row }) => [
      <MenuItem
        key="details"
        onClick={() => {
          handleOpenDialog(row.original);
          closeMenu();
        }}
        sx={{ m: 0 }}
      >
        Дэлгэрэнгүй
      </MenuItem>,
      <MenuItem
        key="cancel"
        onClick={() => {
          closeMenu();
        }}
        sx={{ m: 0 }}
      >
        Цуцлах
      </MenuItem>,
    ],

    renderTopToolbar: ({ table }) => {
      return (
        <Box
          sx={{
            display: "flex",
            gap: "0.5rem",
            p: "8px",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <MRT_GlobalFilterTextField table={table} />
            <MRT_ToggleFiltersButton table={table} />
          </Box>
          <Box></Box>
        </Box>
      );
    },
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
  });

  const renderDialogContent = () => {
    if (!selectedRow) return null;

    if (selectedRow.type === "two") {
      return <div>two</div>;
    }

    const fields = [
      {
        label: "Төрөл",
        value:
          selectedRow.type === "old"
            ? "Хуучин систем"
            : selectedRow.type === "new"
              ? "Шинэ систем"
              : selectedRow.type,
      },
      { label: "Утас", value: selectedRow.MemberId ?? "" },
      { label: "Овог нэр", value: selectedRow.Name ?? "" },
      { label: "Нийт код тоо", value: selectedRow.CodeCount ?? 0 },
      {
        label: "Буцаах код тоо",
        value: selectedRow.refundCodeCount ?? "",
        required: true,
        type: "number",
        color: "success",
      },
      {
        label: "Борлуулалтын урамшуулал авсан дүн",
        value: formatCurrency(selectedRow.bonusAmount || 0),
      },
      {
        label: "Урилтын урамшуулал авсан дүн",
        value: formatCurrency(selectedRow.inviteAmount || 0),
      },
      {
        label: "Нийт авсан урамшуулал",
        value: formatCurrency(selectedRow.totalAmount || 0),
      },
      {
        label: "Е-Баримт авсан дүн",
        value: formatCurrency(selectedRow.Ebarimt || 0),
      },
      { label: "Бүтээгдэхүүн авсан тоо", value: selectedRow.Product || "0" },
      { label: "Банк нэр", value: selectedRow.accName ?? "" },
      { label: "Дансны дугаар", value: selectedRow.accNumber ?? "" },
    ];

    return (
      <div
        style={{ marginTop: "40px", display: "flex", justifyContent: "center" }}
      >
        <div
          style={{
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            maxWidth: "800px",
            width: "100%",
          }}
        >
          {fields.map((field) => (
            <TextField
              key={field.label}
              label={field.label}
              variant="outlined"
              value={field.value}
              fullWidth
              readOnly
              required={field.required || false}
              type={field.type || "text"}
              color={field.color || "primary"}
              sx={{
                marginBottom: "20px",
                "& .MuiOutlinedInput-root": { borderRadius: "8px" },
                "& .MuiFormHelperText-root": { color: "#ff9800" },
              }}
            />
          ))}

          <TextField
            label="Шилжүүлэх эцсийн дүн"
            variant="outlined"
            value={financeAmount ? formatCurrency(financeAmount) : ""}
            onChange={handleChange}
            fullWidth
            required
            type="text"
            error={!financeAmount}
            color="success"
            focused
            helperText={!financeAmount ? "Шилжүүлэх эцсийн дүн оруулна уу" : ""}
            sx={{
              marginBottom: "20px",
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                "&.Mui-error": { borderColor: "#ff9800" },
              },
              "& .MuiFormHelperText-root": { color: "#ff9800" },
            }}
          />

          <Button
            variant="contained"
            color="success"
            onClick={() => handleSubmit(selectedRow)}
            disabled={!financeAmount || loadingSubmit}
            fullWidth
            sx={{
              padding: "15px",
              color: "#fff",
              borderRadius: "8px",
              fontWeight: "bold",
              marginTop: "30px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            }}
          >
            {loadingSubmit ? (
              <CircularProgress size={30} color="secondary" thickness={5} />
            ) : (
              "Хүсэлт илгээх"
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Box>
      <MaterialReactTable table={table} />

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle variant="h3">Дэлгэрэнгүй</DialogTitle>
        <DialogContent>{renderDialogContent()}</DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Хаах
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={5000}
        onClose={() => setSuccessMessage("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="success"
          onClose={() => setSuccessMessage("")}
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={5000}
        onClose={() => setErrorMessage("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="error"
          onClose={() => setErrorMessage("")}
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

const CancelFinance = () => {
  const tableTheme = useTableTheme();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ThemeProvider theme={tableTheme}>
        <Example />
      </ThemeProvider>
    </LocalizationProvider>
  );
};

export default CancelFinance;
