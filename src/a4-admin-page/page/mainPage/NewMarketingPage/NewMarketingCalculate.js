/* eslint-disable react/jsx-pascal-case */
import React, { useEffect, useMemo, useState } from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

//MRT Imports
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { get, ref, orderByChild, equalTo, query } from "firebase/database";
import {
  Box,
  lighten,
  Button,
  TextField,
  MenuItem,
  Tooltip,
  IconButton,
} from "@mui/material";
import { db } from "refrence/realConfig";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import TugrikFormatter from "../../components/TugrikFormatter";
import NewMarketingTeamStructure from "./TeamStructure";
import DoneIcon from "@mui/icons-material/Done";
import { Single, Double, Triple } from "./setData";

const ReactMaterialTable = ({ setCurrentPage, setData }) => {
  const [memberList, setMemberList] = useState([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [currentType, setCurrentType] = useState("");
  const [tableData, setTableData] = useState([]);
  const [receivedMoney, setReceivedMoney] = useState({
    promoSale: 0,
    promoEffort: 0,
    promoSuccess: 0,
    invite1person: 0,
    invite2person: 0,
    invite3person: 0,
    invite4person: 0,
    promoSaleStatus: 0,
    promoEffortStatus: 0,
    promoSuccessStatus: 0,
    invite1personStatus: 0,
    invite2personStatus: 0,
    invite3personStatus: 0,
    invite4personStatus: 0,
  });

  useEffect(() => {
    return () => {
      resetAllState();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetAllState = () => {
    let resetSet =
      currentType === "Single"
        ? Single
        : currentType === "Double"
          ? Double
          : Triple;
    resetSet.forEach((element) => {
      element.currentLevel = false;
      element.invite1personLevel = false;
      element.invite2personLevel = false;
      element.invite3personLevel = false;
      element.invite4personLevel = false;
    });
    setMemberList([]);
    setSelectedMember("");
    setCurrentType("");
    setTableData([]);
    setReceivedMoney({
      promoSale: 0,
      promoEffort: 0,
      promoSuccess: 0,
      invite1person: 0,
      invite2person: 0,
      invite3person: 0,
      invite4person: 0,
    });
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "level",
        header: "Үе",
        size: 100,
        muiTableBodyCellProps: ({ cell, row }) => ({
          sx: {
            backgroundColor: row.original.currentLevel
              ? "lightgreen"
              : "background.paper",
          },
        }),
      },
      {
        accessorKey: "price",
        filterVariant: "autocomplete",
        header: "Үнийн дүн",
        size: 100,
        muiTableBodyCellProps: ({ cell, row }) => ({
          sx: {
            backgroundColor: row.original.currentLevel
              ? "lightgreen"
              : "background.paper",
          },
        }),
        Cell: ({ cell }) => <TugrikFormatter amount={cell.getValue()} />,
        footer: selectedMember && "Олгосон мөнгөн дүн",
      },
      {
        accessorKey: "promoSale",
        filterVariant: "autocomplete",
        header: "Борлуулалтын урамшуулал",
        size: 100,
        Cell: ({ cell }) => <TugrikFormatter amount={cell.getValue()} />,
        footer:
          selectedMember &&
          `${new Intl.NumberFormat("mn-MN", { style: "decimal" }).format(
            receivedMoney.promoSaleStatus,
          )}₮`,
      },
      {
        accessorKey: "promoEffort",
        filterVariant: "autocomplete",
        header: "Идэвхийн урамшуулал",
        size: 100,
        Cell: ({ cell, row }) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            {row.original.level <= receivedMoney.promoEffortStatus && (
              <DoneIcon color="success" />
            )}
            <span>
              <TugrikFormatter amount={cell.getValue()} />
            </span>
          </Box>
        ),
        footer:
          selectedMember &&
          `${new Intl.NumberFormat("mn-MN", { style: "decimal" }).format(
            receivedMoney.promoEffortStatus,
          )}₮`,
      },
      {
        accessorKey: "promoSuccess",
        filterVariant: "autocomplete",
        header: "Амжилтын урамшуулал",
        size: 100,
        Cell: ({ cell, row }) => {
          return (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <span>
                <TugrikFormatter amount={cell.getValue()} />
              </span>
            </Box>
          );
        },
        footer:
          selectedMember &&
          `${new Intl.NumberFormat("mn-MN", { style: "decimal" }).format(
            receivedMoney.promoSuccessStatus,
          )}₮`,
      },
      {
        accessorKey: "promoCount",
        filterVariant: "autocomplete",
        header: "Урамшууллын дүн",
        size: 100,
        Cell: ({ row, cell }) => <TugrikFormatter amount={cell.getValue()} />,
        footer:
          selectedMember &&
          `${new Intl.NumberFormat("mn-MN", { style: "decimal" }).format(
            receivedMoney.promoSaleStatus +
              receivedMoney.promoEffortStatus +
              receivedMoney.promoSuccessStatus,
          )}₮`,
      },
      {
        accessorKey: "invite1person",
        filterVariant: "autocomplete",
        header: "Нэг хүн урихад",
        size: 100,
        muiTableBodyCellProps: ({ cell, row }) => ({
          sx: {
            backgroundColor: row.original.invite1personLevel
              ? "lightgreen"
              : "background.paper",
          },
        }),
        Cell: ({ cell, row }) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            {row.original.level <= receivedMoney.invite1personStatus && (
              <DoneIcon color="success" />
            )}
            <span>
              <TugrikFormatter amount={cell.getValue()} />
            </span>
          </Box>
        ),
        footer:
          selectedMember &&
          `${new Intl.NumberFormat("mn-MN", { style: "decimal" }).format(
            receivedMoney.invite1personStatus,
          )}₮`,
      },
      {
        accessorKey: "invite2person",
        filterVariant: "autocomplete",
        header: "Хоёр хүн урихад",
        size: 100,
        muiTableBodyCellProps: ({ cell, row }) => ({
          sx: {
            backgroundColor: row.original.invite2personLevel
              ? "lightgreen"
              : "background.paper",
          },
        }),
        Cell: ({ cell, row }) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            {row.original.level <= receivedMoney.invite2personStatus && (
              <DoneIcon color="success" />
            )}
            <span>
              <TugrikFormatter amount={cell.getValue()} />
            </span>
          </Box>
        ),
        footer:
          selectedMember &&
          `${new Intl.NumberFormat("mn-MN", { style: "decimal" }).format(
            receivedMoney.invite2personStatus,
          )}₮`,
      },
      {
        accessorKey: "invite3person",
        filterVariant: "autocomplete",
        header: "Гурван хүн урихад",
        size: 100,
        muiTableBodyCellProps: ({ cell, row }) => ({
          sx: {
            backgroundColor: row.original.invite3personLevel
              ? "lightgreen"
              : "background.paper",
          },
        }),
        Cell: ({ cell, row }) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            {row.original.level <= receivedMoney.invite3personStatus && (
              <DoneIcon color="success" />
            )}
            <span>
              <TugrikFormatter amount={cell.getValue()} />
            </span>
          </Box>
        ),
        footer:
          selectedMember &&
          `${new Intl.NumberFormat("mn-MN", { style: "decimal" }).format(
            receivedMoney.invite3personStatus,
          )}₮`,
      },
      {
        accessorKey: "invite4person",
        filterVariant: "autocomplete",
        header: "Дөрвөн хүн урихад",
        size: 100,
        muiTableBodyCellProps: ({ cell, row }) => ({
          sx: {
            backgroundColor: row.original.invite4personLevel
              ? "lightgreen"
              : "background.paper",
          },
        }),
        Cell: ({ cell, row }) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            {row.original.level <= receivedMoney.invite4personStatus && (
              <DoneIcon color="success" />
            )}
            <span>
              <TugrikFormatter amount={cell.getValue()} />
            </span>
          </Box>
        ),
        footer:
          selectedMember &&
          `${new Intl.NumberFormat("mn-MN", { style: "decimal" }).format(
            receivedMoney.invite4personStatus,
          )}₮`,
      },
      {
        accessorKey: "inviteCount",
        filterVariant: "autocomplete",
        header: "Урамшууллын дүн",
        size: 100,
        Cell: ({ cell }) => <TugrikFormatter amount={cell.getValue()} />,
        footer:
          selectedMember &&
          `${new Intl.NumberFormat("mn-MN", { style: "decimal" }).format(
            receivedMoney.invite1personStatus +
              receivedMoney.invite2personStatus +
              receivedMoney.invite3personStatus +
              receivedMoney.invite4personStatus,
          )}₮`,
      },
      {
        accessorKey: "total",
        filterVariant: "autocomplete",
        header: "Нийт урамшуулал",
        size: 100,
        Cell: ({ row, cell }) => <TugrikFormatter amount={cell.getValue()} />,
        footer:
          selectedMember &&
          `${new Intl.NumberFormat("mn-MN", { style: "decimal" }).format(
            receivedMoney.promoSaleStatus +
              receivedMoney.promoEffortStatus +
              receivedMoney.promoSuccessStatus +
              receivedMoney.invite1personStatus +
              receivedMoney.invite2personStatus +
              receivedMoney.invite3personStatus +
              receivedMoney.invite4personStatus,
          )}₮`,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [receivedMoney],
  );

  const handleSelectedType = async (e) => {
    const { value } = e.target;
    setMemberList([]);
    try {
      const memberRef = query(
        ref(db, "newMarketing/UserInfo"),
        orderByChild("type"),
        equalTo(value),
      );
      const memberResult = await get(memberRef);

      if (memberResult.exists()) {
        let memberData = Object.entries(memberResult.val()).map(
          ([id, data]) => ({
            id,
            ...data,
          }),
        );

        if (memberData.length > 0) {
          setMemberList(
            memberData
              .filter((obj) => obj.type === value)
              .sort((a, b) => a.phoneNumber - b.phoneNumber),
          );
          setCurrentType(value);
          setTableData(
            value === "Single" ? Single : value === "Double" ? Double : Triple,
          );
        } else {
          alert("no data found");
        }
      } else {
        setTableData([]);
        setCurrentType(value);
        alert("no data found");
      }
    } catch (error) {
      console.log(error);
      alert(error.message);
    }
  };

  const handleMemberInfo = async (e) => {
    const { value } = e.target;
    let mergedArray = [];
    try {
      const spoRef = query(
        ref(db, "newMarketing/UserInfo"),
        orderByChild("SponsorId"),
        equalTo(value.phoneNumber), // Энэ хүний доор хүн байгаа эсэхийг шалгана
      );
      const promotionRef = query(
        ref(db, "newMarketing/promotionTransaction"),
        orderByChild("ID"),
        equalTo(value.phoneNumber), //  Мөнгө авсан эсэхийг шалгана.
      );
      const spoResult = await get(spoRef);
      const promotionResult = await get(promotionRef);

      let rawTableData = tableData;
      rawTableData.forEach((element) => {
        element.currentLevel = false;
        element.invite1personLevel = false;
        element.invite2personLevel = false;
        element.invite3personLevel = false;
        element.invite4personLevel = false;
      });

      let paymentInfo = {
        promoSaleStatus: 0,
        promoEffortStatus: 0,
        promoSuccessStatus: 0,
        invite1personStatus: 0,
        invite2personStatus: 0,
        invite3personStatus: 0,
        invite4personStatus: 0,
      };

      // is member get money?
      if (promotionResult.exists()) {
        let promotionData = Object.entries(promotionResult.val()).map(
          ([id, data]) => ({
            id,
            ...data,
          }),
        );
        promotionData.filter((obj) => obj.Set === currentType);
        promotionData.forEach((element) => {
          if (element.Type === "Борлуулалтын урамшуулал") {
            paymentInfo.promoSaleStatus =
              paymentInfo.promoSaleStatus + element.Debit;
          } else if (element.Type === "Идэвхийн урамшуулал") {
            paymentInfo.promoEffortStatus =
              paymentInfo.promoEffortStatus + element.Debit;
          } else if (element.Type === "Амжилтын урамшуулал") {
            paymentInfo.promoSuccessStatus =
              paymentInfo.promoSuccessStatus + element.Debit;
          } else if (element.Type === "1-р хүн урьсан урамшуулал") {
            paymentInfo.invite1personStatus =
              paymentInfo.invite1personStatus + element.Debit;
          } else if (element.Type === "2-р хүн урьсан урамшуулал") {
            paymentInfo.invite2personStatus =
              paymentInfo.invite2personStatus + element.Debit;
          } else if (element.Type === "3-р хүн урьсан урамшуулал") {
            paymentInfo.invite3personStatus =
              paymentInfo.invite3personStatus + element.Debit;
          } else if (element.Type === "4-р хүн урьсан урамшуулал") {
            paymentInfo.invite4personStatus =
              paymentInfo.invite4personStatus + element.Debit;
          }
        });
      }

      if (spoResult.exists()) {
        let spoData = Object.entries(spoResult.val()).map(([id, data]) => ({
          id,
          ...data,
        }));
        spoData.filter((obj) => obj.type === currentType);

        mergedArray = [value, ...spoData];
        // reset rawTableData value

        mergedArray.forEach((element, index) => {
          if (index === 0) {
            rawTableData[element.Level - 1].currentLevel = true;
          }
          if (index === 1) {
            rawTableData[element.Level - 1].invite1personLevel = true;
          }
          if (index === 2) {
            rawTableData[element.Level - 1].invite2personLevel = true;
          }
          if (index === 3) {
            rawTableData[element.Level - 1].invite3personLevel = true;
          }
          if (index === 4) {
            rawTableData[element.Level - 1].invite4personLevel = true;
          }
        });

        setReceivedMoney(paymentInfo);
        setTableData(rawTableData);
        setSelectedMember(value);
      } else {
        let rawTableData = tableData;
        const mergedArray = [value];

        // reset rawTableData value
        rawTableData.forEach((element) => {
          element.currentLevel = false;
          element.invite1personLevel = false;
          element.invite2personLevel = false;
          element.invite3personLevel = false;
          element.invite4personLevel = false;
        });
        mergedArray.forEach((element, index) => {
          if (index === 0) {
            rawTableData[element.Level - 1].currentLevel = true;
          }
          if (index === 1) {
            rawTableData[element.Level - 1].invite1personLevel = true;
          }
          if (index === 2) {
            rawTableData[element.Level - 1].invite2personLevel = true;
          }
          if (index === 3) {
            rawTableData[element.Level - 1].invite3personLevel = true;
          }
          if (index === 4) {
            rawTableData[element.Level - 1].invite4personLevel = true;
          }
        });

        setTableData(rawTableData);
        setData(mergedArray);

        setSelectedMember(value);
      }

      setReceivedMoney(paymentInfo);
      setTableData(rawTableData);
      setData(mergedArray);
    } catch (error) {
      console.log(error);
      alert(error.message);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: tableData, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    getRowId: (row) => row.id,
    enableEditing: false,
    initialState: {
      columnPinning: {
        left: ["mrt-row-expand", "mrt-row-select"],
        right: ["mrt-row-actions"],
      },
      pagination: {
        pageSize: 20,
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
      rowsPerPageOptions: [20, 30, 40],
      shape: "rounded",
      variant: "outlined",
    },
    muiTableFooterRowProps: {
      sx: {
        "& .MuiTableCell-root": {
          fontSize: "18px", // Global text size for footer
          fontWeight: "bold",
        },
      },
    },
    renderTopToolbar: () => {
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
          <form>
            <Box sx={{ display: "flex", gap: "0.5rem" }}>
              <TextField
                id="selectType"
                select
                fullWidth
                label="Төрөл сонгох"
                defaultValue=""
                value={currentType}
                onChange={handleSelectedType}
                sx={{ width: "200px" }}
              >
                {["", "Single", "Double", "Triple"].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                id="selectMember"
                select
                fullWidth
                label="Гишүүнийг сонгох"
                value={selectedMember}
                onChange={handleMemberInfo}
                sx={{ width: "200px" }}
              >
                {memberList.map((option) => (
                  <MenuItem key={option.id} value={option}>
                    {option.phoneNumber}
                  </MenuItem>
                ))}
              </TextField>
              <Button
                startIcon={<AccountTreeIcon />}
                color="warning"
                disabled={!selectedMember}
                variant="contained"
                onClick={() => {
                  setCurrentPage("chart");
                }}
              >
                Багийн бүтэц
              </Button>
            </Box>
          </form>
        </Box>
      );
    },
  });

  return <MaterialReactTable table={table} enableFooter={true} />;
};

const queryClient = new QueryClient();

const NewMarketingCalculate = () => {
  const [currentPage, setCurrentPage] = useState("table");
  const [data, setData] = useState([]);

  return (
    //App.tsx or AppProviders file
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <QueryClientProvider client={queryClient}>
        {currentPage === "table" && (
          <ReactMaterialTable
            setCurrentPage={setCurrentPage}
            setData={setData}
          />
        )}
        {currentPage === "chart" && (
          <>
            <Tooltip title="Буцах">
              <IconButton
                aria-label="back"
                onClick={() => setCurrentPage("table")}
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
            <NewMarketingTeamStructure data={data} />
          </>
        )}
      </QueryClientProvider>
    </LocalizationProvider>
  );
};

export default NewMarketingCalculate;
