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

      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      navigate('/news'); 
    } catch (error) {
      setError(error.response?.data?.errors || error.message || 'Ошибка при входе');
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = username.trim() && password.trim();

  return (
    <Box 
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        minHeight: '100vh',
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
        padding: 0,
      }}
    >
      <Box 
        sx={{ 
          maxWidth: 400,
          width: '100%',
          backgroundColor: theme.palette.background.window,
          borderRadius: '16px',
          padding: 4,
          boxShadow: theme.shadows[3],
          margin: 2 // Добавляем небольшой отступ по краям на мобильных устройствах
        }}
      >
        <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
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
          variant="contained"
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
            borderRadius: '8px',
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
    </Box>
  );
};

export default Login;