import * as React from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import {
  Statements,
  UserInfo,
  ProductDelivery,
  EbarimtDelivery,
  OrgChart,
} from "../mainPage/OrderPage";
function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs() {
  const [value, setValue] = React.useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Дансны хуулга" {...a11yProps(0)} />
          <Tab label="Худалдан авалт" {...a11yProps(1)} />
          <Tab label="Бүтээгдэхүүн олголт" {...a11yProps(1)} />
          <Tab label="Е-Баримт олголт" {...a11yProps(1)} />
          <Tab label="Багийн бүтэц" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <Statements />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <UserInfo />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <ProductDelivery />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={3}>
        <EbarimtDelivery />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={4}>
        <OrgChart />
      </CustomTabPanel>
    </Box>
  );
}
