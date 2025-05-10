import React, { useState, useEffect } from 'react';
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
import { useTheme } from "@mui/material/styles";
import { checkAuth } from '../utils/AuthUtils';
import axiosInstance from '../components/axiosInstance';

const SelectQuestionsWindow = ({ open, onClose, onStartGame }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true
  });
  const [mode, setMode] = useState('select'); // 'select' или 'questions'
  const [packs, setPacks] = useState([]);
  const [selectedPack, setSelectedPack] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Проверка авторизации и загрузка пакетов
  useEffect(() => {
    const verifyAuthentication = async () => {
      try {
        const { isAuthorized } = await checkAuth();
        setAuthState({
          isAuthenticated: isAuthorized,
          isLoading: false
        });
        
        if (isAuthorized && open) {
          fetchPacks();
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setAuthState({
          isAuthenticated: false,
          isLoading: false
        });
      }
    };

    verifyAuthentication();
  }, [open]);

  const fetchPacks = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/pack/list/');
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
      const response = await axiosInstance.get(`/game/${packId}/questions/`);
      setQuestions(response.data);
      setTotalQuestions(response.data.length);
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
  };

  const handlePageSizeChange = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStartGame = () => {
    if (selectedPack) {
      onStartGame({ packId: selectedPack });
    } else if (selectedQuestions.length > 0) {
      onStartGame({ questionIds: selectedQuestions.map(q => q.id) });
    }
    onClose();
  };

  const handleBackToPacks = () => {
    setMode('select');
    setSelectedPack(null);
    setSelectedQuestions([]);
  };

  if (authState.isLoading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
            <Typography variant="h6" sx={{ ml: 2 }}>
              Проверка авторизации...
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (!authState.isAuthenticated) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <Box
          sx={{
            backgroundColor: theme.palette.background.window,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 3,
              fontWeight: 'bold',
              color: theme.palette.text.gray,
              textAlign: 'center'
            }}
          >
            ДОСТУП К ИГРЕ
          </Typography>

          <Paper
            sx={{
              backgroundColor: theme.palette.background.white,
              p: 3,
              mb: 3,
              borderRadius: 2,
            }}
          >
            <Stack spacing={2}>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: theme.palette.text.gray,
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}
              >
                Для доступа к игре необходимо авторизоваться
              </Typography>
              
              <Button
                fullWidth
                variant="contained"
                onClick={onClose}
                sx={{
                  py: 1.5,
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  }
                }}
              >
                Войти в систему
              </Button>
            </Stack>
          </Paper>

          <DialogActions>
            <Button 
              variant="outlined"
              onClick={onClose}
              sx={{
                color: theme.palette.text.primary,
                borderColor: theme.palette.text.primary,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                }
              }}
            >
              Закрыть
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box
        sx={{
          backgroundColor: theme.palette.background.window,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            mb: 3,
            fontWeight: 'bold',
            color: theme.palette.text.gray,
            textAlign: 'center'
          }}
        >
          {mode === 'select' ? 'ВЫБЕРИТЕ ПАК ВОПРОСОВ' : 'ВЫБЕРИТЕ ВОПРОСЫ'}
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : mode === 'select' ? (
          <Paper
            sx={{
              backgroundColor: theme.palette.background.white,
              p: 3,
              mb: 3,
              borderRadius: 2,
            }}
          >
            <List>
              {packs.map((pack) => (
                <ListItem 
                  component="button" 
                  key={pack.id}
                  onClick={() => fetchPackQuestions(pack.id)}
                  sx={{
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    }
                  }}
                >
                  <ListItemText
                    primary={pack.name}
                    secondary={`${pack.question_count} вопросов`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        ) : (
          <>
            <Paper
              sx={{
                backgroundColor: theme.palette.background.white,
                p: 3,
                mb: 3,
                borderRadius: 2,
              }}
            >
              <Box sx={{ mb: 2 }}>
                <Button 
                  variant="outlined"
                  onClick={handleBackToPacks}
                  sx={{ mb: 2 }}
                >
                  Назад к пакетам
                </Button>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Выбран пак: {packs.find(p => p.id === selectedPack)?.name}
                </Typography>
              </Box>

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
                      <TableCell>Тема</TableCell>
                      <TableCell>Сложность</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {questions
                      .slice(page * pageSize, page * pageSize + pageSize)
                      .map((question) => (
                        <TableRow key={question.id}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedQuestions.some(q => q.id === question.id)}
                              onChange={() => handleQuestionSelect(question)}
                            />
                          </TableCell>
                          <TableCell>
                            {question.text.substring(0, 50)}...
                          </TableCell>
                          <TableCell>{question.topic}</TableCell>
                          <TableCell>{question.difficulty}</TableCell>
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
                labelRowsPerPage="Вопросов на странице:"
              />
            </Paper>
          </>
        )}

        <DialogActions>
          <Button 
            variant="outlined"
            onClick={onClose}
            sx={{
              color: theme.palette.text.primary,
              borderColor: theme.palette.text.primary,
              '&:hover': {
                borderColor: theme.palette.primary.main,
              }
            }}
          >
            Закрыть
          </Button>
          
          {mode === 'questions' && (
            <Button
              variant="contained"
              onClick={handleStartGame}
              disabled={selectedQuestions.length === 0 && !selectedPack}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
                '&:disabled': {
                  backgroundColor: theme.palette.action.disabled,
                }
              }}
            >
              Начать игру
            </Button>
          )}
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default SelectQuestionsWindow;