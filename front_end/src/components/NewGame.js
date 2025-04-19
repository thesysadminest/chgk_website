import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper,
  useTheme,
  Stack,
  Link
} from '@mui/material';
import { checkAuth, getUserData } from '../utils/AuthUtils';
import { useNavigate } from 'react-router-dom';

const NewGame = ({ onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true,
    user: null
  });

  useEffect(() => {
    const verifyAuthentication = async () => {
      try {
        const { isAuthorized, user } = await checkAuth();
        setAuthState({
          isAuthenticated: isAuthorized,
          isLoading: false,
          user: isAuthorized ? user : null
        });
      } catch (error) {
        console.error('Authentication check failed:', error);
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null
        });
      }
    };

    verifyAuthentication();
  }, []);

  const handleRandomPack = () => {
    console.log("Выбран случайный пак");
    onClose();
    navigate('/game/random');
  };

  const handleSelectQuestions = () => {
    console.log("Выбраны конкретные вопросы");
    onClose();
    navigate('/game/select');
  };

  const handleLoginRedirect = () => {
    onClose();
    navigate('/login');
  };

  if (authState.isLoading) {
    return (
      <Box
        sx={{
          backgroundColor: theme.palette.background.window,
          p: 5,
          borderRadius: 8,
          width: '100%',
          maxWidth: 680,
          mx: 'auto',
          textAlign: 'center'
        }}
      >
        <Typography variant="h6">Проверка авторизации...</Typography>
      </Box>
    );
  }

  if (!authState.isAuthenticated) {
    return (
      <Box
        sx={{
          backgroundColor: theme.palette.background.window,
          p: 5,
          borderRadius: 8,
          width: '100%',
          maxWidth: 680,
          mx: 'auto',
          textAlign: 'center'
        }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            mb: 3,
            fontWeight: 'bold',
            color: theme.palette.text.gray,
          }}
        >
          ДОСТУП К ИГРЕ
        </Typography>

        <Paper
          sx={{
            backgroundColor: theme.palette.background.white,
            p: 3,
            mb: 4,
            borderRadius: 2,
          }}
        >
          <Stack spacing={2}>
            <Typography 
              variant="body1" 
              sx={{ 
                color: theme.palette.text.gray,
                fontWeight: 'bold',
              }}
            >
              Для доступа к игре необходимо авторизоваться
            </Typography>
            
            <Button
              fullWidth
              variant="contained"
              onClick={handleLoginRedirect}
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
            
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Ещё нет аккаунта?{' '}
              <Link 
                component="button" 
                onClick={() => navigate('/registration')}
                sx={{ 
                  color: theme.palette.primary.main,
                  fontWeight: 'bold',
                }}
              >
                Зарегистрироваться
              </Link>
            </Typography>
          </Stack>
        </Paper>

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
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.window,
        p: 5,
        borderRadius: 8,
        width: '100%',
        maxWidth: 680,
        mx: 'auto',
      }}
    >
      <Typography 
        variant="h4" 
        align="center"
        sx={{ 
          mt: 1,
          mb: 3,
          fontWeight: 'bold',
          color: theme.palette.text.gray,
        }}
      >
        ВЫБЕРИТЕ РЕЖИМ ИГРЫ
      </Typography>

      <Paper
        sx={{
          backgroundColor: theme.palette.background.white,
          p: 3,
          mb: 5,
          borderRadius: 2,
        }}
      >
        <Stack spacing={2}>
          <Typography 
            variant="body1" 
            sx={{ 
              color: theme.palette.text.gray,
              fontWeight: 'bold',
            }}
          >
            Добро пожаловать, {authState.user?.username || 'игрок'}!
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: theme.palette.text.gray,
              fontWeight: 'bold',
            }}
          >
            ЧГК рейтинг предоставляет несколько режимов игры, предлагая возможность попробовать себя в ЧГК как новичкам, так и старожилам и ветеранам телевизионной игры
          </Typography>
        </Stack>
      </Paper>

      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={5}
        justifyContent="center"
        sx={{ width: '100%' }}
      >
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flex: 1,
          maxWidth: 280
        }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleRandomPack}
            sx={{
              py: 2,
              backgroundColor: theme.palette.button.red.hover,
              color: theme.palette.button.red.contrastText,
              '&:hover': {
                backgroundColor: theme.palette.button.red.light,
              }
            }}
          >
            <Typography variant="h6">
              СЛУЧАЙНЫЙ ПАК
            </Typography>
          </Button>
          <Typography 
            variant="body2" 
            sx={{ 
              mt: 1.5,
              color: theme.palette.text.gray,
              textAlign: 'center'
            }}
          >
            Случайный пак - прямо как в игре
          </Typography>
        </Box>

        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flex: 1,
          maxWidth: 280
        }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleSelectQuestions}
            sx={{
              py: 2,
              backgroundColor: theme.palette.button.red.hover,
              color: theme.palette.button.red.contrastText,
              '&:hover': {
                backgroundColor: theme.palette.button.red.light,
              }
            }}
          >
            <Typography variant="h6">
              ВЫБРАТЬ ВОПРОСЫ
            </Typography>
          </Button>
          <Typography 
            variant="body2" 
            sx={{ 
              mt: 1.5,
              color: theme.palette.text.gray,
              textAlign: 'center'
            }}
          >
            Тренируйтесь на конкретные темы
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ mt: 4, textAlign: 'center'}}>
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
      </Box>
    </Box>
  );
};

export default NewGame;