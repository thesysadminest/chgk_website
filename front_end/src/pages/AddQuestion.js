import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Alert, 
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import { checkAuth, getAccessToken, getUserData, clearAuthTokens } from "../utils/AuthUtils";

const AddQuestion = () => {
  const theme = useTheme();
  const [questionData, setQuestionData] = useState({
    text: "",
    answer: "",
    comment: ""
  });
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true,
    error: null
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuthentication = async () => {
      try {
        const { isAuthorized, user } = await checkAuth();
        setAuthState({
          isAuthenticated: isAuthorized,
          isLoading: false,
          error: isAuthorized ? null : "Для добавления вопросов необходимо авторизоваться"
        });
      } catch (error) {
        console.error("Authentication check failed:", error);
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          error: "Ошибка проверки авторизации"
        });
        clearAuthTokens();
      }
    };

    verifyAuthentication();
  }, []);

  const handleInputChange = (field) => (e) => {
    setQuestionData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleAddQuestion = async (packType) => {
    if (!authState.isAuthenticated || !isFormValid) return;

    try {
      setSubmitting(true);
      setSubmitError(null);

      const token = getAccessToken();
      const user = getUserData();

      if (!token || !user?.id) {
        throw new Error("Требуется авторизация");
      }

      const response = await axios.post(
        "http://127.0.0.1:8000/api/question/create/",
        {
          question_text: questionData.text.trim(),
          answer_text: questionData.answer.trim(),
          question_note: questionData.comment.trim(),
          author_q: user.id,
          pack_type: packType
        },
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        alert(`Вопрос успешно добавлен в ${packType === 'open' ? 'открытый' : 'ваш'} пак!`);
        setQuestionData({ text: "", answer: "", comment: "" });
        navigate("/questions");
      }
    } catch (error) {
      console.error("Ошибка при добавлении вопроса:", error);
      if (error.response?.status === 401) {
        clearAuthTokens();
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          error: "Сессия истекла. Пожалуйста, войдите снова."
        });
      } else {
        setSubmitError(
          error.response?.data?.detail || 
            error.response?.data?.message || 
            error.message || 
            "Ошибка при добавлении вопроса"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = questionData.text.trim() && questionData.answer.trim();
  const isButtonDisabled = submitting || !isFormValid;

  if (authState.isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!authState.isAuthenticated) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          {authState.error || "Для добавления вопросов необходимо авторизоваться"}
        </Typography>
        <Button 
          variant="contained"
          onClick={() => navigate("/login")}
          sx={{ 
            mt: 2,
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            "&:hover": {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
        >
          Войти в аккаунт
        </Button>
        <Button 
          sx={{ mt: 2, ml: 2 }}
          variant="outlined"
          onClick={() => navigate("/registration")}
        >
          Зарегистрироваться
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
           maxWidth: 800, 
           mx: "auto", 
           p: 3,
           backgroundColor: theme.palette.background.paper,
           borderRadius: 2,
           boxShadow: theme.shadows[1]
         }}>
      <Typography variant="h4" sx={{ mb: 3, color: theme.palette.text.primary }}>
        Создание нового вопроса
      </Typography>

      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {submitError}
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 3 }}>
        Пожалуйста, убедитесь, что ваш вопрос соответствует правилам сообщества.
      </Alert>

      <TextField
        label="Текст вопроса"
        fullWidth
        value={questionData.text}
        onChange={handleInputChange("text")}
        margin="normal"
        multiline
        rows={4}
        required
        sx={{ mb: 2 }}
      />

      <TextField
        label="Правильный ответ"
        fullWidth
        value={questionData.answer}
        onChange={handleInputChange("answer")}
        margin="normal"
        required
        sx={{ mb: 2 }}
      />

      <TextField
        label="Авторский комментарий (необязательно)"
        fullWidth
        value={questionData.comment}
        onChange={handleInputChange("comment")}
        margin="normal"
        multiline
        rows={2}
        sx={{ mb: 4 }}
      />

      <Box sx={{ display: "flex", gap: 2 }}>
        <Tooltip 
          title={!isFormValid ? "Заполните текст вопроса и правильный ответ" : ""} 
          arrow
        >
          <span>
            <Button
              variant={isButtonDisabled ? "disabled-dark" : "red"}
              disabled={isButtonDisabled}
              onClick={() => handleAddQuestion("open")}
              sx={{
                py: 1.5,
              }}
            >
              {submitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Добавить в открытый пак"
              )}
            </Button>
          </span>
        </Tooltip>

        <Tooltip 
          title={!isFormValid ? "Заполните текст вопроса и правильный ответ" : ""} 
          arrow
        >
          <span>
            <Button
              variant={isButtonDisabled ? "disabled-dark" : "red"}
              disabled={isButtonDisabled}
              onClick={() => handleAddQuestion("my")}
              sx={{
                py: 1.5,
              }}
            >
              {submitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Добавить в мой пак"
              )}
            </Button>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default AddQuestion;
