import { Box } from "@mui/material";
import Header from "../../components/Header";
import LineChart from "../../components/LineChart";

const Line = () => {
  return (
    <Box m="20px">
      <Header title="Line Chart" subtitle="Simple Line Chart Of Traffic Rise & Fall
Once A While" />
      <Box height="75vh">
        <LineChart />
      </Box>
    </Box>
  );
};

export default Line;