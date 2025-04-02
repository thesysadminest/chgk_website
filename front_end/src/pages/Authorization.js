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
    const data = Object.fromEntries(formData.entries());

    try {
      const url = isLogin
        ? 'http://127.0.0.1:8000/api/user/login/'
        : 'http://127.0.0.1:8000/api/user/register/';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Handle Django validation errors
        if (response.status === 400) {
          const errors = Object.values(responseData).flat().join('\n');
          throw new Error(errors);
        }
        throw new Error(responseData.detail || 'Authentication failed');
      }

      // Save tokens and user data
      localStorage.setItem('access_token', responseData.tokens.access);
      localStorage.setItem('refresh_token', responseData.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(responseData.user));

      navigate('/'); // Redirect to home page
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error.message || 'Something went wrong');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ marginBottom: 8 }}>
      <Paper sx={{ padding: 3, marginTop: 4, borderRadius: 4, backgroundColor: '#d4d4d4' }}>
        <Box sx={{ textAlign: 'center', marginBottom: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main', marginTop: 2 }}>
            Botanic Garden
          </Typography>
          <Typography variant="h6" sx={{ color: '#2A2A2A' }}>
            chgk with us
          </Typography>
        </Box>

        {error && (
          <Typography variant="body1" sx={{
            color: 'error.main',
            textAlign: 'center',
            marginBottom: 3,
            whiteSpace: 'pre-line'
          }}>
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} justifyContent="center">
            {!isLogin && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    required
                    variant="outlined"
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                type="text"
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                required
                inputProps={{ minLength: 8 }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                sx={{ marginTop: 2 }}
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
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              sx={{ color: 'primary.main' }}
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