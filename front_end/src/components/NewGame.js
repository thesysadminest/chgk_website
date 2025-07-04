import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Link,
  Container,
  CircularProgress
} from '@mui/material';
import { checkAuth, getUserData } from '../utils/AuthUtils';
import { useNavigate } from 'react-router-dom';
import { useTheme } from "@mui/material/styles";
import SelectPackWindow from './SelectPackWindow';

const NewGame = ({ onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true,
    user: null
  });
  const [gameLoading, setGameLoading] = useState(false);
  const [selectPackOpen, setselectPackOpen] = useState(false);

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

  const handleStartRandomPack = () => {
    navigate('/game/0');
    onClose();
  };

  const handleLoginRedirect = () => {
    onClose();
    navigate('/login');
  };

  const handleSelectQuestions = () => {
    //onClose();
    setselectPackOpen(true); 
  };

  if (authState.isLoading || gameLoading) {
    return (
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
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {gameLoading ? 'Загрузка игры...' : 'Проверка авторизации...'}
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!authState.isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mt: '25vh' }}>
        <Box
          sx={{
            backgroundColor: theme.palette.background.window,
            p: 5,
            borderRadius: 8,
            width: '100%',
            justifyContent: 'center',
            textAlign: 'center',
            my: 'auto'
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
              justifyContent: 'center',
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
            </Stack>
          </Paper>

          <Button
            variant="outlined-grey"
            onClick={onClose}
          >
            Закрыть
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <>
      {!selectPackOpen && (
        <Container>
          <Box
            sx={{
              backgroundColor: theme.palette.background.window,
              p: 5,
              borderRadius: 8,
              width: '750px',
              mt: '70px',
              mx: 'auto'
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
                <Button disableRipple
                  fullWidth
                  variant="lightRed"
                  onClick={handleStartRandomPack}
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
                  disableRipple
                  fullWidth
                  variant="lightRed"
                  onClick={handleSelectQuestions}
                >
                  <Typography variant="h6">ВЫБРАТЬ ПАК</Typography>
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

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                variant="outlined-grey"
                onClick={onClose}
              >
                Закрыть
              </Button>
            </Box>
          </Box>
        </Container>
      )}

      <SelectPackWindow
        open={selectPackOpen}
        onClose={() => {
          setselectPackOpen(false);
          onClose();
        }}
        onStartGame={handleStartRandomPack}
      />
    </>
  );
};

export default NewGame;
