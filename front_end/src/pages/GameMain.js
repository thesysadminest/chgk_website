import React, { useState, useEffect } from 'react';
import axiosInstance from "../components/axiosInstance";
import { Box, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

const GameMain = () => {
  const { pack_id, firstQuestionId } = useParams();
  const navigate = useNavigate();

  const [gameState, setGameState] = useState({
    loading: true,
    error: null,
    question: null,
    session: null,
    answer: '',
    feedback: '',
    answerColor: '',
    timeLeft: 60
  });

  // Проверка авторизации
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Загрузка текущего вопроса по ID
  useEffect(() => {
    const loadCurrentQuestion = async () => {
      try {
        const response = await axiosInstance.get(
          `/game/${pack_id}/questions/${firstQuestionId}/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access_token')}`
            }
          }
        );

        setGameState(prev => ({
          ...prev,
          loading: false,
          question: response.data.question,
          session: response.data.session,
          timeLeft: 60
        }));
      } catch (error) {
        console.error("Ошибка загрузки вопроса:", error);
        setGameState(prev => ({
          ...prev,
          loading: false,
          error: error.response?.data?.error || "Ошибка загрузки вопроса"
        }));
      }
    };

    loadCurrentQuestion();
  }, [pack_id, firstQuestionId]);

  // Таймер
  useEffect(() => {
    if (!gameState.question || gameState.loading) return;

    const timer = setInterval(() => {
      setGameState(prev => {
        const newTimeLeft = prev.timeLeft - 1;

        if (newTimeLeft <= 0) {
          handleNextQuestion();
          return { ...prev, timeLeft: 0 };
        }

        return { ...prev, timeLeft: newTimeLeft };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.question, gameState.loading]);

  const handleSubmit = async () => {
    if (!gameState.answer.trim()) return;

    try {
      const response = await axiosInstance.post(
        `/game/${pack_id}/questions/${gameState.question.id}/submit/`,
        { answer: gameState.answer.trim() },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );

      setGameState(prev => ({
        ...prev,
        feedback: response.data.is_correct ? '✓ Верно' : '✕ Неверно',
        answerColor: response.data.is_correct ? '#7fb890' : '#CD5C5C',
        session: response.data.session
      }));
    } catch (error) {
      console.error("Ошибка отправки ответа:", error);
      setGameState(prev => ({
        ...prev,
        error: error.response?.data?.error || "Ошибка при отправке ответа"
      }));
    }
  };

  const handleNextQuestion = async () => {
    try {
      const response = await axiosInstance.get(
        `/game/${pack_id}/questions/${gameState.question.id}/next/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );

      if (response.data.question) {
        navigate(`/game/${pack_id}/questions/${response.data.question.id}`);
      } else {
        // Завершена игра
        navigate(`/game/${pack_id}/results`, {
          state: {
            score: response.data.final_score,
            total: response.data.total_questions
          }
        });
      }
    } catch (error) {
      console.error("Ошибка перехода к следующему вопросу:", error);
      setGameState(prev => ({
        ...prev,
        error: error.response?.data?.error || "Ошибка перехода к следующему вопросу"
      }));
    }
  };

  if (gameState.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (gameState.error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {gameState.error}
        </Alert>
        <Button
          variant="contained"
          onClick={() => window.location.reload()}
        >
          Попробовать снова
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Вопрос {gameState.session?.current_question_index + 1} из {gameState.session?.questions_count}
      </Typography>

      <Typography variant="h6" sx={{ mb: 3 }}>
        {gameState.question?.question_text}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography color="text.secondary">
          Осталось времени: {gameState.timeLeft} сек.
        </Typography>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        label="Ваш ответ"
        multiline
        rows={4}
        value={gameState.answer}
        onChange={(e) => setGameState(prev => ({ ...prev, answer: e.target.value }))}
        sx={{ mb: 3 }}
        style={{ backgroundColor: gameState.answerColor }}
      />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={!gameState.answer.trim()}
          sx={{ flex: 1 }}
        >
          Проверить
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={handleNextQuestion}
          sx={{ flex: 1 }}
        >
          Следующий вопрос
        </Button>
      </Box>

      {gameState.feedback && (
        <Typography sx={{
          mt: 3,
          p: 2,
          borderRadius: 1,
          backgroundColor: gameState.answerColor,
          color: '#fff',
          textAlign: 'center'
        }}>
          {gameState.feedback}
        </Typography>
      )}
    </Box>
  );
};

export default GameMain;
