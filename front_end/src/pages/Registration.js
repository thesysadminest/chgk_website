import React, { useState } from "react";
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Alert, 
  CircularProgress,
  Tooltip,
  Link as MuiLink
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate, useLocation } from "react-router-dom";
import { setAuthTokens, setUserData } from "../utils/AuthUtils";

const Registration = () => {
  const redirectLocation = useLocation()?.state?.redirect;
  const theme = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.trim()
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
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
          username: formData.username,
          email: formData.email,
          password: formData.password
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        let errorMessage = result.detail || result.message || "Ошибка регистрации";
        
        if (result.username && result.username[0] === "A user with that username already exists.") {
          errorMessage = "Такой пользователь уже есть";
        }
        else if (result.email && result.email[0] === "This field must be unique.") {
          errorMessage = "Такая почта уже есть";
        }
        else if (result.password && result.password[0] === "This password is too short. It must contain at least 8 characters.") {
          errorMessage = "Пароль не должен быть короче 8 символов";
        }
        else if (result.password && result.password[0] === "This password is too common.") {
          errorMessage = "Пароль слишком простой";
        }
        throw new Error(errorMessage);
      }

      setAuthTokens({
        access: result.tokens.access,
        refresh: result.tokens.refresh
      });
      setUserData(result.user || { username: formData.username });
      
      navigate((redirectLocation ? redirectLocation.pathname : "/news"), { replace: true });
      
    } catch (error) {
      console.error("Ошибка:", error);
      setError(error.message || "Ошибка регистрации");
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = formData.username && formData.email && 
                    formData.password && formData.confirmPassword;

  return (
    <Box 
      component="main"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.palette.background.default,
        p: 2
      }}
    >
      <Box 
        component="form"
        onSubmit={handleRegister}
        sx={{ 
          width: "100%",
          maxWidth: 400,
          backgroundColor: theme.palette.background.window,
          borderRadius: theme.shape.borderRadius * 2,
          p: 4,
          boxShadow: theme.shadows[3],
          display: "flex",
          flexDirection: "column",
          gap: 2
        }}
      >
        <Typography 
          variant="h4" 
          component="h1"
          sx={{ 
            textAlign: "center", 
            color: theme.palette.primary.main,
            fontWeight: theme.typography.fontWeightBold,
            mb: 1
          }}
        >
          Регистрация
        </Typography>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              backgroundColor: theme.palette.error.light,
              color: theme.palette.error.contrastText
            }}
          >
            {error}
          </Alert>
        )}

        <TextField
          variant_tf="light"
          name="username"
          label="Имя пользователя"
          fullWidth
          value={formData.username}
          onChange={handleChange}
          disabled={submitting}
        />

        <TextField
          variant_tf="light"
          name="email"
          label="Email"
          type="email"
          fullWidth
          value={formData.email}
          onChange={handleChange}
          disabled={submitting}
        />

        <TextField
          variant_tf="light"
          name="password"
          label="Пароль"
          type="password"
          fullWidth
          value={formData.password}
          onChange={handleChange}
          disabled={submitting}
        />

        <TextField
          variant_tf="light"
          name="confirmPassword"
          label="Подтвердите пароль"
          type="password"
          fullWidth
          value={formData.confirmPassword}
          onChange={handleChange}
          disabled={submitting}
        />

        <Tooltip 
          title={!isFormValid ? "Заполните все обязательные поля" : ""}
          placement="top"
          arrow
        >
          <Box>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting || !isFormValid}
              fullWidth
              sx={{
                py: 1.5,
                mt: 1,
                backgroundColor: submitting 
                  ? theme.palette.action.disabledBackground 
                  : theme.palette.primary.main,
                color: submitting 
                  ? theme.palette.text.disabled 
                  : theme.palette.primary.contrastText,
                "&:hover": {
                  backgroundColor: submitting 
                    ? theme.palette.action.disabledBackground 
                    : theme.palette.primary.dark,
                },
                borderRadius: theme.shape.borderRadius,
                "&.Mui-disabled": {
                  backgroundColor: theme.palette.action.disabledBackground,
                  color: theme.palette.text.disabled
                }
              }}
            >
              {submitting ? (
                <CircularProgress 
                  size={24} 
                  sx={{ 
                    color: theme.palette.primary.contrastText 
                  }} 
                />
              ) : "Зарегистрироваться"}
            </Button>
          </Box>
        </Tooltip>

        <Typography 
          variant="body1" 
          sx={{ 
            textAlign: "center", 
            mt: 1, 
            color: theme.palette.default.black5
          }}
        >
          Уже есть аккаунт?{" "}
          <MuiLink 
            component="button" 
            type="button"
            onClick={() => navigate("/login", { state:{redirect: redirectLocation}, replace: true })}
            sx={{ 
              color: theme.palette.primary.main, 
              fontWeight: theme.typography.fontWeightMedium,
              "&:hover": {
                textDecoration: "underline"
              }
            }}
          >
            Войти
          </MuiLink>
        </Typography>
      </Box>
    </Box>
  );
};

export default Registration;
