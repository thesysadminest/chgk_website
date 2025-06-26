import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  IconButton,
  useTheme
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import axiosInstance from '../components/axiosInstance';

const GameQuestionDetail = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { packId, questionId } = useParams();
  const [timer, setTimer] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [question, setQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [questionsList, setQuestionsList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const questionRes = await axiosInstance.get(`/game/packs/${packId}/questions/${questionId}/`);
        setQuestion(questionRes.data);
        
        const packRes = await axiosInstance.get(`/game/packs/${packId}/questions/`);
        setQuestionsList(packRes.data.questions);
        
        const index = packRes.data.questions.findIndex(q => q.id === parseInt(questionId));
        setCurrentIndex(index >= 0 ? index : 0);
        
        startTimer();
      } catch (error) {
        console.error('Error fetching question:', error);
      }
    };

    fetchData();
  }, [packId, questionId]);

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
    setFeedback('Время вышло!');
  };

  const handleSubmit = async () => {
    try {
      setIsTimerRunning(false);
      const response = await axiosInstance.post(
        `/game/${packId}/questions/${questionId}/submit/`,
        { answer: userAnswer }
      );
      
      setFeedback(response.data.is_correct ? 'Правильно!' : 'Неправильно!');
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const navigateToQuestion = (newQuestionId) => {
    navigate(`/game/${packId}/questions/${newQuestionId}`);
    setUserAnswer('');
    setFeedback(null);
    startTimer();
  };

  const handleNext = () => {
    if (currentIndex + 1 < questionsList.length) {
      navigateToQuestion(questionsList[currentIndex].id);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      navigateToQuestion(questionsList[currentIndex - 1].id);
    }
  };

  if (!question) {
    return <Box>Загрузка вопроса...</Box>;
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">
          Вопрос {currentIndex + 1} из {questionsList.length}
        </Typography>
        <Typography variant="h6" color={timer < 10 ? 'error.main' : 'text.primary'}>
          Время: {timer} сек
        </Typography>
      </Box>

      <Typography variant="body1" sx={{ mb: 3, fontSize: '1.2rem' }}>
        {question.question_text}
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        label="Ваш ответ"
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        sx={{ mb: 3 }}
        disabled={!!feedback}
      />

      {!feedback ? (
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={!userAnswer.trim()}
          sx={{ mr: 2 }}
        >
          Ответить
        </Button>
      ) : (
        <Typography 
          variant="h6" 
          color={feedback === 'Правильно!' ? 'success.main' : 'error.main'}
          sx={{ mb: 2 }}
        >
          {feedback}
        </Typography>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <IconButton onClick={handlePrev} disabled={currentIndex === 0}>
          <ChevronLeft fontSize="large" />
        </IconButton>
        <IconButton onClick={handleNext} disabled={currentIndex === questionsList.length - 1}>
          <ChevronRight fontSize="large" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default GameQuestionDetail;