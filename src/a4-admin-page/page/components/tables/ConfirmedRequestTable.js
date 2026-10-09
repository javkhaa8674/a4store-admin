/* eslint-disable react/jsx-pascal-case */
import React, { useMemo } from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

//MRT Imports
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_GlobalFilterTextField,
  MRT_ToggleFiltersButton,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFullScreenButton,
} from "material-react-table";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { get, ref, update, remove } from "firebase/database";
import {
  Box,
  lighten,
  TextField,
  Grid,
  ListItemIcon,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { db } from "refrence/realConfig";
import dayjs from "dayjs";
import MUIStepper from "../../components/MUIStepper";

const ReactAdvancedMaterialTable = () => {
  const columns = useMemo(
    () => [
      {
        id: "mainInfo",
        header: "Үндсэн мэдээлэл",
        columns: [
          {
            accessorKey: "Status",
            filterVariant: "autocomplete",
            header: "Төлөв",
            size: 100,
            Cell: ({ cell }) => (
              <Box
                component="span"
                sx={(theme) => ({
                  backgroundColor: theme.palette.warning.dark,
                  borderRadius: "0.25rem",
                  color: "#fff",
                  maxWidth: "9ch",
                  p: "0.25rem",
                })}
              >
                {cell.getValue()?.toLocaleString?.("mn-MN", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </Box>
            ),
          },
          {
            accessorKey: "ApprovalType",
            enableClickToCopy: true,
            filterVariant: "autocomplete",
            header: "Хүсэлтийн төрөл",
            size: 100,
          },
          {
            accessorKey: "ID",
            enableClickToCopy: true,
            filterVariant: "autocomplete",
            header: "ID",
            size: 100,
          },
          {
            accessorKey: "id",
            enableClickToCopy: true,
            filterVariant: "autocomplete",
            header: "id",
            size: 100,
          },
          {
            accessorKey: "Name",
            enableClickToCopy: true,
            filterVariant: "autocomplete",
            header: "Нэр",
            size: 100,
          },
          {
            accessorFn: (row) => new Date(row.TimeStamps),
            id: "TimeStamps",
            header: "Үүсгэсэн огноо",
            filterVariant: "date",
            filterFn: "lessThan",
            sortingFn: "datetime",
            Cell: ({ cell }) =>
              dayjs(cell.getValue()).format("YYYY-MM-DD HH:mm:ss"),
            Header: ({ column }) => <em>{column.columnDef.header}</em>,
            muiFilterTextFieldProps: {
              sx: {
                minWidth: "100px",
              },
            },
          },
          {
            accessorKey: "Requester_ID",
            enableClickToCopy: true,
            filterVariant: "autocomplete",
            header: "Үүсгэсэн ажилтан",
            size: 100,
          },
        ],
      },
    ],
    [],
  );

  //call CREATE hook
  const { mutateAsync: createUser, isPending: isCreatingUser } =
    useCreateRequest();
  //call READ hook
  const {
    data: fetchedResults = [],
    isError: isLoadingUsersError,
    isFetching: isFetchingUsers,
    isLoading: isLoadingUsers,
  } = useGetRequest();
  //call UPDATE hook
  const { mutateAsync: updateUser, isPending: isUpdatingUser } =
    useUpdateRequest();
  // ★ call DELETE hook
  const { mutateAsync: deleteUser, isPending: isDeletingUser } =
    useDeleteRequest();

  //CREATE action
  const handleCreateRequest = async ({ values, table }) => {
    await createUser(values);
    table.setCreatingRow(null); //exit creating mode
  };

  //UPDATE action
  const handleSaveRequest = async ({ values, table }) => {
    await updateUser(values);
    table.setEditingRow(null); //exit editing mode
  };

  // ★ DELETE action
  const openDeleteConfirmModal = (row) => {
    if (window.confirm("Та энэ мэдээллийг устгахдаа итгэлтэй байна уу?")) {
      deleteUser(row.original.id);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: fetchedResults, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    getRowId: (row) => row.id,
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableGrouping: true,
    enableColumnPinning: true,
    enableFacetedValues: true,
    enableRowActions: true,
    initialState: {
      showColumnFilters: false,
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
    onCreatingRowSave: handleCreateRequest,
    onEditingRowSave: handleSaveRequest,
    renderDetailPanel: ({ row }) => {
      return (
        <>
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
              justifyContent: "space-around",
              left: "30px",
              maxWidth: "1000px",
              position: "sticky",
              width: "100%",
            }}
          >
            <MUIStepper row={row} />
          </Box>
          <Grid container flexDirection="row" spacing={{ xs: 2, md: 3 }}>
            {Object.keys(row.original.Extra[0]).map(
              (key) =>
                row.original.Extra[0][key] && (
                  <Grid size={{ xs: 12, sm: 3 }} key={key}>
                    <TextField
                      value={row.original.Extra[0][key]}
                      label={key}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                ),
            )}
          </Grid>
        </>
      );
    },
    // ★ Хүсэлт устгах товч
    renderRowActionMenuItems: ({ row, closeMenu }) => [
      <MenuItem
        key="delete"
        onClick={() => {
          openDeleteConfirmModal(row);
          closeMenu();
        }}
        sx={{ m: 0 }}
      >
        <ListItemIcon>
          <DeleteIcon />
        </ListItemIcon>
        Устгах
      </MenuItem>,
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
            {/* import MRT sub-components */}
            <MRT_GlobalFilterTextField table={table} />
            <MRT_ToggleFiltersButton table={table} />
            <MRT_ShowHideColumnsButton table={table} />
            <MRT_ToggleDensePaddingButton table={table} />
            <MRT_ToggleFullScreenButton table={table} />
          </Box>
        </Box>
      );
    },

    state: {
      isLoading: isLoadingUsers,
      isSaving: isCreatingUser || isUpdatingUser || isDeletingUser,
      showAlertBanner: isLoadingUsersError,
      showProgressBars: isFetchingUsers,
    },
  });

  //CREATE hook (post new user to api)
  function useCreateRequest() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (user) => {
        //send api update request here
        await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
        return Promise.resolve();
      },
      //client side optimistic update
      onMutate: (newUserInfo) => {
        queryClient.setQueryData(["users"], (prevUsers) => [
          ...prevUsers,
          {
            ...newUserInfo,
            id: (Math.random() + 1).toString(36).substring(7),
          },
        ]);
      },
      // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
    });
  }

  //READ hook (get users from api)
  function useGetRequest() {
    return useQuery({
      queryKey: ["request"],
      queryFn: async () => {
        try {
          const fetchedResults = [];
          // ★ Бүх хүсэлтийг филтергүйгээр унших
          const snapshot = await get(ref(db, "request"));
          snapshot.forEach((childSnapshot) => {
            let rawData = childSnapshot.val();
            rawData["id"] = childSnapshot.key;
            fetchedResults.push(rawData);
          });
          return Promise.resolve(fetchedResults.reverse());
        } catch (error) {
          console.log(error);
          return [];
        }
      },
      refetchOnWindowFocus: false,
    });
  }

  //UPDATE hook (put user in api)
  function useUpdateRequest() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (request) => {
        //send api update request here
        const requestRef = ref(db, `request/${request.id}/`);
        await update(requestRef, request);
        return Promise.resolve();
      },
      onMutate: (newRequestInfo) => {
        queryClient.setQueryData(["request"], (prevRequests) =>
          prevRequests?.map((prevRequest) =>
            prevRequest.id === newRequestInfo.id ? newRequestInfo : prevRequest,
          ),
        );
      },
      onSettled: () => queryClient.invalidateQueries({ queryKey: ["request"] }), //refetch users after mutation, disabled for demo
    });
  }

  // ★ DELETE hook (delete user in api)
  function useDeleteRequest() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (requestId) => {
        try {
          await remove(ref(db, `request/${requestId}`));
          return Promise.resolve();
        } catch (error) {
          console.log(error);
        }
      },
      //client side optimistic update
      onMutate: (requestId) => {
        queryClient.setQueryData(["request"], (prevRequests) =>
          prevRequests?.filter((request) => request.id !== requestId),
        );
      },
      onSettled: () => queryClient.invalidateQueries({ queryKey: ["request"] }), //refetch users after mutation, disabled for demo
    });
  }

  return <MaterialReactTable table={table} />;
};

const queryClient = new QueryClient();

const ConfirmedRequestTable = ({ data }) => (
  //App.tsx or AppProviders file
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <QueryClientProvider client={queryClient}>
      <ReactAdvancedMaterialTable data={data} />
    </QueryClientProvider>
  </LocalizationProvider>
);

export default ConfirmedRequestTable;
