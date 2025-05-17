import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import axios from "axios";
import { useTheme } from "@mui/material/styles";

const NewsPage = () => {
  const theme = useTheme();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/news/");
        setNews(response.data);
      } catch (err) {
        setError("Ошибка при загрузке новостей.");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 800,
        mx: "auto",
        p: 3,
        backgroundColor: theme.palette.background.default,
        borderRadius: theme.components?.MuiButton?.styleOverrides?.root?.borderRadius || 10,
        boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
      }}
    >
      <Typography variant="h4" sx={{ mb: 3, color: theme.palette.text.primary }}>
        Новости
      </Typography>

      {news.length > 0 ? (
        news.map((item, index) => (
          <Box key={index} sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
              {item.title}
            </Typography>
            <Typography variant="body1">{item.content}</Typography>
            <Typography
              variant="caption"
              sx={{ display: "block", mt: 1, color: theme.palette.text.secondary }}
            >
              Опубликовано: {new Date(item.published_at).toLocaleDateString()}
            </Typography>
          </Box>
        ))
      ) : (
        <Typography variant="body1">Нет новых новостей.</Typography>
      )}
    </Box>
  );
};

export default NewsPage;
