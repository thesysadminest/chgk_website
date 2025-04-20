import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Link as MuiLink, Button, TextField, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Questions = () => {
  const [rows, setRows] = useState([]);
  const [originalRows, setOriginalRows] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [visited, setVisited] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/question/list/")
      .then(response => {
        const data = response.data.map((item) => ({
          id: item.id,
          question_text: item.question_text,
          answer_text: item.answer_text,
          author_q: item.author_q?.username || "Неизвестно",
          pub_date_q: (item.pub_date_q ? new Date(item.pub_date_q).toLocaleDateString("ru-RU") : "Неизвестно")
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

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack 
        direction="row" 
        spacing={2} 
        sx={{ 
          justifyContent: "space-between", 
          alignItems: "center", 
          mb: 2,
          flexWrap: 'wrap',
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
          variant="outlined"
          size="small"
          placeholder="Поиск по вопросу"
          value={searchText}
          onChange={(e) => requestSearch(e.target.value)}
          sx={{ width: "300px" }} 
        />
      </Stack>

      <Box sx={{ flexGrow: 1 }}>
        <DataGrid
          rows={rows}
          columns={[
            { 
              field: "id", 
              headerName: "ID", 
              flex: 0.7,
              renderCell: (params) => (
                <MuiLink 
                  component="button" 
                  variant="body2" 
                  onClick={() => handleRowClick(params)} 
                  sx={{ 
                    color: visited[params.id] ? "grey" : "white",
                    textDecoration: "underline", 
                    cursor: "pointer",
                    '&:hover': {
                      color: visited[params.id] ? 'darkgrey' : 'primary.light'
                    }
                  }}
                >
                  {params.value}
                </MuiLink>
              )
            },
            { field: "question_text", headerName: "Question Text", flex: 3 },
            { field: "author_q", headerName: "Author", flex: 2 },
            { field: "pub_date_q", headerName: "Date", flex: 2 },
          ]}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          sx={{ 
            boxShadow: 2, 
            border: 1, 
            borderColor: 'grey.300',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'background.paper',
              color: 'text.primary',
              borderBottom: '1px solid',
              borderColor: 'primary.main'
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 'bold'
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid',
              borderColor: 'grey.800'
            },
            '& .visited-row': {
              color: 'grey'
            }
          }}
          getRowClassName={(params) => visited[params.id] ? "visited-row" : ""}
          onRowClick={handleRowClick}
        />
      </Box>
    </Box>
  );
};

export default Questions;
