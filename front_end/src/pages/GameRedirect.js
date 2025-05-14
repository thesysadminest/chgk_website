import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../components/axiosInstance";
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Link
} from '@mui/material';
import { useTheme } from "@mui/material/styles";

const GameRedirect = () => {
  const theme = useTheme();
  const { pack_id } = useParams();
  const navigate = useNavigate();
  const hasRedirected = useRef(false);
  const [packInfo, setPackInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    const fetchPackInfo = async () => {
      try {
        const response = await axiosInstance.get(`/pack/${pack_id}/`);
        console.log(response);
        setPackInfo(response.data);
        setLoading(false);
      } catch (err) {
        setError("Не удалось загрузить информацию о паке");
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
      navigate("/login");
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
        navigate("/login");
      } else {
        navigate("/packs");
      }
    }
  };

  if (!showPreview) {
    return <p>Загрузка игры...</p>;
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
      <Box sx={{ p: 4 }}>
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

  return (
    <Box sx={{
      maxWidth: 800,
      mx: 'auto',
      p: 4,
      mt: 4,
      backgroundColor: theme.palette.background.paper,
      borderRadius: 2
    }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
        {pack_id === "0" ? "Случайный пак вопросов" : packInfo?.name || "Пак вопросов"}
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        {pack_id === "0" ? (
          <Typography paragraph>
            Вы выбрали случайный пак вопросов. Вам будет предложена подборка
            вопросов из разных пакетов нашей базы.
          </Typography>
        ) : (
          <>
            <Typography variant="h6" gutterBottom>Информация о паке:</Typography>
            <Typography paragraph><strong>ID:</strong> {packInfo?.id}</Typography>
            <Typography paragraph><strong>Описание:</strong> {packInfo?.description || "Нет описания"}</Typography>
            <Typography paragraph><strong>Автор:</strong> {packInfo?.author_p.username || "Неизвестен"}</Typography>
            <Typography paragraph>
              <strong>Дата создания:</strong> {packInfo?.pub_date_p ? new Date(packInfo.pub_date_p).toLocaleDateString() : "Неизвестна"}
            </Typography>
            <Typography paragraph>
              <strong>Количество вопросов:</strong> {packInfo?.questions.length|| 0}
            </Typography>
          </>
        )}

        <Typography paragraph sx={{ mt: 3 }}>
          Перед началом игры рекомендуем ознакомиться с{' '}
          <Link href="/help" color="primary">
            правилами игры
          </Link>.
        </Typography>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          onClick={startGame}
          sx={{
            px: 6,
            py: 2,
            fontSize: '1.2rem',
            backgroundColor: theme.palette.success.main,
            '&:hover': {
              backgroundColor: theme.palette.success.dark,
            }
          }}
        >
          Начать игру
        </Button>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={() => navigate("/packs")}
        >
          Вернуться к списку пакетов
        </Button>
      </Box>
    </Box>
  );
};

export default GameRedirect;