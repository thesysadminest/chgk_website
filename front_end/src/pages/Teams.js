import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import { DataGrid, useGridApiRef } from "@mui/x-data-grid";
import { 
  Box, 
  Link as MuiLink, 
  Button, 
  TextField, 
  CircularProgress, 
  Typography, 
  Alert, 
  Tooltip, 
  Stack,
} from "@mui/material";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { checkAuth, getAccessToken, clearAuthTokens } from "../utils/AuthUtils";

const Teams = () => {
  const theme = useTheme();
  const [rows, setRows] = useState([]);
  const [originalRows, setOriginalRows] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
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
    const fetchTeams = async () => {
      try {
        const token = getAccessToken();
        if (!token) {
          throw new Error("Требуется авторизация");
        }

        const response = await axios.get("http://127.0.0.1:8000/api/team/list/", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const formattedData = response.data.map(team => ({
          id: team.id,
          name: team.name || "Без названия",
          team_score: team.team_score || 0,
          captain_username: team.captain_username || "Неизвестно",
          created_at: team.created_at 
                    ? new Date(team.created_at).toLocaleDateString("ru-RU") 
                    : "Неизвестно",
          captainId: team.captain,
        }));

        setRows(formattedData);
        setOriginalRows(formattedData);
      } catch (err) {
        console.error("Error fetching teams:", err);
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
      fetchTeams();
    } else if (!authState.isLoading) {
      setLoading(false);
    }
  }, [authState.isAuthenticated, authState.isLoading]);

  useEffect(() => {
    if (searchText === "") {
      setRows(originalRows);
    } else {
      const filteredRows = originalRows.filter(row => {
        const searchLower = searchText.toLowerCase();
        return (
          row.name && row.name.toLowerCase().includes(searchLower))
      });
      setRows(filteredRows);
    }
  }, [searchText, originalRows]);

  const handleFindMyTeams = () => {
    if (authState.user) {
      const userId = authState.user.id;
      const userTeams = rows.filter(row => row.captainId === userId);
      
      if (userTeams.length > 0) {
        setSelectedTeamId(userTeams[0].id);
        const teamIndex = rows.findIndex(row => row.id === userTeams[0].id);
        if (teamIndex !== -1) {
          apiRef.current.scrollToIndexes({ rowIndex: teamIndex });
          apiRef.current.setRowSelectionModel([userTeams[0].id]);
        }
      }
    }
  };

  const handleCreateTeam = () => {
    navigate("/add-team");
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    window.location.reload();
  };

  const handleRowClick = (params) => {
    navigate(`/team/${params.id}`, { state: { team: params.row } });
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
    <Box sx={{ display: "flex", justifyContent: "space-between", height: '80vh', flexDirection: 'column', mb: 3}}>
      <Stack 
        direction="row" 
        spacing={2} 
        sx={{ 
          justifyContent: "space-between", 
          alignItems: "center", 
          mb: 2,
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Stack direction="row" spacing={2}>
          <Tooltip 
            disableHoverListener={authState.isAuthenticated} 
            disableFocusListener 
            disableTouchListener 
            title={
              <Typography variant="h7">
                <MuiLink component={Link} to="/login" state={{ redirect: location }}>
                  Войдите в систему
                </MuiLink>
                , чтобы использовать эту функцию
              </Typography>
            }
          >
            <span>
              <Button
                variant={authState.isAuthenticated ? "red" : "outlined"}
                onClick={handleFindMyTeams}
                disabled={!authState.isAuthenticated}
                color="primary"
              >
                Мои команды
              </Button>
            </span>
          </Tooltip>

          <Tooltip 
            disableHoverListener={authState.isAuthenticated} 
            disableFocusListener 
            disableTouchListener 
            title={
              <Typography variant="h7">
                <MuiLink component={Link} to="/login" state={{ redirect: location }}>
                  Войдите в систему
                </MuiLink>
                , чтобы создать команду
              </Typography>
            }
          >
            <span>
              <Button
                variant={authState.isAuthenticated ? "red" : "outlined"}
                onClick={handleCreateTeam}
                disabled={!authState.isAuthenticated}
                color="secondary"
              >
                Создать команду
              </Button>
            </span>
          </Tooltip>
        </Stack>
        
        <TextField
          variant_tf="dark"
          size="small"
          placeholder="Поиск по названию"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ width: "300px" }}
        />
      </Stack>

      <Box sx={{ height: 600 }}>
        <DataGrid
          rows={rows}
          columns={[
            { field: "id", headerName: "ID", flex: 0.5 },
            { field: "name", headerName: "Название", flex: 1 },
            { field: "team_score", headerName: "Очки", flex: 0.5 },
            { field: "captain_username", headerName: "Капитан", flex: 1 },
            { field: "created_at", headerName: "Дата создания", width: 150 },
          ]}
          pageSize={10}
          rowsPerPageOptions={[10, 20, 50]}
          disableSelectionOnClick
          onRowClick={handleRowClick}
          apiRef={apiRef}
          getRowClassName={(params) => {
            return params.id === selectedTeamId ? 'highlighted-row' : '';
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
  );
};

export default Teams;