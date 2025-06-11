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

const AddPackSuccess = ({ open, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleAddAnother = () => {
    onClose(); // Закрывает модальное окно и перенаправляет на /packs
  };

  const handleGoToPacks = () => {
    onClose(); // Уже перенаправляет на /packs
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
          Пак успешно создан!
        </Typography>

        <Typography
          variant="body1"
          sx={{
            mb: 4,
            color: theme.palette.text.dark
          }}
        >
          Ваш пак вопросов был успешно создан и теперь доступен для использования.
          Вы можете добавить его в игру или продолжить редактирование.
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
        >
          <Button
            variant="contained"
            onClick={handleGoToPacks} 
            sx={{
              py: 1.5,
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark
              }
            }}
          >
            Перейти к списку паков
          </Button>

          <Button
            variant="outlined"
            onClick={() => {
              onClose();
              navigate("/add-pack");
            }}
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
            Создать ещё пак
          </Button>
        </Stack>
      </Paper>
    </Backdrop>
  );
};

export default AddPackSuccess;