import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Container, Paper, Grid, Link } from '@mui/material';
import { useTheme } from '@mui/material/styles';

function Authorization() {
  const theme = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    console.log('Отправляемые данные:', data); // Логируем данные

    const requestData = {
      username: data.username,
      email: data.email,
      password: data.password,
      bio: data.bio || '',
    };

    const url = isLogin ? 'http://127.0.0.1:8000/api/user/login/' : 'http://127.0.0.1:8000/api/user/register/';

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then(err => {
            console.error('Ошибка сервера:', err); // Логируем ошибку сервера
            throw new Error(err.message || 'Ошибка при отправке запроса');
          });
        }
        return response.json();
      })
      .then((data) => {
        if (data.token) {
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('token', data.token);
          alert(isLogin ? 'Вход выполнен успешно!' : 'Регистрация прошла успешно!');
          window.location.href = '/';
        } else {
          setError(data.error || 'Ошибка авторизации');
        }
      })
      .catch((error) => {
        console.error('Ошибка:', error);
        setError(error.message || 'Ошибка при отправке запроса');
      });
  };

  return (
    <Container maxWidth="sm" sx={{ marginBottom: 8 }}> {/* Отступ снизу */}
      <Paper
        sx={{
          padding: 3,
          marginTop: 4,
          borderRadius: 4,
          backgroundColor: '#d4d4d4',
        }}
      >
        <Box sx={{ textAlign: 'center', marginBottom: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 'bold', color: 'primary.main', marginTop: 2 }}
          >
            Botanic Garden
          </Typography>
          <Typography variant="h6" sx={{ color: '#2A2A2A' }}>
            chgk with us
          </Typography>
        </Box>

        {error && (
          <Typography variant="body1" sx={{ color: 'error.main', textAlign: 'center', marginBottom: 3 }}>
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} justifyContent="center">
            {!isLogin && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Имя пользователя"
                  name="username"
                  placeholder="Например: tomato2025"
                  required
                  variant="outlined"
                  sx={{ marginBottom: 2 }}
                  InputLabelProps={{
                    sx: {
                      color: 'text.gray',
                      '&.Mui-focused': {
                        color: 'primary.main',
                      },
                    },
                  }}
                  InputProps={{
                    style: { fontSize: '1rem', color: '#000000' }, // Не белый цвет текста
                  }}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email адрес"
                name="email"
                type="email"
                placeholder="Например: botanic@garden.ru"
                required
                variant="outlined"
                sx={{ marginBottom: 2 }}
                InputLabelProps={{
                  sx: {
                    color: 'text.gray',
                    '&.Mui-focused': {
                      color: 'primary.main',
                    },
                  },
                }}
                InputProps={{
                  style: { fontSize: '1rem', color: '#000000' }, // Не белый цвет текста
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Пароль"
                name="password"
                type="password"
                placeholder="Минимум 8 символов, минимум 1 буква"
                inputProps={{ minLength: 8 }}
                required
                variant="outlined"
                sx={{ marginBottom: 2 }}
                InputLabelProps={{
                  
                  sx: {
                    color: 'text.gray',
                    '&.Mui-focused': {
                      color: 'primary.main',
                    },
                  },
                }}
                InputProps={{
                  style: { fontSize: '1rem', color: '#000000' }, // Не белый цвет текста
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                sx={{ marginTop: 2, fontSize: '1rem', padding: '10px' }}
              >
                {isLogin ? 'Войти' : 'Зарегистрироваться'}
              </Button>
            </Grid>
          </Grid>
        </form>

        <Box sx={{ justifyContent: 'center', marginTop: 3, display: 'flex' }}>
          <Typography variant="body1" sx={{ color: 'text.gray' }}>
            {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
          </Typography>
          <Link
            component="button"
            variant="body1"
            onClick={() => setIsLogin(!isLogin)}
            sx={{ color: 'primary.main', ml: '1rem' }}
          >
            {isLogin ? 'Зарегистрируйтесь' : 'Войдите'}
          </Link>
        </Box>
      </Paper>
    </Container>
  );
}

export default Authorization;
