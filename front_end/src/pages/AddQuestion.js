import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Link, Alert } from '@mui/material';
import axios from 'axios';

const AddQuestion = () => {
  const [questionText, setQuestionText] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [authorComment, setAuthorComment] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleAddToOpenPack = async () => {
    if (!isAuthenticated) return;

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      const response = await axios.post(
        'http://127.0.0.1:8000/api/question/create/',
        {
          question_text: questionText,
          answer_text: correctAnswer,
          question_note: authorComment,
          author_q: user.id
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201) {
        alert('Вопрос успешно добавлен в открытый пак!');
        setQuestionText('');
        setCorrectAnswer('');
        setAuthorComment('');
        navigate('/questions');
      }
    } catch (error) {
      console.error('Ошибка при добавлении вопроса:', error);
    }
  };

  const handleAddToMyPack = async () => {
    if (!isAuthenticated) return;
    // Реализация добавления в мой пак
  };

  if (loading) {
    return <Typography>Проверка авторизации...</Typography>;
  }

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Для добавления вопросов необходимо авторизоваться
        </Typography>
        <Link 
          href="/authorization" 
          underline="hover"
          sx={{ 
            fontSize: '1.2rem',
            color: 'primary.main',
            cursor: 'pointer'
          }}
        >
          Перейти на страницу авторизации
        </Link>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', pt: 0 }}>
      <Typography variant="h4" >
        Создание нового вопроса
      </Typography>
      
      <Alert severity="warning" sx={{ mb: 1 }}>
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
        sx={{ mb: 0 }}
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
        helperText="Можно указать источники, пояснения или примечания"
        sx={{ mb: 4 }}
      />

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        gap: 2,
        mb: 3
      }}>
        <Button 
          variant="contained" 
          onClick={handleAddToOpenPack}
          disabled={!questionText || !correctAnswer}
          sx={{
            flex: 1,
            bgcolor: !questionText || !correctAnswer ? '#f5f5f5' : '#752021',
            color: !questionText || !correctAnswer ? '#bdbdbd' : '#ffffff',
            '&:hover': {
              bgcolor: !questionText || !correctAnswer ? '#f5f5f5' : '#c23639'
            },
            py: 1.5,
            borderRadius: 1,
            boxShadow: 'none',
            border: !questionText || !correctAnswer ? '1px solid #e0e0e0' : 'none',
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Добавить в открытый пак
        </Button>
        <Button 
          variant="contained" 
          onClick={handleAddToMyPack}
          disabled={!questionText || !correctAnswer}
          sx={{
            flex: 1,
            bgcolor: !questionText || !correctAnswer ? '#f5f5f5' : '#752021',
            color: !questionText || !correctAnswer ? '#bdbdbd' : '#ffffff',
            '&:hover': {
              bgcolor: !questionText || !correctAnswer ? '#f5f5f5' : '#c23639'
            },
            py: 1.5,
            borderRadius: 1,
            boxShadow: 'none',
            border: !questionText || !correctAnswer ? '1px solid #e0e0e0' : 'none',
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Добавить в мой пак
        </Button>
      </Box>
    </Box>
  );
};

export default AddQuestion;