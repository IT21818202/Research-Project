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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  Slide,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import {
  DeleteOutline,
  SaveOutlined,
  EditOutlined,
  PersonAddOutlined,
  CheckCircleOutlined,
  ErrorOutlined,
  InfoOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";
import Header from "../../components/Header";
import { useState, useEffect } from "react";
import axios from "axios";

// Slide transition for Snackbar
function SlideTransition(props) {
  return <Slide {...props} direction="left" />;
}

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
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  
  // Pop-up states
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    memberId: null,
    memberName: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // success, error, warning, info
  });

  // helper to normalize id from server object
  const getId = (m) => {
    if (!m) return undefined;
    if (m.id) return String(m.id);
    if (m._id) {
      if (typeof m._id === "string") return m._id;
      if (m._id.$oid) return m._id.$oid;
      return String(m._id);
    }
    return undefined;
  };

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/members");
        const normalized = res.data.map((m) => ({ ...m, id: getId(m) }));
        setMembers(normalized);
      } catch (err) {
        console.error("Fetch error:", err);
        showSnackbar("Failed to fetch members", "error");
      }
    };
    fetchMembers();
  }, []);

  // Snackbar helper function
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // Close snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (member) => {
    setDeleteDialog({
      open: true,
      memberId: member.id,
      memberName: member.name,
    });
  };

  // Close delete confirmation dialog
  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, memberId: null, memberName: "" });
  };

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
      showSnackbar("Please fill all required fields", "warning");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/members", form);
      const newMember = response.data;
      const normalizedId = getId(newMember);
      setMembers((prev) => [...prev, { ...newMember, id: normalizedId }]);
      setForm({ name: "", itno: "", phone: "", gender: "male", access: "user" });
      showSnackbar("Member added successfully!", "success");
    } catch (error) {
      console.error("Add error:", error);
      showSnackbar("Failed to add member", "error");
    }
  };

  const handleDelete = async () => {
    const { memberId, memberName } = deleteDialog;
    
    if (!memberId) {
      showSnackbar("No member ID provided", "error");
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/members/${encodeURIComponent(memberId)}`);
      
      // Remove deleted member from local state
      setMembers((prev) => prev.filter((m) => String(m.id) !== String(memberId)));
      
      // If we're editing the deleted member, clear edit mode
      if (editId === memberId) {
        setEditId(null);
        setEditForm({});
      }
      
      closeDeleteDialog();
      showSnackbar(`"${memberName}" has been deleted successfully`, "success");
    } catch (error) {
      console.error("Delete error:", error);
      showSnackbar("Failed to delete member", "error");
    }
  };

  const handleEdit = (member) => {
    setEditId(member.id);
    setEditForm({
      name: member.name,
      itno: member.itno,
      phone: member.phone,
      gender: member.gender,
      access: member.access,
    });
    showSnackbar(`Editing ${member.name}`, "info");
  };

  const handleUpdateMember = async () => {
    if (!editId) return;
    try {
      const res = await axios.put(`http://localhost:5000/api/members/${encodeURIComponent(editId)}`, editForm);
      const updated = res.data;
      const normalizedId = getId(updated);
      setMembers((prev) =>
        prev.map((m) => (String(m.id) === normalizedId ? { ...updated, id: normalizedId } : m))
      );
      setEditId(null);
      setEditForm({});
      showSnackbar("Member updated successfully!", "success");
    } catch (err) {
      console.error("Update error:", err);
      showSnackbar("Failed to update member", "error");
    }
  };

  const columns = [
    { 
      field: "id", 
      headerName: "ID", 
      width: 220,
      renderCell: (params) => (
        <Typography color={colors.grey[100]} sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
          {params.value}
        </Typography>
      ),
    },
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
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: colors.grey[300],
                },
                '&:hover fieldset': {
                  borderColor: colors.blueAccent[300],
                },
                '&.Mui-focused fieldset': {
                  borderColor: colors.blueAccent[500],
                },
              },
            }}
          />
        ) : (
          <Typography color={colors.grey[100]} fontWeight="500">
            {params.value}
          </Typography>
        ),
    },
    {
      field: "itno",
      headerName: "Location",
      flex: 1,
      renderCell: (params) =>
        editId === params.row.id ? (
          <TextField
            name="itno"
            value={editForm.itno || ""}
            onChange={handleEditInputChange}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: colors.grey[300],
                },
                '&:hover fieldset': {
                  borderColor: colors.blueAccent[300],
                },
                '&.Mui-focused fieldset': {
                  borderColor: colors.blueAccent[500],
                },
              },
            }}
          />
        ) : (
          <Typography color={colors.grey[100]}>
            {params.value}
          </Typography>
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
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: colors.grey[300],
                },
                '&:hover fieldset': {
                  borderColor: colors.blueAccent[300],
                },
                '&.Mui-focused fieldset': {
                  borderColor: colors.blueAccent[500],
                },
              },
            }}
          />
        ) : (
          <Typography color={colors.grey[100]}>
            {params.value}
          </Typography>
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
            sx={{
              color: colors.grey[100],
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.grey[300],
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.blueAccent[300],
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.blueAccent[500],
              },
              '& .MuiSvgIcon-root': {
                color: colors.grey[100],
              },
            }}
          >
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
          </Select>
        ) : (
          <Typography color={colors.grey[100]} textTransform="capitalize">
            {params.value}
          </Typography>
        ),
    },
    {
      field: "access",
      headerName: "Access",
      width: 130,
      renderCell: (params) =>
        editId === params.row.id ? (
          <Select
            name="access"
            value={editForm.access || ""}
            onChange={handleEditInputChange}
            size="small"
            sx={{
              color: colors.grey[100],
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.grey[300],
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.blueAccent[300],
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.blueAccent[500],
              },
              '& .MuiSvgIcon-root': {
                color: colors.grey[100],
              },
            }}
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="user">Event Manager</MenuItem>
          </Select>
        ) : (
          <Typography 
            color={params.value === 'admin' ? colors.greenAccent[500] : colors.blueAccent[300]}
            fontWeight="500"
            textTransform="capitalize"
          >
            {params.value === 'admin' ? 'Admin' : 'Event Manager'}
          </Typography>
        ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          {editId === params.row.id ? (
            <Button 
              size="small" 
              variant="contained" 
              color="success" 
              onClick={handleUpdateMember}
              startIcon={<SaveOutlined />}
              sx={{
                backgroundColor: colors.greenAccent[600],
                '&:hover': {
                  backgroundColor: colors.greenAccent[500],
                },
              }}
            >
              Save
            </Button>
          ) : (
            <Button 
              size="small" 
              variant="contained"
              onClick={() => handleEdit(params.row)}
              startIcon={<EditOutlined />}
              sx={{
                backgroundColor: colors.blueAccent[600],
                color: colors.grey[100],
                '&:hover': {
                  backgroundColor: colors.blueAccent[500],
                },
              }}
            >
              Edit
            </Button>
          )}
          <Button 
            size="small" 
            variant="contained"
            onClick={() => openDeleteDialog(params.row)}
            startIcon={<DeleteOutline />}
            sx={{
              backgroundColor: colors.redAccent[600],
              color: colors.grey[100],
              '&:hover': {
                backgroundColor: colors.redAccent[500],
              },
            }}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Header title="TEAM"  />

      {/* Form Section */}
      <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap="20px" mb="20px">
        <Box gridColumn="span 3">
          <TextField 
            fullWidth 
            label="Full Name" 
            name="name" 
            value={form.name} 
            onChange={handleInputChange}
            sx={{
              '& .MuiInputLabel-root': {
                color: colors.grey[300],
              },
              '& .MuiOutlinedInput-root': {
                color: colors.grey[100],
                '& fieldset': {
                  borderColor: colors.grey[300],
                },
                '&:hover fieldset': {
                  borderColor: colors.blueAccent[300],
                },
                '&.Mui-focused fieldset': {
                  borderColor: colors.blueAccent[500],
                },
              },
            }}
          />
        </Box>
        <Box gridColumn="span 3">
          <TextField 
            fullWidth 
            label="Location" 
            name="itno" 
            value={form.itno} 
            onChange={handleInputChange}
            sx={{
              '& .MuiInputLabel-root': {
                color: colors.grey[300],
              },
              '& .MuiOutlinedInput-root': {
                color: colors.grey[100],
                '& fieldset': {
                  borderColor: colors.grey[300],
                },
                '&:hover fieldset': {
                  borderColor: colors.blueAccent[300],
                },
                '&.Mui-focused fieldset': {
                  borderColor: colors.blueAccent[500],
                },
              },
            }}
          />
        </Box>
        <Box gridColumn="span 3">
          <TextField 
            fullWidth 
            label="Phone Number" 
            name="phone" 
            value={form.phone} 
            onChange={handleInputChange}
            sx={{
              '& .MuiInputLabel-root': {
                color: colors.grey[300],
              },
              '& .MuiOutlinedInput-root': {
                color: colors.grey[100],
                '& fieldset': {
                  borderColor: colors.grey[300],
                },
                '&:hover fieldset': {
                  borderColor: colors.blueAccent[300],
                },
                '&.Mui-focused fieldset': {
                  borderColor: colors.blueAccent[500],
                },
              },
            }}
          />
        </Box>
        <Box gridColumn="span 3">
          <RadioGroup row name="gender" value={form.gender} onChange={handleInputChange}>
            <FormControlLabel 
              value="male" 
              control={
                <Radio 
                  sx={{
                    color: colors.grey[300],
                    '&.Mui-checked': {
                      color: colors.blueAccent[500],
                    },
                  }}
                />
              } 
              label={
                <Typography color={colors.grey[100]}>
                  Male
                </Typography>
              } 
            />
            <FormControlLabel 
              value="female" 
              control={
                <Radio 
                  sx={{
                    color: colors.grey[300],
                    '&.Mui-checked': {
                      color: colors.blueAccent[500],
                    },
                  }}
                />
              } 
              label={
                <Typography color={colors.grey[100]}>
                  Female
                </Typography>
              } 
            />
          </RadioGroup>
        </Box>
        <Box gridColumn="span 3">
          <FormControl fullWidth>
            <InputLabel
              sx={{
                color: colors.grey[300],
                '&.Mui-focused': {
                  color: colors.blueAccent[500],
                },
              }}
            >
              Access Level
            </InputLabel>
            <Select 
              name="access" 
              value={form.access} 
              onChange={handleInputChange} 
              label="Access Level"
              sx={{
                color: colors.grey[100],
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.grey[300],
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.blueAccent[300],
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.blueAccent[500],
                },
                '& .MuiSvgIcon-root': {
                  color: colors.grey[100],
                },
              }}
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="user">User</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box gridColumn="span 3">
          <Button 
            fullWidth 
            variant="contained" 
            onClick={handleAddMember}
            startIcon={<PersonAddOutlined />}
            sx={{
              backgroundColor: colors.greenAccent[600],
              '&:hover': {
                backgroundColor: colors.greenAccent[500],
              },
              height: '56px',
            }}
          >
            Add Member
          </Button>
        </Box>
      </Box>

      {/* DataGrid Section */}
      <Box
        height="70vh"
        sx={{
          "& .MuiDataGrid-root": { 
            border: "none",
            color: colors.grey[100],
          },
          "& .MuiDataGrid-cell": { 
            borderBottom: `1px solid ${colors.grey[800]}`,
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
            color: colors.grey[100],
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
            color: colors.grey[100],
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <DataGrid
          rows={members}
          columns={columns}
          disableSelectionOnClick
        />
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        PaperProps={{
          sx: {
            background: `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.primary[500]} 100%)`,
            borderRadius: '12px',
          }
        }}
      >
        <DialogTitle id="delete-dialog-title" sx={{ color: colors.grey[100], borderBottom: `1px solid ${colors.grey[700]}` }}>
          <Box display="flex" alignItems="center" gap={1}>
            <WarningAmberOutlined sx={{ color: colors.redAccent[500] }} />
            Confirm Deletion
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description" sx={{ color: colors.grey[200], mt: 2 }}>
            Are you sure you want to delete member <strong>"{deleteDialog.memberName}"</strong>? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={closeDeleteDialog}
            variant="outlined"
            sx={{
              color: colors.grey[300],
              borderColor: colors.grey[500],
              '&:hover': {
                borderColor: colors.grey[300],
                backgroundColor: colors.grey[700],
              },
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete}
            variant="contained"
            startIcon={<DeleteOutline />}
            sx={{
              backgroundColor: colors.redAccent[600],
              '&:hover': {
                backgroundColor: colors.redAccent[500],
              },
            }}
            autoFocus
          >
            Delete Member
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        TransitionComponent={SlideTransition}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: '100%',
            borderRadius: '8px',
            '& .MuiAlert-icon': {
              fontSize: '1.5rem',
            },
          }}
          iconMapping={{
            success: <CheckCircleOutlined fontSize="inherit" />,
            error: <ErrorOutlined fontSize="inherit" />,
            warning: <WarningAmberOutlined fontSize="inherit" />,
            info: <InfoOutlined fontSize="inherit" />,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Team;