import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, TextField, Button, Link as MuiLink } from "@mui/material";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { RotateLeft } from "@mui/icons-material";

const QuestionDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [question, setQuestion] = useState({
    id: "",
    author_q: "",
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

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/api/question/${id}/`)
      .then(response => {
        const data = Array.isArray(response.data) ? response.data[0] : response.data;
        setQuestion({
          id: data.id,
          question_text: data.question_text || "Неизвестно",
          answer_text: data.answer_text || "",
          author_q: data.author_q?.username || "Неизвестно",
          pub_date_q: data.pub_date_q || "Неизвестно"
        });
      })
      .catch(error => {
        console.error("Ошибка при загрузке данных:", error);
      });
  }, [id]);

  const handleAnswerChange = (event) => {
    setAnswer(event.target.value);
  };

  const handleSubmit = () => {
    if (user.username) {
      if (answer.trim() === question.answer_text) {
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
    navigate(`/question/${id}`);
    setAnswer("");
    setFeedback("");
    setAnswerColor("");
  };

  return (
    <Box sx={{  }}>
      <Typography variant="subtitle1" gutterBottom sx={{ mb: 2, color: "gray" }}>
        ID вопроса: {question.id}
      </Typography>
      <Typography variant="subtitle1" gutterBottom sx={{ mb: 2, color: "gray" }}>
        Автор: {question.author_q}
      </Typography>
      <Typography variant="subtitle1" gutterBottom sx={{ mb: 2, color: "gray" }}>
        Дата публикации: {question.pub_date_q !== "Неизвестно" ? new Date(question.pub_date_q).toLocaleDateString("ru-RU") : "Неизвестно"}
      </Typography>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Текст вопроса: {question.question_text}
      </Typography>
      {user.username ? (
        <>
          <TextField
            InputLabelProps={{ shrink: true }}
            label="Ваш ответ"
            multiline
            rows={3}
            value={answer}
            onChange={handleAnswerChange}
            variant="filled"
            fullWidth
            sx={{ mt: 2, mb: 2, fontSize: "4h" }}
            style={{ backgroundColor: answerColor }}
          />
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Button
              variant="main_button"
              color="primary"
              onClick={handleSubmit}
            >
              Отправить ответ
            </Button>
            {feedback === "Ответ неверный" && (
              <Button
                variant="main_button"
                color="secondary"
                sx={{ ml: 2 }}
                onClick={handleRetry}
              >
                <RotateLeft sx={{ color: "#FFFFFF" }} />
              </Button>
            )}
          </Box>
          <Typography variant="subtitle1" sx={{ mt: 2, color: answerColor }}>
            {feedback}
          </Typography>
        </>
      ) : (
        <Typography variant="h6" sx={{ mt: 2 }}>
          Для ввода и проверки ответа необходимо <MuiLink component={Link} to="/login" state={{ from: location }} underline="hover">авторизоваться</MuiLink>.
        </Typography>
      )}
    </Box>
  );
};

export default QuestionDetail;
