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
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import GroupsIcon from "@mui/icons-material/Groups";
import { getAccessToken } from "../utils/AuthUtils";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import { LineChart } from '@mui/x-charts/LineChart';

const StyledProfileBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
  marginBottom: theme.spacing(4),
}));

const UserDetail = () => {
  const theme = useTheme();
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const [userResources, setUserResources] = useState({
    questions: [],
    packs: [],
    teams: []
  });
  const [ratingData, setRatingData] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const userId = parseInt(id, 10);

  console.log(id);
  console.log(userId);

  useEffect(() => {
    if (!userId) {
      setError("Неверный ID пользователя");
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = getAccessToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const [questionsRes, packsRes, teamsRes, ratingRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/question/list/`, { 
            headers,
            params: { author_q: userId }
          }),
          axios.get(`${API_BASE_URL}/api/pack/list/`, { 
            headers,
            params: { author_p: userId }
          }),
          axios.get(`${API_BASE_URL}/api/team/list/`, { headers }),
          axios.get(`${API_BASE_URL}/api/user/rating-history/`, { headers })
        ]);

        const userTeams = teamsRes.data.filter(team => 
          team.active_members.some(member => member.id === userId)
        );

        const userResponse = await axios.get(
          `${API_BASE_URL}/api/user/${userId}/`,
          { headers }
        );
        
        setUserData(userResponse.data[0]);
        let processedRatingData = [];
        if (ratingRes.data && Array.isArray(ratingRes.data)) {
          const endDate = new Date();
          const startDate = new Date(userResponse.data[0].date_joined);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(endDate.getDate() - 30);
          const chartStartDate = startDate > thirtyDaysAgo ? startDate : thirtyDaysAgo;
          
          processedRatingData = processRatingData(ratingRes.data, chartStartDate, endDate);
        }

        setUserResources({
          questions: questionsRes.data,
          packs: packsRes.data,
          teams: userTeams
        });
        
        setRatingData(processedRatingData);
        setResourcesLoading(false);

      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
        setError(error.response?.data?.detail || error.message || "Ошибка загрузки данных");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

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
                label={`Рейтинг: ${userData.elo_rating || 0}`} 
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
          />
          <Chip 
            icon={<GroupIcon />} 
            label={`Пакетов: ${userResources.packs.length}`} 
            variant="outlined" 
          />
          <Chip 
            icon={<GroupsIcon />} 
            label={`Команд: ${userResources.teams.length}`} 
            variant="outlined" 
          />
        </Box>
      </StyledProfileBox>

      {/* График рейтинга */}
      <StyledProfileBox>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          История рейтинга
        </Typography>
        {ratingData.length > 0 ? (
          <Box sx={{ height: 300, width: '100%', position: 'relative' }}>
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
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
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
                  showMark: ({ index }) => index === 0 || index === ratingData.length - 1,
                }]}
                dataset={ratingData}
                height={300}
                margin={{ left: 70, right: 30, top: 30, bottom: 30 }}
                sx={{
                  '& .MuiLineElement-root': {
                    strokeWidth: 3,
                    filter: 'drop-shadow(3px 3px 5px rgba(0, 0, 0, 0.3))',
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
                    filter: 'drop-shadow(2px 2px 3px rgba(0, 0, 0, 0.2))',
                  },
                }}
              />
            </Box>
          </Box>
        ) : (
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            Нет данных о рейтинге
          </Typography>
        )}
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
       <Paper sx={{ 
          p: 3, 
          flex: 1, 
          display: activeTab === 0 ? 'block' : 'none' 
        }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Созданные вопросы
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
                  button
                  component="a"
                  href={`/question/${question.id}`}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    color: theme.palette.background.white,
                    backgroundColor: 'background.paper',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    }
                  }}
                >
                  <ListItemText
                    primary={question.question_text}
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
                  button
                  component="a"
                  href={`/pack/${pack.id}`}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    color: theme.palette.background.white,
                    backgroundColor: 'background.paper',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <GroupIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={pack.name}
                    secondary={`${pack.questions?.length || 0} вопросов • Рейтинг: ${pack.rating || 0}`}
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
                  button
                  component="a"
                  href={`/team/${team.id}`}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    color: theme.palette.background.white,
                    backgroundColor: 'background.paper',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <GroupsIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={team.name}
                    secondary={`${team.active_members?.length || 0} участников`}
                  />
                  {team.captain === parseInt(userId) && (
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