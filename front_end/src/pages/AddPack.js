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
  Container
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

  const filteredQuestions = userQuestions.filter(question =>
    question.question_text.toLowerCase().includes(searchText.toLowerCase()) ||
    question.answer_text.toLowerCase().includes(searchText.toLowerCase())
  );

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

  const handleToggleQuestion = (questionId) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = filteredQuestions
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map(q => q.id);
      setSelectedQuestions(prev => [...new Set([...prev, ...newSelected])]);
    } else {
      const currentPageIds = filteredQuestions
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map(q => q.id);
      setSelectedQuestions(prev => prev.filter(id => !currentPageIds.includes(id)));
    }
  };

  const handleCreatePack = async () => {
    setIsCreating(true);
    try {
      if (!authState.isAuthenticated || !packName) return;

      const token = getAccessToken();
      if (!token) throw new Error("Токен доступа не найден");

      const packResponse = await axios.post(
        "http://127.0.0.1:8000/api/pack/create/",
        {
          name: packName,
          description: packDescription || "",
          author_p: authState.user.id,
        },
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (packResponse.status !== 201) throw new Error("Ошибка при создании пакета");

      const packId = packResponse.data.id;

      for (const questionId of selectedQuestions) {
        try {
          await axios.post(
            `http://127.0.0.1:8000/api/pack/question/${packId}/`,
            { question_id: questionId },
            { 
              headers: { "Authorization": `Bearer ${token}` },
              timeout: 5000 
            }
          );
        } catch (error) {
          console.error(`Ошибка при добавлении вопроса ${questionId}:`, error);
        }
      }

      navigate("/packs");
    } catch (error) {
      console.error("Ошибка при создании пакета:", error);
      setAuthState({
        ...authState,
        error: error.response?.data?.description?.[0] || 
              error.response?.data?.message || 
              "Ошибка при создании пакета"
      });
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
            backgroundColor: theme.palette.button.red.main,
            color: theme.palette.button.red.contrastText,
            "&:hover": { backgroundColor: theme.palette.button.red.hover },
          }}
        >
          Войти в аккаунт
        </Button>
      </Box>
    );
  }

  return (
    <Container  
      sx={{ 
        height: '100vh',
        width: '100vw',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.default,
        justifyContent: 'center'
      }}
    >
      <Box sx={{ 
        maxWidth: 800,
        mt: 4,
        width: '100%',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Typography variant="h4" gutterBottom sx={{ 
          textAlign: 'center', 
          mb: 3,
          color: theme.palette.text.primary
        }}>
          Создание нового пакета
        </Typography>

        {authState.error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {authState.error}
          </Alert>
        )}

        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          mb: 3,
          width: '100%',
        }}>
          <TextField
            label="Название пакета"
            fullWidth
            value={packName}
            onChange={(e) => setPackName(e.target.value)}
            required
            error={!packName}
            sx={{ maxWidth: 800, mx: 'auto' }}
          />

          <TextField
            label="Описание пакета"
            fullWidth
            value={packDescription}
            onChange={(e) => setPackDescription(e.target.value)}
            required
            multiline
            rows={3}
            sx={{ maxWidth: 800, mx: 'auto' }}
          />
        </Box>

        <Typography variant="h6" sx={{ 
          mb: 2, 
          textAlign: 'center',
          color: theme.palette.text.primary
        }}>
          Выберите вопросы для пакета
        </Typography>

        <TextField
          label="Поиск вопросов"
          fullWidth
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ mb: 3, maxWidth: 800, mx: 'auto' }}
        />

        {filteredQuestions.length > 0 ? (
          <TableContainer sx={{ 
            mb: 3, 
            border: `1px solid ${theme.palette.border.default}`,
            borderRadius: 1,
            maxHeight: 400,
            overflow: 'auto'
          }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.background.light }}>
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
                    />
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>Вопрос</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>Ответ</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>Дата создания</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredQuestions
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((question) => (
                    <TableRow
                      key={question.id}
                      hover
                      onClick={() => handleToggleQuestion(question.id)}
                      sx={{
                        cursor: 'pointer',
                        backgroundColor: selectedQuestions.includes(question.id)
                          ? theme.palette.primary.light
                          : 'inherit'
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedQuestions.includes(question.id)}
                          onChange={() => handleToggleQuestion(question.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {question.question_text}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {question.answer_text}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {new Date(question.pub_date_q).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredQuestions.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ color: theme.palette.text.primary }}
            />
          </TableContainer>
        ) : (
          <Alert severity="info" sx={{ mb: 3 }}>
            {searchText 
              ? "Вопросы по вашему запросу не найдены"
              : "У вас пока нет созданных вопросов. Сначала создайте вопросы."}
          </Alert>
        )}

        <Box sx={{ 
          display: "flex", 
          gap: 2,
          mt: 'auto',
          pt: 2
        }}>
          <Button
            variant="outlined"
            onClick={() => navigate("/add-question")}
            sx={{ 
              flex: 1, 
              maxWidth: 400, 
              mx: 'auto',
              color: theme.palette.text.primary,
              borderColor: theme.palette.text.primary
            }}
          >
            Создать новый вопрос
          </Button>
          <Tooltip 
            title={!packName || selectedQuestions.length === 0 ? "Заполните все обязательные поля" : ""}
            placement="top"
          >
          <span>
              <Button
                variant="contained"
                onClick={handleCreatePack}
                disabled={!packName || selectedQuestions.length === 0 || isCreating}
                sx={{
                  flex: 1,
                  maxWidth: 400,
                  mx: 'auto',
                  backgroundColor: !packName || selectedQuestions.length === 0 
                    ? theme.palette.action.disabled 
                    : theme.palette.button.red.main,
                  color: !packName || selectedQuestions.length === 0 
                    ? theme.palette.text.disabled 
                    : theme.palette.button.red.contrastText,
                  "&:hover": {
                    backgroundColor: !packName || selectedQuestions.length === 0 
                      ? theme.palette.action.disabled 
                      : theme.palette.button.red.hover,
                  },
                }}
              >
                {isCreating ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  `Создать пак (${selectedQuestions.length} вопросов)`
                )}
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Box>
    </Container>
  );
};

export default AddPack;