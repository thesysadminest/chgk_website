import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Container, Paper, Grid, Link } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

function Authorization() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    
    const formData = new FormData(event.target);
    const data = {
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password')
    };

    try {
      const url = isLogin 
        ? 'http://127.0.0.1:8000/api/user/login/'
        : 'http://127.0.0.1:8000/api/user/register/';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(isLogin 
          ? { username: data.username, password: data.password }
          : { username: data.username, email: data.email, password: data.password }
        ),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || result.message || 'Authorization error');
      }

      localStorage.setItem('user', JSON.stringify(result.user || { username: data.username }));
      localStorage.setItem('token', result.access || result.token);
      
      window.location.href = '/';
      
    } catch (error) {
      console.error('Ошибка:', error);
      setError(error.message || 'Authorization error');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ marginBottom: 8 }}>
      <Paper sx={{ padding: 3, marginTop: 4, borderRadius: 4, backgroundColor: 'background.gray' }}>
        <Box sx={{ textAlign: 'center', marginBottom: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main', marginTop: 2 }}>
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
                  label="Email" 
                  name="email" 
                  type="email" 
                  placeholder="Enter your email" 
                  required 
                  variant="outlined" 
                  InputLabelProps={{ sx: { marginBottom: 2, color: 'gray' } }}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Username" 
                name="username" 
                type="text" 
                placeholder="Example: botanic_garden" 
                required 
                variant="outlined" 
                InputLabelProps={{ sx: { marginBottom: 2, color: 'gray' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Password" 
                name="password" 
                type="password" 
                placeholder="Min 8 symbols, min 1 letter" 
                inputProps={{ minLength: 8 }} 
                required 
                variant="outlined" 
                InputLabelProps={{ sx: { marginBottom: 2, color: 'gray' } }}
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
                {isLogin ? 'Log in' : 'Sign up'}
              </Button>
            </Grid>
          </Grid>
        </form>

        <Box sx={{ textAlign: 'center', marginTop: 3 }}>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {isLogin ? "No account yet? " : "Already have an account? "}
            <Link 
              component="button" 
              variant="body1" 
              onClick={() => setIsLogin(!isLogin)} 
              sx={{ color: 'primary.main', fontSize: '1rem' }}
            >
              {isLogin ? "Sign up" : "Log in"}
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default Authorization;