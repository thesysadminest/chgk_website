import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Typography,
  Paper,
  Container,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  TextField,
  Checkbox,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Check from '@mui/icons-material/Check';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { getAccessToken } from '../utils/AuthUtils';
import { useTheme } from '@mui/material/styles';

const TeamInvite = ({ open, onClose, teamId }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);

  const fetchTeamData = async () => {
    try {
      const token = getAccessToken();
      const response = await axios.get(
        `&{API_BASE_URL}/api/team/${teamId}/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      setInvitedUsers(response.data.pending_members || []);
      setTeamMembers(response.data.active_members || []);
    } catch (err) {
      console.error('Error fetching team data:', err);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = getAccessToken();
        setIsAuthenticated(!!token);
        if (token && open) {
          await fetchUsers();
          await fetchTeamData();
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [open]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAccessToken();
      
      const response = await axios.get(
        `${API_BASE_URL}/api/user/list`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      setUsers(response.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.detail || 
        'Не удалось загрузить список пользователей'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInviteSelected = async () => {
    if (selectedUsers.length === 0) {
      setError('Выберите хотя бы одного пользователя');
      return;
    }

    // Фильтруем только тех пользователей, которых можно пригласить
    const usersToInvite = selectedUsers.filter(userId => 
      !isUserInvited(userId) && !isTeamMember(userId)
    );

    if (usersToInvite.length === 0) {
      setError('Выбранные пользователи уже приглашены или состоят в команде');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = getAccessToken();

      const response = await axios.post(
        `${API_BASE_URL}/api/team/${teamId}/invite/`,
        { user_ids: usersToInvite },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccess(`Приглашения отправлены (${usersToInvite.length} пользователям)`);
      setTimeout(() => setSuccess(null), 3000);
      
      // Добавляем приглашенных пользователей в список
      setInvitedUsers(prev => [...prev, ...usersToInvite.map(id => ({ id }))]);
      setSelectedUsers([]);
      fetchTeamData(); // Обновляем данные команды
    } catch (err) {
      console.error('Invitation error:', err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.detail || 
        'Не удалось отправить приглашения'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUser = (userId) => {
    // Не позволяем выбирать уже приглашенных или состоящих в команде
    if (isUserInvited(userId)) return;
    if (isTeamMember(userId)) return;
    
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const isUserInvited = (userId) => {
    return invitedUsers.some(user => user.id === userId);
  };

  const isTeamMember = (userId) => {
    return teamMembers.some(user => user.id === userId);
  };

  const handleClose = () => {
    setUsers([]);
    setError(null);
    setSuccess(null);
    setSearchTerm('');
    setSelectedUsers([]);
    onClose();
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        {/* ... (остается без изменений) ... */}
      </Dialog>
    );
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
          overflow: 'visible'
        }
      }}
      BackdropProps={{
        sx: {
          backdropFilter: 'blur(5px)',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }
      }}
    >
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box
          sx={{
            backgroundColor: theme.palette.background.window,
            p: 5,
            borderRadius: 8,
            width: '100%',
            mx: 'auto',
            textAlign: 'center'
          }}
        >
          <DialogTitle sx={{ p: 0 }}>
            <Typography
              variant="h4"
              sx={{
                mb: 3,
                fontWeight: 'bold',
                color: theme.palette.text.gray,
              }}
            >
              ПРИГЛАШЕНИЕ В КОМАНДУ
            </Typography>
          </DialogTitle>

          <DialogContent dividers sx={{ p: 0, border: 'none' }}>
            <Paper
              sx={{
                backgroundColor: theme.palette.background.white,
                p: 3,
                mb: 4,
                borderRadius: 2,
                position: 'relative',
                minHeight: '400px'
              }}
            >
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Поиск игроков..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />,
                }}
                sx={{ 
                  mb: 3,
                  '& .MuiInputBase-input': {
                    color: theme.palette.text.dark
                  }
                }}
              />

              {error && (
                <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : filteredUsers.length > 0 ? (
                <List>
                  {filteredUsers.map((user) => {
                    const invited = isUserInvited(user.id);
                    const member = isTeamMember(user.id);
                    const selected = selectedUsers.includes(user.id);
                    const disabled = invited || member;

                    return (
                      <ListItem
                        key={user.id}
                        sx={{
                          '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                          },
                          color: theme.palette.text.dark,
                          opacity: disabled ? 0.7 : 1,
                          pointerEvents: disabled ? 'none' : 'auto'
                        }}
                        secondaryAction={
                          member ? (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Check
                                
                                sx={{ fontSize: 30, mr: 1, color: "primary.main" }} 
                              />
                              <Typography variant="body2" color="primary.main">
                                В команде
                              </Typography>
                            </Box>
                          ) : invited ? (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Check
                                color="primary" 
                                sx={{ fontSize: 30, mr: 1 }} 
                              />
                              <Typography variant="body2" color="primary">
                                Приглашен
                              </Typography>
                            </Box>
                          ) : (
                            <Checkbox
                              edge="end"
                              onChange={() => handleToggleUser(user.id)}
                              checked={selected}
                            />
                          )
                        }
                      >
                        <ListItemAvatar>
                          <Avatar>
                            {user.username?.charAt(0).toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={user.username}
                          secondary={user.email}
                        />
                      </ListItem>
                    );
                  })}
                </List>             
              ) : (
                <Typography variant="body1" sx={{ textAlign: 'center', p: 2 }}>
                  {searchTerm ? 'Ничего не найдено' : 'Нет доступных игроков для приглашения'}
                </Typography>
              )}
            </Paper>
          </DialogContent>

          <DialogActions sx={{ 
            justifyContent: 'space-between', 
            p: 0,
            position: 'relative'
          }}>
            {selectedUsers.length > 0 && (
              <Box sx={{ 
                position: 'absolute',
                right: 0,
                bottom: 0,
                mb: 2,
                mr: 2
              }}>
                <Button
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  onClick={handleInviteSelected}
                  disabled={loading}
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                    whiteSpace: 'nowrap'
                  }}
                >
                  Пригласить выбранных ({selectedUsers.length})
                </Button>
              </Box>
            )}
            
            <Button
              variant="outlined"
              onClick={handleClose}
              color="primary"
              disabled={loading}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5
              }}
            >
              Закрыть
            </Button>
          </DialogActions>
        </Box>
      </Container>
    </Dialog>
  );
};

export default TeamInvite;