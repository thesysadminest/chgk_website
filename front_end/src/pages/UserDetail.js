import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Avatar, 
  Button, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar,
  Chip,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
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
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [userQuestions, setUserQuestions] = useState([]);
  const [userPacks, setUserPacks] = useState([]);
  const [userTeams, setUserTeams] = useState([]);
  const [gameHistory, setGameHistory] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const currentUser = JSON.parse(localStorage.getItem('user'));
        
        // Получаем данные пользователя
        const userResponse = await axios.get(
          `http://127.0.0.1:8000/api/user/${userId}/`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        setUserData(userResponse.data);
        setIsCurrentUser(currentUser?.id.toString() === userId);

        // Получаем вопросы пользователя
        const questionsResponse = await axios.get(
          `http://127.0.0.1:8000/api/user/${userId}/questions/`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setUserQuestions(questionsResponse.data);

        // Получаем пакеты пользователя
        const packsResponse = await axios.get(
          `http://127.0.0.1:8000/api/user/${userId}/packs/`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setUserPacks(packsResponse.data);

        // Получаем команды пользователя
        const teamsResponse = await axios.get(
          `http://127.0.0.1:8000/api/user/${userId}/teams/`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setUserTeams(teamsResponse.data);

        // Получаем историю игр
        const gameHistoryResponse = await axios.get(
          `http://127.0.0.1:8000/api/user/${userId}/game_attempts/`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setGameHistory(gameHistoryResponse.data);

      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
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
    return <Typography>Загрузка профиля...</Typography>;
  }

  if (!userData) {
    return <Typography>Пользователь не найден</Typography>;
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
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <EmailIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="body1" color="text.secondary">
                {userData.email || 'Email не указан'}
              </Typography>
            </Box>
            {isCurrentUser && (
              <Button 
                variant="outlined" 
                sx={{ mt: 2 }}
                onClick={() => navigate(`/user/${userId}/edit`)}
              >
                Редактировать профиль
              </Button>
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
          <Chip 
            icon={<PersonIcon />} 
            label={`Команд: ${userTeams.length}`} 
            variant="outlined" 
          />
        </Box>
      </StyledProfileBox>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Вопросы" icon={<QuizIcon />} />
        <Tab label="Пакеты" icon={<GroupIcon />} />
        <Tab label="Команды" icon={<PersonIcon />} />
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
            <Typography>Пользователь еще не создал вопросов</Typography>
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
                    secondary={`${pack.questions.length} вопросов · ${new Date(pack.pub_date_p).toLocaleDateString()}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>Пользователь еще не создал пакетов</Typography>
          )}
        </Paper>
      )}

      {activeTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Команды</Typography>
          {userTeams.length > 0 ? (
            <List>
              {userTeams.map((team) => (
                <ListItem 
                  key={team.id}
                  button
                  onClick={() => navigate(`/team/${team.id}`)}
                >
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={team.name}
                    secondary={`Очки: ${team.team_score}`}
                  />
                  {team.captain?.id.toString() === userId && (
                    <Chip label="Капитан" size="small" color="primary" />
                  )}
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>Пользователь не состоит в командах</Typography>
          )}
        </Paper>
      )}

      {activeTab === 3 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>История игр</Typography>
          {gameHistory.length > 0 ? (
            <List>
              {gameHistory.map((attempt) => (
                <ListItem key={attempt.id}>
                  <ListItemText
                    primary={`Пак: ${attempt.pack.name}`}
                    secondary={
                      <>
                        <span>{new Date(attempt.timestamp).toLocaleString()}</span>
                        <br />
                        <span>Правильных ответов: {attempt.correct_answers} из {attempt.pack.questions.length}</span>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>История игр пуста</Typography>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default UserDetail;