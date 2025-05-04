import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Divider,
  IconButton,
  useTheme
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import axiosInstance from '../components/axiosInstance';

const GamePackDetail = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { packId } = useParams();
  const [timer, setTimer] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [pack, setPack] = useState({
    name: '',
    questions: [],
    currentQuestion: null
  });
  const [userAnswers, setUserAnswers] = useState({});

  useEffect(() => {
    const fetchPack = async () => {
      try {
        const response = await axiosInstance.get(`/game/packs/${packId}/questions/`);
        setPack({
          name: response.data.name,
          questions: response.data.questions,
          currentQuestion: response.data.questions[0]
        });
        startTimer();
      } catch (error) {
        console.error('Error fetching pack:', error);
      }
    };

    fetchPack();
  }, [packId]);

  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimerRunning(false);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const startTimer = () => {
    setTimer(60);
    setIsTimerRunning(true);
  };

  const handleTimeUp = () => {
    // Логика при окончании времени
  };

  const handleAnswerChange = (questionId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = (questionId) => {
    // Логика отправки ответа
    setIsTimerRunning(false);
  };

  const navigateToQuestion = (questionId) => {
    navigate(`/game/${packId}/questions/${questionId}`);
  };

  const handleNext = () => {
    if (currentQuestionIndex < pack.questions.length - 1) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      setPack(prev => ({
        ...prev,
        currentQuestion: prev.questions[newIndex]
      }));
      startTimer();
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(newIndex);
      setPack(prev => ({
        ...prev,
        currentQuestion: prev.questions[newIndex]
      }));
      startTimer();
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          Пак: {pack.name}
        </Typography>
        <Typography variant="h6" color={timer < 10 ? 'error.main' : 'text.primary'}>
          Время: {timer} сек
        </Typography>
      </Box>

      {pack.questions.map((question, index) => (
        <Paper key={question.id} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography 
              variant="h6" 
              onClick={() => navigateToQuestion(question.id)}
              sx={{ 
                cursor: 'pointer',
                color: theme.palette.primary.main,
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Вопрос #{index + 1}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ID: {question.id}
            </Typography>
          </Box>

          <Typography variant="body1" sx={{ mb: 3 }}>
            {question.question_text}
          </Typography>

          <TextField
            fullWidth
            variant="outlined"
            label="Ваш ответ"
            value={userAnswers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            sx={{ mb: 2 }}
          />

          <Button 
            variant="contained" 
            onClick={() => handleSubmit(question.id)}
            disabled={!userAnswers[question.id]?.trim()}
          >
            Ответить
          </Button>

          <Divider sx={{ mt: 3 }} />
        </Paper>
      ))}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <IconButton 
          onClick={handlePrev}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft fontSize="large" />
        </IconButton>
        <IconButton 
          onClick={handleNext}
          disabled={currentQuestionIndex === pack.questions.length - 1}
        >
          <ChevronRight fontSize="large" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default GamePackDetail;