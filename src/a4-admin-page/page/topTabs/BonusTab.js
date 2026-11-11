import * as React from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import {
  PromotionTransaction,
  EbarimtTransaction,
  PromotionCalculation,
  InviterCalculation,
  CalculateLevel,
} from "../mainPage/BonusPage";
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
          <Tab label="Тооцоо шалгах" {...a11yProps(0)} />
          <Tab label="Урамшуулал олголт" {...a11yProps(1)} />
          <Tab label="E-Баримт шивэлт" {...a11yProps(1)} />
          <Tab label="Урамшуулал тоцоолол" {...a11yProps(1)} />
          <Tab label="Уригч тоцоолол" {...a11yProps(1)} />
          <Tab label="Зэрэглэл дэвшүүлэх" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <div>Тооцоо шалгах</div>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <PromotionTransaction />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <EbarimtTransaction />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={3}>
        <PromotionCalculation />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={4}>
        <InviterCalculation />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={5}>
        <CalculateLevel />
      </CustomTabPanel>
    </Box>
  );
}
