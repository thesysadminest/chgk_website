import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const response = await axios.post('http://127.0.0.1:8000/api/user/login/', {
        username: username.trim(),
        password: password.trim(),
      });

      // Сохраняем токены в LocalStorage
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);

      alert('Вход выполнен успешно!');
      navigate('/news'); // Перенаправление на страницу /news
    } catch (error) {
      setError(error.response?.data?.errors || error.message || 'Ошибка при входе');
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = username.trim() && password.trim();

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', flex: 1, minHeight: 0, overflow: 'auto', }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Вход в аккаунт
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <TextField
        label="Имя пользователя"
        fullWidth
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        margin="normal"
        required
        sx={{ mb: 2 }}
      />

      <TextField
        label="Пароль"
        type="password"
        fullWidth
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        margin="normal"
        required
        sx={{ mb: 2 }}
      />

      <Button
        variant="main_button"
        onClick={handleLogin}
        disabled={submitting || !isFormValid}
        sx={{
          mt: 2,
          py: 1.5,
          backgroundColor: submitting ? theme.palette.background.disabled : theme.palette.primary.main,
          color: submitting ? theme.palette.text.disabled : theme.palette.primary.contrastText,
          '&:hover': {
            backgroundColor: submitting ? theme.palette.background.disabled : theme.palette.primary.hover,
          },
          width: '100%',
        }}
      >
        {submitting ? <CircularProgress size={24} color="inherit" /> : 'Войти'}
      </Button>

      <Typography variant="body1" sx={{ textAlign: 'center', mt: 3, color: theme.palette.text.secondary }}>
        Нет аккаунта?{' '}
        <Link to="/registration" style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
          Зарегистрироваться
        </Link>
      </Typography>
    </Box>
  );
};

export default Login;
