import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography, Link as MuiLink } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

const PackDetail = () => {
  const theme = useTheme();
  const [rows, setRows] = useState([]);
  const { id: packId } = useParams();
  const navigate = useNavigate();
  const [visited, setVisited] = useState({});
  const [pack, setPack] = useState({
    name: "",
    author_p: "",
    pub_date_p: "",
    questions: [],
  });
  const [authorsCache, setAuthorsCache] = useState({});

  // Функция для получения username автора по ID
  const getAuthorUsername = async (authorId) => {
    if (!authorId) return "Неизвестно";
    
    // Если уже есть в кэше
    if (authorsCache[authorId]) return authorsCache[authorId];
    
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/user/${authorId}/`);
      const username = response.data.username;
      // Сохраняем в кэш
      setAuthorsCache(prev => ({ ...prev, [authorId]: username }));
      return username;
    } catch (error) {
      console.error("Ошибка при получении данных автора:", error);
      return `Автор ID: ${authorId}`;
    }
  };

  useEffect(() => {
    const fetchPackData = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/pack/${packId}/`);
        console.log("Raw response data:", response.data);
    
        // Упрощенная обработка
        const packData = response.data;
        setPack({
          name: packData.name || "No name",
          author_p: packData.author_p?.username || "Unknown",
          pub_date_p: packData.pub_date_p || "Unknown",
          questions: packData.questions || []
        });
    
        setRows(packData.questions?.map((q, i) => ({
          id: q.id,
          questionIndex: i + 1,
          question_text: q.question_text,
          author_q: q.author_q?.username || "Unknown",
          pub_date_q: q.pub_date_q ? new Date(q.pub_date_q).toLocaleDateString("ru-RU") : "Unknown"
        })) || []);
    
      } catch (error) {
        console.error("Error fetching pack:", error);
      }
    };
    fetchPackData();
  }, [packId]);

  const handleRowClick = (params) => {
    navigate(`/question/${params.row.id}`);
    setVisited(prev => ({ ...prev, [params.row.id]: true }));
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Имя пака: {pack.name}
      </Typography>
      <Typography variant="subtitle1" gutterBottom sx={{ mb: 2, color: "gray" }}>
        Автор: {pack.author_p}
      </Typography>
      <Typography variant="subtitle1" gutterBottom sx={{ mb: 2, color: "gray" }}>
        Дата публикации: {pack.pub_date_p !== "Неизвестно" 
          ? new Date(pack.pub_date_p).toLocaleDateString("ru-RU") 
          : "Неизвестно"}
      </Typography>
      <Typography variant="h6" gutterBottom>
        Вопросы:
      </Typography>
      <Box sx={{ height: "60vh", width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={[
            { 
              field: "questionIndex", 
              headerName: "№", 
              width: 70,
              renderCell: (params) => (
                <MuiLink 
                  component="button" 
                  variant="body2" 
                  onClick={() => handleRowClick(params)} 
                  sx={{ 
                    textDecoration: "underline", 
                    cursor: "pointer"
                  }}
                >
                  {params.value}
                </MuiLink>
              )
            },
            { 
              field: "question_text", 
              headerName: "Текст вопроса", 
              flex: 3,
              renderCell: (params) => (
                <div style={{ whiteSpace: "normal", wordWrap: "break-word" }}>
                  {params.value}
                </div>
              )
            },
            { 
              field: "author_q", 
              headerName: "Автор", 
              flex: 1,
              renderCell: (params) => (
                <span style={{ 
                  
                }}>
                  {params.value}
                </span>
              )
            },
            { 
              field: "pub_date_q", 
              headerName: "Дата создания", 
              flex: 1 
            },
          ]}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20]}
          autoHeight
          getRowId={(row) => row.id}
          sx={{ 
            boxShadow: 2, 
            '& .MuiDataGrid-cell:hover': {
              cursor: "pointer"
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: "#f5f5f5",
              fontWeight: "bold"
            }
          }}
          onRowClick={handleRowClick}
        />
      </Box>
    </Box>
  );
};

export default PackDetail;