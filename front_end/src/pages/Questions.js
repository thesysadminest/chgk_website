
import React, { Component } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { CircularProgress, Box, Typography } from '@mui/material';

class Questions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: []
    };
  }

  componentDidMount() {
    this.fetchQuestions();
  }

  fetchQuestions() {
    axios.get('http://127.0.0.1:8000/api/question/')
      .then(response => {
        const data = response.data.map((item, index) => ({
          id: item.id,
          question_text : item.question_text,
          answer_text : item.answer_text,
          author : item.author.username,
        }));
        this.setState({ rows: data });
      })
      .catch(error => {
        console.error('Ошибка при загрузке данных:', error);
      });
  }

  render() {
    const { rows } = this.state;

    const columns = [
      { field: 'id', headerName: 'ID', width: 150 },
      { field: 'question_text', headerName: 'Question Text', width: 400 },
      { field: 'answer_text', headerName: 'Answer Text', width: 400 },
      { field: 'author', headerName: 'Author', width: 200 },
    ];

    return (
      <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            disableSelectionOnClick
            sx={{ boxShadow: 2, border: 1, borderColor: 'grey.300' }}
          />
    );
  }
}

export default Questions;
