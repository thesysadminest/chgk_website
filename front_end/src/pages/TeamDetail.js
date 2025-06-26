import API_BASE_URL from '../config';
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Box, 
  Typography, 
  Avatar, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar,
  Chip, 
  Tabs, 
  Tab, 
  Paper, 
  CircularProgress, 
  Alert,
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  Stack
} from "@mui/material";
import { styled } from "@mui/material/styles";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import HistoryIcon from "@mui/icons-material/History";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { getAccessToken } from "../utils/AuthUtils";
import TeamInvite from "../components/TeamInvite";
import axios from "axios";

const StyledTeamBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
  marginBottom: theme.spacing(4),
}));

const TeamDetail = () => {
  const { id: teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCaptain, setIsCaptain] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
    const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true,
    user: null
  });

  const fetchTeamData = async () => {
  try {
    setLoading(true);
    const token = getAccessToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const response = await axios.get(
      `${API_BASE_URL}/api/team/${teamId}/`,
      { headers }
    );
    
    const teamData = Array.isArray(response.data) ? response.data[0] : response.data;
    setTeam(teamData);

    if (token) {
      const userResponse = await axios.get(
        `${API_BASE_URL}/api/user/me/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCurrentUserId(userResponse.data.id);
      setIsCaptain(teamData.captain === userResponse.data.id);
    }
  } catch (error) {
    console.error("Ошибка загрузки:", error);
    setError(error.response?.data?.detail || error.message || "Ошибка загрузки данных");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchTeamData();
}, [teamId]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenInvite = () => {
    setInviteOpen(true);
  };

  const handleCloseInvite = () => {
    setInviteOpen(false);
  };

const handleResponse = async (response) => {
  try {
    setLoading(true);
    const token = getAccessToken();
    if (!token) {
      navigate("/login");
      return;
    }

    const invitationsResponse = await axios.get(
      `${API_BASE_URL}/api/user/${currentUserId}/invitations/`, 
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("Все приглашения пользователя:", invitationsResponse.data); 

    const userInvitation = invitationsResponse.data.find(inv => {
      console.log("Проверяем приглашение:", inv);
      return inv.team.id === parseInt(teamId) && inv.status === 'pending';
    });

    console.log("Найденное приглашение:", userInvitation); 

    if (!userInvitation) {
      setSnackbar({
        open: true,
        message: "Приглашение не найдено. Проверьте, что оно действительно существует и имеет статус 'pending'.",
        severity: "error"
      });
      return;
    }

    const result = await axios.post(
      `${API_BASE_URL}/api/user/${currentUserId}/invitations/${userInvitation.id}/respond/`,
      { response: response ? 'accept' : 'reject' },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("Ответ сервера:", result.data);

    setSnackbar({
      open: true,
      message: response ? "Вы успешно вступили в команду!" : "Вы отклонили приглашение",
      severity: "success"
    });

    await fetchTeamData();

  } catch (error) {
    console.error("Ошибка обработки приглашения:", {
      error: error,
      response: error.response,
      data: error.response?.data
    });
    
    setSnackbar({
      open: true,
      message: error.response?.data?.detail || 
              error.response?.data?.message || 
              "Ошибка обработки приглашения",
      severity: "error"
    });
  } finally {
    setLoading(false);
  }
};

const handleLeaveTeam = async () => {
  try {
    const token = getAccessToken();
    if (!token) {
      navigate("/login");
      return;
    }

    await axios.post(
      `${API_BASE_URL}/api/team/${teamId}/leave/`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const teamResponse = await axios.get(
      `${API_BASE_URL}/api/team/${teamId}/`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    const updatedTeam = Array.isArray(teamResponse.data) ? teamResponse.data[0] : teamResponse.data;
    setTeam(updatedTeam);

    const isStillMember = updatedTeam.active_members.some(member => member.id === currentUserId);
    if (isStillMember) {
      throw new Error("Не удалось выйти из команды");
    }

    setSnackbar({
      open: true,
      message: "Вы успешно покинули команду",
      severity: "success"
    });


  } catch (error) {
    console.error("Ошибка выхода из команды:", error);
    setSnackbar({
      open: true,
      message: error.response?.data?.detail || "Ошибка выхода из команды",
      severity: "error"
    });
  }
};

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  }

  if (!team) {
    return <Alert severity="warning" sx={{ m: 2 }}>Команда не найдена</Alert>;
  }

  const activeMembers = team.active_members || [];
  const pendingMembers = team.pending_members || [];
  const isMember = activeMembers.some(member => member.id === currentUserId);
  const hasPendingInvite = pendingMembers.some(member => member.id === currentUserId);

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3, mt: -4 }}>
      {/* Уведомления */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Модальное окно приглашения */}
      {isCaptain && (
        <TeamInvite 
          open={inviteOpen} 
          onClose={handleCloseInvite} 
          teamId={teamId}
          onSuccess={(message) => setSnackbar({
            open: true,
            message: message,
            severity: "success"
          })}
        />
      )}

      <StyledTeamBox>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Avatar sx={{ width: 100, height: 100, mr: 3, bgcolor: 'primary.main' }}>
            <GroupIcon sx={{ fontSize: 50 }} />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h4">{team.name}</Typography>
              <Chip 
                icon={<MilitaryTechIcon />} 
                label={`Очки: ${team.team_score || 0}`} 
                color="primary"
              />
            </Box>
            
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <PersonIcon sx={{ mr: 1 }} />
              <Typography variant="body1" color="text.secondary">
                Капитан: {team?.captain_username || 'Неизвестно'}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Создана: {team.created_at 
                  ? new Date(team.created_at).toLocaleDateString("ru-RU") 
                  : "Неизвестно"}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 8 }}>
            {isCaptain && (
              <Button 
                variant="contained" 
                startIcon={<PersonAddIcon />}
                onClick={handleOpenInvite}
              >
                Пригласить
              </Button>
            )}
            
            {isMember && !isCaptain && (
              <Button 
                variant="outlined" 
                color="error"
                startIcon={<ExitToAppIcon />}
                onClick={handleLeaveTeam}
              >
                Покинуть команду
              </Button>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {team.description && (
          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {team.description}
            </Typography>
          </Box>
        )} 

        <Box sx={{ display: "flex", gap: 2 }}>
          <Chip 
            icon={<GroupIcon />} 
            label={`Участников: ${activeMembers.length}`} 
            variant="outlined" 
          />
          <Chip 
            icon={<PersonAddIcon />} 
            label={`Приглашений: ${pendingMembers.length}`} 
            variant="outlined" 
          />
        </Box>
      </StyledTeamBox>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Участники" icon={<GroupIcon />} />
        <Tab label="Приглашения" icon={<PersonAddIcon />} />
        <Tab label="История игр" icon={<HistoryIcon />} />
      </Tabs>

      {activeTab === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Участники команды</Typography>
          {activeMembers.length > 0 ? (
            <List>
              {activeMembers.map((member) => (
                <ListItem key={member.id}>
                  <ListItemAvatar>
                    <Avatar>
                      {member.username?.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={member.username || "Неизвестный пользователь"}
                    secondary={member.email || ""}
                  />
                  {member.id === team.captain ? ( 
                    <Chip 
                      label="Капитан" 
                      color="primary" 
                      size="small"
                      icon={<MilitaryTechIcon />}
                    />
                  ) : member.id === currentUserId ? (
                    <Chip 
                      label="Вы" 
                      color="primary" 
                      size="small"
                    />
                  ) : (
                    <Chip 
                      label="Участник" 
                      color="default" 
                      size="small"
                    />
                  )}
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>В команде пока нет участников</Typography>
          )}
        </Paper>
      )}

      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Приглашения</Typography>
          {pendingMembers.length > 0 ? (
            <List>
              {pendingMembers.map((member) => (
                <ListItem key={member.id}>
                  <ListItemAvatar>
                    <Avatar>
                      {member.username?.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={member.username || "Неизвестный пользователь"}
                    secondary={member.email || ""}
                  />
                  {member.id === currentUserId ? (
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleResponse(true)}
                        disabled={loading}
                      >
                        Принять
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleResponse(false)}
                        disabled={loading}
                      >
                        Отклонить
                      </Button>
                    </Stack>
                  ) : (
                    <Chip 
                      label="приглашён" 
                      color="default" 
                      size="small"
                    />
                  )}
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>В команде пока нет активных приглашений</Typography>
          )}
        </Paper>
      )}


      {activeTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>История игр команды</Typography>
          <Typography>Здесь будет история игр команды</Typography>
        </Paper>
      )}
    </Box>
  );
};

export default TeamDetail;
