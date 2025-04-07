import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, Typography, Alert } from "@mui/material";

const PackAddQuestion = () => {
  const [questionText, setQuestionText] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [authorComment, setAuthorComment] = useState("");
  const navigate = useNavigate();

  const handleAddToPack = () => {
    // Здесь будет логика добавления вопроса в временное хранилище
    // или передача данных обратно в AddPack
    alert("Вопрос добавлен в пак!");
    navigate("/add-pack"); 
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Добавление вопроса в пак
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        Этот вопрос будет добавлен в создаваемый пакет
      </Alert>

      <TextField
        label="Текст вопроса"
        fullWidth
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        margin="normal"
        multiline
        rows={4}
        required
      />

      <TextField
        label="Правильный ответ"
        fullWidth
        value={correctAnswer}
        onChange={(e) => setCorrectAnswer(e.target.value)}
        margin="normal"
        required
      />

      <TextField
        label="Комментарий автора (необязательно)"
        fullWidth
        value={authorComment}
        onChange={(e) => setAuthorComment(e.target.value)}
        margin="normal"
        multiline
        rows={2}
      />

      <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
        <Button
          variant="outlined"
          onClick={() => navigate("/add-pack")}
          sx={{ flex: 1 }}
        >
          Назад к созданию пакета
        </Button>
        <Button
          variant="main_button"
          onClick={handleAddToPack}
          disabled={!questionText || !correctAnswer}
          sx={{ flex: 1 }}
        >
          Добавить в пак
        </Button>
      </Box>
    </Box>
  );
};

export default PackAddQuestion;