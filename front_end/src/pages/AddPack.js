import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography } from '@mui/material';
import User from '../components/User'; // Импортируем класс User

const AddPack = () => {
  const [packName, setPackName] = useState('');
  const [description, setDescription] = useState('');
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

  const handleAddPack = () => {
    // Логика добавления нового пака
    // Здесь должна быть ваша логика запроса к серверу
    alert('Пак успешно добавлен!');
    setPackName('');
    setDescription('');
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Добавить новый пак
      </Typography>
      <TextField
        label="Имя пака"
        fullWidth
        value={packName}
        onChange={(e) => setPackName(e.target.value)}
        margin="normal"
      />
      <TextField
        label="Описание"
        fullWidth
        multiline
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        margin="normal"
      />
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Button variant="contained" color="primary" onClick={handleAddPack}>
          Добавить пак
        </Button>
      </Box>
    </Box>
  );
};

export default AddPack;
