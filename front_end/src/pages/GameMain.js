import React, { useState, useEffect } from 'react';
import axiosInstance from "../components/axiosInstance";
import CssBaseline from "@mui/material/CssBaseline";
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  CircularProgress, 
  Alert,
  Card,
  CardContent,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper
} from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Check, 
  Close, 
  ArrowBack, 
  ArrowForward, 
  Send,
  Timer 
} from '@mui/icons-material';
import { useTheme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: '800px',
  width: '90%',
  margin: '2rem auto',
  backgroundColor: theme.palette.background.default,
  boxShadow: 'none',
  border: 'none',
  '&.MuiCard-root': {
    boxShadow: 'none',
    border: 'none',
    outline: 'none'
  }
}));

const QuestionPaper = styled(Paper)(({ theme }) => ({
  padding: '24px',
  marginBottom: '24px',
  backgroundColor: theme.palette.background.dark,
  color: theme.palette.text.primary,
  wordBreak: 'break-word'
}));

const VerdictPaper = styled(Paper)(({ theme, verdict }) => ({
  padding: '24px',
  marginBottom: '24px',
  backgroundColor: verdict === 'success' 
    ? theme.palette.success.dark 
    : theme.palette.error.dark,
  color: theme.palette.getContrastText(
    verdict === 'success' 
      ? theme.palette.success.dark 
      : theme.palette.error.dark
  ),
  borderRadius: '12px',
}));

const AnswerField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.paper,
    '& .MuiInputBase-input': {
      color: theme.palette.text.primary
    }
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary
  }
}));

const GameMain = () => {
  const theme = useTheme();
  const { pack_id, firstQuestionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [quitDialogOpen, setQuitDialogOpen] = useState(false);
  const [targetQuestionId, setTargetQuestionId] = useState(null);
  const [timeExpired, setTimeExpired] = useState(false);

  const [gameState, setGameState] = useState({
    loading: true,
    error: null,
    question: null,
    session: null,
    answer: '',
    isCorrect: false,
    correctAnswer: '',
    authorComment: '',
    timeLeft: 60,
    answered: false,
    hasPrevQuestion: false,
    hasNextQuestion: false
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login', { state:{redirect: location} });
    }
  }, [navigate, location]);

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
          hasPrevQuestion: response.data.has_prev_question,
          hasNextQuestion: response.data.has_next_question,
          timeLeft: 60,
          answer: '',
          isCorrect: false,
          correctAnswer: '',
          authorComment: '',
          answered: false
        }));
        setTimeExpired(false);
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

  const handleTimeExpired = async () => {
    if (gameState.answered) return;

    try {
      const response = await axiosInstance.post(
        `/game/${pack_id}/questions/${gameState.question.id}/submit/`,
        { answer: '' }, // Пустой ответ при истечении времени
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );

      setGameState(prev => ({
        ...prev,
        isCorrect: false, // Всегда false при истечении времени
        correctAnswer: response.data.correct_answer,
        authorComment: response.data.author_comment || 'Время истекло',
        session: response.data.session,
        answered: true,
        hasNextQuestion: response.data.has_next_question,
        timeLeft: 0
      }));
      setTimeExpired(true);
    } catch (error) {
      console.error("Ошибка отправки ответа:", error);
      setGameState(prev => ({
        ...prev,
        error: error.response?.data?.error || "Ошибка при отправке ответа"
      }));
    }
  };

  useEffect(() => {
    if (!gameState.question || gameState.loading || gameState.answered) return;

    const timer = setInterval(() => {
      setGameState(prev => {
        const newTimeLeft = prev.timeLeft - 1;

        if (newTimeLeft <= 0) {
          clearInterval(timer);
          handleTimeExpired();
          return { ...prev, timeLeft: 0 };
        }

        return { ...prev, timeLeft: newTimeLeft };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.question, gameState.loading, gameState.answered]);

  const handleSubmit = async () => {
    if (!gameState.answer.trim() || gameState.answered || timeExpired) return;

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
        isCorrect: response.data.is_correct,
        correctAnswer: response.data.correct_answer,
        authorComment: response.data.author_comment || 'Автор не оставил комментария',
        session: response.data.session,
        answered: true,
        hasNextQuestion: response.data.has_next_question
      }));
    } catch (error) {
      console.error("Ошибка отправки ответа:", error);
      setGameState(prev => ({
        ...prev,
        error: error.response?.data?.error || "Ошибка при отправке ответа"
      }));
    }
  };

  const handleNavigateQuestion = (direction) => {
    if (!gameState.answered && gameState.answer.trim()) {
      setTargetQuestionId(direction);
      setQuitDialogOpen(true);
    } else {
      navigateToQuestion(direction);
    }
  };

  const navigateToQuestion = (direction) => {
    const endpoint = direction === 'prev' 
      ? `/game/${pack_id}/questions/${gameState.question.id}/prev/`
      : `/game/${pack_id}/questions/${gameState.question.id}/next/`;

    axiosInstance.get(endpoint, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    })
    .then(response => {
      if (response.data.question) {
        navigate(`/game/${pack_id}/questions/${response.data.question.id}`);
      } else if (direction === 'next') {
        navigate(`/game/${pack_id}/results`, {
          state: {
            score: response.data.final_score,
            total: response.data.total_questions
          }
        });
      }
    })
    .catch(error => {
      console.error(`Ошибка перехода к ${direction} вопросу:`, error);
      setGameState(prev => ({
        ...prev,
        error: error.response?.data?.error || `Ошибка перехода к ${direction} вопросу`
      }));
    });
  };

  const QuitQuestionDialog = () => (
    <Dialog
      open={quitDialogOpen}
      onClose={() => setQuitDialogOpen(false)}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Подтверждение выхода</DialogTitle>
      <DialogContent>
        <Typography>
          Вы не ответили на текущий вопрос. После перехода ответить на него будет невозможно.
          Вы уверены, что хотите продолжить?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setQuitDialogOpen(false)}>Отмена</Button>
        <Button 
          onClick={() => {
            setQuitDialogOpen(false);
            navigateToQuestion(targetQuestionId);
          }}
          color="primary"
        >
          Продолжить
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (gameState.loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '100vh'
      }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (gameState.error) {
    return (
      <Box sx={{ 
        p: 4, 
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <Alert severity="error" sx={{ mb: 2, maxWidth: '500px' }}>
          {gameState.error}
        </Alert>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => window.location.reload()}
        >
          Попробовать снова
        </Button>
      </Box>
    );
  }

  return (
    <>
      <CssBaseline />
      <QuitQuestionDialog />
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 2,
        backgroundColor: theme.palette.background.default
      }}>
        <StyledCard>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <Box display="flex" alignItems="center" sx={{
                backgroundColor: theme.palette.background.paper,
                borderRadius: '20px',
                px: 2,
                py: 1,
              }}>
                <Timer color={timeExpired ? "error" : "primary"} sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold" color={timeExpired ? "error" : "text.primary"}>
                  {gameState.timeLeft} сек.
                </Typography>
              </Box>
            </Box>

            <QuestionPaper sx={{ minHeight: '20vh', borderRadius: 3, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1" color="text.secondary" mb={1}>
                Вопрос {gameState.session?.current_question_index + 1} из {gameState.session?.questions_count}
              </Typography>
              <Typography variant="h5" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}> 
                {gameState.question?.question_text}
              </Typography>
            </QuestionPaper>

            {gameState.answered || timeExpired ? (
              <VerdictPaper elevation={3} verdict={gameState.isCorrect ? 'success' : 'error'}>
                <Box display="flex" alignItems="center" mb={3}>
                  {gameState.isCorrect ? (
                    <Check sx={{ color: 'inherit', fontSize: '2rem', mr: 2 }} />
                  ) : (
                    <Close sx={{ color: 'inherit', fontSize: '2rem', mr: 2 }} />
                  )}
                  <Typography variant="h5" sx={{ 
                    fontWeight: 'bold',
                    color: 'inherit'
                  }}>
                    {timeExpired ? 'Время истекло!' : gameState.isCorrect ? 'Правильно!' : 'Неправильно!'}
                  </Typography>
                </Box>

                {!timeExpired && (
                  <Box mb={3}>
                    <Typography variant="h6" color="inherit" mb={1}>
                      Ваш ответ:
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      fontWeight: 500,
                      color: 'inherit',
                      wordBreak: 'break-word'
                    }}>
                      {gameState.answer || '—'}
                    </Typography>
                  </Box>
                )}

                <Box mb={3}>
                  <Typography variant="h6" color="inherit" mb={1}>
                    Правильный ответ:
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    fontWeight: 500,
                    color: 'inherit',
                    wordBreak: 'break-word'
                  }}>
                    {gameState.correctAnswer}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h6" color="inherit" mb={1}>
                    {timeExpired ? 'Примечание:' : 'Комментарий автора:'}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: 'inherit',
                    wordBreak: 'break-word'
                  }}>
                    {timeExpired ? 'Вы не успели ответить на вопрос вовремя' : gameState.authorComment}
                  </Typography>
                </Box>
              </VerdictPaper>
            ) : (
              <AnswerField
                fullWidth
                variant="outlined"
                label="Ваш ответ"
                multiline
                rows={4}
                value={gameState.answer}
                onChange={(e) => setGameState(prev => ({ ...prev, answer: e.target.value }))}
                sx={{ mb: 3 }}
                disabled={timeExpired}
              />
            )}

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <IconButton
                onClick={() => handleNavigateQuestion('prev')}
                disabled={!gameState.hasPrevQuestion}
                color="primary"
                sx={{ 
                  width: '56px',
                  height: '56px',
                  backgroundColor: gameState.hasPrevQuestion ? theme.palette.primary.main : theme.palette.action.disabledBackground,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: gameState.hasPrevQuestion ? theme.palette.primary.dark : theme.palette.action.disabledBackground
                  }
                }}
              >
                <ArrowBack />
              </IconButton>

              <IconButton
                onClick={() => handleNavigateQuestion('next')}
                disabled={!gameState.hasNextQuestion && !gameState.answered}
                color="primary"
                sx={{ 
                  width: '56px',
                  height: '56px',
                  backgroundColor: (gameState.hasNextQuestion || gameState.answered) ? theme.palette.primary.main : theme.palette.action.disabledBackground,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: (gameState.hasNextQuestion || gameState.answered) ? theme.palette.primary.dark : theme.palette.action.disabledBackground
                  }
                }}
              >
                <ArrowForward />
              </IconButton>
            </Box>

            {!gameState.answered && (
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSubmit}
                  disabled={!gameState.answer.trim()}
                  endIcon={<Send />}
                  sx={{
                    borderRadius: '28px',
                    padding: '8px 24px',
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                >
                  Отправить ответ
                </Button>
              </Box>
            )}
          </CardContent>
        </StyledCard>
      </Box>
    </>
  );
};

export default GameMain;
