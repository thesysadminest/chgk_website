import API_BASE_URL from '../config';
import axios from "axios";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Box, Link as MuiLink, Button, TextField, Stack, Rating } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const Questions = () => {
  const [rows, setRows] = useState([]);
  const [originalRows, setOriginalRows] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [visited, setVisited] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/question/list/`)
      .then(response => {
        const data = response.data.map((item) => ({
          id: item.id,
          question_text: item.question_text,
          answer_text: item.answer_text,
          author_q: item.author_q?.username || "Неизвестно",
          pub_date_q: (item.pub_date_q ? new Date(item.pub_date_q).toLocaleDateString("ru-RU") : "Неизвестно"),
          difficulty: item.difficulty || 1
        }));
        setRows(data);
        setOriginalRows(data);
      })
      .catch(error => {
        console.error("Ошибка при загрузке данных:", error);
      });
  }, []);

  const handleRowClick = (params) => {
    navigate(`/question/${params.id}`, { state: { question: params.row } });
    setVisited({ ...visited, [params.id]: true });
  };

  const handleAddQuestion = () => {
    navigate("/add-question");
  };

  const handleToPacks = () => {
    navigate("/packs"); 
  };

  const requestSearch = (searchValue) => {
    setSearchText(searchValue);
    const filteredRows = originalRows.filter((row) => {
      return row.question_text.toLowerCase().includes(searchValue.toLowerCase());
    });
    setRows(filteredRows);
  };

  const renderStars = (params) => {
    return (
      <Rating
        name={"difficulty-${params.id}"}
        value={params.value}
        max={5}
        readOnly
      />
    );
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Stack 
        direction="row" 
        spacing={2} 
        sx={{ 
          justifyContent: "space-between", 
          alignItems: "center", 
          mb: 2,
          flexWrap: "wrap",
          gap: 2
        }}
      >
        <Stack direction="row" spacing={2}>
          <Button  variant="red" onClick={handleToPacks}>
            Перейти к пакам
          </Button>
          <Button variant="red" onClick={handleAddQuestion}>
            Добавить вопрос
          </Button>
        </Stack>

        <TextField
          variant_tf="dark"
          size="small"
          placeholder="Поиск по вопросу"
          value={searchText}
          onChange={(e) => requestSearch(e.target.value)}
          sx={{ width: "300px" }} 
        />
      </Stack>


      <DataGrid
        rows={rows}
        columns={[
          { field: "id", headerName: "ID", flex: 0.5 },
          { field: "question_text", headerName: "Вопрос", flex: 3 },
          { field: "author_q", headerName: "Автор", flex: 2 },
          { field: "pub_date_q", headerName: "Дата", flex: 2 },
          { field: "difficulty", headerName: "Сложность", flex: 1.5, renderCell: renderStars}
        ]}
        pageSize={5}
        rowsPerPageOptions={[5, 10, 20]}
        getRowClassName={(params) => visited[params.id] ? "visited-row" : ""}
        disableSelectionOnClick
        onRowClick={handleRowClick}
      />

    </Box>
  );
};

export default Questions;
