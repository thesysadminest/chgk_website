import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import axiosInstance from "../components/axiosInstance";
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Link,
  Stack
} from '@mui/material';
import { useTheme } from "@mui/material/styles";

const GameRedirect = () => {
  const theme = useTheme();
  const { pack_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const hasRedirected = useRef(false);
  const [packInfo, setPackInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    const fetchPackInfo = async () => {
      try {
        const response = await axiosInstance.get(`/pack/${pack_id}/`);
        setPackInfo(response.data);
      } catch (err) {
        setError("Не удалось загрузить информацию о паке");
      } finally {
        setLoading(false);
      }
    };

    if (pack_id !== "0") {
      fetchPackInfo();
    } else {
      setLoading(false);
    }
  }, [pack_id]);

  const startGame = async () => {
    if (hasRedirected.current) return;
    hasRedirected.current = true;
    setShowPreview(false);

    const access_token = localStorage.getItem("access_token");
    if (!access_token) {
      navigate("/login", { state:{redirect: location} });
      return;
    }

    try {
      const response = await axiosInstance.get(`/game/${pack_id}/start/`);
      const packId = response.data?.real_pack_id || pack_id;
      const firstQuestionId = response.data?.first_question.id;

      if (firstQuestionId) {
        navigate(`/game/${packId}/questions/${firstQuestionId}`);
      } else {
        navigate("/packs");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/login", { state:{redirect: location} });
      } else {
        navigate("/packs");
      }
    }
  };

  if (!showPreview) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography color="error">{error}</Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/packs")}
          sx={{ mt: 2 }}
        >
          Вернуться к списку пакетов
        </Button>
      </Box>
    );
  }

  const renderPackInfo = () => (
    <Box sx = {{color: theme.palette.text.visited, mt: 2, mb: 2}}>
      <Box sx={{color: theme.palette.primary.contrastText, fontWeight: 'bold', textAlign: 'center', mb: 2}}>
      <Typography variant="h4">Информация о паке</Typography>
      </Box>
      <Typography paragraph><strong>ID:</strong> {packInfo?.id}</Typography>
      <Typography paragraph><strong>Описание:</strong> {packInfo?.description || "Нет описания"}</Typography>
      <Typography paragraph><strong>Автор:</strong> {packInfo?.author_p?.username || "Неизвестен"}</Typography>
      <Typography paragraph>
        <strong>Дата создания:</strong> {packInfo?.pub_date_p ? new Date(packInfo.pub_date_p).toLocaleDateString() : "Неизвестна"}
      </Typography>
      <Typography paragraph>
        <strong>Количество вопросов:</strong> {packInfo?.questions?.length || 0}
      </Typography>
    </Box>
  );

  return (
    <CssBaseline>
    <Box sx={{
        backgroundColor: theme.palette.background.default,
        minHeight: '100vh',
        width: '98vw',
        overflow: "hidden",
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        ml: 0
    }}>
      <Box sx={{
          width: '98vw',
          p: 9,
          ml: 0,
          display: 'flex',
          overflow: "hidden",
          flexDirection: 'column',
          boxSizing: 'border-box',
          alignItems: 'center'
      }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            mb: 3, 
            mt: 2,
            textAlign: 'center', 
            color: theme.palette.primary.contrastText 
          }}>
            Выбранный режим: {pack_id === "0" ? "случайный пак вопросов" : "пак вопросов"}
        </Typography>

        <Paper sx={{
            backgroundColor: theme.palette.background.light,
            borderRadius: 2,
            maxWidth: '60vw',
            p: 3,
            mb: 2
        }}>
          <Typography paragraph sx={{ textAlign: 'center', mt: 2 }}>
            Вам будет предложено сыграть один пакет из нашей базы. Вопросы будут показываны по одному. 
            Ответ на один вопрос можно ввести только один раз в течение 60 секунд.
          </Typography>

          <Typography paragraph sx={{ mt: 2, textAlign: 'center' }}>
            Перед началом рекомендуем ознакомиться с{' '}
            <Link href="/help" color="primary">
              правилами игры
            </Link>.
          </Typography>

        </Paper>
        
        {packInfo && renderPackInfo()}
      
        <Stack 
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2} 
          sx={{ 
            justifyContent: 'center',  
        }}>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate("/packs")}
            sx={{
              px: 4,
              py: 1,
              fontSize: '1.2rem',
            }}>
            Перейти к списку пакетов
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate("/questions")}
            sx={{
              px: 4,
              py: 1,
              fontSize: '1.2rem',
            }}>
            Перейти к списку вопросов
          </Button>

          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            onClick={startGame}
            sx={{
              px: 4,
              py: 1,
              fontSize: '1.2rem',
            }}>
              Начать игру
          </Button>
        </Stack>
      </Box>
    </Box>
    </CssBaseline>
  );
};

export default GameRedirect;
