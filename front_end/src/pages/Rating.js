import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  CircularProgress,
  Chip,
  Stack,
  Alert
} from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from "@mui/material/styles";
import axiosInstance from '../components/axiosInstance';
import { Check, Close } from '@mui/icons-material';

const GameResults = () => {
  const { pack_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const [results, setResults] = useState({
    loading: true,
    error: null,
    data: null
  });

  const [userData, setUserData] = useState({
    previousRating: location.state?.previousRating || 0, // Рейтинг до игры
    currentRating: 0,  // Рейтинг после игры
    ratingChange: location.state?.ratingChange || 0,
    loading: true,
    error: null
  });

  const [gameStats, setGameStats] = useState({
    correctAnswers: location.state?.score || 0,
    totalQuestions: location.state?.total || 0,
    loading: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Загружаем текущий рейтинг пользователя (после игры)
        const userResponse = await axiosInstance.get('/user/me/');

        setUserData(prev => ({
          ...prev,
          currentRating: userResponse.data.elo_rating || 1000,
          loading: false
        }));

        // Загружаем результаты последней игры
        const gameResponse = await axiosInstance.get(`/game/${pack_id}/results/`);

        setResults({
          loading: false,
          error: null,
          data: gameResponse.data
        });

        setGameStats({
          correctAnswers: gameResponse.data.correct_answers,
          totalQuestions: gameResponse.data.total_questions,
          loading: false
        });

      } catch (error) {
        setResults({
          loading: false,
          error: error.response?.data?.error || 'Не удалось загрузить результаты',
          data: null
        });
        setUserData(prev => ({
          ...prev,
          loading: false,
          error: 'Не удалось загрузить данные пользователя'
        }));
      }
    };

    fetchData();
  }, [pack_id]);

  const handleBackToPacks = () => {
    navigate('/packs');
  };

  const handleGoToRating = () => {
    navigate('/rating');
  };

  if (results.loading || userData.loading || gameStats.loading) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress size={80} />
      </Container>
    );
  }

  if (results.error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {results.error}
        </Alert>
        <Button
          variant="contained"
          onClick={handleBackToPacks}
        >
          Вернуться к списку пакетов
        </Button>
      </Container>
    );
  }

  const correctAnswers = gameStats.correctAnswers;
  const totalQuestions = gameStats.totalQuestions;
  const wrongAnswers = totalQuestions - correctAnswers;
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4, backgroundColor: theme.palette.background.paper }}>
        <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
          Результаты игры
        </Typography>

        <Typography variant="h6" align="center" sx={{ mb: 4, color: theme.palette.text.secondary }}>
          Пак: {results.data?.pack?.name || `ID ${pack_id}`}
        </Typography>

        {!userData.error ? (
          <Paper elevation={2} sx={{
            p: 3,
            mb: 4,
            backgroundColor: theme.palette.background.default,
            borderRadius: 2
          }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Изменение рейтинга</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {userData.previousRating}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mx: 1 }}>→</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {userData.currentRating}
                </Typography>
                {userData.ratingChange !== 0 && (
                  <Chip
                    label={`${userData.ratingChange > 0 ? '+' : ''}${userData.ratingChange}`}
                    color={userData.ratingChange > 0 ? 'success' : 'error'}
                    size="medium"
                    sx={{ ml: 2 }}
                  />
                )}
              </Box>
            </Box>
            <Button
              variant="outlined"
              onClick={handleGoToRating}
              fullWidth
            >
              Посмотреть полный рейтинг
            </Button>
          </Paper>
        ) : (
          <Alert severity="warning" sx={{ mb: 4 }}>
            {userData.error}
          </Alert>
        )}

        <Box sx={{
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: 2,
          mb: 4
        }}>
          <StatBox
            title="Правильные ответы"
            value={correctAnswers}
            color={theme.palette.success.main}
            subtitle={`из ${totalQuestions}`}
            icon={<Check />}
          />

          <StatBox
            title="Неправильные ответы"
            value={wrongAnswers}
            color={theme.palette.error.main}
            subtitle={`из ${totalQuestions}`}
            icon={<Close />}
          />

          <StatBox
            title="Процент правильных"
            value={`${percentage}%`}
            color={
              percentage > 70 ? theme.palette.success.main :
                percentage > 40 ? theme.palette.warning.main :
                  theme.palette.error.main
            }
          />
        </Box>

        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h5" sx={{
            color:
              percentage > 70 ? theme.palette.success.main :
                percentage > 40 ? theme.palette.warning.main :
                  theme.palette.error.main,
            fontWeight: 'bold'
          }}>
            {percentage > 70 ? 'Отличный результат!' :
              percentage > 40 ? 'Неплохо, но можно лучше!' :
                'Попробуйте еще раз!'}
          </Typography>
          {userData.ratingChange !== 0 && (
            <Typography variant="subtitle1" sx={{ mt: 1 }}>
              {userData.ratingChange > 0 ? 'Ваш рейтинг увеличился!' : 'Ваш рейтинг уменьшился'}
            </Typography>
          )}
        </Box>

        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 3,
          mt: 4,
          flexWrap: 'wrap'
        }}>
          <Button
            variant="contained"
            onClick={handleBackToPacks}
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              }
            }}
          >
            Вернуться к списку пакетов
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

const StatBox = ({ title, value, color, subtitle, icon }) => (
  <Box sx={{
    textAlign: 'center',
    p: 2,
    minWidth: 150,
    borderRadius: 2,
    backgroundColor: 'background.default',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  }}>
    <Typography variant="subtitle2" sx={{ mb: 1 }}>{title}</Typography>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {icon && React.cloneElement(icon, { sx: { color } })}
      <Typography variant="h4" sx={{ color, fontWeight: 'bold' }}>{value}</Typography>
    </Box>
    {subtitle && <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1 }}>{subtitle}</Typography>}
  </Box>
);

export default GameResults;