import API_BASE_URL from '../config';
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
  Skeleton,
  Snackbar
} from "@mui/material";
import { styled } from "@mui/material/styles";
import EmailIcon from "@mui/icons-material/Email";
import QuizIcon from "@mui/icons-material/Quiz";
import GroupIcon from "@mui/icons-material/Group";
import HistoryIcon from "@mui/icons-material/History";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import GroupsIcon from "@mui/icons-material/Groups";
import { getAccessToken } from "../utils/AuthUtils";
import { useTheme } from "@mui/material/styles";
import axios from "axios";

const StyledProfileBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
  marginBottom: theme.spacing(4),
}));

const UserDetail = () => {
  const theme = useTheme();
  const { id: userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [userResources, setUserResources] = useState({
    questions: [],
    packs: [],
    teams: [],
    pending_invitations: []
  });
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const [resourcesLoaded, setResourcesLoaded] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = getAccessToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const userResponse = await axios.get(
          `${API_BASE_URL}/api/user/${userId}/`
        );
        
        setUserData(userResponse.data[0]);

        if (token) {
          const currentUserResponse = await axios.get(
            `http://127.0.0.1:8000/api/user/me/`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setCurrentUserId(currentUserResponse.data.id);
        }

        const resourcesResponse = await axios.get(
          `http://127.0.0.1:8000/api/user/${userId}/`,
          { headers }
        );
        
        setUserResources({
          questions: resourcesResponse.data.questions || [],
          packs: resourcesResponse.data.packs || [],
          teams: resourcesResponse.data.teams || [],
          pending_invitations: resourcesResponse.data.pending_invitations || []
        });
        
        setResourcesLoaded(true);

      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
        setError(error.response?.data?.detail || error.message || "Ошибка загрузки данных");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
    return (
      <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!userData) {
    return (
      <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
        <Alert severity="warning">Пользователь не найден</Alert>
      </Box>
    );
  }

  const isCurrentUser = currentUserId === parseInt(userId);

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3, mt: -4 }}>
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

      <StyledProfileBox>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3, backgroundColor: theme.palette.background.light }}>
          <Avatar 
            sx={{ width: 100, height: 100, mr: 3, bgcolor: 'primary.main' }}
            src={userData.avatar}
          >
            {userData.username.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h4">{userData.username}</Typography>
              <Chip 
                icon={<MilitaryTechIcon />} 
                label={`Рейтинг: ${userData.rating || 0}`} 
                color="primary"
              />
            </Box>
            
            {userData.email && (
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                <EmailIcon sx={{ mr: 1 }} />
                <Typography variant="body1" color="text.secondary">
                  {userData.email}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Зарегистрирован: {userData.date_joined 
                  ? new Date(userData.date_joined).toLocaleDateString("ru-RU") 
                  : "Неизвестно"}
              </Typography>
            </Box>
          </Box>

          {isCurrentUser && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 8 }}>
              <Button 
                variant="contained"
                onClick={() => {}}
              >
                Редактировать профиль
              </Button>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {userData.bio && (
          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {userData.bio}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: "flex", gap: 2, flexWrap: 'wrap' }}>
          <Chip 
            icon={<QuizIcon />} 
            label={`Вопросов: ${userResources.questions.length}`} 
            variant="outlined" 
            color={activeTab === 0 ? 'primary' : 'default'}
            onClick={() => setActiveTab(0)}
          />
          <Chip 
            icon={<GroupIcon />} 
            label={`Пакетов: ${userResources.packs.length}`} 
            variant="outlined" 
            color={activeTab === 1 ? 'primary' : 'default'}
            onClick={() => setActiveTab(1)}
          />
          <Chip 
            icon={<GroupsIcon />} 
            label={`Команд: ${userResources.teams.length}`} 
            variant="outlined" 
            color={activeTab === 2 ? 'primary' : 'default'}
            onClick={() => setActiveTab(2)}
          />
        </Box>
      </StyledProfileBox>

      <Tabs 
        value={activeTab} 
        onChange={handleTabChange}
        variant="fullWidth"
        indicatorColor="primary"
        textColor="primary"
        sx={{ mb: 3 }}
      >
        <Tab label="Вопросы" icon={<QuizIcon />} />
        <Tab label="Пакеты" icon={<GroupIcon />} />
        <Tab label="Команды" icon={<GroupsIcon />} />
      </Tabs>

      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Вопросы */}
        <Paper sx={{ 
          p: 3, 
          flex: 1, 
          display: activeTab === 0 ? 'block' : 'none' 
        }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Созданные вопросы
          </Typography>
          {!resourcesLoaded ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} height={72} />
              ))}
            </Box>
          ) : userResources.questions.length > 0 ? (
            <List disablePadding>
              {userResources.questions.map((question) => (
                <ListItem 
                  key={question.id} 
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    backgroundColor: 'background.paper'
                  }}
                >
                  <ListItemText
                    primary={question.question_text}
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                    secondary={`Опубликовано: ${new Date(question.pub_date_q).toLocaleDateString()}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary" sx={{ py: 2 }}>
              Пользователь еще не создал публичных вопросов
            </Typography>
          )}
        </Paper>

        {/* Пакеты */}
        <Paper sx={{ 
          p: 3, 
          flex: 1, 
          display: activeTab === 1 ? 'block' : 'none' 
        }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Созданные пакеты
          </Typography>
          {!resourcesLoaded ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={72} />
              ))}
            </Box>
          ) : userResources.packs.length > 0 ? (
            <List disablePadding>
              {userResources.packs.map((pack) => (
                <ListItem 
                  key={pack.id}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    backgroundColor: 'background.paper'
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <GroupIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={pack.name}
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                    secondary={`${pack.questions_count || 0} вопросов • Рейтинг: ${pack.rating || 0}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary" sx={{ py: 2 }}>
              Пользователь еще не создал публичных пакетов
            </Typography>
          )}
        </Paper>

        {/* Команды */}
        <Paper sx={{ 
          p: 3, 
          flex: 1, 
          display: activeTab === 2 ? 'block' : 'none' 
        }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Команды пользователя
          </Typography>
          {!resourcesLoaded ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={72} />
              ))}
            </Box>
          ) : userResources.teams.length > 0 ? (
            <List disablePadding>
              {userResources.teams.map((team) => (
                <ListItem 
                  key={team.id}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    backgroundColor: 'background.paper'
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <GroupsIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={team.name}
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                    secondary={`${team.members_count || 0} участников • Очки: ${team.team_score || 0}`}
                  />
                  {team.captain === currentUserId && (
                    <Chip 
                      label="Капитан" 
                      size="small" 
                      color="primary" 
                      sx={{ ml: 1 }}
                    />
                  )}
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary" sx={{ py: 2 }}>
              Пользователь не состоит ни в одной команде
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default UserDetail;