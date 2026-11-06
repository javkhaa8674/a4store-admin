import * as React from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import {
  BlackAllUserInfo,
  BlackCalculateLevel,
  BlackOrignalUserInfo,
  BlackPromotionCalculation,
  BlackTransactionReq,
  BlackOrgChart,
  BlackProductDelivary,
  DeleteBlackMembers,
  BlackEBarimtDelivery,
} from "../mainPage/BlackMemberspage";

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
          variant="scrollable" // 👈 Баруун, зүүн тийш гүйдэг болгох тохиргоо
          scrollButtons="auto" // 👈 Хэрэгцээтэй үед баруун, зүүн сумтай товчийг автоматаар харуулах
        >
          <Tab label="Блэк шилжих хүсэлт" {...a11yProps(0)} />
          <Tab label="Блэк үлдсэн худалдан авалт" {...a11yProps(1)} />
          <Tab label="Бүх худалдан авалт" {...a11yProps(1)} />
          <Tab label="Блэк бүтээгдэхүүн олголт" {...a11yProps(1)} />
          <Tab label="Блэк e-баримт олголт" {...a11yProps(1)} />
          <Tab label="Блэк багийн бүтэц" {...a11yProps(1)} />
          <Tab label="Блэк урамшуулал бодолт" {...a11yProps(1)} />
          <Tab label="Блэк зэрэглэл дэвшүүлэх" {...a11yProps(1)} />
          <Tab label="Блэк хогийн сав" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <BlackTransactionReq />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <BlackOrignalUserInfo />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <BlackAllUserInfo />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={3}>
        <BlackProductDelivary />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={4}>
        <BlackEBarimtDelivery />
      </CustomTabPanel>

      <CustomTabPanel value={value} index={5}>
        <BlackOrgChart />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={6}>
        <BlackPromotionCalculation />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={7}>
        <BlackCalculateLevel />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={8}>
        <DeleteBlackMembers />
      </CustomTabPanel>
    </Box>
  );
}
