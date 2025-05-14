import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Container,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from "@mui/material/styles";
import axiosInstance from '../components/axiosInstance';
import { Check, Close, Replay } from '@mui/icons-material';

const GameResults = () => {
  const { packId, userId, attemptId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [results, setResults] = useState({
    loading: true,
    error: null,
    data: null
  });
  
  const [stats, setStats] = useState({
    correctAnswers: 0,
    totalQuestions: 0,
    score: 0,
    percentage: 0,
    timeSpent: '0 мин'
  });

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axiosInstance.get(
          `/game/${packId}/user/${userId}/attempt/${attemptId}/results/`
        );
        
        setResults({
          loading: false,
          error: null,
          data: response.data
        });
        
        // Вычисляем статистику
        const correct = response.data.correct_answers;
        const total = response.data.total_questions;
        const percentage = Math.round((correct / total) * 100);
        
        setStats({
          correctAnswers: correct,
          totalQuestions: total,
          score: response.data.score || correct, // Используем score если есть, иначе количество правильных
          percentage,
          timeSpent: calculateTimeSpent(response.data.start_time, response.data.end_time)
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
  }, [packId, userId, attemptId]);

  const calculateTimeSpent = (start, end) => {
    if (!start || !end) return 'Неизвестно';
    
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diff = (endTime - startTime) / 1000; // Разница в секундах
    
    const minutes = Math.floor(diff / 60);
    const seconds = Math.floor(diff % 60);
    
    return `${minutes} мин ${seconds} сек`;
  };

  const handleReplay = () => {
    navigate(`/game/${packId}/start`);
  };

  const handleBackToPacks = () => {
    navigate('/packs');
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
        <Typography color="error" variant="h5" sx={{ mb: 2 }}>
          {results.error}
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleBackToPacks}
        >
          Вернуться к списку пакетов
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4, backgroundColor: theme.palette.background.paper }}>
        <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
          Результаты игры
        </Typography>
        
        <Typography variant="h6" align="center" sx={{ mb: 4, color: theme.palette.text.secondary }}>
          Пак: {results.data.pack_name || `ID ${packId}`} | Попытка #{attemptId}
        </Typography>
        
        {/* Основная статистика */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-around', 
          flexWrap: 'wrap',
          gap: 2,
          mb: 4
        }}>
          <StatBox 
            title="Правильные ответы" 
            value={`${stats.correctAnswers}/${stats.totalQuestions}`}
            color={theme.palette.success.main}
          />
          
          <StatBox 
            title="Процент правильных" 
            value={`${stats.percentage}%`}
            color={stats.percentage > 70 ? theme.palette.success.main : 
                  stats.percentage > 40 ? theme.palette.warning.main : 
                  theme.palette.error.main}
          />
          
          <StatBox 
            title="Набрано очков" 
            value={stats.score}
            color={theme.palette.primary.main}
          />
          
          <StatBox 
            title="Затрачено времени" 
            value={stats.timeSpent}
            color={theme.palette.info.main}
          />
        </Box>
        
        {/* Детализация по вопросам */}
        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
          Детализация ответов:
        </Typography>
        
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.primary.light }}>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Вопрос</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: 'white' }}>Статус</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'white' }}>Ваш ответ</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'white' }}>Правильный ответ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.data.question_results?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                      {item.question_text || `Вопрос ${index + 1}`}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {item.is_correct ? (
                      <Chip 
                        icon={<Check />} 
                        label="Правильно" 
                        color="success" 
                        size="small" 
                      />
                    ) : (
                      <Chip 
                        icon={<Close />} 
                        label="Неправильно" 
                        color="error" 
                        size="small" 
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {item.user_answer || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {item.correct_answer}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Divider sx={{ my: 3 }} />
        
        {/* Кнопки действий */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          gap: 3,
          mt: 4
        }}>
          <Button
            variant="contained"
            startIcon={<Replay />}
            onClick={handleReplay}
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
            Играть снова
          </Button>
          
          <Button
            variant="outlined"
            onClick={handleBackToPacks}
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              '&:hover': {
                borderColor: theme.palette.primary.dark,
              }
            }}
          >
            Выбрать другой пак
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

// Компонент для отображения статистики
const StatBox = ({ title, value, color }) => (
  <Box sx={{ 
    textAlign: 'center',
    p: 2,
    minWidth: 150,
    borderRadius: 2,
    backgroundColor: 'background.default'
  }}>
    <Typography variant="subtitle2" sx={{ mb: 1 }}>{title}</Typography>
    <Typography variant="h4" sx={{ color, fontWeight: 'bold' }}>{value}</Typography>
  </Box>
);

export default GameResults;