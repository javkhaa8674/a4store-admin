import React, { useState } from "react";
import * as XLSX from "xlsx";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";
import CloseIcon from "@mui/icons-material/Close";
import {
  TextField,
  Button,
  styled,
  Box,
  Typography,
  LinearProgress,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import BrowserUpdatedIcon from "@mui/icons-material/BrowserUpdated";
import { ref, set } from "firebase/database";
import { db } from "refrence/realConfig";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const Import = () => {
  const [file, setFile] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [path, setPath] = useState("");

  const convertXLSXtoJSON = () => {
    setLoading(true);
    let result = {};
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, {
          type: "binary",
          cellDates: true,
          cellNF: false,
          cellText: false,
        });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        const ifDateToString = convertDatesToStrings(json);
        setJsonData(JSON.stringify(ifDateToString, null, 2));
        setData(ifDateToString);
      };

      reader.readAsBinaryString(file);
    }
    setLoading(false);
    return result;
  };

  const convertDatesToStrings = (arr) => {
    return arr.map((obj) => {
      let newObj = { ...obj };
      for (let key in newObj) {
        if (newObj[key] instanceof Date) {
          newObj[key] = newObj[key].toISOString(); // You can change the format if needed
        }
      }
      return newObj;
    });
  };
  const handleUpload = async () => {
    if (!file) {
      alert("File not chosen");
      return;
    }

    if (!jsonData) {
      alert("File not converted. After you convert the file, please upload it");
      return;
    }
    setLoading(true);

    try {
      let sendData = [];
      data.forEach((element) => {
        const { id, ...rest } = element; // Remove the 'id' field
        sendData.push({ key: id, value: rest }); // Store key separately
      });

      console.log("sendData", sendData);

      // Upload each item with a custom key (without 'id' in the data)
      for (const item of sendData) {
        if (!item.key) {
          console.error("Missing key for item:", item);
          continue; // Skip items without a key
        }

        const dbRef = ref(db, `${path}/${item.key}`);
        await set(dbRef, item.value);
      }

      alert("Successfully uploaded");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4">Файл импорт</Typography>
      <Box sx={{ width: "100%", marginTop: 2 }}>
        {loading && <LinearProgress />}
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
        {file ? (
          <>
            <LoadingButton
              variant="outlined"
              startIcon={<CloseIcon />}
              onClick={() => {
                setFile(null);
                setJsonData(null);
              }}
              loading={loading}
            >
              Cancel
            </LoadingButton>
            <LoadingButton
              variant="outlined"
              startIcon={<ChangeCircleIcon />}
              onClick={convertXLSXtoJSON}
              loading={loading}
            >
              Convert
            </LoadingButton>
          </>
        ) : (
          <Button
            id="input_json"
            accept=".xls,.xlsx"
            role={undefined}
            variant="outlined"
            component="label"
            tabIndex={-1}
            startIcon={
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <BrowserUpdatedIcon />
                <Typography variant="caption" sx={{ marginLeft: 2 }}>
                  Browse
                </Typography>
              </Box>
            }
            onChange={(e) => setFile(e.target.files[0])}
          >
            <VisuallyHiddenInput type="file" />
          </Button>
        )}
        <Typography
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginLeft: 1,
            marginRight: 2,
          }}
          variant="caption"
        >
          {!file ? "No Chosen File" : file.name}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <TextField
          variant="standard"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          label="Path"
        />
        <LoadingButton
          variant="outlined"
          startIcon={<CloudUploadIcon />}
          onClick={handleUpload}
          loading={loading}
        >
          Upload
        </LoadingButton>
        {/* <LoadingButton
          variant="outlined"
          startIcon={<CloudUploadIcon />}
          onClick={handleDelete}
          loading={loading}
        >
          Delete
        </LoadingButton> */}
      </Box>
      <Box sx={{ width: "100%" }}>{loading && <LinearProgress />}</Box>
      <pre>{jsonData}</pre>
    </Box>
  );
};

export default Import;
