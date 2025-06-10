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
import axios from "axios";
import { useTheme } from "@mui/material/styles";
import { useNavigate, useLocation } from "react-router-dom";
import { setAuthTokens } from "../utils/AuthUtils";

const Login = () => {
  const redirectLocation = useLocation()?.state?.redirect;
  const theme = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
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

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);

      const response = await axios.post(
        "http://127.0.0.1:8000/api/user/login/", 
        {
          username: formData.username,
          password: formData.password
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      setAuthTokens({
        access: response.data.access,
        refresh: response.data.refresh
      });

      navigate((redirectLocation ? redirectLocation.pathname : "/news"), { replace: true });
      
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 
                         (error.response?.status === 400 ? "Неверный логин или пароль" : "Ошибка при входе");
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = formData.username && formData.password;

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
        overflow: 'auto'
      }}
    >
      <Box 
        component="form"
        onSubmit={handleLogin}
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
          Вход в аккаунт
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
          name="password"
          label="Пароль"
          type="password"
          variant="outlined"
          fullWidth
          value={formData.password}
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
              ) : "Войти"}
            </Button>
          </Box>
        </Tooltip>

        <Typography 
          variant="body1" 
          sx={{ 
            textAlign: "center", 
            mt: 1, 
            color: theme.palette.default.black5,
          }}
        >
          Нет аккаунта?{" "}
          <MuiLink 
            component="button" 
            type="button"
            onClick={() => navigate("/registration", { state:{redirect: redirectLocation}, replace: true })}
            sx={{ 
              color: theme.palette.primary.main, 
              fontWeight: theme.typography.fontWeightMedium,
              "&:hover": {
                textDecoration: "underline"
              }
            }}
          >
            Зарегистрироваться
          </MuiLink>
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
