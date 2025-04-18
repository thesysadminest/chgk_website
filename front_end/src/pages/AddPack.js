import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  useTheme
} from "@mui/material";
import axios from "axios";
import { checkAuth, getAccessToken, clearAuthTokens } from "../utils/AuthUtils";

const AddPack = () => {
  const theme = useTheme ();
  const [packName, setPackName] = useState("");
  const [packDescription, setPackDescription] = useState("");
  const [userQuestions, setUserQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    error: null
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuthAndData = async () => {
      try {
        const { isAuthorized, user } = await checkAuth();
        
        if (!isAuthorized) {
          setAuthState({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error: "Для создания пакетов необходимо авторизоваться"
          });
          return;
        }

        const token = getAccessToken();
        if (!token) {
          throw new Error("Токен доступа не найден");
        }

        const questionsResponse = await axios.get(
          "http://127.0.0.1:8000/api/question/list/",
          { headers: { "Authorization": `Bearer ${token}` } }
        );

        const filteredQuestions = questionsResponse.data.filter(
          q => q.author_q?.id === user.id
        );

        setAuthState({
          isAuthenticated: true,
          user,
          isLoading: false,
          error: null
        });
        setUserQuestions(filteredQuestions);
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
        clearAuthTokens(); 
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: error.message || "Произошла ошибка при загрузке данных"
        });
      }
    };

    initializeAuthAndData();
  }, []);

  const handleToggleQuestion = (questionId) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleCreatePack = async () => {
    if (!authState.isAuthenticated || !packName || selectedQuestions.length === 0) return;

    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("Токен доступа не найден");
      }

      const packResponse = await axios.post(
        "http://127.0.0.1:8000/api/pack/create/",
        {
          name: packName,
          description: packDescription,
          author_p: authState.user.id,
        },
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (packResponse.status === 201) {
        const packId = packResponse.data.id;


        await Promise.all(
          selectedQuestions.map(questionId =>
            axios.post(
              `http://127.0.0.1:8000/api/pack/question/${packId}/`,
              { question_id: questionId },
              { headers: { "Authorization": `Bearer ${token}` } }
            )
          )
        );

        alert("Пак успешно создан!");
        navigate("/packs");
      }
    } catch (error) {
      console.error("Ошибка при создании пакета:", error);
      if (error.response?.status === 401) {
        clearAuthTokens();
        setAuthState({
          ...authState,
          isAuthenticated: false,
          error: "Сессия истекла. Пожалуйста, войдите снова."
        });
      } else {
        setAuthState({
          ...authState,
          error: error.response?.data?.message || "Ошибка при создании пакета"
        });
      }
    }
  };

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
          {authState.error || "Для создания пакетов необходимо авторизоваться"}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/login")}
          sx={{
            mt: 2,
            backgroundColor: "#752021",
            color: "#ffffff",
            "&:hover": { backgroundColor: "#c23639" },
          }}
        >
          Войти в аккаунт
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Создание нового пакета
      </Typography>

      {authState.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {authState.error}
        </Alert>
      )}

      <TextField
        label="Название пакета"
        fullWidth
        value={packName}
        onChange={(e) => setPackName(e.target.value)}
        margin="normal"
        required
        sx={{ mb: 2 }}
      />

      <TextField
        label="Описание пакета"
        fullWidth
        value={packDescription}
        onChange={(e) => setPackDescription(e.target.value)}
        margin="normal"
        multiline
        rows={2}
        sx={{ mb: 3 }}
      />

      <Typography variant="h6" sx={{ mb: 2 }}>
        Ваши вопросы ({userQuestions.length})
      </Typography>

      {userQuestions.length > 0 ? (
        <List
          dense
          sx={{
            border: "1px solid #e0e0e0",
            borderRadius: 1,
            maxHeight: 300,
            overflow: "auto",
            mb: 3,
          }}
        >
          {userQuestions.map((question) => (
            <ListItem
              key={question.id}
              disablePadding
              onClick={() => handleToggleQuestion(question.id)}
              sx={{
                backgroundColor: selectedQuestions.includes(question.id)
                  ? "rgba(117, 32, 33, 0.1)"
                  : "inherit",
                "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
              }}
            >
              <ListItemButton>
                <ListItemText
                  primary={question.question_text}
                  secondary={`Ответ: ${question.answer_text}`}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>
          У вас пока нет созданных вопросов. Сначала создайте вопросы.
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="outlined"
          onClick={() => navigate("/add-question")}
          sx={{ flex: 1 }}
        >
          Создать новый вопрос
        </Button>
        <Button
          variant="contained"
          onClick={handleCreatePack}
          disabled={!packName || selectedQuestions.length === 0}
          sx={{
            flex: 1,
            backgroundColor: !packName || selectedQuestions.length === 0 
              ? theme.palette.background.disabled 
              : "#752021",
            color: !packName || selectedQuestions.length === 0 
              ? "#bdbdbd" 
              : theme.palette.text.white,
            "&:hover": {
              backgroundColor: !packName || selectedQuestions.length === 0 
                ? theme.palette.background.disabled 
                : "#c23639",
            },
          }}
        >
          Создать пак
        </Button>
      </Box>
    </Box>
  );
};

export default AddPack;