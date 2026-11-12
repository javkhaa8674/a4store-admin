/* eslint-disable react/jsx-pascal-case */
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useMemo } from "react";

//MRT Imports
import { Box, Grid, lighten, TextField } from "@mui/material";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import dayjs from "dayjs";
import {
  equalTo,
  get,
  orderByChild,
  query,
  ref,
  update,
} from "firebase/database";
import {
  MaterialReactTable,
  MRT_GlobalFilterTextField,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  useMaterialReactTable,
} from "material-react-table";
import { db } from "refrence/realConfig";
import MUIStepper from "../../components/MUIStepper";

const ReactAdvancedMaterialTable = () => {
  const userInfo = JSON.parse(localStorage.getItem("user"));

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
            Header: ({ column }) => <em>{column.columnDef.header}</em>, //custom header markup
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
      isSaving: isCreatingUser || isUpdatingUser,
      showAlertBanner: isLoadingUsersError,
      showProgressBars: isFetchingUsers,
    },
  });

  //CREATE hook (post new user to api)
  function useCreateRequest() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async () => {
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
        //send api request here
        try {
          let approver_status;
          if (userInfo.role === "system") {
            approver_status = "Approver3_Status";
          } else if (userInfo.role === "finance") {
            approver_status = "Approver2_Status";
          } else if (userInfo.role === "manager") {
            approver_status = "Approver1_Status";
          } else if (userInfo.role === "cs") {
            approver_status = "Requester_Status";
          } else if (userInfo.role === "director") {
            approver_status = "Approver4_status";
          }
          const fetchedResults = [];
          const que = query(
            ref(db, "request"),
            orderByChild(approver_status),
            equalTo("Цуцлагдсан"),
          );
          const snapshot = await get(que);
          snapshot.forEach((childSnapshot) => {
            let rawData = childSnapshot.val();
            rawData["id"] = childSnapshot.key;
            fetchedResults.push(rawData);
          });
          return Promise.resolve(fetchedResults.reverse());
        } catch (error) {
          console.log(error);
        }
        //await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
        //return Promise.resolve(data);
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

  return <MaterialReactTable table={table} />;
};

const queryClient = new QueryClient();

const CancelledRequestTable = ({ data }) => (
  //App.tsx or AppProviders file
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <QueryClientProvider client={queryClient}>
      <ReactAdvancedMaterialTable data={data} />
    </QueryClientProvider>
  </LocalizationProvider>
);

export default CancelledRequestTable;
