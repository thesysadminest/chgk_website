import React, { useState, useEffect } from 'react';
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
  Popover,
  Chip,
  Paper,
  styled
} from '@mui/material';
import { 
  Add, 
  Quiz, 
  Group, 
  People 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
}));

const MyProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const userData = JSON.parse(localStorage.getItem('user'));
        
        if (!token || !userData) {
          navigate('/login');
          return;
        }

        const response = await axios.get(
          `http://127.0.0.1:8000/api/user/${userData.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        setUser(response.data[0]);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleCreateClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCreateClose = () => {
    setAnchorEl(null);
  };

  const handleCreateItem = (type) => {
    handleCreateClose();
    switch(type) {
      case 'question':
        navigate('/add-question');
        break;
      case 'pack':
        navigate('/add-pack');
        break;
      case 'team':
        navigate('/create-team');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return <Typography>Загрузка...</Typography>;
  }

  if (!user) {
    return <Typography>Пользователь не найден</Typography>;
  }
  

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <StyledPaper>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ width: 100, height: 100, mr: 3 }}>
            {user.username.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h4">{user.username}</Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
              {user.email}
            </Typography>
            {user.bio && (
              <Typography variant="body1" sx={{ mt: 2 }}>
                {user.bio}
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="main_button" 
            startIcon={<Add />}
            onClick={handleCreateClick}
            sx={{ mr: 2 }}
          >
            Создать
          </Button>

          <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={handleCreateClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
          >
            <List>
              <ListItemButton onClick={() => handleCreateItem('question')}>
                <ListItemText primary="Вопрос" />
                <Quiz sx={{ ml: 2 }} />
              </ListItemButton>
              <ListItemButton onClick={() => handleCreateItem('pack')}>
                <ListItemText primary="Пакет" />
                <Group sx={{ ml: 2 }} />
              </ListItemButton>
              <ListItemButton onClick={() => handleCreateItem('team')}>
                <ListItemText primary="Команду" />
                <People sx={{ ml: 2 }} />
              </ListItemButton>
            </List>
          </Popover>

          <Button 
            variant="outlined" 
            onClick={() => navigate(`/user/${user.id}/edit`)}
          >
            Редактировать профиль
          </Button>
        </Box>
      </StyledPaper>

      <StyledPaper>
        <Typography variant="h5" gutterBottom>Моя активность</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip 
            label={`Вопросов: ${user.questions_count || 0}`} 
            variant="outlined" 
            onClick={() => navigate('/my-questions')}
            clickable
          />
          <Chip 
            label={`Пакетов: ${user.packs_count || 0}`} 
            variant="outlined" 
            onClick={() => navigate('/my-packs')}
            clickable
          />
          <Chip 
            label={`Команд: ${user.teams_count || 0}`} 
            variant="outlined" 
            onClick={() => navigate('/my-teams')}
            clickable
          />
        </Box>
      </StyledPaper>
    </Box>
  );
};

export default MyProfile;
