import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Container
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../components/axiosInstance';
import { checkAuth } from '../utils/AuthUtils';
import { startGame } from '../utils/GameUtils';
import { useTheme } from '@mui/material/styles';
import GamePackDetail from '../components/GamePackDetail';
import GameQuestionDetail from '../components/GameQuestionDetail';
import SelectQuestionsWindow from '../components/SelectQuestionsWindow';

const GamePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { packId, questionId, userId, attemptId } = useParams();
  
  const [gameState, setGameState] = useState({
    loading: true,
    error: null,
    mode: null, // 'pack', 'questions' или 'select'
    score: { correct: 0, total: 0, score: 0 }
  });

  const [selectQuestionsOpen, setSelectQuestionsOpen] = useState(false);
  const [selectPackOpen, setSelectPackOpen] = useState(false);

  // Инициализация игры
  useEffect(() => {
    const initializeGame = async () => {
      try {
        const { isAuthorized } = await checkAuth();
        if (!isAuthorized) {
          navigate('/login');
          return;
        }

        if (!packId && !questionId) {
          // Режим выбора вопросов
          setGameState(prev => ({
            ...prev,
            loading: false,
            mode: 'select'
          }));
          return;
        }

        if (questionId) {
          // Режим вопроса
          const scoreRes = await axiosInstance.get(
            `/game/${packId}/user/${userId}/attempt/${attemptId}/results/`
          );
          
          setGameState({
            loading: false,
            error: null,
            mode: 'question',
            score: {
              correct: scoreRes.data.correct_answers,
              total: scoreRes.data.total_questions,
              score: scoreRes.data.score || 0
            }
          });
        } else if (packId) {
          // Режим пакета
          setGameState({
            loading: false,
            error: null,
            mode: 'pack',
            score: { correct: 0, total: 0, score: 0 }
          });
        }
      } catch (error) {
        setGameState(prev => ({
          ...prev,
          loading: false,
          error: error.response?.data?.error || 'Ошибка загрузки игры'
        }));
      }
    };

    initializeGame();
  }, [packId, questionId, navigate]);

  const handleStartGame = async (options) => {
    try {
      setGameState(prev => ({ ...prev, loading: true }));
      
      let gameData;
      if (options.packId) {
        gameData = await startGame({ packId: options.packId });
      } else if (options.questionIds) {
        gameData = await startGame({ questionIds: options.questionIds });
      }

      if (gameData) {
        navigate(`/game/${gameData.packId}/questions/${gameData.firstQuestionId}`);
      }
    } catch (error) {
      setGameState(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.error || 'Ошибка начала игры'
      }));
    }
  };

  const handleGameComplete = () => {
    navigate(`/game/${packId}/user/${userId}/attempt/${attemptId}/results`);
  };

  if (gameState.loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6">Загрузка игры...</Typography>
      </Container>
    );
  }

  if (gameState.error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography color="error" variant="h6">{gameState.error}</Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Вернуться на главную
        </Button>
      </Container>
    );
  }

  return (
    <SelectQuestionsWindow
      open={selectQuestionsOpen}
      onClose={() => setSelectQuestionsOpen(false)}
      onStartGame={handleStartGame}
    />
  );
};

export default GamePage;