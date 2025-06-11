import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  Link,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import { checkAuth, getAccessToken, clearAuthTokens } from "../utils/AuthUtils";
import AddPackSuccess from "../components/AddPackSuccess";

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
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

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

      const packResponse = await axios.post(
        "http://127.0.0.1:8000/api/pack/create/",
        {
          name: packName.trim(),
          description: packDescription.trim()
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

      const packId = packResponse.data.id;

      for (const questionId of selectedQuestions) {
        await axios.post(
          `http://127.0.0.1:8000/api/pack/question/${packId}/`,
          { question_id: questionId },
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      setSuccessModalOpen(true);
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
          sx={{ 
            mt: 2,
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            "&:hover": {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
        >
          Войти в аккаунт
        </Button>
        <Button 
          sx={{ mt: 2, ml: 2 }}
          variant="outlined"
          onClick={() => navigate("/registration")}
        >
          Зарегистрироваться
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{
        backgroundColor: theme.palette.background.window, 
        p: 4, 
        borderRadius: 4, 
        width: 1050, 
        ml: 5,
        position: 'relative',
        pb: 8
      }}>
        <Typography variant="h4" sx={{ mb: 3, color: theme.palette.primary.main, fontWeight: 'bold' }}>
          Создание нового пакета
        </Typography>

        {authState.error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {authState.error}
          </Alert>
        )}

        <Box sx={{ mt: 3 }}>
          <TextField
            label="Название пакета *"
            fullWidth
            value={packName}
            onChange={(e) => setPackName(e.target.value)}
            sx={{ 
              mb: 2,
              borderRadius: 1,
              
              backgroundColor: theme.palette.background.white, 
              '& .MuiInputBase-input': {
                color: theme.palette.text.dark
              }
            }}
          />
          <TextField
            label="Описание пакета"
            fullWidth
            multiline
            rows={3}
            value={packDescription}
            onChange={(e) => setPackDescription(e.target.value)}
            sx={{ 
              borderRadius: 1,
              '& .MuiInputBase-input': {
                color: theme.palette.text.dark
              }
            }}
          />
        </Box>

        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ flex: 1, color: theme.palette.text.dark }}>
              Выберите вопросы для пакета*
            </Typography>
            <TextField
              label="Поиск вопросов"
              variant="outlined"
              size="small"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              sx={{ 
                width: 300,
                borderRadius: 1
              }}
            />
          </Box>

          {filteredQuestions.length > 0 ? (
            <Box sx={{ 
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              overflow: 'hidden',
              mb: 3
            }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                      <TableCell padding="checkbox">
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
                      <TableCell sx={{ color: theme.palette.common.white }}>
                        Вопрос
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.common.white }}>
                        Ответ
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.common.white }}>
                        Дата создания
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
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
                          <TableCell sx={{color: theme.palette.text.dark}}>{question.question_text || "Без текста"}</TableCell>
                          <TableCell sx={{color: theme.palette.text.dark}}>{question.answer_text || "Без ответа"}</TableCell>
                          <TableCell sx={{color: theme.palette.text.dark}}>
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
                  borderTop: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.primary.main
                }}
              />
            </Box>
          ) : (
            <Alert severity="info" sx={{ mt: 2 }}>
              {searchText 
                ? "Вопросы по вашему запросу не найдены"
                : "У вас пока нет созданных вопросов"}
            </Alert>
          )}
        </Box>

        <Box sx={{ 
          position: 'absolute',
          right: 24,
          bottom: 24,
          display: "flex", 
          gap: 2 
        }}>
          <Button
            variant="outlined"
            onClick={() => navigate("/add-question")}
            sx={{
              py: 1.5,
              px: 3,
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              '&:hover': {
                borderColor: theme.palette.primary.dark,
                color: theme.palette.primary.dark
              }
            }}
          >
            Создать новый вопрос
          </Button>

          <Tooltip 
            title={!packName ? "Укажите название пакета" : 
                   selectedQuestions.length === 0 ? "Выберите хотя бы один вопрос" : ""}
            arrow
            placement="top"
            componentsProps={{
              tooltip: {
                sx: {
                  backgroundColor: theme.palette.background.tooltip,
                  color: theme.palette.text.tooltip,
                  '& .MuiTooltip-arrow': {
                    color: theme.palette.background.tooltip,
                  }
                }
              }
            }}
          >
            <span>
              <Button
                variant="contained"
                onClick={handleCreatePack}
                disabled={!packName || selectedQuestions.length === 0 || isCreating}
                sx={{
                  py: 1.5,
                  px: 3,
                  backgroundColor: (!packName || selectedQuestions.length === 0) ? 
                    theme.palette.action.disabled : 
                    theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: (!packName || selectedQuestions.length === 0) ? 
                      theme.palette.action.disabled : 
                      theme.palette.primary.dark,
                  }
                }}
              >
                {isCreating ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  `Создать пак (${selectedQuestions.length})`
                )}
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Box>

      <AddPackSuccess 
        open={successModalOpen}
        onClose={() => {
          setSuccessModalOpen(false);
          navigate("/packs");
        }}
      />
    </>
  );
};

export default AddPack;