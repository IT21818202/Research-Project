import { Box, Chip, Typography, useTheme, Paper } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";

// Mock Data for Safety Officers / Monitoring Agents
const mockMonitoringContacts = [
  {
    id: 1,
    name: "Alice Perera",
    role: "Safety Officer",
    zone: "Colombo - Zone A",
    phone: "077-123-4567",
    email: "alice.perera@example.com",
    priority: "High",
    shift: "Day",
  },
  {
    id: 2,
    name: "Nimal Silva",
    role: "Crowd Monitor",
    zone: "Kandy - Zone C",
    phone: "076-345-6789",
    email: "nimal.silva@example.com",
    priority: "Medium",
    shift: "Night",
  },
  {
    id: 3,
    name: "Tharushi Fernando",
    role: "Emergency Responder",
    zone: "Galle - Zone B",
    phone: "071-234-5678",
    email: "tharushi.f@example.com",
    priority: "High",
    shift: "Day",
  },
  {
    id: 4,
    name: "Kasun Jayawardena",
    role: "Supervisor",
    zone: "Colombo - Zone D",
    phone: "078-987-6543",
    email: "kasun.j@example.com",
    priority: "Low",
    shift: "Evening",
  },
];

const Contacts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "role",
      headerName: "Role",
      flex: 1,
    },
    {
      field: "zone",
      headerName: "Monitoring Zone",
      flex: 1.2,
    },
    {
      field: "phone",
      headerName: "Phone Number",
      flex: 1,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.2,
    },
    {
      field: "priority",
      headerName: "Alert Priority",
      flex: 0.8,
      renderCell: ({ value }) => {
        let color =
          value === "High"
            ? "error"
            : value === "Medium"
            ? "warning"
            : "success";
        return <Chip label={value} color={color} size="small" />;
      },
    },
    {
      field: "shift",
      headerName: "Shift Time",
      flex: 0.8,
      renderCell: ({ value }) => {
        let color =
          value === "Day"
            ? "success"
            : value === "Night"
            ? "secondary"
            : "info";
        return <Chip label={value} color={color} size="small" />;
      },
    },
  ];

  return (
    <Box m="20px">
      {/* Gradient Header Section */}
      <Paper
        elevation={6}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: "16px",
          background: `linear-gradient(135deg, ${colors.blueAccent[500]} 0%, ${colors.greenAccent[500]} 100%)`,
          color: "#fff",
        }}
      >
        <Typography variant="h3" fontWeight="bold">
          FIELD CONTACTS
        </Typography>
        <Typography variant="subtitle1">
          Monitoring & Emergency Response Contact List
        </Typography>
      </Paper>

      {/* DataGrid Section */}
      <Box
        sx={{
          height: "75vh",
          "& .MuiDataGrid-root": {
            border: "none",
            borderRadius: "12px",
            overflow: "hidden",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
            fontWeight: "bold",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            color: colors.grey[100],
            fontSize: "16px",
            fontWeight: "bold",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
            color: colors.grey[100],
          },
          "& .MuiDataGrid-toolbarContainer": {
            backgroundColor: colors.primary[400],
            padding: "8px",
          },
          "& .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
            fontWeight: "bold",
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: colors.blueAccent[800],
            transform: "scale(1.01)",
            transition: "all 0.2s ease-in-out",
          },
        }}
      >
        <DataGrid
          rows={mockMonitoringContacts}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
          disableSelectionOnClick
        />
      </Box>
    </Box>
  );
};

export default Contacts;
