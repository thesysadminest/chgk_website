import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Alert, 
  CircularProgress,
  Tooltip
} from '@mui/material';
import axios from 'axios';
import { checkAuth } from '../utils/authCheck';
import { useTheme } from '@mui/material/styles';

const AddQuestion = () => {
  const theme = useTheme(); 
  const [questionText, setQuestionText] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [authorComment, setAuthorComment] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { isAuthorized } = await checkAuth();
        setIsAuthenticated(isAuthorized);
      } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleAddQuestion = async (packType) => {
    if (!isAuthenticated) return;
    try {
      setSubmitting(true);
      setError(null);

      const token = localStorage.getItem('access_token');
      const user = JSON.parse(localStorage.getItem('user'));

      const questionResponse = await axios.post(
        'http://127.0.0.1:8000/api/question/create/',
        {
          question_text: questionText.trim(),
          answer_text: correctAnswer.trim(),
          question_note: authorComment.trim(),
          author_q: user.id,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (questionResponse.status === 201) {
        const questionId = questionResponse.data.id;
        alert(`Вопрос успешно добавлен в ${packType === 'open' ? 'открытый' : 'ваш'} пак!`);
        setQuestionText('');
        setCorrectAnswer('');
        setAuthorComment('');
        navigate('/questions');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      setError(error.response?.data?.detail || error.message || 'Ошибка при добавлении');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Для добавления вопросов необходимо авторизоваться
        </Typography>
        <Button 
          variant="main_button" 
          onClick={() => navigate('/registration')}
          sx={{ 
            mt: 2,
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': {
              backgroundColor: theme.palette.primary.hover,
            },
          }}
        >
          Войти в аккаунт
        </Button>
      </Box>
    );
  }

  const isFormValid = questionText.trim() && correctAnswer.trim();
  const isButtonDisabled = submitting || !isFormValid;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', flex: 1, minHeight: 0, overflow: 'auto', }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Создание нового вопроса
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Alert severity="warning" sx={{ mb: 3 }}>
        Пожалуйста, убедитесь, что ваш вопрос этичен и не затрагивает острые социальные, 
        политические или религиозные темы. Вопросы, нарушающие правила сообщества, 
        будут удалены.
      </Alert>

      <TextField
        label="Текст вопроса"
        fullWidth
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        margin="normal"
        multiline
        rows={4}
        required
        sx={{ mb: 2 }}
      />

      <TextField
        label="Правильный ответ"
        fullWidth
        value={correctAnswer}
        onChange={(e) => setCorrectAnswer(e.target.value)}
        margin="normal"
        required
        sx={{ mb: 2 }}
      />

      <TextField
          label="Авторский комментарий (необязательно)"
          fullWidth
          value={authorComment}
          onChange={(e) => setAuthorComment(e.target.value)}
          margin="normal"
          multiline
          rows={2}
          sx={{ mb: 4 }}
      />


      <Box sx={{ display: 'flex', gap: 2 }}>
        <Tooltip 
          title={!isFormValid ? "Заполните текст вопроса и правильный ответ" : ""} 
          arrow
        >
          <span>
            <Button
              variant="main_button"
              onClick={() => handleAddQuestion('open')}
              disabled={isButtonDisabled}
              sx={{
                flex: 1,
                py: 1.5,
                backgroundColor: isButtonDisabled ? theme.palette.background.disabled : theme.palette.primary.main,
                color: isButtonDisabled ? theme.palette.text.disabled : theme.palette.primary.contrastText,
                '&:hover': {
                  backgroundColor: isButtonDisabled ? theme.palette.background.disabled : theme.palette.primary.hover,
                },
              }}
            >
              {submitting ? <CircularProgress size={24} color="inherit" /> : 'Добавить в открытый пак'}
            </Button>
          </span>
        </Tooltip>

        <Tooltip 
          title={!isFormValid ? "Заполните текст вопроса и правильный ответ" : ""} 
          arrow
        >
          <span>
            <Button
              variant="main_button"
              onClick={() => handleAddQuestion('my')}
              disabled={isButtonDisabled}
              sx={{
                flex: 1,
                py: 1.5,
                backgroundColor: isButtonDisabled ? theme.palette.background.disabled : theme.palette.primary.main,
                color: isButtonDisabled ? theme.palette.text.disabled : theme.palette.primary.contrastText,
                '&:hover': {
                  backgroundColor: isButtonDisabled ? theme.palette.background.disabled : theme.palette.primary.hover,
                },
              }}
            >
              {submitting ? <CircularProgress size={24} color="inherit" /> : 'Добавить в мой пак'}
            </Button>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default AddQuestion;
