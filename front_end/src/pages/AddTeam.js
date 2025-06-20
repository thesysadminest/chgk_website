import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Alert,
  CircularProgress,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  Container,
  Grid,
  Link,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import { checkAuth, getAccessToken, clearAuthTokens } from "../utils/AuthUtils";
import AddTeamSuccess from "../components/AddTeamSuccess";

const AddTeam = () => {
  const theme = useTheme();
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    error: null
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchText, setSearchText] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  // Добавляем состояние для данных команды
  const [team, setTeam] = useState({
    members_count: 1, // Капитан (текущий пользователь) уже включен
    pending_invitations_count: 0
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initializeAuthAndData = async () => {
      try {
        const { isAuthorized, user } = await checkAuth();
        
        if (!isAuthorized) {
          setAuthState({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error: "Для создания команды необходимо авторизоваться"
          });
          return;
        }

        const token = getAccessToken();
        if (!token) throw new Error("Токен доступа не найден");

        // Получаем список пользователей (исключая текущего)
        const usersResponse = await axios.get(
          "http://127.0.0.1:8000/api/user/list/",
          { headers: { "Authorization": `Bearer ${token}` } }
        );

        setAuthState({
          isAuthenticated: true,
          user,
          isLoading: false,
          error: null
        });
        setUsers(usersResponse.data.filter(u => u.id !== user.id));
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
        clearAuthTokens(); 
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: error.message || "Произошла ошибка при загрузке данных"
        });
      }
    };

    initializeAuthAndData();
  }, []);

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleToggleUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = filteredUsers.map(u => u.id);
      setSelectedUsers(newSelected);
    } else {
      setSelectedUsers([]);
    }
  };

const handleCreateTeam = async () => {
    setIsCreating(true);
    try {
      if (!authState.isAuthenticated || !teamName.trim()) {
        throw new Error("Не заполнены обязательные поля");
      }

      const token = getAccessToken();
      if (!token) throw new Error("Токен доступа не найден");

      // Создаем команду
      const teamResponse = await axios.post(
        "http://127.0.0.1:8000/api/team/create/",
        {
          name: teamName.trim(),
          description: teamDescription.trim() || null,
        },
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const teamId = teamResponse.data.id;
      let successfulInvitations = 0;

      // Отправляем приглашения
      if (selectedUsers.length > 0) {
        const inviteResponse = await axios.post(
          `http://127.0.0.1:8000/api/team/${teamId}/invite/`,
          { user_ids: selectedUsers },
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        successfulInvitations = inviteResponse.data.invitations?.length || 0;
      }

      // Обновляем состояние с данными команды
      setTeam({
        members_count: 1, // Капитан
        captain: authState.user.id, // ID текущего пользователя
        captain_username: authState.user.username, // Username текущего пользователя
        pending_invitations_count: successfulInvitations
      });
      
      setSuccessModalOpen(true);
      
    } catch (error) {
      console.error("Ошибка:", error);
      setAuthState(prev => ({
        ...prev,
        error: error.response?.data?.message || error.message || "Ошибка при создании команды"
      }));
    } finally {
      setIsCreating(false);
    }
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (authState.isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!authState.isAuthenticated) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          {authState.error || "Для создания команды необходимо авторизоваться"}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/login")}
          sx={{ 
            mt: 2,
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            "&:hover": {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
        >
          Войти в аккаунт
        </Button>
        <Button 
          sx={{ mt: 2, ml: 2 }}
          variant="outlined"
          onClick={() => navigate("/registration")}
        >
          Зарегистрироваться
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{
        backgroundColor: theme.palette.background.window, 
        p: 4, 
        borderRadius: 4, 
        width: 1050, 
        ml: 5,
        position: 'relative',
        pb: 8
      }}>
        <Typography variant="h4" sx={{ mb: 3, color: theme.palette.primary.main, fontWeight: 'bold' }}>
          Создание новой команды
        </Typography>

        {authState.error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {authState.error}
          </Alert>
        )}

        <Box sx={{ mt: 3 }}>
          <TextField
            label="Название команды *"
            fullWidth
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            sx={{ 
              mb: 2,
              borderRadius: 1,
              backgroundColor: theme.palette.background.white, 
              '& .MuiInputBase-input': {
                color: theme.palette.text.dark
              }
            }}
          />
          <TextField
            label="Описание команды"
            fullWidth
            multiline
            rows={3}
            value={teamDescription}
            onChange={(e) => setTeamDescription(e.target.value)}
            sx={{ 
              borderRadius: 1,
              '& .MuiInputBase-input': {
                color: theme.palette.text.dark
              }
            }}
          />
        </Box>

        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ flex: 1, color: theme.palette.text.dark }}>
              Выберите участников для приглашения
            </Typography>
            <TextField
              label="Поиск пользователей"
              variant="outlined"
              size="small"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              sx={{ 
                width: 300,
                borderRadius: 1
              }}
            />
          </Box>

          {filteredUsers.length > 0 ? (
            <Box sx={{ 
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              overflow: 'hidden',
              mb: 3
            }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={
                            selectedUsers.length > 0 &&
                            selectedUsers.length < filteredUsers.length
                          }
                          checked={
                            filteredUsers.length > 0 &&
                            selectedUsers.length === filteredUsers.length
                          }
                          onChange={handleSelectAll}
                          sx={{ color: theme.palette.common.white }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.common.white }}>
                        Имя пользователя
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.common.white }}>
                        Email
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.common.white }}>
                        Дата регистрации
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((user) => (
                        <TableRow
                          key={user.id}
                          hover
                          selected={selectedUsers.includes(user.id)}
                          onClick={() => handleToggleUser(user.id)}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => handleToggleUser(user.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </TableCell>
                          <TableCell sx={{color: theme.palette.text.dark}}>
                            {user.username || "Без имени"}
                          </TableCell>
                          <TableCell sx={{color: theme.palette.text.dark}}>
                            {user.email || "Без email"}
                          </TableCell>
                          <TableCell sx={{color: theme.palette.text.dark}}>
                            {user.date_joined 
                              ? new Date(user.date_joined).toLocaleDateString() 
                              : "Нет даты"}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredUsers.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{ 
                  borderTop: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.primary.main
                }}
              />
            </Box>
          ) : (
            <Alert severity="info" sx={{ mt: 2 }}>
              {searchText 
                ? "Пользователи по вашему запросу не найдены"
                : "Нет доступных пользователей для приглашения"}
            </Alert>
          )}
        </Box>

        <Box sx={{ 
          position: 'absolute',
          right: 24,
          bottom: 24,
          display: "flex", 
          gap: 2 
        }}>
          <Button
            variant="outlined"
            onClick={() => navigate("/users")}
            sx={{
              py: 1.5,
              px: 3,
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              '&:hover': {
                borderColor: theme.palette.primary.dark,
                color: theme.palette.primary.dark
              }
            }}
          >
            Найти пользователей
          </Button>

          <Tooltip 
            title={!teamName ? "Укажите название команды" : ""}
            arrow
            placement="top"
            componentsProps={{
              tooltip: {
                sx: {
                  backgroundColor: theme.palette.background.tooltip,
                  color: theme.palette.text.tooltip,
                  '& .MuiTooltip-arrow': {
                    color: theme.palette.background.tooltip,
                  }
                }
              }
            }}
          >
            <span>
              <Button
                variant="contained"
                onClick={handleCreateTeam}
                disabled={!teamName || isCreating}
                sx={{
                  py: 1.5,
                  px: 3,
                  backgroundColor: !teamName ? 
                    theme.palette.action.disabled : 
                    theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: !teamName ? 
                      theme.palette.action.disabled : 
                      theme.palette.primary.dark,
                  }
                }}
              >
                {isCreating ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  `Создать команду${selectedUsers.length > 0 ? ` (${selectedUsers.length})` : ''}`
                )}
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Box>

      <AddTeamSuccess 
        open={successModalOpen}
        teamName={teamName}
        invitedCount={team.pending_invitations_count}
        membersCount={team.members_count}
        onClose={() => {
          setSuccessModalOpen(false);
          navigate("/teams");
        }}
      />
    </>
  );
};

export default AddTeam;