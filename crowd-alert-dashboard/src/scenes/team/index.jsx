// src/scenes/team/index.jsx
import {
  Box,
  Typography,
  useTheme,
  TextField,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import {
  DeleteOutline,
  SaveOutlined,
  EditOutlined,
} from "@mui/icons-material";
import Header from "../../components/Header";
import { useState, useEffect } from "react";
import axios from "axios";

const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    itno: "",
    phone: "",
    gender: "male",
    access: "user",
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/members");
        setMembers(
          res.data.map((m) => ({
            ...m,
            id: m._id,
          }))
        );
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchMembers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddMember = async () => {
    if (!form.name || !form.itno || !form.phone || !form.access) {
      alert("Fill all fields");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/members", form);
      const newMember = response.data;
      setMembers((prev) => [...prev, { ...newMember, id: newMember._id }]);
      setForm({ name: "", itno: "", phone: "", gender: "male", access: "user" });
    } catch (error) {
      console.error("Add error:", error);
    }
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) {
      alert("Select members to delete.");
      return;
    }

    try {
      await Promise.all(
        selectedIds.map((id) => axios.delete(`http://localhost:5000/api/members/${id}`))
      );
      setMembers((prev) => prev.filter((m) => !selectedIds.includes(m.id)));
      setSelectedIds([]);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleEdit = (member) => {
    setEditId(member.id);
    setEditForm({ ...member });
  };

  const handleUpdateMember = async () => {
    try {
      const res = await axios.put(`http://localhost:5000/api/members/${editId}`, editForm);
      const updated = res.data;
      setMembers((prev) =>
        prev.map((m) => (m.id === updated._id ? { ...updated, id: updated._id } : m))
      );
      setEditId(null);
      setEditForm({});
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 220 },
    {
      field: "name",
      headerName: "Full Name",
      flex: 1,
      renderCell: (params) =>
        editId === params.row.id ? (
          <TextField
            name="name"
            value={editForm.name || ""}
            onChange={handleEditInputChange}
          />
        ) : (
          params.value
        ),
    },
    {
      field: "itno",
      headerName: "IT Number",
      flex: 1,
      renderCell: (params) =>
        editId === params.row.id ? (
          <TextField
            name="itno"
            value={editForm.itno || ""}
            onChange={handleEditInputChange}
          />
        ) : (
          params.value
        ),
    },
    {
      field: "phone",
      headerName: "Phone Number",
      flex: 1,
      renderCell: (params) =>
        editId === params.row.id ? (
          <TextField
            name="phone"
            value={editForm.phone || ""}
            onChange={handleEditInputChange}
          />
        ) : (
          params.value
        ),
    },
    {
      field: "gender",
      headerName: "Gender",
      width: 100,
      renderCell: (params) =>
        editId === params.row.id ? (
          <Select
            name="gender"
            value={editForm.gender || ""}
            onChange={handleEditInputChange}
            size="small"
          >
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
          </Select>
        ) : (
          params.value
        ),
    },
    {
      field: "access",
      headerName: "Access",
      width: 110,
      renderCell: (params) =>
        editId === params.row.id ? (
          <Select
            name="access"
            value={editForm.access || ""}
            onChange={handleEditInputChange}
            size="small"
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
            <MenuItem value="user">User</MenuItem>
          </Select>
        ) : (
          params.value
        ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 130,
      renderCell: (params) =>
        editId === params.row.id ? (
          <Button size="small" onClick={handleUpdateMember}>
            <SaveOutlined />
          </Button>
        ) : (
          <Button size="small" onClick={() => handleEdit(params.row)}>
            <EditOutlined />
          </Button>
        ),
    },
  ];

  return (
    <Box m="20px">
      <Header title="TEAM" subtitle="Manage Team Members - Add / Edit / Delete" />

      {/* Form Section */}
      <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap="20px" mb="20px">
        <Box gridColumn="span 3">
          <TextField fullWidth label="Full Name" name="name" value={form.name} onChange={handleInputChange} />
        </Box>
        <Box gridColumn="span 3">
          <TextField fullWidth label="IT Number" name="itno" value={form.itno} onChange={handleInputChange} />
        </Box>
        <Box gridColumn="span 3">
          <TextField fullWidth label="Phone Number" name="phone" value={form.phone} onChange={handleInputChange} />
        </Box>
        <Box gridColumn="span 3">
          <RadioGroup row name="gender" value={form.gender} onChange={handleInputChange}>
            <FormControlLabel value="male" control={<Radio />} label="Male" />
            <FormControlLabel value="female" control={<Radio />} label="Female" />
          </RadioGroup>
        </Box>
        <Box gridColumn="span 3">
          <FormControl fullWidth>
            <InputLabel>Access Level</InputLabel>
            <Select name="access" value={form.access} onChange={handleInputChange} label="Access Level">
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
              <MenuItem value="user">User</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box gridColumn="span 3">
          <Button fullWidth variant="contained" color="success" onClick={handleAddMember}>
            Add Member
          </Button>
        </Box>
        <Box gridColumn="span 3">
          <Button fullWidth variant="outlined" color="error" startIcon={<DeleteOutline />} onClick={handleDelete}>
            Delete Selected
          </Button>
        </Box>
      </Box>

      {/* DataGrid Section */}
      <Box
        height="70vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none" },
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
        }}
      >
       <DataGrid
  checkboxSelection
  rows={members}
  columns={columns}
  selectionModel={selectedIds}
  onSelectionModelChange={(newSelectionModel) => {
    setSelectedIds(newSelectionModel);
    console.log("Selection changed:", newSelectionModel);
  }}
/>

      </Box>
    </Box>
  );
};

export default Team;
