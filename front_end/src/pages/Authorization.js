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

    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    console.log("Form Data:", data);

    const requestData = isLogin
      ? { username: data.username, password: data.password }
      : { username: data.username, email: data.email, password: data.password };

    console.log("Request Payload:", requestData);

    const url = isLogin
      ? 'http://127.0.0.1:8000/api/user/login/'
      : 'http://127.0.0.1:8000/api/user/register/';

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then(text => {
            console.error("Server Response:", text);
            try {
              const json = JSON.parse(text);
              throw new Error(json.message || "Error while sending request");
            } catch {
              throw new Error("Unexpected server response");
            }
          });
        }
        return response.json();
      })
      .then((data) => {
        if (data.token) {
          localStorage.setItem('user', JSON.stringify(data.user || {}));
          localStorage.setItem('token', data.token);
          alert(isLogin ? "Successfully logged in!" : "Successfully registered!");
          setTimeout(() => {
            window.location.href = (isLogin ? '/' : '/authorization');
          }, 500);

        } else {
          setError(data.error || "Authorization error");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        setError(error.message || "Error while sending a request");
      });
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
          <Typography variant="body1" sx={{ color: 'error.main', textAlign: 'center', marginBottom: 3 }}>
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} justifyContent="center">
            {!isLogin && (
            <Grid item xs={12}>
              <TextField fullWidth label="Email" name="email" type="email" placeholder="Enter your email" required variant="outlined" sx={{ marginBottom: 2 }} />
                
            </Grid>
            )}
            <Grid item xs={12}>
              <TextField fullWidth label="Username" name="username" type="text" placeholder="Example: botanic_garden" required variant="outlined" sx={{ marginBottom: 2 }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Password" name="password" type="password" placeholder="Min 8 symbols, min 1 letter" inputProps={{ minLength: 8 }} required variant="outlined" sx={{ marginBottom: 2 }} />
            </Grid>
            <Grid item xs={12}>
              <Button fullWidth type="submit" variant="contained" size="large" sx={{ marginTop: 2, fontSize: '1rem', padding: '10px' }}>
                {isLogin ? 'Log in' : 'Sign up'}
              </Button>
            </Grid>
          </Grid>
        </form>

        <Box sx={{ textAlign: 'center', marginTop: 3 }}>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {isLogin ? "No account yet? " : "Already have an account? "}
            <Link component="button" variant="body1" onClick={() => setIsLogin(!isLogin)} sx={{ color: 'primary.main', fontSize: '1rem' }}>
              {isLogin ? "Sign up" : "Log in"}
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default Authorization;
