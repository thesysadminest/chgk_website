import React, { useState, useEffect } from 'react';
import axios from 'axios';
import axiosInstance from "../components/axiosInstance";
import { Box, Typography, TextField, Button, Link as MuiLink } from '@mui/material';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';

const GameMain = () => {
  const { id, firstQuestionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [answerColor, setAnswerColor] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : { username: null };
  });

  useEffect(() => {
    axiosInstance.get(`http://127.0.0.1:8000/api/game/${id}/${firstQuestionId}`,
      {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      .then(response => {
        setQuestion(response.data);
        setTimeLeft(60);
      })
      .catch(error => {
        console.error('Error loading:', error);
      });
  }, [id, firstQuestionId]);

  useEffect(() => {
    if (timeLeft === 0) {
      handleNextQuestion();
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswerChange = (event) => {
    setAnswer(event.target.value);
  };

  const handleSubmit = () => {
    if (user.username && answer.trim()) {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error("Токен отсутствует. Перенаправляем на авторизацию.");
        navigate("/login");
      }

      axiosInstance.post(`http://127.0.0.1:8000/api/game/${id}/${firstQuestionId}/submit`, { answer },
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('access_token')}`
          }
        })
        .then(response => {
          const isCorrect = response.data.is_correct;
          setFeedback(isCorrect ? 'Ответ верный' : 'Ответ неверный');
          setAnswerColor(isCorrect ? '#7fb890' : '#CD5C5C');
        })
        .catch(error => {
          console.error('Ошибка при отправке ответа:', error);
        });
    }
  };

  const handleNextQuestion = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error("Токен отсутствует. Перенаправляем на авторизацию.");
      navigate("/login");
    }

    axiosInstance.get(`http://127.0.0.1:8000/api/game/${id}/${firstQuestionId}/next`)
      .then(response => {
        if (response.data.next_question_id) {
          navigate(`/game/${id}/${response.data.next_question_id}`);
        } else {
          navigate(`/game/${id}/results`);
        }
      })
      .catch(error => {
        console.error('Ошибка при переходе к следующему вопросу:', error);
      });
  };

  return (
    <Box sx={{ p: 4 }}>
      {question ? (
        <>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            {question.question_text}
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 2, color: 'gray' }}>
            Time left: {timeLeft} 
          </Typography>
          <TextField
            InputLabelProps={{ shrink: true }}
            label="Your answer"
            multiline
            rows={3}
            value={answer}
            onChange={handleAnswerChange}
            variant="filled"
            fullWidth
            sx={{ mt: 2, mb: 2, fontSize: '4h' }}
            style={{ backgroundColor: answerColor }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button variant="main_button" color="primary" onClick={handleSubmit}>
              Check
            </Button>
            <Button variant="main_button" color="secondary" sx={{ ml: 2 }} onClick={handleNextQuestion}>
              Next
            </Button>
          </Box>
          <Typography variant="subtitle1" sx={{ mt: 2, color: answerColor }}>
            {feedback}
          </Typography>
        </>
      ) : (
        <Typography variant="h6">Loading question...</Typography>
      )}
    </Box>
  );
};

export default GameMain;