import React, { useState, useEffect } from "react";
import API_BASE_URL from '../config';
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import { DataGrid, useGridApiRef } from "@mui/x-data-grid";
import { Box, Link as MuiLink, Button, TextField, CircularProgress, Typography, Alert, Tooltip, Stack } from "@mui/material";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { checkAuth, getAccessToken, clearAuthTokens } from "../utils/AuthUtils";

const Rating = () => {
    const theme = useTheme();
    const [rows, setRows] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [authState, setAuthState] = useState({
      isAuthenticated: false,
      user: null,
      isLoading: true
    });
    const navigate = useNavigate();
    const location = useLocation();
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
          // Инициализируем selectedUserId после аутентификации
          if (isAuthorized) {
            setSelectedUserId(user.id);
          }
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
  
          const response = await axios.get(`${API_BASE_URL}/api/user/list/`, {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
  
          const formattedData = response.data
            .sort((a, b) => (b.elo_rating || 1000) - (a.elo_rating || 1000))
            .map((user, index) => ({
              id: user.id,
              position: index + 1,
              username: user.username || "Неизвестно",
              email: user.email || "Не указан",
              elo_rating: user.elo_rating || 1000
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
  
    // Автоматически выделяем строку после загрузки данных
    useEffect(() => {
      if (authState.isAuthenticated && rows.length > 0 && selectedUserId) {
        const userIndex = rows.findIndex(row => row.id === selectedUserId);
        if (userIndex !== -1) {
          apiRef.current.scrollToIndexes({ rowIndex: userIndex });
          apiRef.current.setRowSelectionModel([selectedUserId]);
        }
      }
    }, [rows, authState.isAuthenticated, selectedUserId, apiRef]);

  const handleFindMe = () => {
    if (authState.user) {
      const userId = authState.user.id;
      setSelectedUserId(userId);
      
      const userIndex = rows.findIndex(row => row.id === userId);
      if (userIndex !== -1) {
        apiRef.current.scrollToIndexes({ rowIndex: userIndex });
        apiRef.current.setRowSelectionModel([userId]);
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
            onClick={() => navigate("/login", { state:{redirect: location} })}
            sx={{ mt: 2, ml: 2 }}
          >
            Войти
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{alignItems: 'center'}}>
    <Box sx={{ display: "flex", justifyContent: "center", flexDirection: "column", mb: 3, maxWidth: 800, maxHeight: 600}}>
      <Stack 
        direction="row" 
        spacing={2} 
        sx={{ 
          justifyContent: "space-between", 
          alignItems: "center", 
          mb: 2,
          flexWrap: "wrap",
          gap: 2
        }}
      >
        <Tooltip disableHoverListener={authState.isAuthenticated} disableFocusListener disableTouchListener title={
                   <Typography variant="h7">
                     <MuiLink component={Link} to="/login" state={{ redirect: location }}>
                       Войдите в систему
                     </MuiLink>
                     , чтобы использовать эту функцию
                   </Typography>
                 }>
        </Tooltip>
        
       
      </Stack>

      <Box sx={{ height: 600 }}>
        <DataGrid
            rows={rows}
            columns={[
                { field: "position", headerName: "Позиция", flex: 0.9 },
                { field: "username", headerName: "Имя", flex: 1 },
                { field: "elo_rating", headerName: "Рейтинг", flex: 1 },
            ]}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            onRowClick={handleRowClick}
            apiRef={apiRef}
            rowSelectionModel={selectedUserId ? [selectedUserId] : []}
            getRowClassName={(params) => {
                return params.id === selectedUserId ? "highlighted-row" : "";
            }}
        />
      </Box>

      <style>
        {`
          .highlighted-row {
            background-color: ${theme.palette.default.red1} !important;
          }
          .highlighted-row:hover {
            background-color: ${theme.palette.default.red2} !important;
          }
        `}
      </style>
    </Box>
    </Box>
  );
};

export default Rating;

