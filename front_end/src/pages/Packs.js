import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Link as MuiLink, Button, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Packs = () => {
  const [rows, setRows] = useState([]);
  const [originalRows, setOriginalRows] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [visited, setVisited] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/pack/list')
      .then(response => {
        const data = response.data.map((item) => ({
          id: item.id,
          name: item.name,
          questions: item.questions,
          author_p: item.author_p || "Неизвестно",
          description: item.description || "Нет",
          pub_date_p: (item.pub_date_p ? new Date(item.pub_date_p).toLocaleDateString('ru-RU') : 'Неизвестно')
        }));
        setRows(data);
        setOriginalRows(data);
      })
      .catch(error => {
        console.error('Ошибка при загрузке данных:', error);
      });
  }, []);

  const handleRowClick = (params) => {
    navigate(`/pack/${params.row.id}`, { state: { pack: params.row } });
    setVisited({ ...visited, [params.row.id]: true });
  };

  const handleAddPack = () => {
    navigate('/add-pack');
  };

  const handleGoToQuestions = () => {
    navigate('/questions'); // Переход к банку вопросов
  };

  const requestSearch = (searchValue) => {
    setSearchText(searchValue);
    const filteredRows = originalRows.filter((row) => {
      return row.name.toLowerCase().includes(searchValue.toLowerCase());
    });
    setRows(filteredRows);
  };

  return (
    <Box sx={{ height: '80vh', width: '75vw', pr: '5vw', mt: '2vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" color="secondary" onClick={handleGoToQuestions}>
            Перейти к банку вопросов
          </Button>
          <Button variant="contained" color="primary" onClick={handleAddPack}>
            Добавить пак
          </Button>
        </Box>

        <TextField
          variant="outlined"
          size="small"
          placeholder="Поиск по названию пакета"
          value={searchText}
          onChange={(e) => requestSearch(e.target.value)}
          sx={{ width: '300px' }} 
        />
      </Box>

      <DataGrid
        rows={rows}
        columns={[
          { 
            field: 'id', 
            headerName: 'ID', 
            flex: 0.5,
            renderCell: (params) => (
              <MuiLink 
                component="button" 
                variant="body2" 
                onClick={() => handleRowClick(params)} 
                sx={{ 
                  color: 'white',
                  textDecoration: 'underline', 
                  cursor: 'pointer' 
                }}
              >
                {params.value}
              </MuiLink>
            )
          },
          { field: 'name', headerName: 'Название', flex: 2 },
          { field: 'description', headerName: 'Описание', flex: 4 },
          { field: 'author_p', headerName: 'Автор', flex: 2 },
          { field: 'pub_date_p', headerName: 'Дата', flex: 2 },
        ]}
        pageSize={5}
        rowsPerPageOptions={[5, 10, 20]}
        autoHeight
        sx={{ 
          boxShadow: 2, 
          border: 1, 
          borderColor: 'grey.300',
          '& .MuiDataGrid-cell': {
            color: 'white', // Белый цвет текста в ячейках
          },
          '& .MuiDataGrid-columnHeader': {
            color: 'white', // Белый цвет текста в заголовках
          },
        }}
        onRowClick={handleRowClick}
      />
    </Box>
  );
};

export default Packs;