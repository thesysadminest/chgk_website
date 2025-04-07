import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography, Link as MuiLink } from "@mui/material";
import { useParams, useLocation, useNavigate } from "react-router-dom";

const PackDetail = () => {
  const [rows, setRows] = useState([]);
  const { id: packId } = useParams(); 
  const location = useLocation();
  const navigate = useNavigate();
  const [visited, setVisited] = useState({});
  const [pack, setPack] = useState({
    name: "",
    author_p: "",
    pub_date_p: "",
    questions: [],
  });

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/pack/${packId}/") 
      .then(response => {
        const data = response.data;
        console.log("Полученные данные:", data);  

        const packData = Array.isArray(data) ? data[0] : data;
        const questions = packData.questions ? packData.questions.map((item, index) => ({
          id: item.id, 
          questionIndex: index + 1,  
          question_text: item.question_text,
          author_q: item.author_q || "Неизвестно",
          pub_date_q: item.pub_date_q ? new Date(item.pub_date_q).toLocaleDateString("ru-RU") : "Неизвестно"
        })) : [];
        console.log("Отформатированные вопросы:", questions);  
        setRows(questions);

        setPack({
          name: packData.name,
          questions: questions,
          author_p: packData.author_p || "Неизвестно",
          pub_date_p: packData.pub_date_p || "Неизвестно"
        });
      })
      .catch(error => {
        console.error("Ошибка при загрузке данных:", error);
      });
  }, [packId]);

  const handleRowClick = (params) => {
    navigate("/question/${params.row.id}");
    setVisited({ ...visited, [params.row.id]: true });
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
        Дата публикации: {pack.pub_date_p !== "Неизвестно" ? new Date(pack.pub_date_p).toLocaleDateString("ru-RU") : "Неизвестно"}
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
              headerName: "Индекс", 
              flex: 0.7,
              renderCell: (params) => (
                <MuiLink 
                  component="button" 
                  variant="body2" 
                  onClick={() => handleRowClick(params)} 
                  sx={{ color: visited[params.row.id] ? "burgundy" : "white", textDecoration: "underline", cursor: "pointer" }}
                >
                  {params.value}
                </MuiLink>
              )
            },
            { field: "question_text", headerName: "Текст вопроса", flex: 3 },
            { field: "author_q", headerName: "Автор", flex: 2 },
            { field: "pub_date_q", headerName: "Дата создания", flex: 2 },
          ]}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          autoHeight
          getRowId={(row) => row.questionIndex}
          sx={{ boxShadow: 2, border: 1, inactiveBorderColor: "grey.300" }}
          onRowClick={handleRowClick}
        />
      </Box>
    </Box>
  );
};

export default PackDetail;
