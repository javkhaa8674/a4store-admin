import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ChartUserByCountry from "./ChartUserByCountry";
import CustomizedTreeView from "./CustomizedTreeView";
import CustomizedDataGrid from "./CustomizedDataGrid";

import PageViewsBarChart from "./PageViewsBarChart";
import SessionsChart from "./SessionsChart";
import StatCard from "./StatCard";

const rawData = [
  {
    title: "Гишүүд",
    value: "14k",
    interval: "Сүүлийн 30 өдөр",
    trend: "up",
    data: [
      200, 24, 220, 260, 240, 380, 100, 240, 280, 240, 300, 340, 320, 360, 340,
      380, 360, 400, 380, 420, 400, 640, 340, 460, 440, 480, 460, 600, 880, 920,
    ],
  },
  {
    title: "Худалдан авалт",
    value: "325",
    interval: "Сүүлийн 30 өдөр",
    trend: "down",
    data: [
      1640, 1250, 970, 1130, 1050, 900, 720, 1080, 900, 450, 920, 820, 840, 600,
      820, 780, 800, 760, 380, 740, 660, 620, 840, 500, 520, 480, 400, 360, 300,
      220,
    ],
  },
  {
    title: "Дансны гүйлгээ",
    value: "200k",
    interval: "Сүүлийн 30 өдөр",
    trend: "up",
    data: [
      500, 400, 510, 530, 520, 600, 530, 520, 510, 730, 520, 510, 530, 620, 510,
      530, 520, 410, 530, 520, 610, 530, 520, 610, 530, 420, 510, 430, 520, 510,
    ],
  },
  {
    title: "Худалдан авалт",
    value: "325",
    interval: "Сүүлийн 30 өдөр",
    trend: "down",
    data: [
      1640, 1250, 970, 1130, 1050, 900, 720, 1080, 900, 450, 920, 820, 840, 600,
      820, 780, 800, 760, 380, 740, 660, 620, 840, 500, 520, 480, 400, 360, 300,
      220,
    ],
  },
];

const MainGrid = () => {
  const [data, setData] = useState(rawData);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      // // setLoading(true);
      // // const MemberResult=[], UserInfoResult=[], StatementResult=[];
      // // const snapshot = await get(query(ref(db, "dashboard"), limitToLast(30)));
      // // let snapValue = snapshot.val();

      // // console.log(snapValue);
      // // for (let key in snapValue.Members) {
      // //   MemberResult.unshift(snapValue.Members[key].currentCount);
      // // }
      // // for (let key in snapValue.userInfo) {
      // //   UserInfoResult.unshift(snapValue.userInfo[key].currentCount);
      // // }
      // console.log("userInfoResult", UserInfoResult);
      setData([
        {
          title: "Гишүүд",
          value: "14k",
          interval: "Сүүлийн 30 өдөр",
          trend: "up",
        },
        {
          title: "Худалдан авалт",
          value: "325",
          interval: "Сүүлийн 30 өдөр",
          trend: "down",
        },
      ]);
    } catch (error) {
      console.log(error);
      alert(error.message);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* cards */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Хяналтын самбар
      </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        {data.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard {...card} />
          </Grid>
        ))}
        {/* <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <HighlightedCard />
        </Grid> */}
        <Grid size={{ sm: 12, md: 6 }}>
          <SessionsChart />
        </Grid>
        <Grid size={{ sm: 12, md: 6 }}>
          <PageViewsBarChart />
        </Grid>
      </Grid>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Дэлгэрэнгүй
      </Typography>
      <Grid container spacing={2} columns={12}>
        <Grid size={{ md: 12, lg: 9 }}>
          <CustomizedDataGrid />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }}>
          <Stack gap={2} direction={{ xs: "column", sm: "row", lg: "column" }}>
            <CustomizedTreeView />
            <ChartUserByCountry />
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MainGrid;
