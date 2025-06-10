import React, { useState, useEffect } from "react";
import axios from "axios";
import { getAccessToken, getUserData } from "../utils/AuthUtils";
import { Box, Typography, TextField, Button, Stack, Paper, Link as MuiLink, Alert, CircularProgress, Tooltip } from "@mui/material";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { RotateLeft, Edit, Delete, DeleteForever, Done, Close, Face, Event } from "@mui/icons-material";

const QuestionDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [question, setQuestion] = useState({
    id: useParams().id,
    author_q: "",
    author_id: "",
    pub_date_q: "",
    question_text: "",
    answer_text: ""
  });
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [answerColor, setAnswerColor] = useState("");

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : { username: null };
  });

  const myName = getUserData()?.username || null;
  const [isMyQuestion, setIsMyQuestion] = useState(false);

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/api/question/${question.id}/`)
      .then(response => {
        const data = Array.isArray(response.data) ? response.data[0] : response.data;
        console.log("Полученные данные вопроса:", data); // Добавим лог для отладки
        
        // Определяем имя автора вопроса
        let authorName = "Неизвестно";
        if (data.author_q) {
          if (typeof data.author_q === 'object' && data.author_q.username) {
            authorName = data.author_q.username;
          } else if (typeof data.author_q === 'string') {
            authorName = data.author_q;
          } else if (typeof data.author_q === 'number') {
            // Если приходит только ID автора, можно сделать дополнительный запрос
            authorName = `ID: ${data.author_q}`;
          }
        }

        setQuestion({
          id: data.id,
          question_text: data.question_text || "Неизвестно",
          answer_text: data.answer_text || "",
          author_q: authorName, // Используем обработанное имя автора
          author_id: data.author_q?.id || "Неизвестно",
          pub_date_q: data.pub_date_q || "Неизвестно"
        });

        setIsMyQuestion(data.author_q?.username === myName);
      })
      .catch(error => {
        console.error("Ошибка при загрузке данных:", error);
      });
  }, [question.id, myName]);

  const [questionTextEdit, setQuestionTextEdit] = useState("");
  const [questionAnsEdit, setQuestionAnsEdit] = useState("");

  const [buttonsPending, setButtonsPending] = useState(false);
  const [buttonsEdit, setButtonsEdit] = useState(false);
  const [buttonsDelete, setButtonsDelete] = useState(false);

  const [goodState, setGoodState] = useState("");
  const [errState, setErrState] = useState("");
  const [deletedState, setDeletedState] = useState(false);

  const editIsValid = questionTextEdit.trim() && questionAnsEdit.trim();

  const handleEditButton = () => {
    setQuestionTextEdit(question.question_text);
    setQuestionAnsEdit(question.answer_text);
    setButtonsEdit(true);
  };

  const handleDeleteButton = () => {
    setButtonsDelete(true);
  };

  const handleCloseButton = () => {
    if (buttonsPending) return;
    setButtonsEdit(false);
    setButtonsDelete(false);
  };

  const handleEditQuestion = async () => {
    if (buttonsPending) return;
    setButtonsPending(true);

    try {
      const token = getAccessToken();
      if (!token) throw new Error("Токен доступа не найден");
      const questionResponse = await axios.put(
        `http://127.0.0.1:8000/api/question/update/${question.id}/`,
        {
          question_text: questionTextEdit.trim(),
          answer_text: questionAnsEdit.trim()
        },
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (questionResponse.status !== 200) {
        throw new Error("Ошибка при редактировании вопроса");
      }

      question.question_text = questionTextEdit.trim();
      question.answer_text = questionAnsEdit.trim();
      setGoodState("Информация обновлена!");
    }
    catch (error) {
      console.error("Ошибка:", error);
      setErrState(error.response?.data?.message || error.message || "Ошибка при редактировании вопроса")
    } finally {
      setButtonsPending(false);
      handleRetry();
      handleCloseButton();
    }
  };

  const handleDeleteQuestion = async () => {
    if (buttonsPending) return;
    setButtonsPending(true);

    try {
      const token = getAccessToken();
      if (!token) throw new Error("Токен доступа не найден");
      const questionResponse = await axios.delete(
        `http://127.0.0.1:8000/api/question/delete/${question.id}/`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (questionResponse.status !== 204) {
        throw new Error("Ошибка при удалении вопроса");
      }

      setQuestion({
        id: question.id,
      });

      setDeletedState(true);
      setGoodState("Вопрос удалён!");
    }
    catch (error) {
      console.error("Ошибка:", error);
      setErrState(error.response?.data?.message || error.message || "Ошибка при удалении вопроса")
    } finally {
      setButtonsPending(false);
      handleRetry();
      handleCloseButton();
    }
  };

  const handleAnswerChange = (event) => {
    setAnswer(event.target.value);
  };

  const handleSubmit = () => {
    if (user.username) {
      if (answer.trim().toLowerCase() === question.answer_text.toLowerCase()) {
        setFeedback("Ответ верный");
        setAnswerColor("#7fb890");
      } else {
        setFeedback("Ответ неверный");
        setAnswerColor("#CD5C5C");
      }
    } else {
      navigate("/login");
    }
  };

  const handleRetry = () => {
    setAnswer("");
    setFeedback("");
    setAnswerColor("");
  };

  return (
    <>
      {errState.trim() &&
       <Alert severity="error" sx={{ mb: 3 }}>
         {errState}
       </Alert>
      }
      {goodState.trim() &&
       <Alert severity="success" sx={{ mb: 3 }}>
         {goodState}
       </Alert>
      }
      {deletedState &&
       <Button variant="outlined-grey" component={Link} to={`/questions`}>
         Назад к вопросам
       </Button>
      }

      {!deletedState && (
        <>
          <Stack 
            direction="row" 
            sx={{ 
              justifyContent: "space-between", 
              alignItems: "center", 
              mb: 2,
              flexWrap: 'wrap-reverse',
              gap: 2
            }}
          >
            <Paper variant_p="chip">
              <Face/>
              <MuiLink component={Link} to={`/user/${question.author_id}`} color="inherit" sx={{ ml: "4px" }}>
                {question.author_q}
              </MuiLink>

              <Event sx={{ ml: 2 }}/>
              <Typography sx={{ ml: "4px" }}>
                {question.pub_date_q !== "Неизвестно" 
                 ? new Date(question.pub_date_q).toLocaleDateString("ru-RU") 
                 : "----"}
              </Typography>
            </Paper>
            
            {isMyQuestion && (
              <Stack spacing={2} direction="row" >
                {!(buttonsEdit || buttonsDelete) && (
                  <>
                    <Button onClick={handleEditButton} variant="outlined-grey"> 
                      <Edit />
                    </Button>
                    <Button onClick={handleDeleteButton} variant="outlined-grey">
                      <Delete />
                    </Button>
                  </>
                )}
              {buttonsEdit && (
                <>
                  <Button
                    variant={editIsValid ? "outlined-grey" : "disabled-dark"}
                    disabled={!editIsValid}
                    onClick={handleEditQuestion}>
                    {buttonsPending ? <CircularProgress size={24} color="inherit"/> : <Done /> }
                  </Button>
                  <Button variant="outlined-grey" onClick={handleCloseButton}>
                    <Close />
                  </Button>
                </>
              )}
              {buttonsDelete && (
                <>
                  <Button variant="red" onClick={handleDeleteQuestion}>
                    {buttonsPending ? <CircularProgress color="inherit"/> : <DeleteForever /> }
                  </Button>
                  <Button variant="outlined-grey" onClick={handleCloseButton}>
                    <Close />
                  </Button>
                </>
              )}
              </Stack>
            )}
        </Stack>

        {!(buttonsEdit) && (
          <>
            <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
              Текст вопроса: {question.question_text}
            </Typography>

            <Tooltip disableHoverListener={user.username} disableFocusListener disableTouchListener title={
                       <Typography variant="h6">
                         Для ввода и проверки ответа необходимо{" "}
                         <MuiLink component={Link} to="/login" state={{ redirect: location }}>
                           авторизоваться
                         </MuiLink>.
                       </Typography>
                     }>
              <span>
                <TextField
                  disabled={!user.username}
                  InputLabelProps={{ shrink: true }}
                  label="Ваш ответ"
                  multiline
                  rows={3}
                  value={answer}
                  onChange={handleAnswerChange}
                  variant="filled"
                  fullWidth
                  sx={{ mt: 2, mb: 2 }}
                  style={{ backgroundColor: answerColor }}
                />
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Button
                    disabled={!user.username}
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    sx={{ mr: 2 }}
                  >
                    Отправить ответ
                  </Button>
                  {feedback === "Ответ неверный" && (
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<RotateLeft />}
                      onClick={handleRetry}
                    >
                      Попробовать снова
                    </Button>
                  )}
                </Box>
              </span>
            </Tooltip>
          </>
        )}
        
        {buttonsEdit && (
          <>
            <TextField
              label="Текст вопроса *"
              fullWidth
              disabled={buttonsPending}
              defaultValue={question.question_text}
              onChange={(e) => setQuestionTextEdit(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Правильный ответ *"
              fullWidth
              disabled={buttonsPending}
              defaultValue={question.answer_text}
              onChange={(e) => setQuestionAnsEdit(e.target.value)}
              sx={{ mb: 2 }}
            />
          </>
        )}
        </>
      )}
    
    {feedback && (
      <Typography variant="subtitle1" sx={{ mt: 2, color: answerColor }}>
        {feedback}
      </Typography>
    )}
    
    </>
  );
};

export default QuestionDetail;
