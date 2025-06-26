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

const AddTeamSuccess = ({ open, onClose, teamName, invitedCount, membersCount }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleGoToTeams = () => {
    onClose(); 
  };

  const handleAddAnother = () => {
    onClose();
    navigate("/add-team");
  };

  return (
    <Backdrop open={open}>
      <Paper sx={{
          backgroundColor: theme.palette.background.window,
          p: 5,
          borderRadius: 4,
          width: '100%',
          maxWidth: 600,
          mx: 'auto',
          textAlign: 'center'
        }}>
        <Typography variant="h4" sx={{
            mb: 3,
            color: theme.palette.primary.main,
            fontWeight: 'bold'
          }}>
          Команда успешно создана!
        </Typography>

        <Typography variant="body1" sx={{ mb: 2, color: theme.palette.text.dark }}>
          Команда <strong>"{teamName}"</strong> была успешно создана.
        </Typography>

        <Box sx={{ textAlign: 'left', mb: 3, pl: 2, color: theme.palette.text.dark }}>
          <Typography>• Участников: {membersCount} (вы - капитан)</Typography>
          {invitedCount > 0 && (
            <Typography>• Отправлено приглашений: {invitedCount}</Typography>
          )}
        </Box>


        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
        >
          <Button
            variant="contained"
            onClick={handleGoToTeams}
            sx={{
              py: 1.5,
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark
              }
            }}
          >
            Перейти к списку команд
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
            Создать ещё команду
          </Button>
        </Stack>
      </Paper>
    </Backdrop>
  );
};

export default AddTeamSuccess;