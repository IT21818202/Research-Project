import { Box } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";

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
      flex: 1,
    },
    {
      field: "priority",
      headerName: "Alert Priority",
      flex: 0.8,
    },
    {
      field: "shift",
      headerName: "Shift Time",
      flex: 0.8,
    },
  ];

  return (
    <Box m="20px">
      <Header
        title="FIELD CONTACTS"
        subtitle="Monitoring & Emergency Response Contact List"
      />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <DataGrid
          rows={mockMonitoringContacts}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
        />
      </Box>
    </Box>
  );
};

export default Contacts;
