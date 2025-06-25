import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Stack,
  CircularProgress,
  Container,
  Chip,
  Divider,
  Button,
  Paper,
  styled
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { getAccessToken, getUserData } from '../utils/AuthUtils';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StyledTeamCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
  marginBottom: theme.spacing(4),
  cursor: 'pointer',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[6],
  },
}));

const MyTeams = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUserTeams = async () => {
      try {
        const token = getAccessToken();
        if (!token) {
          navigate('/login');
          return;
        }

        const userData = getUserData();
        if (!userData || !userData.id) {
          throw new Error('Не удалось получить данные пользователя');
        }
        setCurrentUser(userData);

        const response = await axios.get('${API_BASE_URL}/api/team/list/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Filter teams where current user is in active_members
        const filteredTeams = response.data.filter(team => 
          team.active_members.some(member => member.id === userData.id)
        );

        setTeams(filteredTeams);
      } catch (err) {
        console.error('Error fetching user teams:', err);
        setError(err.response?.data?.message || 'Не удалось загрузить ваши команды');
      } finally {
        setLoading(false);
      }
    };

    fetchUserTeams();
  }, [navigate]);

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
      <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
        {error}
      </Typography>
    );
  }

  if (teams.length === 0) {
    return (
      <Typography sx={{ mt: 2, textAlign: 'center' }}>
        У вас пока нет активных команд. Создайте новую команду или примите приглашение.
      </Typography>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: theme.palette.text.primary }}>
        Мои команды
      </Typography>

      <Stack spacing={3}>
        {teams.map((team) => (
          <StyledTeamCard key={team.id} onClick={() => handleTeamClick(team.id)}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <Avatar sx={{ 
                width: 80, 
                height: 80, 
                mr: 3, 
                bgcolor: 'primary.main',
                fontSize: '2.5rem'
              }}>
                {team.name.charAt(0).toUpperCase()}
              </Avatar>
              
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h5">{team.name}</Typography>
                  <Chip 
                    icon={<MilitaryTechIcon />} 
                    label={`Очки: ${team.team_score || 0}`} 
                    color="primary"
                  />
                   <Chip 
                label={team.captain === currentUser?.id ? "Вы капитан" : "Вы участник"} 
                color={team.captain === currentUser?.id ? "primary" : "default"}
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

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Chip 
                  icon={<GroupIcon />} 
                  label={`${team.active_members?.length || 0} участников`} 
                  variant="outlined" 
                />
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

           
          </StyledTeamCard>
        ))}
      </Stack>
    </Container>
  );
};

export default MyTeams;