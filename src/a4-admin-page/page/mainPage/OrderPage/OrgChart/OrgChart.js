import React, { useState, useEffect, useRef, useMemo } from "react";
import OrganizationChart from "@dabeng/react-orgchart";
import MyNode from "./my-node";
import "./my-node.css";
import {
  Typography,
  useColorScheme,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { ref, onValue } from "firebase/database";
import { db } from "refrence/realConfig";

const CustomNodeChart = () => {
  const orgchart = useRef();
  const { mode } = useColorScheme(); //(optional) if you already have a theme defined in your app root, you can import here
  const tableTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          info: {
            main: "rgb(255,122,0)", //add in a custom color for the toolbar alert background stuff
          },
          background: {
            default:
              mode === "light"
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
    [mode],
  );
  const [hierarchy, setHierarchy] = useState({
    InviterId: "",
    InviterName: "",
    Level: 30,
    MemberId: 99117315,
    ProductName: "Скийнбүүстер",
    QuantityName: "АдъяаЦолмон",
    RankName: "БМ",
    SponsorId: null,
    SponsorName: null,
    children: [],
    id: "-O6sbRqgzFQtTCec8w9L",
    index: 1,
    timeStamp: "09/05/2024 10:18",
  });

  useEffect(() => {
    const userRef = ref(db, "userInfo");
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      const fetchedResults = [];
      let rawData = data;
      for (let key in rawData) {
        fetchedResults.unshift({
          ...rawData[key],
          id: key,
        });
      }
      const reverse = fetchedResults.reverse();
      let rest = buildNestedStructure(reverse);

      const hierarchicalData2 = rest[0];
      setHierarchy(hierarchicalData2);
    });
  }, []);

  const buildNestedStructure = (arr) => {
    let map = {};
    let roots = [];
    // Ensure root node starts with null values
    arr[0].SponsorId = null;
    arr[0].SponsorName = null;

    // Build the map
    arr.forEach((item) => {
      map[item.QuantityName + item.MemberId] = {
        ...item,
        children: [],
      };
    });

    // Build the hierarchy
    arr.forEach((item) => {
      if (item.SponsorName === null) {
        roots.push(map[item.QuantityName + item.MemberId]);
      } else {
        console.log("item", item);
        map[item.SponsorName + item.SponsorId].children.push(
          map[item.QuantityName + item.MemberId],
        );
      }
    });
    return roots;
  };

  return (
    <ThemeProvider theme={tableTheme}>
      <div
        style={{
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <Typography color="inherit" variant="h4">
          Багийн бүтэц
        </Typography>
        <OrganizationChart
          ref={orgchart}
          datasource={hierarchy}
          chartClass="myChart"
          NodeTemplate={MyNode}
          pan={true}
          //collapsible={true}
        />
      </div>
    </ThemeProvider>
  );
};

export default CustomNodeChart;
