import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Container,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axiosInstance from '../components/axiosInstance';

const SelectQuestions = ({ open, onClose, onStartGame }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('select'); // 'select' или 'questions'
  const [packs, setPacks] = useState([]);
  const [selectedPack, setSelectedPack] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Загружаем список пакетов при открытии
  React.useEffect(() => {
    if (open) {
      fetchPacks();
    }
  }, [open]);

  const fetchPacks = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/game/packs/');
      setPacks(response.data);
      setMode('select');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching packs:', error);
      setLoading(false);
    }
  };

  const fetchPackQuestions = async (packId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/game/packs/${packId}/questions/`);
      setQuestions(response.data);
      setSelectedPack(packId);
      setMode('questions');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pack questions:', error);
      setLoading(false);
    }
  };

  const handleQuestionSelect = (question) => {
    setSelectedQuestions(prev => {
      const isSelected = prev.some(q => q.id === question.id);
      return isSelected 
        ? prev.filter(q => q.id !== question.id)
        : [...prev, question];
    });
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedQuestions([...questions]);
    } else {
      setSelectedQuestions([]);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    // Здесь можно добавить загрузку новой страницы вопросов
  };

  const handlePageSizeChange = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
    // Здесь можно добавить загрузку с новым размером страницы
  };

  const handleStartGame = () => {
    if (selectedPack) {
      onStartGame({ packId: selectedPack });
    } else if (selectedQuestions.length > 0) {
      onStartGame({ questionIds: selectedQuestions.map(q => q.id) });
    }
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        backdropFilter: 'blur(4px)',
        '& .MuiDialog-paper': {
          borderRadius: 4,
          p: 3
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', fontSize: '1.5rem' }}>
        {mode === 'select' ? 'Выберите пакет вопросов' : 'Выберите вопросы'}
      </DialogTitle>
      
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : mode === 'select' ? (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {packs.map(pack => (
              <ListItem 
                key={pack.id} 
                button 
                onClick={() => fetchPackQuestions(pack.id)}
                sx={{
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover
                  }
                }}
              >
                <ListItemText 
                  primary={pack.name} 
                  secondary={`Вопросов: ${pack.questions_count || 0}`}
                  primaryTypographyProps={{ fontWeight: 'medium' }}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box>
            <Button 
              onClick={() => setMode('select')}
              sx={{ mb: 2 }}
            >
              ← Назад к выбору пакета
            </Button>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={
                          selectedQuestions.length > 0 &&
                          selectedQuestions.length < questions.length
                        }
                        checked={
                          questions.length > 0 &&
                          selectedQuestions.length === questions.length
                        }
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell>Вопрос</TableCell>
                    <TableCell>Автор</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {questions.map(question => (
                    <TableRow key={question.id}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedQuestions.some(q => q.id === question.id)}
                          onChange={() => handleQuestionSelect(question)}
                        />
                      </TableCell>
                      <TableCell>{question.question_text}</TableCell>
                      <TableCell>{question.author_q?.username || 'Неизвестен'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalQuestions}
              rowsPerPage={pageSize}
              page={page}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handlePageSizeChange}
            />
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'space-between', p: 3 }}>
        <Button 
          onClick={onClose}
          sx={{
            color: theme.palette.text.secondary,
            '&:hover': {
              color: theme.palette.text.primary
            }
          }}
        >
          Отмена
        </Button>
        
        <Button
          variant="contained"
          onClick={handleStartGame}
          disabled={mode === 'select' ? !selectedPack : selectedQuestions.length === 0}
          sx={{
            px: 4,
            py: 1,
            borderRadius: 2,
            fontWeight: 'bold'
          }}
        >
          {mode === 'select' ? 'Играть все вопросы' : `Начать игру (${selectedQuestions.length})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelectQuestions;