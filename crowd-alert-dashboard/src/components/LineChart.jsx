import { ResponsiveLine } from "@nivo/line";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";

const LineChart = ({ data, isCustomLineColors = false, isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // fallback to empty if no data
  const chartData = data && data.length > 0 ? data : [];

  return (
    <ResponsiveLine
      data={chartData}
      theme={{
        axis: {
          domain: {
            line: {
              stroke: colors.grey[100],
            },
          },
          legend: {
            text: {
              fill: colors.grey[100],
            },
          },
          ticks: {
            line: {
              stroke: colors.grey[100],
              strokeWidth: 1,
            },
            text: {
              fill: colors.grey[100],
            },
          },
        },
        legends: {
          text: {
            fill: colors.grey[100],
          },
        },
        tooltip: {
          container: {
            color: colors.primary[500],
          },
        },
      }}
      colors={isDashboard ? { datum: "color" } : { scheme: "nivo" }}
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: 0,
        max: 4,
        stacked: true,
        reverse: false,
      }}
      yFormat=" >-.2f"
      curve="catmullRom"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        orient: "bottom",
        tickSize: 0,
        tickPadding: 5,
        tickRotation: 45,
        legend: isDashboard ? undefined : "Time",
        legendOffset: 36,
        legendPosition: "middle",
      }}
      axisLeft={{
        orient: "left",
        tickValues: [0, 1, 2, 3, 4],
        tickSize: 3,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "Risk Level",
        legendOffset: -40,
        legendPosition: "middle",
        format: (value) => {
          switch (value) {
            case 0:
              return "Unknown";
            case 1:
              return "Low";
            case 2:
              return "Medium";
            case 3:
              return "High";
            case 4:
              return "Very High";
            default:
              return "";
          }
        },
      }}
      enableGridX={false}
      enableGridY={true}
      pointSize={8}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      legends={[
        {
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          translateX: 100,
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: "left-to-right",
          itemWidth: 80,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: "circle",
          symbolBorderColor: "rgba(0, 0, 0, .5)",
          effects: [
            {
              on: "hover",
              style: {
                itemBackground: "rgba(0, 0, 0, .03)",
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
    />
  );
};

export default LineChart;
