import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography } from '@mui/material';
import User from '../components/User'; // Импортируем класс User

const AddQuestion = () => {
  const [questionText, setQuestionText] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Проверяем авторизацию пользователя
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (!user.username) {
        navigate('/me'); // Перенаправляем на страницу авторизации, если пользователь не авторизован
      }
    } else {
      navigate('/me'); // Перенаправляем на страницу авторизации, если пользователь не найден
    }
  }, [navigate]);

  const handleAddToOpenPack = () => {
    // Логика добавления вопроса в открытый пак
    // Здесь должна быть ваша логика запроса к серверу
    alert('Вопрос успешно добавлен в открытый пак!');
    setQuestionText('');
    setCorrectAnswer('');
  };

  const handleAddToMyPack = () => {
    // Логика добавления вопроса в личный пак
    // Здесь должна быть ваша логика запроса к серверу
    alert('Вопрос успешно добавлен в ваш пак!');
    setQuestionText('');
    setCorrectAnswer('');
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Добавить вопрос
      </Typography>
      <TextField
        label="Текст вопроса"
        fullWidth
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        margin="normal"
      />
      <TextField
        label="Правильный ответ"
        fullWidth
        value={correctAnswer}
        onChange={(e) => setCorrectAnswer(e.target.value)}
        margin="normal"
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button variant="contained" color="primary" onClick={handleAddToOpenPack}>
          Добавить в открытый пак
        </Button>
        <Button variant="contained" color="secondary" onClick={handleAddToMyPack}>
          Добавить в мой пак
        </Button>
      </Box>
    </Box>
  );
};

export default AddQuestion;
