import API_BASE_URL from '../config';
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Box,
  Stack,
  Button, 
  TextField, 
  Typography, 
  Alert, 
  CircularProgress,
  Tooltip,
  MenuItem,
  FormControl,
  Select,
  InputLabel
} from "@mui/material";
import { AddPhotoAlternate, HideImage } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import { Link } from 'react-router-dom';
import { checkAuth, getAccessToken, getUserData, clearAuthTokens } from "../utils/AuthUtils";
import AddQuestionSuccess from "../components/AddQuestionSuccess";

const AddQuestion = () => {
  const theme = useTheme();
  const [questionData, setQuestionData] = useState({
    text: "",
    answer: "",
    comment: "",
    difficulty: 1
  });
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true,
    error: null
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [packType, setPackType] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

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

  const [newImage, setNewImage] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");

  const handleImgEditButton = () => {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = "image/*";

    input.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;

      setNewImage(file);

      const imageUrl = URL.createObjectURL(file);
      setNewImageUrl(imageUrl);
    }

    
    input.click();
    // setButtonsImgEdit(true);
  };

  const handleImgDeleteButton = () => {
    setNewImage("");
    setNewImageUrl("");
  };

  const handleAddQuestion = async (type) => {
    if (!authState.isAuthenticated || !isFormValid) return;

    try {
      setSubmitting(true);
      setSubmitError(null);
      setPackType(type);

      const token = getAccessToken();
      const user = getUserData();

      if (!token || !user?.id) {
        throw new Error("Требуется авторизация");
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/question/create/`,
        {
          question_text: questionData.text.trim(),
          answer_text: questionData.answer.trim(),
          question_note: questionData.comment.trim(),
          difficulty: questionData.difficulty,
          author_q: user.id,
          pack_type: type
        },
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status !== 201) {  
        throw new Error("Ошибка при добавлении вопроса");
      }

      if (newImage) {
        const formData = new FormData();
        formData.append('image', newImage);

        const imgReplaceResponse = await axios.put(
          `${API_BASE_URL}/api/question/update/${response.data.id}/?image=true`, formData,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            },
          });

        if (imgReplaceResponse.status !== 200) {
          throw new Error("Ошибка при добавлении изображения");
        }
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
      setSuccessModalOpen(true);
      setQuestionData({ text: "", answer: "", comment: "", difficulty: 1});
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
          onClick={() => navigate("/login", { state:{redirect: location} })}
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
          onClick={() => navigate("/registration", { state:{redirect: location} })}
        >
          Зарегистрироваться
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{
        backgroundColor: theme.palette.background.window, 
        p: 4, 
        borderRadius: 4, 
        width: 1050, 
        ml: 5,
        position: 'relative',
        pb: 8
      }}>
        <Typography variant="h4" sx={{ mb: 3, color: theme.palette.primary.main, fontWeight: 'bold' }}>
          Создание нового вопроса
        </Typography>

        {submitError && (
          <Alert severity="error">
            {submitError}
          </Alert>
        )}

        <Alert severity="warning">
        Пожалуйста, убедитесь, что ваш вопрос соответствует{' '}
        <Link 
          to="/help/basic-rules" 
          style={{
            color: theme.palette.primary.main,
            textDecoration: 'underline'
          }}
        >
          правилам сообщества
        </Link>.
      </Alert>
      <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          py: 2,
           }}>

        {newImage && (
          <img
            src={newImageUrl}
            style={{
              maxHeight: "30vh", maxWidth: "25vw",
              borderRadius: "5px",
              height: "auto", width: "auto"}}
            alt="Раздатка"/>
        )}
        <Stack spacing={2} direction="row">
          <Button onClick={handleImgEditButton} variant="red"> 
            <AddPhotoAlternate sx={{mr: 2}} />
            Выбрать изображение
          </Button>
          <Button onClick={handleImgDeleteButton} disabled={!newImage} variant="red">
            <HideImage sx={{mr: 2}} />
            Удалить изображение
          </Button>
        </Stack>
        <TextField
          label="Текст вопроса"
          fullWidth
          value={questionData.text}
          onChange={handleInputChange("text")}
          multiline
          rows={4}
          required
          sx={{ 
            borderRadius: 1,
            backgroundColor: theme.palette.background.white, 
            '& .MuiInputBase-input': {
              color: theme.palette.text.dark
            }
          }}
        />

        <TextField
          label="Правильный ответ"
          fullWidth
          value={questionData.answer}
          onChange={handleInputChange("answer")}
          required
          sx={{ 
            borderRadius: 1,
            backgroundColor: theme.palette.background.white,
            '& .MuiInputBase-input': {
              color: theme.palette.text.dark
            }
          }}
        />

        <FormControl 
          fullWidth
          sx={{ 
            borderRadius: 1
          }}
        >
          <InputLabel id="difficulty-label">Сложность вопроса</InputLabel>
          <Select
            labelId="difficulty-label"
            value={questionData.difficulty}
            onChange={handleInputChange("difficulty")}
            label="Сложность вопроса"
            sx={{
              backgroundColor: theme.palette.background.white,
              '& .MuiSelect-select': {
                color: theme.palette.text.dark
              }
            }}
          >
            <MenuItem value={1}>Очень просто (1 звезда)</MenuItem>
            <MenuItem value={2}>Просто (2 звезды)</MenuItem>
            <MenuItem value={3}>Стандарт (3 звезды)</MenuItem>
            <MenuItem value={4}>Сложно (4 звезды)</MenuItem>
            <MenuItem value={5}>Очень сложно (5 звезд)</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Авторский комментарий (необязательно)"
          fullWidth
          value={questionData.comment}
          onChange={handleInputChange("comment")}
          margin="normal"
          multiline
          rows={2}
          sx={{ 
            '& .MuiInputBase-input': {
              color: theme.palette.text.dark
            }
          }}
        />
        </Box>

        <Box sx={{ 
          position: 'absolute',
          right: 24,
          bottom: 24,
          display: "flex", 
          gap: 2 
        }}>
          <Tooltip 
            title={!isFormValid ? "Заполните текст вопроса и правильный ответ" : ""} 
            arrow
            placement="top"
            componentsProps={{
              tooltip: {
                sx: {
                  backgroundColor: theme.palette.background.tooltip,
                  color: theme.palette.text.tooltip,
                  '& .MuiTooltip-arrow': {
                    color: theme.palette.background.tooltip,
                  }
                }
              }
            }}
          >
            <span>
              <Button
                variant="red"
                disabled={isButtonDisabled}
                onClick={() => handleAddQuestion("open")}
                sx={{
                  py: 1.5,
                  px: 3,
                }}
              >
                 Добавить в открытый пак
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Box>

      <AddQuestionSuccess 
        open={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        packType={packType}
      />
    </>
  );
};

export default AddQuestion;
