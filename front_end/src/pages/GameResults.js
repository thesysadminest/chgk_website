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

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axiosInstance.get(`/game/${pack_id}/results/`);

        const finalScore = location.state?.score || response.data.correct_answers;
        const totalQuestions = location.state?.total || response.data.total_questions;

        setResults({
          loading: false,
          error: null,
          data: {
            ...response.data,
            correct_answers: finalScore,
            total_questions: totalQuestions,
            previous_rating: response.data.previous_rating ||
              (response.data.current_rating - (response.data.rating_change || 0)),
            current_rating: response.data.current_rating ||
              (response.data.previous_rating + (response.data.rating_change || 0))
          }
        });

      } catch (error) {
        setResults({
          loading: false,
          error: error.response?.data?.error || 'Не удалось загрузить результаты',
          data: null
        });
      }
    };

    fetchResults();
  }, [pack_id, location.state]);

  const handleBackToPacks = () => {
    navigate('/packs');
  };

  const handleGoToRating = () => {
    navigate('/rating');
  };

  if (results.loading) {
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

  const correctAnswers = results.data.correct_answers;
  const totalQuestions = results.data.total_questions;
  const wrongAnswers = totalQuestions - correctAnswers;
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const ratingChange = results.data.rating_change;
  const previousRating = results.data.previous_rating;
  const currentRating = results.data.current_rating;

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

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default, height: '100vh', width: '100vw', alignItems: 'center', overflowX: 'hidden', ml:-1 }}>
      <Container sx={{ p: 4, mt: 8}}>
        <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
          Результаты игры
        </Typography>

        <Typography variant="h6" align="center" sx={{ mb: 4, color: theme.palette.text.secondary }}>
          Пак: {results.data.pack?.name || `ID ${pack_id}`}
        </Typography>

      
          <Box sx={{ mb: 2, borderColor: 'none', alignItems: 'center', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Изменение рейтинга</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {previousRating}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mx: 1 }}>→</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {currentRating}
              </Typography>
              {ratingChange !== 0 && (
                <Chip
                  label={`${ratingChange > 0 ? '+' : ''}${ratingChange}`}
                  color={ratingChange > 0 ? 'success' : 'error'}
                  size="medium"
                  sx={{ ml: 2 }}
                />
              )}
            </Box>
          
          <Button
            variant="outlined"
            onClick={handleGoToRating}
            sx={{ mt: 1 }}
            >
            <Typography variant='h6'>
                Посмотреть полный рейтинг
            </Typography>
          </Button>
        </Box>

        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'row',
          p: 3,
          gap: 2
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
          <Typography variant="h4" sx={{
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
          {ratingChange !== 0 && (
            <Typography variant="h6" sx={{ mt: 1 }}>
              {ratingChange > 0 ? 'Ваш рейтинг увеличился!' : 'Ваш рейтинг уменьшился'}
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
            <Typography variant='h6'>
                Вернуться к списку пакетов
            </Typography>
          </Button>
        </Box>
      </Paper>
      </Container>
    </Box>
  );
};

export default GameResults;