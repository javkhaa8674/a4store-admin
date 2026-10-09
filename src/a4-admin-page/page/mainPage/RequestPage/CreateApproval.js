/* eslint-disable react/jsx-pascal-case */
import React, { useEffect, useState } from "react";
import {
  AppBar,
  Box,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Toolbar,
  Typography,
  Fab,
  Divider,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import Slide from "@mui/material/Slide";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { get, ref, query, orderByChild, equalTo } from "firebase/database";
import InputAdornment from "@mui/material/InputAdornment";
import { AuthStore, addPost } from "store/AuthStore";
import { db } from "refrence/realConfig";
import "dayjs/locale/mn";
import dayjs from "dayjs";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const RequestType = [
  { value: "", label: "" },
  { value: "Уригч солих", label: "Уригч солих" },
  { value: "Спонсор солих", label: "Спонсор солих" },
  { value: "Дансны дугаар солих", label: "Дансны дугаар солих" },
  { value: "Овог солих", label: "Овог солих" },
  { value: "Нэр солих", label: "Нэр солих" },
  { value: "Буцаалт хийх", label: "Буцаалт хийх" },
  { value: "Бүтээгдэхүүн олголт", label: "Бүтээгдэхүүн олголт" },
  { value: "E-баримт олголт", label: "E-баримт олголт" },
  { value: "Нууц үг солиулах", label: "Нууц үг солиулах" },
  {
    value: "Худалдан авалт хийж болохгүй байгаа",
    label: "Худалдан авалт хийж болохгүй байгаа",
  },
  { value: "Бусад", label: "Бусад" },
];

const BankList = [
  "",
  "Худалдаа хөгжлийн банк",
  "Хаан банк",
  "Голомт банк",
  "Төрийн банк",
  "Тээвэр хөгжлийн банк",
  "Ариг банк",
  "Капитрон банк",
  "Үндэсний хөрөнгө оруулалтын банк",
  "Хас банк",
  "Богд банк",
  "Чингис Хаан банк",
  "М банк",
];

const cardData = [
  { title: "A багц", amount: 1500000 },
  { title: "B багц", amount: 1500000 },
  { title: "C багц", amount: 1500000 },
  { title: "D багц", amount: 1500000 },
  { title: "E багц", amount: 1500000 },
  { title: "F багц", amount: 1500000 },
  { title: "G багц", amount: 750000 },
  { title: "H багц", amount: 750000 },
  { title: "I багц", amount: 750000 },
  { title: "Тун удахгүй", amount: 0 },
  { title: "Скин бүүстер", amount: 1500000 },
  { title: "Exoriche нүүрний ком (3 set)", amount: 1500000 },
  { title: "Дөрвөн улирал амралт", amount: 1500000 },
  { title: "Хүн орхоодой (Үрлэн)", amount: 1500000 },
  { title: "Хүн орхоодой (Ваартай)", amount: 1500000 },
];

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CreateApproval = ({ open, setOpen }) => {
  const [ID, setID] = useState("");
  const [comment, setComment] = useState("");
  const [memberInfo, setMemberInfo] = useState({});
  const [userList, setUserList] = useState([
    {
      oldID: "",
      oldLastName: "",
      oldFirstName: "",
      newID: "",
      newLastName: "",
      newFirstName: "",
      oldBankName: "",
      oldBankNumber: "",
      newBankName: "",
      newBankNumber: "",
      productName: "",
      productNumber: "",
      count: "",
      ebarimt: "",
    },
  ]);
  const [selectedApprovalType, setSelectedApprovalType] = useState("");
  const [summary, setSummary] = useState({
    transactionCount: 0,
    ebarimtCount: 0,
    buyCount: 0,
    productCount: 0,
  });
  const { admin, loading, darkMode } = AuthStore.useState();
  const [sendData, setSendData] = useState({});
  const [isValid, setValid] = useState(false);
  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });
  const [statementData, setStatementData] = useState([]);
  const [buyData, setBuyData] = useState([]);
  const [ebarimtData, setEbarimtData] = useState([]);
  const [productData, setProductData] = useState([]);

  // ★ localStorage-с user мэдээлэл авах (fallback)
  const localUser = JSON.parse(localStorage.getItem("user") || "{}");

  // ★ photoURL болон email-г олон эх сурвалжаас авах
  const currentEmail =
    admin?.user?.email || admin?.userInfo?.email || localUser.email || "";
  const currentPhotoURL =
    admin?.user?.photoURL ||
    admin?.userInfo?.photoURL ||
    localUser.photoURL ||
    "";

  useEffect(() => {
    resetAllStates();
  }, [open]);

  const resetAllStates = () => {
    setUserList([
      {
        oldID: "",
        oldLastName: "",
        oldFirstName: "",
        newID: "",
        newLastName: "",
        newFirstName: "",
        oldBankName: "",
        oldBankNumber: "",
        newBankName: "",
        newBankNumber: "",
        productName: "",
        productNumber: "",
        count: "",
        ebarimt: "",
      },
    ]);
    setSendData({});
    setMemberInfo({});
    setSelectedApprovalType("");
    setID("");
    setSummary({
      transactionCount: 0,
      ebarimtCount: 0,
      buyCount: 0,
      productCount: 0,
    });
    setComment("");
    setStatementData([]);
    setBuyData([]);
    setEbarimtData([]);
    setProductData([]);
  };

  // ★ undefined утгуудыг цэвэрлэх helper
  const removeUndefined = (obj) => {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null),
    );
  };

  // ★ Шууд шийдвэрлэсэн sendData буцаах helper
  const buildSendData = () => {
    return {
      Requester_ID: currentEmail,
      Requester_Status: "Илгээсэн",
      Requester_Avatar: currentPhotoURL,
      Requester_Comment: comment || "",
      Requester_Major: "систем",
      // Approver = Requester (нэг хүн)
      Approver_ID: currentEmail,
      Approver_Status: "Шийдвэрлэсэн",
      Approver_Avatar: currentPhotoURL,
      Approver_Comment: comment || "",
      Approver_Major: "систем",
      Version: 5,
    };
  };

  const handleSearch = async (e, value) => {
    AuthStore.update((store) => {
      store.loading = true;
    });

    try {
      const dbRef = ref(db, "Members");
      const memberQuery = query(
        dbRef,
        orderByChild("phoneNumber"),
        equalTo(Number(value)),
      );
      const snapshot = await get(memberQuery);

      if (!snapshot.exists()) {
        AuthStore.update((store) => {
          store.actionText.title = "Амжилтгүй боллоо";
          store.actionText.body = "Бизнес эрхлэгч гишүүний бүртгэлгүй байна.";
          store.actionText.status = true;
          store.loading = false;
        });
        setID("");
        return [];
      }
      const fetchedResults = [];
      let rawData = snapshot.val();
      for (let key in rawData) {
        fetchedResults.unshift({
          ...rawData[key],
          id: key,
        });
      }
      setMemberInfo(fetchedResults[0]);

      if (
        [
          "Нууц үг солиулах",
          "Худалдан авалт хийж болохгүй байгаа",
          "Дансны дугаар солих",
          "Овог солих",
          "Нэр солих",
        ].includes(e.target.value)
      ) {
        setUserList([
          {
            oldID: "",
            oldLastName:
              e.target.value === "Овог солих" ? fetchedResults[0].lastName : "",
            oldFirstName:
              e.target.value === "Нэр солих" ? fetchedResults[0].firstName : "",
            oldBankName:
              e.target.value === "Дансны дугаар солих"
                ? fetchedResults[0].bankName
                : "",
            oldBankNumber:
              e.target.value === "Дансны дугаар солих"
                ? fetchedResults[0].accountNumber
                : "",
            newID: "",
            newLastName: "",
            newFirstName: "",
            newBankName: "",
            newBankNumber: "",
            productName: "",
            productNumber: "",
            count: "",
            ebarimt: "",
          },
        ]);
        setSendData(buildSendData());
      } else if (
        ["Бүтээгдэхүүн олголт", "E-баримт олголт"].includes(e.target.value)
      ) {
        if (e.target.value === "E-баримт олголт") {
          const statementRef = ref(db, "statements");
          const buyRef = ref(db, "userInfo");
          const ebarimtRef = ref(db, "ebarimt");
          const statementQuery = query(
            statementRef,
            orderByChild("memberId"),
            equalTo(Number(ID)),
          );
          const buyQuery = query(
            buyRef,
            orderByChild("MemberId"),
            equalTo(Number(ID)),
          );
          const ebarimtQuery = query(
            ebarimtRef,
            orderByChild("ID"),
            equalTo(ID),
          );
          const statementSnapshot = await get(statementQuery);
          const buySnapshot = await get(buyQuery);
          const ebarimtSnapshot = await get(ebarimtQuery);
          let buySum = 0;
          let ebarimtSum = 0;
          let statementSum = 0;
          let sdata = [],
            bdata = [],
            edata = [];
          if (statementSnapshot.exists()) {
            let statementSnap = statementSnapshot.val();
            for (let key in statementSnap) {
              sdata.unshift({ ...statementSnap[key], id: key });
              statementSum = statementSum + statementSnap[key].tranAmount;
            }
            setStatementData(sdata);
          }
          if (buySnapshot.exists()) {
            let buySnap = buySnapshot.val();
            for (let key in buySnap) {
              bdata.unshift({ ...buySnap[key], id: key });
            }
            buySum = Object.keys(buySnap).length;
            setBuyData(bdata);
          }
          if (ebarimtSnapshot.exists()) {
            let ebarimtSnap = ebarimtSnapshot.val();
            for (let key in ebarimtSnap) {
              edata.unshift({ ...ebarimtSnap[key], id: key });
              ebarimtSum = ebarimtSum + Number(ebarimtSnap[key].Count);
            }
            setEbarimtData(edata);
          }

          setSummary({
            ...summary,
            transactionCount: statementSum,
            buyCount: buySum * 1500000,
            ebarimtCount: ebarimtSum,
          });
        }
        if (e.target.value === "Бүтээгдэхүүн олголт") {
          const statementRef = ref(db, "statements");
          const buyRef = ref(db, "userInfo");
          const productRef = ref(db, "productdelivery");
          const statementQuery = query(
            statementRef,
            orderByChild("memberId"),
            equalTo(Number(ID)),
          );
          const buyQuery = query(
            buyRef,
            orderByChild("MemberId"),
            equalTo(Number(ID)),
          );
          const productQuery = query(
            productRef,
            orderByChild("ID"),
            equalTo(ID),
          );
          const statementSnapshot = await get(statementQuery);
          const buySnapshot = await get(buyQuery);
          const productSnapshot = await get(productQuery);
          let sdata = [],
            bdata = [],
            pdata = [];
          let buySum = 0,
            productSum = 0,
            statementSum = 0;
          if (statementSnapshot.exists()) {
            let statementSnap = statementSnapshot.val();
            for (let key in statementSnap) {
              sdata.unshift({ ...statementSnap[key], id: key });
              statementSum = statementSum + statementSnap[key].tranAmount;
            }
            setStatementData(sdata);
          }
          if (buySnapshot.exists()) {
            let buySnap = buySnapshot.val();
            for (let key in buySnap) {
              bdata.unshift({ ...buySnap[key], id: key });
            }
            buySum = Object.keys(buySnap).length;
            setBuyData(bdata);
          }
          if (productSnapshot.exists()) {
            let productSnap = productSnapshot.val();
            for (let key in productSnap) {
              pdata.unshift({ ...productSnap[key], id: key });
              productSum = productSum + Number(productSnap[key].Count);
            }
            setProductData(pdata);
          }
          setSummary({
            ...summary,
            transactionCount: statementSum / 1500000,
            buyCount: buySum,
            productCount: productSum,
          });
        }
        setSendData(buildSendData());
      } else if (
        ["Уригч солих", "Спонсор солих", "Бусад"].includes(e.target.value)
      ) {
        setUserList([
          {
            oldID: "",
            oldLastName: "",
            oldFirstName: "",
            oldBankName: "",
            oldBankNumber: "",
            newID: "",
            newLastName: "",
            newFirstName: "",
            newBankName: "",
            newBankNumber: "",
            productName: "",
            productNumber: "",
            count: "",
            ebarimt: "",
          },
        ]);
        setSendData(buildSendData());
      } else if (["Буцаалт хийх"].includes(e.target.value)) {
        const statementRef = ref(db, "statements");
        const buyRef = ref(db, "userInfo");
        const ebarimtRef = ref(db, "ebarimt");
        const productRef = ref(db, "productdelivery");
        const statementQuery = query(
          statementRef,
          orderByChild("memberId"),
          equalTo(Number(ID)),
        );
        const buyQuery = query(
          buyRef,
          orderByChild("MemberId"),
          equalTo(Number(ID)),
        );
        const productQuery = query(productRef, orderByChild("ID"), equalTo(ID));
        const ebarimtQuery = query(ebarimtRef, orderByChild("ID"), equalTo(ID));

        const statementSnapshot = await get(statementQuery);
        const buySnapshot = await get(buyQuery);
        const ebarimtSnapshot = await get(ebarimtQuery);
        const productSnapshot = await get(productQuery);
        let buySum = 0;
        let ebarimtSum = 0;
        let statementSum = 0;
        let productSum = 0;
        let sdata = [],
          bdata = [],
          edata = [],
          pdata = [];

        if (statementSnapshot.exists()) {
          let statementSnap = statementSnapshot.val();
          for (let key in statementSnap) {
            sdata.unshift({ ...statementSnap[key], id: key });
            statementSum = statementSum + statementSnap[key].tranAmount;
          }
          setStatementData(sdata);
        }
        if (buySnapshot.exists()) {
          let buySnap = buySnapshot.val();
          for (let key in buySnap) {
            bdata.unshift({ ...buySnap[key], id: key });
          }
          buySum = Object.keys(buySnap).length;
          setBuyData(bdata);
        }
        if (ebarimtSnapshot.exists()) {
          let ebarimtSnap = ebarimtSnapshot.val();
          for (let key in ebarimtSnap) {
            edata.unshift({ ...ebarimtSnap[key], id: key });
            ebarimtSum = ebarimtSum + Number(ebarimtSnap[key].Count);
          }
          setEbarimtData(edata);
        }
        if (productSnapshot.exists()) {
          let productSnap = productSnapshot.val();
          for (let key in productSnap) {
            pdata.unshift({ ...productSnap[key], id: key });
            productSum = productSum + Number(productSnap[key].Count);
          }
          setProductData(pdata);
        }

        setSummary({
          ...summary,
          transactionCount: statementSum,
          buyCount: buySum * 1500000,
          ebarimtCount: ebarimtSum,
          productCount: productSum,
        });
        setSendData(buildSendData());
      } else {
        setUserList([
          {
            oldID: "",
            oldLastName: "",
            oldFirstName: "",
            oldBankName: "",
            oldBankNumber: "",
            newID: "",
            newLastName: "",
            newFirstName: "",
            newBankName: "",
            newBankNumber: "",
            productName: "",
            productNumber: "",
            count: "",
            ebarimt: "",
          },
        ]);
      }
      setSelectedApprovalType(e.target.value);

      AuthStore.update((store) => {
        store.loading = false;
      });
    } catch (error) {
      console.log(error);
    } finally {
      AuthStore.update((store) => {
        store.loading = false;
      });
    }
  };

  const handleUserAdd = () => {
    setUserList([
      ...userList,
      {
        oldID: "",
        oldName: "",
        newID: "",
        newName: "",
        oldBankName: "",
        oldBankNumber: "",
        newBankName: "",
        newBankNumber: "",
        productName: "",
        productPrice: "",
        productNumber: "",
        count: "",
        ebarimt: "",
        calc: "",
        bonusCalc: "",
      },
    ]);
  };

  const handleUserRemove = (index) => {
    const list = [...userList];
    list.splice(index, 1);
    setUserList(list);
  };

  const handleUserChange = (e, index) => {
    const { name, value } = e.target;
    const list = [...userList];
    list[index][name] = value;
    setUserList(list);
    validation();
  };

  const validation = () => {
    if (!Object.keys(memberInfo).length) {
      setValid(false);
      return false;
    }
    if (!selectedApprovalType) {
      setValid(false);
      return false;
    }
    setValid(true);
    return true;
  };

  const handleSubmit = async (e, index) => {
    if (!validation()) {
      AuthStore.update((store) => {
        store.actionText.title = "Амжилтгүй боллоо";
        store.actionText.body = "Мэдээллийг бүрэн бөглөнө үү.";
        store.actionText.status = true;
      });
      return;
    }

    const TimeStamps = Date.now();

    // ★ Requester = Approver нэг хүн, шууд шийдвэрлэсэн
    let sent = {
      ...sendData,
      // Requester
      Requester_ID: currentEmail,
      Requester_TimeStamps: TimeStamps,
      Requester_Major: "систем",
      Requester_Comment: comment || "",
      Requester_Status: "Илгээсэн",
      Requester_Avatar: currentPhotoURL,
      // Approver (нэг хүн)
      Approver_ID: currentEmail,
      Approver_TimeStamps: TimeStamps,
      Approver_Major: "систем",
      Approver_Comment: comment || "",
      Approver_Status: "Шийдвэрлэсэн",
      Approver_Avatar: currentPhotoURL,
      // Ерөнхий
      Status: "Шийдвэрлэсэн",
      Level: 2,
      TimeStamps: TimeStamps,
      Name: `${memberInfo.lastName || ""}${memberInfo.firstName || ""}`,
      ID: ID || "",
      ApprovalType: selectedApprovalType || "",
      Extra: userList,
    };

    sent = removeUndefined(sent);

    console.log("sent", sent);
    AuthStore.update((store) => {
      store.loading = true;
    });

    try {
      // ★ 1. Хүсэлтийг хадгалах
      const result = await addPost(`request/`, sent);

      if (result.success) {
        // ★ 2. E-баримт олголт бол ebarimt/ руу бичих
        if (selectedApprovalType === "E-баримт олголт") {
          const ebarimtData = {
            Requester_TimeStamps: TimeStamps,
            Count: userList[0].ebarimt,
            TimeStamps: TimeStamps,
            ID: ID,
            Name: `${memberInfo.lastName || ""}${memberInfo.firstName || ""}`,
            Description: comment || "",
          };
          await addPost("ebarimt/", ebarimtData);
        }

        // ★ 3. Бүтээгдэхүүн олголт бол productdelivery/ руу бичих
        if (selectedApprovalType === "Бүтээгдэхүүн олголт") {
          const productDeliveryData = {
            Requester_TimeStamps: TimeStamps,
            Count: userList[0].productNumber,
            TimeStamps: TimeStamps,
            ID: ID,
            Name: `${memberInfo.lastName || ""}${memberInfo.firstName || ""}`,
            ProductName: userList[0].productName,
            Description: comment || "",
            ProductCount: userList[0].productNumber,
          };
          await addPost("productdelivery/", productDeliveryData);
        }

        // ★ 4. Буцаалт хийх бол cancelContract/ руу бичих
        if (selectedApprovalType === "Буцаалт хийх") {
          const cancelData = {
            Requester_TimeStamps: TimeStamps,
            TimeStamps: TimeStamps,
            ConfirmedTimeStamps: TimeStamps,
            Name: `${memberInfo.lastName || ""}${memberInfo.firstName || ""}`,
            ID: ID,
            Count: userList[0].count,
            Description: comment || "",
            Calc: userList[0].calc,
            BonusCalc: userList[0].bonusCalc,
          };
          await addPost("cancelContract/", cancelData);
        }

        AuthStore.update((store) => {
          store.actionText.title = "Амжилттай";
          store.actionText.body = "Хүсэлтийг амжилттай шийдвэрлэлээ.";
          store.actionText.status = true;
        });
      }
    } catch (error) {
      AuthStore.update((store) => {
        store.actionText.title = "Таны хүсэлт амжилтгүй боллоо";
        store.actionText.body = error;
        store.actionText.status = true;
      });
    } finally {
      AuthStore.update((store) => {
        store.loading = false;
      });
      setOpen(!open);
      setID("");
      setComment("");
      setSelectedApprovalType("");
      setSummary({});
    }
  };

  const numberWithCommas = (x) => {
    x = x.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x)) x = x.replace(pattern, "$1,$2");
    return x;
  };

  return (
    <ThemeProvider theme={theme}>
      <Dialog
        fullScreen
        open={open}
        onClose={() => {
          setOpen(!open);
          resetAllStates();
        }}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => {
                setOpen(false);
                resetAllStates();
              }}
              aria-label="close"
            >
              <CloseIcon sx={{ color: "inherit" }} />
            </IconButton>
            <Typography
              sx={{ ml: 2, flex: 1 }}
              variant="h6"
              component="div"
              color="inherit"
            >
              Шинэ хүсэлт
            </Typography>
          </Toolbar>
        </AppBar>
        <Box
          sx={{
            display: "flex",
            margin: 5,
            justifyContent: "center",
            flexDirection: "row",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <FormControl>
              <Grid container spacing={1}>
                <Grid
                  size={{ xs: 12 }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 2,
                  }}
                >
                  <Grid flexDirection="column" size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      id="search-type"
                      label="ID хайх..."
                      value={ID}
                      onChange={(e) => setID(e.target.value)}
                      type="number"
                      sx={{ marginBottom: 2 }}
                    />
                    <TextField
                      fullWidth
                      id="Select-approval-type"
                      select
                      label="Хүсэлтийн төрөл"
                      value={selectedApprovalType}
                      onChange={(e) => {
                        !ID.length
                          ? alert("Та утасны дугаарыг оруулна уу.")
                          : ID.length !== 8
                            ? alert(
                                "Та утасны дугаараа зөв оруулсан эсэхийг шалгана уу.",
                              )
                            : handleSearch(e, ID);
                      }}
                    >
                      {RequestType.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              </Grid>

              {/* Уригч солих */}
              <Grid container spacing={1}>
                {selectedApprovalType === "Уригч солих" && (
                  <Grid size={{ xs: 12 }}>
                    {userList.map((singleUser, index) => (
                      <Grid
                        key={index}
                        size={{ xs: 12 }}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Grid sx={{ display: "flex", flexDirection: "column" }}>
                          <TextField
                            fullWidth
                            name="oldID"
                            label="Хуучин ID"
                            type="number"
                            value={singleUser.oldID}
                            onChange={(e) => handleUserChange(e, index)}
                          />
                          <TextField
                            fullWidth
                            name="oldName"
                            label="Хуучин нэр"
                            value={singleUser.oldName}
                            onChange={(e) => handleUserChange(e, index)}
                          />
                        </Grid>
                        {userList.length - 1 === index ? (
                          <Fab
                            color="primary"
                            size="small"
                            sx={{ margin: 1 }}
                            onClick={handleUserAdd}
                          >
                            <AddIcon />
                          </Fab>
                        ) : (
                          <Fab
                            color="error"
                            size="small"
                            sx={{ margin: 1 }}
                            onClick={() => handleUserRemove(index)}
                          >
                            <RemoveIcon />
                          </Fab>
                        )}
                        <Grid sx={{ display: "flex", flexDirection: "column" }}>
                          <TextField
                            fullWidth
                            name="newID"
                            label="Шинэ ID"
                            type="number"
                            value={singleUser.newID}
                            onChange={(e) => handleUserChange(e, index)}
                          />
                          <TextField
                            fullWidth
                            name="newName"
                            label="Шинэ нэр"
                            value={singleUser.newName}
                            onChange={(e) => handleUserChange(e, index)}
                          />
                        </Grid>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Grid>

              {/* Спонсор солих */}
              <Grid container spacing={1}>
                {selectedApprovalType === "Спонсор солих" && (
                  <Grid size={{ xs: 12 }}>
                    {userList.map((singleUser, index) => (
                      <Grid
                        key={index}
                        size={{ xs: 12 }}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Grid sx={{ display: "flex", flexDirection: "column" }}>
                          <TextField
                            fullWidth
                            name="oldID"
                            label="Хуучин ID"
                            type="number"
                            value={singleUser.oldID}
                            onChange={(e) => handleUserChange(e, index)}
                          />
                          <TextField
                            fullWidth
                            name="oldName"
                            label="Хуучин нэр"
                            value={singleUser.oldName}
                            onChange={(e) => handleUserChange(e, index)}
                          />
                        </Grid>
                        {userList.length - 1 === index ? (
                          <Fab
                            color="primary"
                            size="small"
                            sx={{ margin: 1 }}
                            onClick={handleUserAdd}
                          >
                            <AddIcon />
                          </Fab>
                        ) : (
                          <Fab
                            color="error"
                            size="small"
                            sx={{ margin: 1 }}
                            onClick={() => handleUserRemove(index)}
                          >
                            <RemoveIcon />
                          </Fab>
                        )}
                        <Grid sx={{ display: "flex", flexDirection: "column" }}>
                          <TextField
                            fullWidth
                            name="newID"
                            label="Шинэ ID"
                            type="number"
                            value={singleUser.newID}
                            onChange={(e) => handleUserChange(e, index)}
                          />
                          <TextField
                            fullWidth
                            name="newName"
                            label="Шинэ нэр"
                            value={singleUser.newName}
                            onChange={(e) => handleUserChange(e, index)}
                          />
                        </Grid>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Grid>

              {/* Дансны дугаар солих */}
              <Grid container spacing={1}>
                {selectedApprovalType === "Дансны дугаар солих" && (
                  <Grid size={{ xs: 12 }}>
                    {userList.map((singleUser, index) => (
                      <Grid
                        key={index}
                        size={{ xs: 12 }}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Grid sx={{ flexDirection: "column" }}>
                          <TextField
                            fullWidth
                            name="oldBankName"
                            label="Хуучин банк"
                            value={singleUser.oldBankName || ""}
                          />
                          <TextField
                            fullWidth
                            name="oldBankNumber"
                            label="Хуучин данс"
                            type="number"
                            value={singleUser.oldBankNumber}
                            onChange={(e) => handleUserChange(e, index)}
                          />
                        </Grid>
                        {userList.length - 1 === index ? (
                          <Fab
                            color="primary"
                            size="small"
                            sx={{ margin: 1 }}
                            onClick={handleUserAdd}
                          >
                            <AddIcon />
                          </Fab>
                        ) : (
                          <Fab
                            color="error"
                            size="small"
                            sx={{ margin: 1 }}
                            onClick={() => handleUserRemove(index)}
                          >
                            <RemoveIcon />
                          </Fab>
                        )}
                        <Grid sx={{ flexDirection: "column" }}>
                          <TextField
                            fullWidth
                            name="newBankName"
                            label="Шинэ банк"
                            select
                            value={singleUser.newBankName}
                            onChange={(e) => handleUserChange(e, index)}
                          >
                            {BankList.map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </TextField>
                          <TextField
                            fullWidth
                            name="newBankNumber"
                            label="Шинэ данс"
                            type="number"
                            value={singleUser.newBankNumber}
                            onChange={(e) => handleUserChange(e, index)}
                          />
                        </Grid>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Grid>

              {/* Овог солих */}
              <Grid container spacing={1} sx={{ marginTop: 1 }}>
                {selectedApprovalType === "Овог солих" && (
                  <Grid size={{ xs: 12 }}>
                    {userList.map((singleUser, index) => (
                      <Grid
                        key={index}
                        size={{ xs: 12 }}
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <TextField
                          fullWidth
                          name="oldLastName"
                          label="Хуучин овог"
                          value={singleUser.oldLastName}
                          onChange={(e) => handleUserChange(e, index)}
                        />
                        <TextField
                          fullWidth
                          name="newLastName"
                          label="Шинэ овог"
                          value={singleUser.newLastName}
                          onChange={(e) => handleUserChange(e, index)}
                          sx={{ marginLeft: 1 }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Grid>

              {/* Нэр солих */}
              <Grid container spacing={1} sx={{ marginTop: 1 }}>
                {selectedApprovalType === "Нэр солих" && (
                  <Grid size={{ xs: 12 }}>
                    {userList.map((singleUser, index) => (
                      <Grid
                        key={index}
                        size={{ xs: 12 }}
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <TextField
                          fullWidth
                          name="oldFirstName"
                          label="Хуучин нэр"
                          value={singleUser.oldFirstName}
                          onChange={(e) => handleUserChange(e, index)}
                        />
                        <TextField
                          fullWidth
                          name="newFirstName"
                          label="Шинэ нэр"
                          value={singleUser.newFirstName}
                          onChange={(e) => handleUserChange(e, index)}
                          sx={{ marginLeft: 1 }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Grid>

              {/* Худалдан авалт хийж болохгүй байгаа */}
              <Grid container spacing={1} sx={{ marginTop: 1 }}>
                {selectedApprovalType ===
                  "Худалдан авалт хийж болохгүй байгаа" && (
                  <Grid size={{ xs: 12 }}>
                    {userList.map((singleUser, index) => (
                      <Grid
                        key={index}
                        size={{ xs: 12 }}
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <TextField
                          fullWidth
                          name="count"
                          label="Дүн"
                          type="number"
                          value={singleUser.count}
                          onChange={(e) => handleUserChange(e, index)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                ₮
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Grid>

              {/* Буцаалт хийх */}
              <Grid
                container
                spacing={1}
                columnSpacing={{ xs: 2, sm: 2, md: 3 }}
                sx={{ marginTop: 1 }}
              >
                {selectedApprovalType === "Буцаалт хийх" && (
                  <>
                    <Grid size={{ xs: 12 }}>
                      {userList.map((singleUser, index) => (
                        <div key={index}>
                          <TextField
                            fullWidth
                            name="calc"
                            label="Бодолт"
                            type="number"
                            value={singleUser.calc}
                            onChange={(e) => handleUserChange(e, index)}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  ₮
                                </InputAdornment>
                              ),
                            }}
                          />
                          <TextField
                            fullWidth
                            name="bonusCalc"
                            label="Бонус бодолт"
                            type="number"
                            value={singleUser.bonusCalc}
                            onChange={(e) => handleUserChange(e, index)}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  ₮
                                </InputAdornment>
                              ),
                            }}
                            sx={{ marginTop: 2 }}
                          />
                        </div>
                      ))}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12 }} sx={{ marginBottom: 2 }}>
                      <Typography variant="body2" align="center">
                        Гишүүний мэдээлэл
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12 }} justifyContent="center">
                      <Box>
                        <Accordion>
                          <AccordionSummary>
                            <Typography variant="body2">
                              Овог нэр:{" "}
                              <strong>
                                {Object.keys(memberInfo).length === 0
                                  ? ""
                                  : `${memberInfo.lastName} ${memberInfo.firstName}`}
                              </strong>
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails></AccordionDetails>
                        </Accordion>
                        <Accordion>
                          <AccordionSummary>
                            <Typography variant="body2">
                              Үлдсэн дүн:{" "}
                              <strong>
                                {numberWithCommas(
                                  summary.transactionCount -
                                    summary.ebarimtCount,
                                )}{" "}
                                ₮
                              </strong>
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails></AccordionDetails>
                        </Accordion>
                        <Accordion>
                          <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
                            <Typography variant="body2">
                              Е-баримт авсан дүн:{" "}
                              <strong>
                                {numberWithCommas(summary.ebarimtCount)} ₮
                              </strong>
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Box
                              sx={{
                                width: "100%",
                                bgcolor: "background.paper",
                                borderRadius: 2,
                                boxShadow: 3,
                                p: 2,
                                overflowX: "auto",
                                height: 300,
                              }}
                            >
                              <List>
                                <Divider />
                                {ebarimtData.map((transaction, index) => (
                                  <div key={index}>
                                    <ListItem
                                      sx={{
                                        backgroundColor: "#e0e0e0",
                                        color: "black",
                                        borderRadius: 2,
                                        mb: 1,
                                      }}
                                    >
                                      <ListItemText
                                        primary={transaction.Description}
                                        secondary={dayjs(
                                          transaction.TimeStamps,
                                        ).format("YYYY-MM-DD HH:mm:ss")}
                                      />
                                      <Typography variant="body2">
                                        {numberWithCommas(transaction.Count)}₮
                                      </Typography>
                                    </ListItem>
                                  </div>
                                ))}
                              </List>
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                        <Accordion>
                          <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
                            <Typography variant="body2">
                              Бүтээгдэхүүн авсан хэмжээ:{" "}
                              <strong>
                                {numberWithCommas(summary.productCount)} ширхэг
                              </strong>
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Box
                              sx={{
                                width: "100%",
                                bgcolor: "background.paper",
                                borderRadius: 2,
                                boxShadow: 3,
                                p: 2,
                                overflowX: "auto",
                                height: 300,
                              }}
                            >
                              <List>
                                <Divider />
                                {productData.map((transaction, index) => (
                                  <div key={index}>
                                    <ListItem
                                      sx={{
                                        backgroundColor: "#e0e0e0",
                                        color: "black",
                                        borderRadius: 2,
                                        mb: 1,
                                      }}
                                    >
                                      <ListItemText
                                        primary={transaction.Description}
                                        secondary={dayjs(
                                          transaction.TimeStamps,
                                        ).format("YYYY-MM-DD HH:mm:ss")}
                                      />
                                      <Typography variant="body2">
                                        {numberWithCommas(transaction.Count)}
                                        ширхэг
                                      </Typography>
                                    </ListItem>
                                  </div>
                                ))}
                              </List>
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                        <Accordion>
                          <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
                            <Typography variant="body2">
                              Худалдаж авсан дүн:{" "}
                              <strong>
                                {numberWithCommas(summary.buyCount)} ₮
                              </strong>
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Box
                              sx={{
                                width: "100%",
                                bgcolor: "background.paper",
                                borderRadius: 2,
                                boxShadow: 3,
                                p: 2,
                                overflowX: "auto",
                                height: 300,
                              }}
                            >
                              <List>
                                <Divider />
                                {buyData.map((transaction, index) => (
                                  <div key={index}>
                                    <ListItem
                                      sx={{
                                        backgroundColor: "#e0e0e0",
                                        color: "black",
                                        borderRadius: 2,
                                        mb: 1,
                                      }}
                                    >
                                      <ListItemText
                                        primary={transaction.ProductName}
                                        secondary={dayjs(
                                          transaction.timeStamp,
                                        ).format("YYYY-MM-DD HH:mm:ss")}
                                      />
                                    </ListItem>
                                  </div>
                                ))}
                              </List>
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                        <Accordion>
                          <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
                            <Typography variant="body2">
                              Гүйлгээний дүн:{" "}
                              <strong>
                                {numberWithCommas(summary.transactionCount)} ₮
                              </strong>
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Box
                              sx={{
                                width: "100%",
                                backgroundColor: "#e0e0e0",
                                borderRadius: 2,
                                boxShadow: 3,
                                p: 2,
                                overflowX: "auto",
                                height: 300,
                              }}
                            >
                              <List>
                                <Divider />
                                {statementData.map((transaction, index) => (
                                  <div key={index}>
                                    <ListItem
                                      sx={{
                                        backgroundColor: "#e0e0e0",
                                        color: "black",
                                        borderRadius: 2,
                                        mb: 1,
                                      }}
                                    >
                                      <ListItemText
                                        primary={`${transaction.accName} ${transaction.accNum}`}
                                        secondary={dayjs(
                                          transaction.tranPostedDate,
                                        ).format("YYYY-MM-DD HH:mm:ss")}
                                      />
                                      <Typography variant="body2">
                                        {numberWithCommas(
                                          transaction.tranAmount,
                                        )}
                                        ₮
                                      </Typography>
                                    </ListItem>
                                  </div>
                                ))}
                              </List>
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      </Box>
                    </Grid>
                  </>
                )}
              </Grid>

              {/* E-баримт олголт */}
              <Grid
                container
                spacing={1}
                columnSpacing={{ xs: 2, sm: 2, md: 3 }}
                sx={{ marginTop: 1 }}
              >
                {selectedApprovalType === "E-баримт олголт" && (
                  <>
                    <Grid size={{ xs: 12, sm: 12 }}>
                      {userList.map((singleUser, index) => (
                        <TextField
                          key={index}
                          fullWidth
                          name="ebarimt"
                          label="Дүн"
                          type="number"
                          value={singleUser.ebarimt}
                          onChange={(e) => handleUserChange(e, index)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                ₮
                              </InputAdornment>
                            ),
                          }}
                        />
                      ))}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12 }} sx={{ marginBottom: 2 }}>
                      <Typography variant="body2" align="center">
                        Гишүүний мэдээлэл
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12 }} justifyContent="center">
                      <Box>
                        <Accordion>
                          <AccordionSummary>
                            <Typography variant="body2">
                              Овог нэр:{" "}
                              <strong>
                                {Object.keys(memberInfo).length === 0
                                  ? ""
                                  : `${memberInfo.lastName} ${memberInfo.firstName}`}
                              </strong>
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails></AccordionDetails>
                        </Accordion>
                        <Accordion>
                          <AccordionSummary>
                            <Typography variant="body2">
                              Үлдсэн дүн:{" "}
                              <strong>
                                {numberWithCommas(
                                  summary.transactionCount -
                                    summary.ebarimtCount,
                                )}{" "}
                                ₮
                              </strong>
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails></AccordionDetails>
                        </Accordion>
                        <Accordion>
                          <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
                            <Typography variant="body2">
                              Е-баримт авсан дүн:{" "}
                              <strong>
                                {numberWithCommas(summary.ebarimtCount)} ₮
                              </strong>
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Box
                              sx={{
                                width: "100%",
                                bgcolor: "background.paper",
                                borderRadius: 2,
                                boxShadow: 3,
                                p: 2,
                                overflowX: "auto",
                                height: 300,
                              }}
                            >
                              <List>
                                <Divider />
                                {ebarimtData.map((transaction, index) => (
                                  <div key={index}>
                                    <ListItem
                                      sx={{
                                        backgroundColor: "#e0e0e0",
                                        color: "black",
                                        borderRadius: 2,
                                        mb: 1,
                                      }}
                                    >
                                      <ListItemText
                                        primary={transaction.Description}
                                        secondary={dayjs(
                                          transaction.TimeStamps,
                                        ).format("YYYY-MM-DD HH:mm:ss")}
                                      />
                                      <Typography variant="body2">
                                        {numberWithCommas(transaction.Count)}₮
                                      </Typography>
                                    </ListItem>
                                  </div>
                                ))}
                              </List>
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                        <Accordion>
                          <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
                            <Typography variant="body2">
                              Худалдаж авсан дүн:{" "}
                              <strong>
                                {numberWithCommas(summary.buyCount)} ₮
                              </strong>
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Box
                              sx={{
                                width: "100%",
                                bgcolor: "background.paper",
                                borderRadius: 2,
                                boxShadow: 3,
                                p: 2,
                                overflowX: "auto",
                                height: 300,
                              }}
                            >
                              <List>
                                <Divider />
                                {buyData.map((transaction, index) => (
                                  <div key={index}>
                                    <ListItem
                                      sx={{
                                        backgroundColor: "#e0e0e0",
                                        color: "black",
                                        borderRadius: 2,
                                        mb: 1,
                                      }}
                                    >
                                      <ListItemText
                                        primary={transaction.ProductName}
                                        secondary={dayjs(
                                          transaction.timeStamp,
                                        ).format("YYYY-MM-DD HH:mm:ss")}
                                      />
                                    </ListItem>
                                  </div>
                                ))}
                              </List>
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                        <Accordion>
                          <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
                            <Typography variant="body2">
                              Гүйлгээний дүн:{" "}
                              <strong>
                                {numberWithCommas(summary.transactionCount)} ₮
                              </strong>
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Box
                              sx={{
                                width: "100%",
                                backgroundColor: "#e0e0e0",
                                borderRadius: 2,
                                boxShadow: 3,
                                p: 2,
                                overflowX: "auto",
                                height: 300,
                              }}
                            >
                              <List>
                                <Divider />
                                {statementData.map((transaction, index) => (
                                  <div key={index}>
                                    <ListItem
                                      sx={{
                                        backgroundColor: "#e0e0e0",
                                        color: "black",
                                        borderRadius: 2,
                                        mb: 1,
                                      }}
                                    >
                                      <ListItemText
                                        primary={`${transaction.accName} ${transaction.accNum}`}
                                        secondary={dayjs(
                                          transaction.tranPostedDate,
                                        ).format("YYYY-MM-DD HH:mm:ss")}
                                      />
                                      <Typography variant="body2">
                                        {numberWithCommas(
                                          transaction.tranAmount,
                                        )}
                                        ₮
                                      </Typography>
                                    </ListItem>
                                  </div>
                                ))}
                              </List>
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      </Box>
                    </Grid>
                  </>
                )}
              </Grid>

              {/* Бүтээгдэхүүн олголт */}
              <Grid container spacing={1} sx={{ marginTop: 1 }}>
                {selectedApprovalType === "Бүтээгдэхүүн олголт" && (
                  <>
                    <Grid size={{ xs: 12 }}>
                      {userList.map((singleUser, index) => (
                        <div key={index}>
                          <TextField
                            fullWidth
                            name="productName"
                            label="Бүтээгдэхүүний нэр"
                            select
                            value={singleUser.productName}
                            onChange={(e) => handleUserChange(e, index)}
                          >
                            {cardData.map((option) => (
                              <MenuItem key={option.title} value={option.title}>
                                {option.title} - {option.amount}₮
                              </MenuItem>
                            ))}
                          </TextField>
                          <TextField
                            fullWidth
                            name="productNumber"
                            label="Бүтээгдэхүүний тоо"
                            type="number"
                            value={singleUser.productNumber}
                            onChange={(e) => handleUserChange(e, index)}
                            sx={{ marginTop: 2 }}
                          />
                        </div>
                      ))}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12 }} sx={{ marginBottom: 2 }}>
                      <Typography variant="body2" align="center">
                        Гишүүний мэдээлэл
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12 }} justifyContent="center">
                      <Box>
                        <Accordion>
                          <AccordionSummary>
                            <Typography variant="body2">
                              Овог нэр:{" "}
                              <strong>
                                {Object.keys(memberInfo).length === 0
                                  ? ""
                                  : `${memberInfo.lastName} ${memberInfo.firstName}`}
                              </strong>
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails></AccordionDetails>
                        </Accordion>
                        <Accordion>
                          <AccordionSummary>
                            <Typography variant="body2">
                              Үлдсэн хэмжээ:{" "}
                              <strong>
                                {numberWithCommas(
                                  summary.transactionCount -
                                    summary.productCount,
                                )}{" "}
                                ширхэг
                              </strong>
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails></AccordionDetails>
                        </Accordion>
                        <Accordion>
                          <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
                            <Typography variant="body2">
                              Бүтээгдэхүүн авсан хэмжээ:{" "}
                              <strong>
                                {numberWithCommas(summary.productCount)} ширхэг
                              </strong>
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Box
                              sx={{
                                width: "100%",
                                bgcolor: "background.paper",
                                borderRadius: 2,
                                boxShadow: 3,
                                p: 2,
                                overflowX: "auto",
                                height: 300,
                              }}
                            >
                              <List>
                                <Divider />
                                {productData.map((transaction, index) => (
                                  <div key={index}>
                                    <ListItem
                                      sx={{
                                        backgroundColor: "#e0e0e0",
                                        color: "black",
                                        borderRadius: 2,
                                        mb: 1,
                                      }}
                                    >
                                      <ListItemText
                                        primary={transaction.Description}
                                        secondary={dayjs(
                                          transaction.TimeStamps,
                                        ).format("YYYY-MM-DD HH:mm:ss")}
                                      />
                                      <Typography variant="body2">
                                        {numberWithCommas(transaction.Count)}
                                        ширхэг
                                      </Typography>
                                    </ListItem>
                                  </div>
                                ))}
                              </List>
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                        <Accordion>
                          <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
                            <Typography variant="body2">
                              Худалдаж авсан хэмжээ:{" "}
                              <strong>
                                {numberWithCommas(summary.buyCount)} ширхэг
                              </strong>
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Box
                              sx={{
                                width: "100%",
                                bgcolor: "background.paper",
                                borderRadius: 2,
                                boxShadow: 3,
                                p: 2,
                                overflowX: "auto",
                                height: 300,
                              }}
                            >
                              <List>
                                <Divider />
                                {buyData.map((transaction, index) => (
                                  <div key={index}>
                                    <ListItem
                                      sx={{
                                        backgroundColor: "#e0e0e0",
                                        color: "black",
                                        borderRadius: 2,
                                        mb: 1,
                                      }}
                                    >
                                      <ListItemText
                                        primary={transaction.ProductName}
                                        secondary={dayjs(
                                          transaction.timeStamp,
                                        ).format("YYYY-MM-DD HH:mm:ss")}
                                      />
                                    </ListItem>
                                  </div>
                                ))}
                              </List>
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                        <Accordion>
                          <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
                            <Typography variant="body2">
                              Гүйлгээний хэмжээ:{" "}
                              <strong>
                                {numberWithCommas(summary.transactionCount)}{" "}
                                ширхэг
                              </strong>
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Box
                              sx={{
                                width: "100%",
                                backgroundColor: "#e0e0e0",
                                borderRadius: 2,
                                boxShadow: 3,
                                p: 2,
                                overflowX: "auto",
                                height: 300,
                              }}
                            >
                              <List>
                                <Divider />
                                {statementData.map((transaction, index) => (
                                  <div key={index}>
                                    <ListItem
                                      sx={{
                                        backgroundColor: "#e0e0e0",
                                        color: "black",
                                        borderRadius: 2,
                                        mb: 1,
                                      }}
                                    >
                                      <ListItemText
                                        primary={`${transaction.accName} ${transaction.accNum}`}
                                        secondary={dayjs(
                                          transaction.tranPostedDate,
                                        ).format("YYYY-MM-DD HH:mm:ss")}
                                      />
                                      <Typography variant="body2">
                                        {numberWithCommas(
                                          transaction.tranAmount,
                                        )}
                                        ₮
                                      </Typography>
                                    </ListItem>
                                  </div>
                                ))}
                              </List>
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      </Box>
                    </Grid>
                  </>
                )}
              </Grid>

              {/* Тайлбар */}
              <Grid container spacing={1} sx={{ marginTop: 5 }}>
                {ID && selectedApprovalType && (
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      id="multiline-comment"
                      label="Тайлбар"
                      multiline
                      rows={4}
                      value={comment}
                      onChange={(e) => {
                        setComment(e.target.value);
                        validation();
                      }}
                    />
                  </Grid>
                )}
                <Grid size={{ xs: 12 }}>
                  <LoadingButton
                    fullWidth
                    disabled={!isValid}
                    loading={loading}
                    loadingIndicator="Loading…"
                    variant="contained"
                    onClick={handleSubmit}
                  >
                    <span>Шийдвэрлэх</span>
                  </LoadingButton>
                </Grid>
              </Grid>
            </FormControl>
          </Box>
        </Box>
      </Dialog>
    </ThemeProvider>
  );
};

export default CreateApproval;
