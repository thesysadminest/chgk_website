import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Container,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useTheme } from "@mui/material/styles";
import { checkAuth } from '../utils/AuthUtils';
import axiosInstance from '../components/axiosInstance';
import { useNavigate } from 'react-router-dom';

const SelectPackWindow = ({ open, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true
  });
  const [packs, setPacks] = useState([]);

  useEffect(() => {
    const verifyAuthentication = async () => {
      try {
        const { isAuthorized } = await checkAuth();
        setAuthState({
          isAuthenticated: isAuthorized,
          isLoading: false
        });

        if (isAuthorized && open) {
          fetchPacks();
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setAuthState({
          isAuthenticated: false,
          isLoading: false
        });
      }
    };

    verifyAuthentication();
  }, [open]);

  const fetchPacks = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/pack/list/');
      setPacks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching packs:', error);
      setLoading(false);
    }
  };

  const handleStartGame = async (packId) => {
    try {
      setLoading(true);
      navigate(`/game/${packId}`);
      onClose();
    } catch (error) {
      console.error('Error starting game:', error);
      setLoading(false);
    }
  };

  if (authState.isLoading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
            <Typography variant="h6" sx={{ ml: 2 }}>
              Проверка авторизации...
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (!authState.isAuthenticated) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <Box
          sx={{
            backgroundColor: theme.palette.background.window,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              mb: 3,
              fontWeight: 'bold',
              color: theme.palette.text.gray,
              textAlign: 'center'
            }}
          >
            ДОСТУП К ИГРЕ
          </Typography>

          <Paper
            sx={{
              backgroundColor: theme.palette.background.white,
              p: 3,
              mb: 3,
              borderRadius: 2,
            }}
          >
            <Stack spacing={2}>
              <Typography
                variant="body1"
                sx={{
                  color: theme.palette.text.gray,
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}
              >
                Для доступа к игре необходимо авторизоваться
              </Typography>

              <Button
                fullWidth
                variant="contained"
                onClick={onClose}
                sx={{
                  py: 1.5,
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  }
                }}
              >
                Войти в систему
              </Button>
            </Stack>
          </Paper>

          <DialogActions>
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{
                color: theme.palette.text.primary,
                borderColor: theme.palette.text.primary,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                }
              }}
            >
              Закрыть
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box
        sx={{
          backgroundColor: theme.palette.background.window,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 3,
            fontWeight: 'bold',
            color: theme.palette.primary.main,
            textAlign: 'center'
          }}
        >
          Выберите пак вопросов
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper
            sx={{
              backgroundColor: theme.palette.background.white,
              p: 3,
              mb: 3,
              borderRadius: 2,
            }}
          >
            <List>
              {packs.map((pack) => (
                <ListItem
                  key={pack.id}
                  sx={{
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                    color: theme.palette.text.dark,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <ListItemText
                    primary={pack.name}
                    secondary={`Вопросов: ${pack.questions.length}`}
                  />
                  <Button
                    variant="contained"
                    onClick={() => handleStartGame(pack.id)}
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      }
                    }}
                  >
                    Играть
                  </Button>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        <DialogActions>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              color: theme.palette.text.primary,
              borderColor: theme.palette.text.primary,
              '&:hover': {
                borderColor: theme.palette.primary.main,
              }
            }}
          >
            Закрыть
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default SelectPackWindow;
