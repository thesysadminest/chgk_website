import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { DataGrid, useGridApiRef } from "@mui/x-data-grid"; // Импорт apiRef
import { Box, Link as MuiLink, Button, TextField, CircularProgress, Typography, Alert, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { checkAuth } from "../utils/authCheck";

const Users = () => {
  const [rows, setRows] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const apiRef = useGridApiRef(); // Ссылка на API таблицы

  useEffect(() => {
    const fetchAuthStatus = async () => {
      const { isAuthorized, user } = await checkAuth();
      setIsAuthorized(isAuthorized);
      if (isAuthorized) {
        setCurrentUser(user); // Сохраняем данные текущего пользователя
      }
    };

    fetchAuthStatus();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get("http://127.0.0.1:8000/api/user/list/", {
          headers: {
            "Authorization": "Bearer ${token}",
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
        setError(err.message || "Ошибка загрузки данных");
        if (err.response?.status === 401) navigate("/authorization");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  const handleFindMe = () => {
    if (currentUser) {
      // Используем API таблицы для прокрутки к строке
      apiRef.current.scrollToIndexes({
        rowIndex: rows.findIndex(row => row.id === currentUser.id),
      });
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    window.location.reload();
  };

  const handleRowClick = (params) => {
    navigate("/user/${params.id}", { state: { user: params.row } });
  };

  if (loading) {
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
          Ошибка: {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={handleRetry}
          sx={{ mt: 2 }}
        >
          Попробовать снова
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "80vh", width: "75vw" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, alignItems: "center" }}>
        <Tooltip title={isAuthorized ? "" : "Войдите в систему, чтобы использовать эту функцию"}>
          <span>
            <Button
              variant="contained"
              onClick={handleFindMe}
              disabled={!isAuthorized} // Неактивна, если пользователь не авторизован
              sx={{
                backgroundColor: isAuthorized ? "primary.main" : "gray",
                color: isAuthorized ? "#fff" : "#aaa",
                cursor: isAuthorized ? "pointer" : "not-allowed",
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
                  href={"/user/${params.value}"} 
                  underline="hover"
                  sx={{ cursor: "pointer" }}
                >
                  {params.value}
                </MuiLink>
              ),
            },
            { field: "username", headerName: "Имя", flex: 1 },
            { field: "email", headerName: "Email", flex: 1.5 },
            { field: "bio", headerName: "О себе", flex: 2 },
            { field: "date_joined", headerName: "Дата регистрации", width: 150 },
          ]}
          pageSize={10} // Начальное отображение 10 строк
          rowsPerPageOptions={[10, 20, 50]} // Добавляем только 10, 20, 50
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
