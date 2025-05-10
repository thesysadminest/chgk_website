import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Alert,
  CircularProgress,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  Container,
  Grid,
  Paper
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import { checkAuth, getAccessToken, clearAuthTokens } from "../utils/AuthUtils";

const AddPack = () => {
  const theme = useTheme();
  const [packName, setPackName] = useState("");
  const [packDescription, setPackDescription] = useState("");
  const [userQuestions, setUserQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    error: null
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchText, setSearchText] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuthAndData = async () => {
      try {
        const { isAuthorized, user } = await checkAuth();
        
        if (!isAuthorized) {
          setAuthState({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error: "Для создания пакетов необходимо авторизоваться"
          });
          return;
        }

        const token = getAccessToken();
        if (!token) throw new Error("Токен доступа не найден");

        const questionsResponse = await axios.get(
          "http://127.0.0.1:8000/api/question/list/",
          { headers: { "Authorization": `Bearer ${token}` } }
        );

        const filteredQuestions = questionsResponse.data.filter(
          q => q.author_q?.id === user.id
        );

        setAuthState({
          isAuthenticated: true,
          user,
          isLoading: false,
          error: null
        });
        setUserQuestions(filteredQuestions);
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
        clearAuthTokens(); 
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: error.message || "Произошла ошибка при загрузке данных"
        });
      }
    };

    initializeAuthAndData();
  }, []);

  const filteredQuestions = userQuestions.filter(question =>
    question.question_text?.toLowerCase().includes(searchText.toLowerCase()) ||
    question.answer_text?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleToggleQuestion = (questionId) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = filteredQuestions.map(q => q.id);
      setSelectedQuestions(newSelected);
    } else {
      setSelectedQuestions([]);
    }
  };

  const handleCreatePack = async () => {
      setIsCreating(true);
      try {
        if (!authState.isAuthenticated || !packName.trim()) {
          throw new Error("Не заполнены обязательные поля");
        }

        const token = getAccessToken();
        if (!token) throw new Error("Токен доступа не найден");

        // 1. Создаем пак с основными данными
        const packResponse = await axios.post(
          "http://127.0.0.1:8000/api/pack/create/",
          {
            name: packName.trim(),
            description: packDescription.trim(),
            questions: selectedQuestions // Передаем сразу массив ID вопросов
          },
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (packResponse.status !== 201) {
          throw new Error("Ошибка при создании пакета");
        }

        console.log("Пак успешно создан:", packResponse.data);
        navigate("/packs");
      } catch (error) {
        console.error("Ошибка:", error);
        setAuthState(prev => ({
          ...prev,
          error: error.response?.data?.message || error.message || "Ошибка при создании пакета"
        }));
      } finally {
        setIsCreating(false);
      }
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
          {authState.error || "Для создания пакетов необходимо авторизоваться"}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/login")}
        >
          Войти в аккаунт
        </Button>
      </Box>
    );
  }

  return (
    <Container 
      maxWidth="md" 
      sx={{ 
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        py: 2
      }}
    >
      <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
        {/* Заголовок и форма */}
        <Box>
          <Typography variant="h4" gutterBottom sx={{ textAlign: "center", mb: 3 }}>
            Создание нового пакета
          </Typography>

          {authState.error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {authState.error}
            </Alert>
          )}

          <Box sx={{ mb: 2 }}>
            <TextField
              label="Название пакета *"
              fullWidth
              value={packName}
              onChange={(e) => setPackName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Описание пакета"
              fullWidth
              multiline
              rows={3}
              value={packDescription}
              onChange={(e) => setPackDescription(e.target.value)}
            />
          </Box>
        </Box>

        {/* Поиск и заголовок таблицы */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ flex: 1 }}>
            Выберите вопросы для пакета
          </Typography>
          <TextField
            label="Поиск вопросов"
            variant="outlined"
            size="small"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ width: 300 }}
          />
        </Box>

        {/* Таблица с вопросами */}
        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {filteredQuestions.length > 0 ? (
            <>
              <TableContainer sx={{ flex: 1, border: `1px solid ${theme.palette.divider}` }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.black2 }}>
                      <TableCell padding="checkbox" sx={{ backgroundColor: theme.palette.black2 }}>
                        <Checkbox
                          indeterminate={
                            selectedQuestions.length > 0 &&
                            selectedQuestions.length < filteredQuestions.length
                          }
                          checked={
                            filteredQuestions.length > 0 &&
                            selectedQuestions.length === filteredQuestions.length
                          }
                          onChange={handleSelectAll}
                          sx={{ color: theme.palette.common.white }}
                        />
                      </TableCell>
                      <TableCell sx={{ 
                        backgroundColor: theme.palette.black2,
                        color: theme.palette.common.white 
                      }}>
                        Вопрос
                      </TableCell>
                      <TableCell sx={{ 
                        backgroundColor: theme.palette.black2,
                        color: theme.palette.common.white 
                      }}>
                        Ответ
                      </TableCell>
                      <TableCell sx={{ 
                        backgroundColor: theme.palette.black2,
                        color: theme.palette.common.white 
                      }}>
                        Дата создания
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody sx={{ overflow: 'auto' }}>
                    {filteredQuestions
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((question) => (
                        <TableRow
                          key={question.id}
                          hover
                          selected={selectedQuestions.includes(question.id)}
                          onClick={() => handleToggleQuestion(question.id)}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedQuestions.includes(question.id)}
                              onChange={() => handleToggleQuestion(question.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </TableCell>
                          <TableCell>{question.question_text || "Без текста"}</TableCell>
                          <TableCell>{question.answer_text || "Без ответа"}</TableCell>
                          <TableCell>
                            {question.pub_date_q 
                              ? new Date(question.pub_date_q).toLocaleDateString() 
                              : "Нет даты"}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredQuestions.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{ 
                  border: `1px solid ${theme.palette.divider}`,
                  borderTop: 0,
                  backgroundColor: theme.palette.black2,
                  color: theme.palette.common.white
                }}
              />
            </>
          ) : (
            <Alert severity="info" sx={{ mb: 3 }}>
              {searchText 
                ? "Вопросы по вашему запросу не найдены"
                : "У вас пока нет созданных вопросов"}
            </Alert>
          )}
        </Box>
      </Box>

      {/* Кнопки внизу */}
      <Box sx={{ 
        padding: 2,
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`
      }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate("/add-question")}
            >
              Создать новый вопрос
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Tooltip 
              title={!packName ? "Укажите название пакета" : 
                    selectedQuestions.length === 0 ? "Выберите хотя бы один вопрос" : ""}
            >
              <span style={{ width: '100%' }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleCreatePack}
                  disabled={!packName || selectedQuestions.length === 0 || isCreating}
                >
                  {isCreating ? (
                    <CircularProgress size={24} />
                  ) : (
                    `Создать пак (${selectedQuestions.length})`
                  )}
                </Button>
              </span>
            </Tooltip>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AddPack;