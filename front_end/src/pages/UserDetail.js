import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Alert
} from '@mui/material';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import EmailIcon from '@mui/icons-material/Email';
import QuizIcon from '@mui/icons-material/Quiz';
import GroupIcon from '@mui/icons-material/Group';
import HistoryIcon from '@mui/icons-material/History';

const StyledProfileBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
  marginBottom: theme.spacing(4),
}));

const UserDetail = () => {
  const userId = useParams().id;
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [userQuestions, setUserQuestions] = useState([]);
  const [userPacks, setUserPacks] = useState([]);
  const [gameHistory, setGameHistory] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
       
        const userResponse = await axios.get(
          `http://127.0.0.1:8000/api/user/${userId}`
        );
        
        setUserData(userResponse.data[0]);

        // дальше закомментил потому что на бэке нет таких методов
        
        // Получаем публичные вопросы пользователя
        /*const questionsResponse = await axios.get(
          `http://127.0.0.1:8000/user/${userId}/questions/public/`
        );
        setUserQuestions(questionsResponse.data);

        // Получаем публичные пакеты пользователя
        const packsResponse = await axios.get(
          `http://127.0.0.1:8000/api/user/${userId}/packs/public/`
        );
        setUserPacks(packsResponse.data);

        // Получаем публичную историю игр
        const gameHistoryResponse = await axios.get(
          `http://127.0.0.1:8000/user/${userId}/game_attempts/public/`
        );
        setGameHistory(gameHistoryResponse.data);*/

      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        setError(error.response?.data?.detail || error.message || 'Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!userData) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Alert severity="warning">Пользователь не найден</Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <StyledProfileBox>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ width: 100, height: 100, mr: 3 }}>
            {userData.username.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h4">{userData.username}</Typography>
            {userData.email && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <EmailIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body1" color="text.secondary">
                  {userData.email}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {userData.bio && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1">{userData.bio}</Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', mt: 3, gap: 2 }}>
          <Chip 
            icon={<QuizIcon />} 
            label={`Вопросов: ${userQuestions.length}`} 
            variant="outlined" 
          />
          <Chip 
            icon={<GroupIcon />} 
            label={`Пакетов: ${userPacks.length}`} 
            variant="outlined" 
          />
        </Box>
      </StyledProfileBox>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Вопросы" icon={<QuizIcon />} />
        <Tab label="Пакеты" icon={<GroupIcon />} />
        <Tab label="История игр" icon={<HistoryIcon />} />
      </Tabs>

      {activeTab === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Созданные вопросы</Typography>
          {userQuestions.length > 0 ? (
            <List>
              {userQuestions.map((question) => (
                <ListItem 
                  key={question.id} 
                  button
                  onClick={() => navigate(`/question/${question.id}`)}
                >
                  <ListItemText
                    primary={question.question_text}
                    secondary={`Опубликовано: ${new Date(question.pub_date_q).toLocaleDateString()}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>Пользователь еще не создал публичных вопросов</Typography>
          )}
        </Paper>
      )}

      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Созданные пакеты</Typography>
          {userPacks.length > 0 ? (
            <List>
              {userPacks.map((pack) => (
                <ListItem 
                  key={pack.id}
                  button
                  onClick={() => navigate(`/pack/${pack.id}`)}
                >
                  <ListItemAvatar>
                    <Avatar>
                      <GroupIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={pack.name}
                    secondary={'${pack.questions?.length || 0} вопросов'}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>Пользователь еще не создал публичных пакетов</Typography>
          )}
        </Paper>
      )}

      {activeTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>История игр</Typography>
          {gameHistory.length > 0 ? (
            <List>
              {gameHistory.map((attempt) => (
                <ListItem key={attempt.id}>
                  <ListItemText
                    primary={`Пакет: ${attempt.pack?.name || 'Неизвестно'}`}
                    secondary={
                      <>
                        <span>{new Date(attempt.timestamp).toLocaleString()}</span>
                        <br />
                        <span>Правильных ответов: {attempt.correct_answers}</span>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>Публичная история игр отсутствует</Typography>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default UserDetail;
