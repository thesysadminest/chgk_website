import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const QuitGame = ({ open, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleQuit = () => {
    navigate('/news');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          backgroundColor: theme.palette.background.window,
          color: theme.palette.text.dark
        }
      }}
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          Выйти из игры?
        </Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx = {{
          color: theme.palette.text.dark
        }}>
          Вы уверены, что хотите выйти из текущей игры? Ваш прогресс может быть потерян.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            mr: 2,
            color: theme.palette.text.primary,
            borderColor: theme.palette.text.primary
          }}
        >
          Отмена
        </Button>
        <Button
          onClick={handleQuit}
          variant="contained"
          sx={{
            backgroundColor: theme.palette.error.main,
            '&:hover': {
              backgroundColor: theme.palette.error.dark
            }
          }}
        >
          Выйти
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuitGame;