import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import { useNavigate, Link } from 'react-router-dom';

const Registration = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await axios.post('http://127.0.0.1:8000/api/register', {
        username: username.trim(),
        email: email.trim(),
        password: password.trim(),
      });
      alert('Регистрация прошла успешно!');
      navigate('/news'); // Перенаправление на страницу /news
    } catch (error) {
      setError(error.response?.data?.detail || error.message || 'Ошибка при регистрации');
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = username.trim() && email.trim() && password.trim() && confirmPassword.trim();

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Регистрация
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
        label="Email"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
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

      <TextField
        label="Подтвердите пароль"
        type="password"
        fullWidth
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        margin="normal"
        required
        sx={{ mb: 2 }}
      />

      <Button
        variant="main_button"
        onClick={handleRegister}
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
        {submitting ? <CircularProgress size={24} color="inherit" /> : 'Зарегистрироваться'}
      </Button>

      <Typography variant="body1" sx={{ textAlign: 'center', mt: 3, color: theme.palette.text.secondary }}>
        Уже есть аккаунт?{' '}
        <Link to="/login" style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
          Войти
        </Link>
      </Typography>
    </Box>
  );
};

export default Registration;
