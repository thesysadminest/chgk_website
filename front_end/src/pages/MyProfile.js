import API_BASE_URL from '../config';
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
  Chip,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Skeleton,
  ClickAwayListener
} from "@mui/material";
import { 
  Add, 
  Quiz, 
  Group, 
  People,
  Email,
  MilitaryTech,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { LineChart } from '@mui/x-charts/LineChart';

const MyProfile = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [ratingData, setRatingData] = useState([]);
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

        const response = await axios.get(
          `${API_BASE_URL}/api/user/${userData.id}/`,
          {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          }
        );
        
        setUser(response.data[0]);

        const ratingResponse = await axios.get(
          `${API_BASE_URL}/api/user/rating-history`,
          {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          }
        )

        if (ratingResponse.data && Array.isArray(ratingResponse.data)) {
          const endDate = new Date();
          const startDate = new Date(userData.date_joined);
          
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(endDate.getDate() - 30);
          
          const chartStartDate = startDate > thirtyDaysAgo ? startDate : thirtyDaysAgo;
          
          const processedData = processRatingData(ratingResponse.data, chartStartDate, endDate);
          setRatingData(processedData);
        }

      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

  fetchUserData(); // Вызываем функцию загрузки данных
}, []); // Пустой массив зависимостей для однократного выполнения

  const processRatingData = (data, startDate, endDate) => {
    const dateMap = {};
    const result = [];
    
    data.forEach(item => {
      const date = new Date(item.date).toISOString().split('T')[0];
      dateMap[date] = item.rating;
    });

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      result.push({
        date: new Date(currentDate),
        rating: dateMap[dateStr] || (result.length > 0 ? result[result.length - 1].rating : 1000)
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  };

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

  const ratingZones = [
    { min: 0, max: 200, color: '#CCCCCC'}, //1
    { min: 200, max: 400, color: '#77FF77'}, // 2
    { min: 400, max: 600, color: '#77DDBB'}, // 3 
    { min: 600, max: 800, color: '#AAAAFF'}, // 4
    { min: 800, max: 1000, color: '#FF88FF'}, // 5
    { min: 1000, max: 1200, color: '#FFCC88'}, // 6
    { min: 1200, max: 1400, color: '#FFBB55'}, // 7
    { min: 1400, max: 1600, color: '#FF7777'}, // 8
    { min: 1600, max: 1800, color: '#FF3333'}, // 9
    { min: 1800, max: 2000, color: '#AA0000'} // 10
  ];

  const chartData = ratingData.length > 0 ? ratingData : [];
  const minRating = chartData.length > 0 ? Math.max(0, Math.min(...chartData.map(d => d.rating)) - 200) : 0;
  const maxRating = chartData.length > 0 ? Math.max(...chartData.map(d => d.rating)) + 200 : 3000;

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

      <Paper 
        sx={{ 
          padding: theme.spacing(3),
          marginBottom: theme.spacing(8),
          backgroundColor: theme.palette.background.light,
          borderRadius: 2
        }}
      >
        <Box sx={{ height: 300, width: '100%' , mb: 4}}>
          <Typography variant="h6" gutterBottom>История рейтинга</Typography>
          
          {chartData.length > 0 ? (
            <Box sx={{ 
              position: 'relative', 
              height: '100%',
              width: '100%'
            }}>
              {/* Цветные зоны - фиксированные от 0 до 2000 */}
              <Box sx={{
                position: 'absolute',
                top: '30px',
                left: '70px',
                right: '30px',
                bottom: '30px',
                zIndex: 0,
                display: 'flex',
                flexDirection: 'column-reverse',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                {ratingZones.map((zone, index) => {
                  // Фиксированные значения для всех зон (0-2000)
                  const top = ((2000 - zone.max) / 2000) * 100;
                  const bottom = ((2000 - zone.min) / 2000) * 100;
                  
                  return (
                    <Box 
                      key={index}
                      sx={{
                        position: 'absolute',
                        top: `${top}%`,
                        bottom: `${100 - bottom}%`,
                        left: 0,
                        right: 0,
                        backgroundColor: zone.color,
                        borderBottom: index !== ratingZones.length - 1 ? '1px solid rgba(0,0,0,0.1)' : 'none'
                      }}
                    />
                  );
                })}
              </Box>

              {/* График с фиксированным масштабом 0-2000 */}
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0 
              }}>
                <LineChart
                  xAxis={[{
                    dataKey: 'date',
                    scaleType: 'time',
                    valueFormatter: (date) => date.toLocaleDateString(),
                  }]}
                  yAxis={[{
                    min: 0,
                    max: 2000,
                    tickInterval: ratingZones.map(zone => zone.min).concat(2000),
                  }]}
                  series={[{
                    dataKey: 'rating',
                    area: false,
                    color: '#EDC240',
                    showMark: ({ index }) => index === 0 || index === chartData.length - 1,
                  }]}
                  dataset={chartData}
                  height={300}
                  margin={{ left: 70, right: 30, top: 30, bottom: 30 }}
                  sx={{
                    '& .MuiLineElement-root': {
                      strokeWidth: 3,
                      filter: 'drop-shadow(3px 3px 5px rgba(0, 0, 0, 0.3))', // Тень для линии
                    },
                    '& .MuiChartsAxis-line': {
                      stroke: 'white',
                      strokeWidth: 2,
                    },
                    '& .MuiChartsAxis-tick': {
                      stroke: 'white',
                      strokeWidth: 2,
                    },
                    '& .MuiChartsAxis-tickLabel': {
                      fill: 'white',
                      fontSize: '0.75rem',
                    },
                    '& .MuiMarkElement-root': {
                      fill: 'white !important',
                      fillOpacity: 1,
                      filter: 'drop-shadow(2px 2px 3px rgba(0, 0, 0, 0.2))', // Тень для маркеров
                    },
                  }}
                />
              </Box>
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              Нет данных о рейтинге
            </Typography>
          )}
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