import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Backdrop,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from "@mui/material/styles";

const AddQuestionSuccess = ({ open, onClose, packType }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleAddAnother = () => {
    onClose(); 
  };

  const handleGoToQuestions = () => {
    onClose();
    navigate('/questions');
  };

  return (
    <Backdrop
      open={open}
      sx={{
        zIndex: theme.zIndex.modal,
        backdropFilter: 'blur(4px)',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }}
    >
      <Paper
        sx={{
          backgroundColor: theme.palette.background.window,
          p: 5,
          borderRadius: 4,
          width: '100%',
          maxWidth: 600,
          mx: 'auto',
          textAlign: 'center'
        }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 3,
            color: theme.palette.primary.main,
            fontWeight: 'bold'
          }}
        >
          Вопрос успешно отправлен!
        </Typography>

        <Typography
          variant="body1"
          sx={{
            mb: 4,
            color: theme.palette.text.dark
          }}
        >
          {packType === 'open' 
           ? 'Ваш вопрос отправлен на проверку модераторами. В случае соответствия требованиям сайта вопрос будет добавлен в открытый пакет в течение 3-5 рабочих дней.'
            : 'Вопрос успешно добавлен в ваш личный пак вопросов.'}
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
        >
          <Button
            variant="contained"
            onClick={handleGoToQuestions} 
            sx={{
              py: 1.5,
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark
              }
            }}
          >
            Перейти к банку вопросов
          </Button>

          <Button
            variant="outlined"
            onClick={handleAddAnother} 
            sx={{
              py: 1.5,
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              '&:hover': {
                borderColor: theme.palette.primary.dark,
                color: theme.palette.primary.dark
              }
            }}
          >
            Добавить ещё вопрос
          </Button>
        </Stack>
      </Paper>
    </Backdrop>
  );
};

export default AddQuestionSuccess;