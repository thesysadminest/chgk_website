import React, { useState } from "react";
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Alert, 
  CircularProgress,
  Tooltip 
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate, Link } from "react-router-dom";

const Registration = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleRegister = async (event) => {
    event.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const response = await fetch("http://127.0.0.1:8000/api/user/register/", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: username.trim(),
          email: email.trim(),
          password: password.trim()
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        let errorMessage = result.detail || result.message || "Ошибка регистрации";
        
        if (result.username && result.username[0] == "A user with that username already exists.") {
          errorMessage = "Такой пользователь уже есть";
        }
        else if (result.email && result.email[0] == "This field must be unique.") {
          errorMessage = "Такая почта уже есть";
        }
        else if (result.password && result.password[0] == "This password is too short. It must contain at least 8 characters.") {
          errorMessage = "Пароль не должен быть короче 8 символов";
        }
        else if (result.password && result.password[0] == "This password is too common.") {
          errorMessage = "Пароль слишком простой";
        }
        throw new Error(errorMessage);
      }

      localStorage.setItem("access_token", result.access);
      localStorage.setItem("refresh_token", result.refresh);
      localStorage.setItem("user", JSON.stringify(result.user || { username }));
      
      navigate("/news");
      
    } catch (error) {
      console.error("Ошибка:", error);
      setError(error.message || "Ошибка регистрации");
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = username.trim() && email.trim() && password.trim() && confirmPassword.trim();

  return (
    <Box 
      component="form"
      onSubmit={handleRegister}
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        minHeight: "100vh",
        backgroundColor: theme.palette.background.paper,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: 0,
        padding: 0,
      }}
    >
      <Box 
        sx={{ 
          maxWidth: "400px",
          maxHeight: "480px",
          backgroundColor: theme.palette.background.window,
          borderRadius: "16px",
          mt: 2.5,
          padding: 4,
          boxShadow: theme.shadows[3],
        }}
      >
        <Typography 
          variant="h4" 
          sx={{
            textAlign: "center", 
            color: theme.palette.primary.main, 
            fontWeight: "bold",
            mb: 1
          }}
        >
          Регистрация
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 0.5 }}>{error}</Alert>}

        <TextField
          name="username"
          label="Имя пользователя"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          margin="normal"
          required
          sx={{ mb: 0.5 }}
        />

        <TextField
          name="email"
          label="Email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required
          type="email"
          sx={{ mb: 0.5 }}
        />

        <TextField
          name="password"
          label="Пароль"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          required
          sx={{ mb: 0.2 }}
        />

        <TextField
          label="Подтвердите пароль"
          type="password"
          fullWidth
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          margin="normal"
          required
          sx={{ mb: 0.2 }}
        />

        <Tooltip 
          title={!isFormValid ? "Заполните все обязательные поля" : ""}
          placement="top"
        >
          <span>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting || !isFormValid}
              sx={{
                mt: 1,
                py: 1.5,
                backgroundColor: submitting ? theme.palette.background.disabled : theme.palette.primary.main,
                color: submitting ? theme.palette.text.disabled : theme.palette.primary.contrastText,
                "&:hover": {
                  backgroundColor: submitting ? theme.palette.background.disabled : theme.palette.primary.hover,
                },
                width: "100%",
                borderRadius: "10px",
              }}
            >
              {submitting ? <CircularProgress size={24} color="inherit" /> : "Зарегистрироваться"}
            </Button>
          </span>
        </Tooltip>

        <Typography 
          variant="body1" 
          sx={{ 
            textAlign: "center", 
            mt: 1, 
            color: theme.palette.text.secondary 
          }}
        >
          Уже есть аккаунт?{" "}
          <Link to="/login" style={{ color: theme.palette.primary.main, textDecoration: "none" }}>
            Войти
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Registration;
