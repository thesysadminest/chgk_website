import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Link, 
  Alert,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider
} from '@mui/material';
import axios from 'axios';

const AddPack = () => {
  const [packName, setPackName] = useState('');
  const [packDescription, setPackDescription] = useState('');
  const [userQuestions, setUserQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          setIsAuthenticated(true);
          const user = JSON.parse(localStorage.getItem('user'));
          const response = await axios.get(
            `http://127.0.0.1:8000/api/user/${user.id}/questions/`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          setUserQuestions(response.data);
        }
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleToggleQuestion = (questionId) => {
    const currentIndex = selectedQuestions.indexOf(questionId);
    const newSelected = [...selectedQuestions];

    if (currentIndex === -1) {
      newSelected.push(questionId);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    setSelectedQuestions(newSelected);
  };

  const handleCreatePack = async () => {
    if (!isAuthenticated || !packName || selectedQuestions.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      const response = await axios.post(
        'http://127.0.0.1:8000/api/pack/create/',
        {
          name: packName,
          description: packDescription,
          questions: userQuestions
            .filter(q => selectedQuestions.includes(q.id))
            .map(q => ({
              question_text: q.question_text,
              answer_text: q.answer_text,
              author_q: user.id
            }))
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.status === 201) {
        alert('Пак успешно создан!');
        navigate('/packs');
      }
    } catch (error) {
      console.error('Ошибка при создании пакета:', error);
    }
  };

  if (loading) return <Typography>Загрузка...</Typography>;
  if (!isAuthenticated) return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>
        Для создания пакетов необходимо авторизоваться
      </Typography>
      <Link href="/authorization" underline="hover" sx={{ fontSize: '1.2rem', color: 'primary.main' }}>
        Перейти на страницу авторизации
      </Link>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Typography variant="h4" gutterBottom>Создание нового пакета</Typography>
      
      <TextField
        label="Название пакета"
        fullWidth
        value={packName}
        onChange={(e) => setPackName(e.target.value)}
        margin="normal"
        required
      />

      <TextField
        label="Описание пакета"
        fullWidth
        value={packDescription}
        onChange={(e) => setPackDescription(e.target.value)}
        margin="normal"
        multiline
        rows={2}
      />

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          onClick={() => {}} 
          sx={{ flex: 1 }}
        >
          Выбрать существующие вопросы
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/add-pack/add-question')}
          sx={{ flex: 1 }}
        >
          Создать новый вопрос
        </Button>
      </Box>

      {userQuestions.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
            Выбранные вопросы ({selectedQuestions.length})
          </Typography>
          <List dense sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
            {userQuestions
              .filter(q => selectedQuestions.includes(q.id))
              .map((question) => (
                <ListItem key={question.id} disablePadding>
                  <ListItemButton>
                    <ListItemText 
                      primary={question.question_text} 
                      secondary={`Ответ: ${question.answer_text}`} 
                    />
                  </ListItemButton>
                </ListItem>
              ))}
          </List>
        </>
      )}

      <Button
        variant="contained"
        onClick={handleCreatePack}
        disabled={!packName || selectedQuestions.length === 0}
        sx={{ mt: 3, width: '100%' }}
      >
        Создать пак
      </Button>
    </Box>
  );
};

export default AddPack;