import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CircularProgress
} from '@mui/material';
import axios from 'axios';

const AddPack = () => {
  const [packName, setPackName] = useState('');
  const [packDescription, setPackDescription] = useState('');
  const [userQuestions, setUserQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndLoadQuestions = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('Требуется авторизация');
        }

        const authResponse = await axios.get('http://127.0.0.1:8000/api/user/me/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (authResponse.status === 200) {
          setIsAuthenticated(true);
          const userId = authResponse.data.id;

          try {
            const questionsResponse = await axios.get(
              `http://127.0.0.1:8000/api/question/list/`,
              { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            const filteredQuestions = questionsResponse.data.filter(
              q => q.author_q?.id === userId
            );
            setUserQuestions(filteredQuestions);
          } catch (questionsError) {
            console.error('Ошибка загрузки вопросов:', questionsError);
            setError('Не удалось загрузить вопросы');
          }
        }
      } catch (authError) {
        console.error('Ошибка авторизации:', authError);
        setError('Ошибка авторизации. Пожалуйста, войдите снова.');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadQuestions();
  }, []);

  const handleToggleQuestion = (questionId) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId) 
        : [...prev, questionId]
    );
  };

  const handleCreatePack = async () => {
    if (!isAuthenticated || !packName || selectedQuestions.length === 0) return;

    try {
      const token = localStorage.getItem('access_token');
      const user = JSON.parse(localStorage.getItem('user'));

      // Создаем пак
      const packResponse = await axios.post(
        'http://127.0.0.1:8000/api/pack/create/',
        {
          name: packName,
          description: packDescription,
          author_p: user.id
        },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      if (packResponse.status === 201) {
        const packId = packResponse.data.id;
        
        await Promise.all(
          selectedQuestions.map(questionId => 
            axios.post(
              `http://127.0.0.1:8000/api/pack/question/${packId}/`,
              { question_id: questionId },
              { headers: { 'Authorization': `Bearer ${token}` } }
            )
          )
        );

        alert('Пак успешно создан!');
        navigate('/packs');
      }
    } catch (error) {
      console.error('Ошибка при создании пакета:', error);
      setError('Ошибка при создании пакета. Пожалуйста, попробуйте снова.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Для создания пакетов необходимо авторизоваться
        </Typography>
        <Button 
          variant="contained"
          onClick={() => navigate('/login')}
          sx={{
            mt: 2,
            backgroundColor: '#752021',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#c23639'
            }
          }}
        >
          Войти в аккаунт
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Typography variant="h4" gutterBottom>Создание нового пакета</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
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
        <List dense sx={{ 
          border: '1px solid #e0e0e0', 
          borderRadius: 1,
          maxHeight: 300,
          overflow: 'auto',
          mb: 3
        }}>
          {userQuestions.map((question) => (
            <ListItem 
              key={question.id} 
              disablePadding
              onClick={() => handleToggleQuestion(question.id)}
              sx={{
                backgroundColor: selectedQuestions.includes(question.id) 
                  ? 'rgba(117, 32, 33, 0.1)' 
                  : 'inherit',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
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

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button 
          variant="outlined"
          onClick={() => navigate('/add-question')}
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
              ? '#f5f5f5' 
              : '#752021',
            color: !packName || selectedQuestions.length === 0 
              ? '#bdbdbd' 
              : '#ffffff',
            '&:hover': {
              backgroundColor: !packName || selectedQuestions.length === 0 
                ? '#f5f5f5' 
                : '#c23639'
            }
          }}
        >
          Создать пак
        </Button>
      </Box>
    </Box>
  );
};

export default AddPack;