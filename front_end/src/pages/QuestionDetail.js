import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, TextField, Button } from '@mui/material';
import { useParams, useLocation } from 'react-router-dom';

const QuestionDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const [question, setQuestion] = useState(location.state?.question || {
    id: '',
    author: { username: '' },
    publication_date: '',
    question_text: ''
  });
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    if (!location.state?.question) {
      axios.get(`http://127.0.0.1:8000/api/question/${id}`)
        .then(response => {
          setQuestion(response.data);
        })
        .catch(error => {
          console.error('Ошибка при загрузке данных:', error);
        });
    }
  }, [id, location.state]);

  const handleAnswerChange = (event) => {
    setAnswer(event.target.value);
  };

  const handleSubmit = () => {
    // Обработка отправки ответа
    console.log('Ответ отправлен:', answer);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Вопрос ID: {question.id}
      </Typography>
      <Typography variant="h6" gutterBottom>
        Автор: {question.author && question.author.username ? question.author.username : 'Неизвестно'}
      </Typography>
      <Typography variant="h6" gutterBottom>
        Дата публикации: {question.publication_date ? new Date(question.publication_date).toLocaleDateString('ru-RU') : 'Неизвестно'}
      </Typography>
      <Typography variant="h6" gutterBottom>
        Текст вопроса: {question.question_text ? question.question_text : 'Неизвестно'}
      </Typography>
      <TextField
        label="Ваш ответ"
        multiline
        rows={4}
        value={answer}
        onChange={handleAnswerChange}
        variant="outlined"
        fullWidth
        sx={{ mt: 2, mb: 2 }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
      >
        Отправить ответ
      </Button>
    </Box>
  );
};

export default QuestionDetail;
