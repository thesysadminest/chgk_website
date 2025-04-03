import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Link as MuiLink, Button, TextField, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Users = () => {
  const [rows, setRows] = useState([]);
  const [originalRows, setOriginalRows] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [visited, setVisited] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/user/list')
      .then(response => {
        const data = response.data.map(item => ({
          id: item.id,
          username: item.username,
          email: item.email || "Не указан",
          bio: item.bio || "Не указана",
          date_joined: item.date_joined 
            ? new Date(item.date_joined).toLocaleDateString('ru-RU') 
            : 'Неизвестно'
        }));
        setRows(data);
        setOriginalRows(data);
      })
      .catch(error => {
        console.error('Ошибка при загрузке данных:', error);
      });

    const token = localStorage.getItem('access_token');
    if (token) {
      axios.get('http://127.0.0.1:8000/api/user/myprofile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        setCurrentUser(response.data);
      })
      .catch(error => {
        console.error('Ошибка при получении данных пользователя:', error);
      });
    }
  }, []);

  const handleFindMe = () => {
    if (currentUser) {
      const meRow = rows.find(row => row.id === currentUser.id);
      if (meRow) {
        navigate(`/user/${currentUser.id}`, { state: { user: meRow } });
        setVisited({ ...visited, [currentUser.id]: true });
      }
    }
  };

  const handleRowClick = (params) => {
    navigate(`/user/${params.id}`, { state: { user: params.row } });
    setVisited({ ...visited, [params.id]: true });
  };

  const requestSearch = (searchValue) => {
    setSearchText(searchValue);
    const filteredRows = originalRows.filter((row) => {
      return row.username.toLowerCase().includes(searchValue.toLowerCase()) ||
             row.email.toLowerCase().includes(searchValue.toLowerCase());
    });
    setRows(filteredRows);
  };

  return (
    <Box sx={{ height: '80vh', width: '75vw'}}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Tooltip title={currentUser ? "" : "Требуется авторизация"} arrow>
          <span>
            <Button 
              variant="contained" 
              onClick={handleFindMe}
              disabled={!currentUser}
              sx={{
                backgroundColor: !currentUser ? '#f5f5f5' : '#752021',
                color: !currentUser ? '#bdbdbd' : '#ffffff',
                '&:hover': {
                  backgroundColor: !currentUser ? '#f5f5f5' : '#c23639'
                },
                py: 1.5,
                borderRadius: 1,
                boxShadow: 'none',
                border: !currentUser ? '1px solid #e0e0e0' : 'none',
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Найти меня
            </Button>
          </span>
        </Tooltip>

        <TextField
          variant="outlined"
          size="small"
          placeholder="Поиск по имени или email"
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
            flex: 0.7,
            renderCell: (params) => (
              <MuiLink 
                component="button" 
                variant="body2" 
                onClick={() => handleRowClick(params)} 
                sx={{ 
                  color: visited[params.id] ? 'grey' : 'white', 
                  textDecoration: 'underline', 
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline',
                  }
                }}
              >
                {params.value}
              </MuiLink>
            )
          },
          { field: 'username', headerName: 'Имя пользователя', flex: 2 },
          { field: 'email', headerName: 'Email', flex: 2 },
          { field: 'bio', headerName: 'Биография', flex: 3 },
          { field: 'date_joined', headerName: 'Дата регистрации', flex: 2 },
        ]}
        pageSize={5}
        rowsPerPageOptions={[5, 10, 20]}
        autoHeight
        sx={{ 
          boxShadow: 2, 
          border: 1, 
          borderColor: 'grey.300',
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: 'transparent',
            color: 'text.primary',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 'bold',
          },
          '& .MuiDataGrid-columnHeaders': {
            borderBottom: '1px solid rgba(224, 224, 224, 1)',
          },
          '& .visited-row': {
            color: 'grey',
          },
        }}
        getRowClassName={(params) => visited[params.id] ? 'visited-row' : ''}
        onRowClick={handleRowClick}
      />
    </Box>
  );
};

export default Users;