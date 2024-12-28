import React from "react";
import { Box, Stack, Paper, ButtonBase, Typography } from "@mui/material";
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';

import purpleTheme from "../themes/appereance.js";
let dp_theme = createTheme(purpleTheme);

const Item = styled(ButtonBase)(({ theme }) => ({
  width: '100%',
  height: '100%',
  textAlign: 'center',
  fontSize: 'calc(10px + 3vmin)',
  fontFamily: 'Roboto, sans-serif',
  color: "#FFFFFF",
  backgroundColor: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
  '&.username-button': {
    backgroundColor: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));

const Lobby = () => {
  return (
    <ThemeProvider theme={dp_theme}>
      <Box sx={{ height: '60vh', mr: '10vh', ml: '10vh', mb: '20vh', mt: '5vh', flexGrow: 0 }}>
        <Stack spacing='10vh' sx={{ height: "100%" }}>
          <Stack spacing='10vh' sx={{ height: "50vh" }} direction="row">
            <Item href='/questions' className="username-button">
              <Typography variant="h6">Вопросы</Typography>
            </Item>
            <Item href='/packs' className="username-button">
              <Typography variant="h6">Пакеты</Typography>
            </Item>
          </Stack>
          <Stack spacing='10vh' sx={{ height: "50vh" }} direction="row">
            <Item href='/users' className="username-button">
              <Typography variant="h6">Пользователи</Typography>
            </Item>
            <Item href='/teams' className="username-button">
              <Typography variant="h6">Команды</Typography>
            </Item>
          </Stack>
        </Stack>
      </Box>
    </ThemeProvider>
  );
};

export default Lobby;
