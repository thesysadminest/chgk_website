import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, TextField, Button, Link as MuiLink } from '@mui/material';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';

const QuestionDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [question, setQuestion] = useState({});
  

  const [answer, setAnswer] = useState('');
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : { username: null };
  });

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/api/question/${id}`)
      .then(response => {
        setQuestion(response.data);
      })
      .catch(error => {
        console.error('Ошибка при загрузке данных:', error);
      });
  }, [id]);

  const {pub_date_q} = (question.pub_date_q ? question.pub_date_q : "A?");
  const {author_q} = (question.author_q ? question.author_q : "A?");
  const {question_text} = (question.question_text ? question.question_text : "A?");


  const handleAnswerChange = (event) => {
    if (user.username) {
      setAnswer(event.target.value);
    }
  };

  const handleSubmit = () => {
    if (user.username) {
      // Обработка отправки ответа
      console.log('Ответ отправлен:', answer);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Вопрос ID: {id}
      </Typography>
      <Typography variant="h6" gutterBottom>
        Автор: {author_q}
      </Typography>
      <Typography variant="h6" gutterBottom>
        Дата публикации: {pub_date_q}
      </Typography>
      <Typography variant="h6" gutterBottom>
        Текст вопроса: {question_text}
      </Typography>
      {user.username ? (
        <>
          <TextField
            label="Ваш ответ"
            multiline
            rows={4}
            value={answer}
            onChange={handleAnswerChange}
            variant="outlined"
            fullWidth
            sx={{ mt: 2, mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            Отправить ответ
          </Button>
        </>
      ) : (
        <Typography variant="h6" sx={{ mt: 2 }}>
          Для ввода и проверки ответа необходимо <MuiLink component={Link} to="/me" state={{ from: location }} underline="hover">авторизоваться</MuiLink>.
        </Typography>
      )}
    </Box>
  );
};

export default QuestionDetail;
