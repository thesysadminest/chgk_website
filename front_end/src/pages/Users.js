import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid, useGridApiRef } from "@mui/x-data-grid";
import { Box, Link as MuiLink, Button, TextField, CircularProgress, Typography, Alert, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { checkAuth, getAccessToken, clearAuthTokens } from "../utils/AuthUtils";

const Users = () => {
  const [rows, setRows] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    isLoading: true
  });
  const navigate = useNavigate();
  const apiRef = useGridApiRef();

  useEffect(() => {
    const verifyAuthentication = async () => {
      try {
        const { isAuthorized, user } = await checkAuth();
        setAuthState({
          isAuthenticated: isAuthorized,
          user: isAuthorized ? user : null,
          isLoading: false
        });
      } catch (error) {
        console.error("Authentication check failed:", error);
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false
        });
        clearAuthTokens();
      }
    };

    verifyAuthentication();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = getAccessToken();
        if (!token) {
          throw new Error("Требуется авторизация");
        }

        const response = await axios.get("http://127.0.0.1:8000/api/user/list/", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const formattedData = response.data.map(user => ({
          id: user.id,
          username: user.username || "Неизвестно",
          email: user.email || "Не указан",
          bio: user.bio || "Не указана",
          date_joined: user.date_joined 
            ? new Date(user.date_joined).toLocaleDateString("ru-RU") 
            : "Неизвестно",
        }));

        setRows(formattedData);
      } catch (err) {
        console.error("Error fetching users:", err);
        if (err.response?.status === 401) {
          clearAuthTokens();
          setError("Сессия истекла. Пожалуйста, войдите снова.");
        } else {
          setError(err.message || "Ошибка загрузки данных");
        }
      } finally {
        setLoading(false);
      }
    };

    if (authState.isAuthenticated) {
      fetchUsers();
    } else if (!authState.isLoading) {
      setLoading(false);
    }
  }, [authState.isAuthenticated, authState.isLoading]);

  const handleFindMe = () => {
    if (authState.user) {
      const userIndex = rows.findIndex(row => row.id === authState.user.id);
      if (userIndex !== -1) {
        apiRef.current.scrollToIndexes({ rowIndex: userIndex });
      }
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    window.location.reload();
  };

  const handleRowClick = (params) => {
    navigate(`/user/${params.id}`, { state: { user: params.row } });
  };

  if (authState.isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={handleRetry}
          sx={{ mt: 2 }}
        >
          Попробовать снова
        </Button>
        {error.includes("Сессия истекла") && (
          <Button 
            variant="outlined" 
            onClick={() => navigate("/login")}
            sx={{ mt: 2, ml: 2 }}
          >
            Войти
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ height: "80vh", width: "75vw", p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, alignItems: "center" }}>
        <Tooltip title={authState.isAuthenticated ? "" : "Войдите в систему, чтобы использовать эту функцию"}>
          <span>
            <Button
              variant="contained"
              onClick={handleFindMe}
              disabled={!authState.isAuthenticated}
              sx={{
                backgroundColor: authState.isAuthenticated ? "primary.main" : "grey.300",
                color: authState.isAuthenticated ? "#fff" : "grey.500",
                "&:hover": {
                  backgroundColor: authState.isAuthenticated ? "primary.dark" : "grey.300",
                },
              }}
            >
              Найти меня
            </Button>
          </span>
        </Tooltip>
        <TextField
          label="Поиск"
          variant="outlined"
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ width: 300 }}
        />
      </Box>

      <DataGrid
        rows={rows}
        columns={[
          { 
            field: "id", 
            headerName: "ID", 
            width: 80, 
            renderCell: (params) => (
              <MuiLink 
                onClick={() => handleRowClick(params)}
                underline="hover"
                sx={{ cursor: "pointer" }}
              >
                {params.value}
              </MuiLink>
            ),
          },
          { 
            field: "username", 
            headerName: "Имя", 
            flex: 1,
            renderCell: (params) => (
              <MuiLink 
                onClick={() => handleRowClick(params)}
                underline="hover"
                sx={{ cursor: "pointer" }}
              >
                {params.value}
              </MuiLink>
            ),
          },
          { field: "email", headerName: "Email", flex: 1.5 },
          { field: "bio", headerName: "О себе", flex: 2 },
          { field: "date_joined", headerName: "Дата регистрации", width: 150 },
        ]}
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50]}
        disableSelectionOnClick
        apiRef={apiRef}
        sx={{
          "& .MuiDataGrid-cell:focus": { outline: "none" },
          "& .MuiDataGrid-columnHeader:focus": { outline: "none" },
        }}
      />
    </Box>
  );
};

export default Users;