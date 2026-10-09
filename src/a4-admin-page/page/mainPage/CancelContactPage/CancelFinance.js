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
  lighten,
  TextField,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  Snackbar,
} from "@mui/material";

// Icons

// Example mock data for the table

const Example = () => {
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [financeAmount, setFinanceAmount] = useState(null);
  const [successMessage, setSuccessMessage] = useState(""); // For success message
  const [data, setData] = useState([]); // Set an empty array as the default value
  const [errorMessage, setErrorMessage] = useState(""); // For
  const [openDialog, setOpenDialog] = useState(false);

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setFinanceAmount(null); // Reset state when dialog is closed
    setOpenDialog(false); // Close the dialog
  };

  useEffect(() => {
    // Fetch data from the backend
    axios
      .post("https://api-hw5amqni4q-uc.a.run.app/CancelContactfinanceData")
      .then((response) => {
        setData(response.data.data);
        console.log(response.data.data);
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
            accessorFn: (row) => ` ${row.Name}`,
            id: "name",
            header: "Name",
            size: 250,
            Cell: ({ renderedCellValue, row }) => (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <span>{renderedCellValue}</span>
              </Box>
            ),
          },
          {
            accessorKey: "MemberId",
            enableClickToCopy: true,
            filterVariant: "autocomplete",
            header: "Утас",
            size: 300,
          },
          {
            accessorKey: "type",
            filterVariant: "autocomplete",
            header: "Буцаалт хийх систем",
            size: 300,
            Cell: ({ cell }) => {
              // Check the value of 'type' and display the corresponding label
              const value = cell.getValue();
              return value === "new"
                ? "Шинэ"
                : value === "old"
                  ? "Хуучин"
                  : value === "two"
                    ? "Шинэ болон Хуучин"
                    : value;
            },
          },
          {
            accessorKey: "totalAmount",
            filterFn: "between",
            header: "Нийт авсан урамшуулал",
            size: 200,
            Cell: ({ cell }) => (
              <Box
                component="span"
                sx={(theme) => ({
                  backgroundColor:
                    cell.getValue() < 500000
                      ? theme.palette.error.dark
                      : cell.getValue() >= 500000 && cell.getValue() < 1500000
                        ? theme.palette.warning.dark
                        : theme.palette.success.dark,
                  borderRadius: "0.25rem",
                  color: "#fff",
                  maxWidth: "9ch",
                  p: "0.25rem",
                })}
              >
                {cell.getValue()?.toLocaleString("MN-mn", {
                  style: "currency",
                  currency: "MNT",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </Box>
            ),
          },

          {
            accessorFn: (row) => new Date(row.createRequestTimeStamp),
            id: "createRequestTimeStamp",
            header: "Хүсэлт үүсгэсэн огноо",
            filterVariant: "date",
            filterFn: "lessThan",
            sortingFn: "datetime",
            Cell: ({ cell }) => cell.getValue()?.toLocaleDateString(),
            Header: ({ column }) => <em>{column.columnDef.header}</em>,
            muiFilterTextFieldProps: {
              sx: {
                minWidth: "250px",
              },
            },
          },
        ],
      },
    ],
    [],
  );

  const handleSubmit = async () => {
    setLoadingSubmit(true);
    setErrorMessage(""); // Reset error message
    setSuccessMessage(""); // Reset success message
    try {
      if (data.type === "two") {
        await axios.post(
          `https://api-hw5amqni4q-uc.a.run.app/saveCancelContact`,
          { efundCode: 456 },
        );
      } else {
        await axios.post(
          `https://api-hw5amqni4q-uc.a.run.app/saveCancelContact`,
          { efundCode: 456 },
        );
      }

      setSuccessMessage("Хүсэлт амжилттай илгээгдлээ!"); // Success message
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || "Алдаа гарлаа та дахин оролдно уу",
      );
    } finally {
      setLoadingSubmit(false);
    }
  };
  const handleChange = (e) => {
    let newValue = e.target.value.replace(/[^\d]/g, ""); // Remove non-numeric characters

    if (newValue) {
      // Format as currency without decimals
      newValue = new Intl.NumberFormat("mn-MN", {
        style: "currency",
        currency: "MNT",
        minimumFractionDigits: 0, // No decimals
      }).format(newValue);
    }

    setFinanceAmount(newValue);
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
      showColumnFilters: true,
      showGlobalFilter: true,
      columnPinning: {
        left: ["mrt-row-expand", "mrt-row-select"],
        right: ["mrt-row-actions"],
      },
    },
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    muiSearchTextFieldProps: {
      size: "small",
      variant: "outlined",
    },
    muiPaginationProps: {
      color: "secondary",
      rowsPerPageOptions: [10, 20, 30],
      shape: "rounded",
      variant: "outlined",
    },
    renderDetailPanel: ({ row }) => {
      // Check if row.original.type is "two" and render accordingly
    },

    renderRowActionMenuItems: ({ closeMenu, row }) => [
      <MenuItem
        key={0}
        onClick={() => {
          handleOpenDialog(row); // Open the dialog when the menu item is clicked
        }}
        sx={{ m: 0 }}
      >
        Дэлгэрэнгүй
      </MenuItem>,
      <MenuItem
        key={0}
        onClick={() => {
          closeMenu();
        }}
        sx={{ m: 0 }}
      >
        Цуцлах
      </MenuItem>,

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Дэлгэрэнгүй</DialogTitle>
        <DialogContent>
          {row.original.type === "two" ? (
            <div>two</div>
          ) : (
            <div
              style={{
                marginTop: "40px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  background: "#fff",
                  padding: "20px",
                  borderRadius: "8px",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  maxWidth: "800px",
                  width: "100%",
                }}
              >
                {[
                  {
                    label: "Төрөл",
                    value:
                      row.original.type === "old"
                        ? "Хуучин систем"
                        : row.original.type === "new"
                          ? "Шинэ систем"
                          : row.original.type,
                  },
                  { label: "Утас", value: row.original.MemberId || "" },
                  { label: "Овог нэр", value: row.original.Name || "" },
                  {
                    label: "Нийт код тоо",
                    value: row.original.CodeCount,
                  },
                  {
                    label: "Буцаах код тоо",
                    value: row.original.CodeCount || "",
                    required: true,
                    type: "number",
                    color: "success",
                  },
                  {
                    label: "Борлуулалтын урамшуулал авсан дүн",
                    value: row.original.bonusAmount
                      ? new Intl.NumberFormat("mn-MN", {
                          style: "currency",
                          currency: "MNT",
                        }).format(row.original.bonusAmount)
                      : 0,
                  },
                  {
                    label: "Урилтын урамшуулал авсан дүн",
                    value: row.original.inviteAmount
                      ? new Intl.NumberFormat("mn-MN", {
                          style: "currency",
                          currency: "MNT",
                        }).format(row.original.inviteAmount)
                      : 0,
                  },
                  {
                    label: "Нийт авсан урамшуулал",
                    value: row.original.totalAmount
                      ? new Intl.NumberFormat("mn-MN", {
                          style: "currency",
                          currency: "MNT",
                        }).format(row.original.totalAmount)
                      : 0,
                  },
                  {
                    label: "Е-Баримт авсан дүн",
                    value: row.original.Ebarimt
                      ? new Intl.NumberFormat("mn-MN", {
                          style: "currency",
                          currency: "MNT",
                        }).format(row.original.Ebarimt)
                      : 0,
                  },
                  {
                    label: "Бүтээгдэхүүн авсан тоо",
                    value: row.original.Product || "0",
                  },
                  {
                    label: "Банк нэр",
                    value: row.original.accName || "",
                  },
                  {
                    label: "Дансны дугаар",
                    value: row.original.accNumber || "",
                  },
                ].map((field) => (
                  <TextField
                    key={field.label} // Unique key for each field
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
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                      },
                      "& .MuiFormHelperText-root": {
                        color: "#ff9800", // Warning color for helper text
                      },
                    }}
                  />
                ))}

                <TextField
                  label="Шилжүүлэх эцсийн дүн"
                  variant="outlined"
                  value={financeAmount}
                  onChange={handleChange}
                  fullWidth
                  required
                  type="text"
                  error={
                    financeAmount === "" ||
                    isNaN(financeAmount?.replace(/[^\d]/g, ""))
                  }
                  color="success"
                  focused
                  helperText={
                    !financeAmount ||
                    isNaN(financeAmount?.replace(/[^\d]/g, ""))
                      ? "Шилжүүлэх эцсийн дүн оруулна уу"
                      : ""
                  }
                  sx={{
                    marginBottom: "20px",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      "&.Mui-error": {
                        borderColor: "#ff9800", // Warning color (yellow-orange)
                      },
                    },
                    "& .MuiFormHelperText-root": {
                      color: "#ff9800", // Warning color for helper text
                    },
                  }}
                />

                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleSubmit(row)}
                  disabled={!financeAmount}
                  fullWidth
                  sx={{
                    padding: "15px",
                    fontSize: "1.2rem",
                    backgroundColor: "#4caf50",
                    color: "#fff",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    marginTop: "30px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                    "&:hover": {
                      backgroundColor: "#388e3c",
                    },
                  }}
                >
                  {loadingSubmit ? (
                    <CircularProgress
                      size={30}
                      color="secondary"
                      thickness={5}
                    />
                  ) : (
                    "Хүсэлт илгээх"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Хаах
          </Button>
        </DialogActions>
      </Dialog>,
    ],
    renderTopToolbar: ({ table }) => {
      return (
        <Box
          sx={(theme) => ({
            backgroundColor: lighten(theme.palette.background.default, 0.05),
            display: "flex",
            gap: "0.5rem",
            p: "8px",
            justifyContent: "space-between",
          })}
        >
          <Box sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <MRT_GlobalFilterTextField table={table} />
            <MRT_ToggleFiltersButton table={table} />
          </Box>
          <Box></Box>
        </Box>
      );
    },
  });

  return (
    <>
      <MaterialReactTable table={table} />

      {/* ★ Амжилтын мэдээлэл */}
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

      {/* ★ Алдааны мэдээлэл */}
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
    </>
  );
};

// Date Picker Imports

const CancelFinance = () => (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <Example />
  </LocalizationProvider>
);

export default CancelFinance;
