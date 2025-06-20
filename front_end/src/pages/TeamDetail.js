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
  Tooltip
} from "@mui/material";
import { styled } from "@mui/material/styles";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import HistoryIcon from "@mui/icons-material/History";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { getAccessToken } from "../utils/AuthUtils";
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

  useEffect(() => {
  const fetchTeamData = async () => {
  try {
    setLoading(true);
    const token = getAccessToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const response = await axios.get(
      `http://127.0.0.1:8000/api/team/${teamId}/`,
      { headers }
    );
    
    // Исправление: берем первый элемент массива если пришел массив
    const teamData = Array.isArray(response.data) ? response.data[0] : response.data;
    
    console.log('Processed team data:', teamData); // Добавьте это для проверки
    
    if (!teamData) {
      throw new Error('Пустой ответ от сервера');
    }
    
    setTeam(teamData);

    if (token) {
      const userResponse = await axios.get(
        `http://127.0.0.1:8000/api/user/me/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsCaptain(teamData.captain === userResponse.data.id);
    }

  } catch (error) {
    console.error("Ошибка загрузки:", error);
    setError(error.response?.data?.detail || error.message || "Ошибка загрузки данных");
  } finally {
    setLoading(false);
  }
};

  fetchTeamData();
}, [teamId]);


  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleInviteMembers = () => {
    navigate(`/team/${teamId}/invite`);
  };

  const handleRespondToInvitation = async (invitationId, accept) => {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("Требуется авторизация");
      }

      await axios.post(
        `http://127.0.0.1:8000/api/invitations/${invitationId}/respond/`,
        { response: accept ? 'accept' : 'reject' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Обновляем данные команды после ответа
      const response = await axios.get(
        `http://127.0.0.1:8000/api/team/${teamId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTeam(response.data);

    } catch (error) {
      console.error("Ошибка обработки приглашения:", error);
      setError(error.response?.data?.message || error.message || "Ошибка обработки приглашения");
    }
  };

  const handleRevokeInvitation = async (memberId) => {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("Требуется авторизация");
      }

      await axios.delete(
        `http://127.0.0.1:8000/api/team/member/${memberId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Обновляем данные команды после отзыва
      const response = await axios.get(
        `http://127.0.0.1:8000/api/team/${teamId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTeam(response.data);

    } catch (error) {
      console.error("Ошибка отзыва приглашения:", error);
      setError(error.response?.data?.message || error.message || "Ошибка отзыва приглашения");
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!team) {
    return <Alert severity="warning">Команда не найдена</Alert>;
  }

  console.log('Team data:', {
  name: team.name,
  captain: team.captain,
  captain_username: team.captain_username,
  created_at: team.created_at,
  members: team.members
});
  const activeMembers = team.members?.filter(member => member.is_active) || [];
  const pendingInvitations = team.members?.filter(member => !member.is_active) || [];

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
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

          {isCaptain && (
            <Button 
              variant="contained" 
              startIcon={<PersonAddIcon />}
              onClick={handleInviteMembers}
            >
              Пригласить
            </Button>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: "flex", gap: 2 }}>
          <Chip 
            icon={<GroupIcon />} 
            label={`Участников: ${activeMembers.length}`} 
            variant="outlined" 
          />
          <Chip 
            icon={<PersonAddIcon />} 
            label={`Приглашений: ${pendingInvitations.length}`} 
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
                      {member.user?.username?.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={member.user?.username || "Неизвестный пользователь"}
                    secondary={member.user?.email || ""}
                  />
                  {member.role === 'CAPTAIN' ? (
                    <Chip 
                      label="Капитан" 
                      color="primary" 
                      size="small"
                      icon={<MilitaryTechIcon />}
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" gutterBottom>Ожидающие приглашения</Typography>
            {isCaptain && (
              <Button 
                variant="outlined" 
                startIcon={<PersonAddIcon />}
                onClick={handleInviteMembers}
              >
                Новое приглашение
              </Button>
            )}
          </Box>
          
          {pendingInvitations.length > 0 ? (
            <List>
              {pendingInvitations.map((invitation) => (
                <ListItem key={invitation.id}>
                  <ListItemAvatar>
                    <Avatar>
                      {invitation.user?.username?.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={invitation.user?.username || "Неизвестный пользователь"}
                    secondary={`Приглашение отправлено: ${new Date(invitation.joined_at).toLocaleString()}`}
                  />
                  
                  {isCaptain ? (
                    <Button 
                      size="small" 
                      color="error"
                      onClick={() => handleRevokeInvitation(invitation.id)}
                    >
                      Отозвать
                    </Button>
                  ) : (
                    <Box>
                      <Button 
                        size="small" 
                        color="success"
                        sx={{ mr: 1 }}
                        onClick={() => handleRespondToInvitation(invitation.id, true)}
                      >
                        Принять
                      </Button>
                      <Button 
                        size="small" 
                        color="error"
                        onClick={() => handleRespondToInvitation(invitation.id, false)}
                      >
                        Отклонить
                      </Button>
                    </Box>
                  )}
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>Нет ожидающих приглашений</Typography>
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