import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

const Questions = () => {
  const [rows, setRows] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/question/list')
      .then(response => {
        const data = response.data.map((item) => ({
          id: item.id,
          question_text: item.question_text,
          answer_text: item.answer_text,
          author: item.author ? item.author: "a?",
        }));
        setRows(data);
      })
      .catch(error => {
        console.error('Ошибка при загрузке данных:', error);
      });
  }, []);

  const handleRowClick = (params) => {
    navigate(`/question/${params.id}`, { state: { question: params.row } });
  };

  return (
    <Box sx={{ height: '80vh', width: '75vw', pr: '5vw', mt: '2vh' }}>
      <DataGrid
        rows={rows}
        columns={[
          { 
            field: 'id', 
            headerName: 'ID', 
            flex: 1,
            renderCell: (params) => (
              <span onClick={() => handleRowClick(params)}>
                {params.value}
              </span>
            )
          },
          { field: 'question_text', headerName: 'Question Text', flex: 3 },
          { field: 'answer_text', headerName: 'Answer Text', flex: 3 },
          { field: 'author', headerName: 'Author', flex: 2 },
          { field: 'ppub_date_q', headerName: 'Date', flex: 1},
        ]}
        pageSize={5}
        rowsPerPageOptions={[5, 10, 20]}
        autoHeight
        sx={{ boxShadow: 2, border: 1, borderColor: 'grey.300' }}
        onRowClick={handleRowClick}
      />
    </Box>
  );
};

export default Questions;
