import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Avatar, 
  Button, 
  Divider, 
  List, 
  ListItem, 
  ListItemText,
  ListItemButton,
  ListItemAvatar,
  Popover,
  Chip,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  styled,
  Skeleton
} from "@mui/material";
import { 
  Add, 
  Quiz, 
  Group, 
  People,
  Email,
  MilitaryTech,
  History
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MyProfile = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [userResources, setUserResources] = useState({
    questions: [],
    packs: [],
    teams: []
  });
  const [resourcesLoading, setResourcesLoading] = useState(false);

 useEffect(() => {
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const userData = JSON.parse(localStorage.getItem("user"));
      
      if (!token || !userData) {
        setError("Требуется авторизация");
        return;
      }

      // Загружаем данные пользователя
      const userResponse = await axios.get(
        `http://127.0.0.1:8000/api/user/${userData.id}/`,
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );
      
      setUser(userResponse.data[0]);
      
      // Загружаем ресурсы пользователя
      await loadUserResources(userData.id, token);
      
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
      setError(error.response?.data?.detail || "Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  }

  const loadUserResources = async (userId, token) => {
    try {
      setResourcesLoading(true);
      
      // Получаем вопросы пользователя
      const questionsResponse = await axios.get(
        `http://127.0.0.1:8000/api/question/list/`,
        {
          headers: {
            "Authorization": `Bearer ${token}`
          },
          params: {
            author_q: userId
          }
        }
      );

      // Получаем пакеты пользователя
      const packsResponse = await axios.get(
        `http://127.0.0.1:8000/api/pack/list/`,
        {
          headers: {
            "Authorization": `Bearer ${token}`
          },
          params: {
            author_p: userId
          }
        }
      );

      // Получаем ВСЕ команды (как в MyTeams)
      const teamsResponse = await axios.get(
        `http://127.0.0.1:8000/api/team/list/`,
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );

      // Фильтруем команды, где пользователь является активным участником
      const userTeams = teamsResponse.data.filter(team => 
        team.active_members.some(member => member.id === userId)
      );

      setUserResources({
        questions: questionsResponse.data || [],
        packs: packsResponse.data || [],
        teams: userTeams // Используем отфильтрованный список
      });
      
    } catch (error) {
      console.error("Ошибка загрузки ресурсов:", error);
      setError("Ошибка загрузки ресурсов пользователя");
    } finally {
      setResourcesLoading(false);
    }
  };

  fetchUserData(); // Вызываем функцию загрузки данных
}, []); // Пустой массив зависимостей для однократного выполнения

  const handleCreateClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCreateClose = () => {
    setAnchorEl(null);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleQuestionClick = (questionId) => {
    navigate(`/question/${questionId}`);
  };

  const handlePackClick = (packId) => {
    navigate(`/pack/${packId}`);
  };

  const handleTeamClick = (teamId) => {
    navigate(`/team/${teamId}`);
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
      <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
        <Alert severity="warning">Пользователь не найден</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <Paper 
        sx={{ 
          padding: theme.spacing(3),
          marginBottom: theme.spacing(3),
          backgroundColor: theme.palette.background.light,
          borderRadius: 2
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Avatar 
            sx={{ width: 100, height: 100, mr: 3, bgcolor: 'primary.main' }}
          >
            {user.username.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h4">{user.username}</Typography>
              <Chip 
                icon={<MilitaryTech />} 
                label={`Рейтинг: ${user.rating || 0}`} 
                color="primary"
              />
            </Box>
            
            {user.email && (
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                <Email sx={{ mr: 1 }} />
                <Typography variant="body1" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Зарегистрирован: {user.date_joined 
                  ? new Date(user.date_joined).toLocaleDateString("ru-RU") 
                  : "Неизвестно"}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {user.bio && (
          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {user.bio}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Chip 
            icon={<Quiz />} 
            label={`Вопросов: ${userResources.questions.length}`} 
            variant="outlined" 
          />
          <Chip 
            icon={<Group />} 
            label={`Пакетов: ${userResources.packs.length}`} 
            variant="outlined" 
          />
          <Chip 
            icon={<People />} 
            label={`Команд: ${userResources.teams.length}`} 
            variant="outlined" 
          />
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button 
            variant="outlined" 
            onClick={() => {}}
          >
            Редактировать профиль
          </Button>
        </Box>
      </Paper>

      <Tabs 
        value={activeTab} 
        onChange={handleTabChange}
        variant="fullWidth"
        indicatorColor="primary"
        textColor="primary"
        sx={{ mb: 3 }}
      >
        <Tab label="Мои вопросы" icon={<Quiz />} />
        <Tab label="Мои пакеты" icon={<Group />} />
        <Tab label="Мои команды" icon={<People />} />
      </Tabs>

      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Вопросы */}
        <Paper sx={{ 
          p: 3, 
          flex: 1, 
          display: activeTab === 0 ? 'block' : 'none' 
        }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Мои вопросы
          </Typography>
          {resourcesLoading ? (
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
                  disablePadding
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    backgroundColor: 'background.paper'
                  }}
                >
                  <ListItemButton onClick={() => handleQuestionClick(question.id)}>
                    <ListItemText
                      primary={question.question_text}
                      primaryTypographyProps={{ fontWeight: 'medium' }}
                      secondary={`Опубликовано: ${new Date(question.pub_date_q).toLocaleDateString()}`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary" sx={{ py: 2 }}>
              Вы еще не создали вопросов
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
            Мои пакеты
          </Typography>
          {resourcesLoading ? (
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
                  disablePadding
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    backgroundColor: 'background.paper'
                  }}
                >
                  <ListItemButton onClick={() => handlePackClick(pack.id)}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <Group />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={pack.name}
                      primaryTypographyProps={{ fontWeight: 'medium' }}
                      secondary={`${pack.questions_count || 0} вопросов • Рейтинг: ${pack.rating || 0}`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary" sx={{ py: 2 }}>
              Вы еще не создали пакетов
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
            Мои команды
          </Typography>
          {resourcesLoading ? (
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
                  disablePadding
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    backgroundColor: 'background.paper'
                  }}
                >
                  <ListItemButton onClick={() => handleTeamClick(team.id)}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <People />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={team.name}
                      primaryTypographyProps={{ fontWeight: 'medium' }}
                      secondary={`${team.members_count || 0} участников • Очки: ${team.team_score || 0}`}
                    />
                    {team.captain === user.id && (
                      <Chip 
                        label="Капитан" 
                        size="small" 
                        color="primary" 
                        sx={{ ml: 1 }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary" sx={{ py: 2 }}>
              Вы не состоите ни в одной команде
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default MyProfile;