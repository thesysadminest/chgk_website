import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config';
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { useTheme } from "@mui/material/styles";
import ScheduleIcon from '@mui/icons-material/Schedule';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupIcon from '@mui/icons-material/Group';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { getAccessToken } from '../utils/AuthUtils';
import { getRefreshToken } from '../utils/AuthUtils';
import { setAuthTokens } from '../utils/AuthUtils';
import { verifyToken } from '../utils/AuthUtils';
import { clearAuthTokens } from '../utils/AuthUtils';
import { setUserData } from '../utils/AuthUtils';
import { refreshAccessToken } from '../utils/AuthUtils';

const Invitations = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true,
    user: null
  });

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        const accessToken = getAccessToken();
        if (!accessToken) {
          setAuthState({ isAuthenticated: false, isLoading: false, user: null });
          return;
        }

        const userData = await verifyToken(accessToken);
        setUserData(userData);
        setAuthState({ isAuthenticated: true, isLoading: false, user: userData });
        
        await fetchInvitations(userData.id); 
        
      } catch (error) {
        console.error('Auth check error:', error);
        clearAuthTokens();
        setAuthState({ isAuthenticated: false, isLoading: false, user: null });
      }
    };

    checkAuthAndFetchData();
  }, []);

  const fetchInvitations = async (userId) => {
    try {
      setLoading(true);
      const accessToken = getAccessToken();
      const response = await axios.get(
        `${API_BASE_URL} /api/user/${userId}/invitations/`, 
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
    
      setInvitations(response.data);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      
      if (error.response?.status === 401) {
        try {
          const refreshToken = getRefreshToken();
          if (refreshToken) {
            const tokens = await refreshAccessToken(refreshToken);
            setAuthTokens(tokens);
            await fetchInvitations(authState.user?.id);
            return;
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          clearAuthTokens();
          setAuthState({ isAuthenticated: false, isLoading: false, user: null });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (invitationId, response, e) => {
    e.stopPropagation(); // Предотвращаем всплытие события
    try {
      setLoading(true);
      const accessToken = getAccessToken();
      await axios.post(
        `${API_BASE_URL} /api/user/${authState.user?.id}/invitations/${invitationId}/respond/`,
        { response: response ? 'accept' : 'reject' },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      await fetchInvitations(authState.user?.id);
    } catch (error) {
      console.error('Error responding to invitation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToTeam = (teamId) => {
    navigate(`/team/${teamId}`);
  };

  if (authState.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!authState.isAuthenticated) {
    return (
      <Paper
        sx={{
          backgroundColor: theme.palette.background.paper,
          p: 3,
          borderRadius: 2,
          textAlign: 'center',
          boxShadow: 3
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: theme.palette.text.primary,
            mb: 2
          }}
        >
          Для просмотра приглашений необходимо авторизоваться
        </Typography>
        <Button
          variant="contained"
          href="/login"
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            }
          }}
        >
          Войти
        </Button>
      </Paper>
    );
  }

  if (loading && invitations.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (invitations.length === 0) {
    return (
      <Paper
        sx={{
          backgroundColor: theme.palette.background.paper,
          p: 3,
          borderRadius: 2,
          textAlign: 'center',
          boxShadow: 3
        }}
      >
        <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
          У вас нет активных приглашений
        </Typography>
      </Paper>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Дата неизвестна';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return 'Дата неизвестна';
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 4 }}>
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          fontWeight: 'bold'
        }}
      >
        Мои приглашения в команды
      </Typography>

      <Paper sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
        <List sx={{ '& .MuiDivider-root': { display: 'none' } }}>
          {invitations.map((invitation) => {
            const isProcessed = !['pending', null, undefined].includes(invitation.status);
            const isAccepted = invitation.status === 'accepted';
            const teamName = invitation.team?.name || 'Без названия';
            const captainName = invitation.team?.captain_username || 'Неизвестный капитан';
            const createdAt = formatDate(invitation.created_at);
            const teamId = invitation.team?.id;

            return (
              <React.Fragment key={invitation.id}>
                <Paper
  onClick={() => teamId && handleNavigateToTeam(teamId)}
  sx={{
      backgroundColor: theme.palette.background.light,
    padding: theme.spacing(2),
  borderRadius: 2,
  boxShadow: theme.shadows[3],
  marginBottom: theme.spacing(2),
  cursor: 'pointer',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[6],
  },
  }}
>
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <IconButton 
        sx={{ 
          mr: 2,
          backgroundColor: theme.palette.primary.main,
          '&:hover': {
            backgroundColor: isProcessed 
              ? theme.palette.primary.main 
              : theme.palette.primary.dark
          }
        }}
      >
        <GroupIcon />
      </IconButton>
  
    <ListItemText 
      primary={`Приглашение в команду "${teamName}"`}
      secondary={
        <>
          <Typography component="span" display="block">
            От: {captainName}
          </Typography>
          <Typography component="span" display="block" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            <ScheduleIcon fontSize="small" sx={{ mr: 0.5 }} />
            {createdAt}
          </Typography>
        </>
      }
      sx={{
        '& .MuiListItemText-primary': {
          color: theme.palette.text.primary,
          fontWeight: 500
        },
        '& .MuiListItemText-secondary': {
          color: theme.palette.text.secondary
        }
      }}
    />

    {!isProcessed ? (
    <Stack direction="row" spacing={2}>
      <Button
        variant="contained"
        onClick={(e) => handleResponse(invitation.id, true, e)}
        sx={{
          '&:disabled': { opacity: 0.7 }
        }}
      >
        Принять
      </Button>
      <Button
        variant="outlined"
        onClick={(e) => handleResponse(invitation.id, false, e)}
        sx={{
          '&:disabled': { opacity: 0.7 }
        }}
      >
        Отклонить
      </Button>
    </Stack>
  ) : (
    <Typography 
      sx={{ 
        fontWeight: 'bold', 
        minWidth: 100, 
        textAlign: 'center',  
        color: theme.palette.primary.hover
      }}
    >
      {isAccepted ? '✓ Принято' : '✗ Отклонено'}
    </Typography>
  )}
  </Box>
  
  
</Paper>
              </React.Fragment>
            );
          })}
        </List>
      </Paper>
    </Box>
  );
};

export default Invitations;