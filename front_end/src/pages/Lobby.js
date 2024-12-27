import React from "react";

import {Box, Stack, Paper, ButtonBase} from "@mui/material";
import {ThemeProvider, createTheme, styled} from '@mui/material/styles';
import { spacing } from '@mui/system';

import purpleTheme from "../themes/appereance.js"
let dp_theme = createTheme(purpleTheme);

const Item = styled(ButtonBase, Paper)(({ dp_theme }) => ({ 
    width : '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 'calc(10px + 3vmin)',
    fontFamily: 'Roboto, sans-serif',
    color: "#FFFFFF",
  }));

const Lobby = () => {
    return (
        <ThemeProvider theme={dp_theme}>
            <Box sx={{ height: '60vh', mr: '10vh', ml: '10vh', mb: '20vh', mt: '5vh', flexGrow: 0 }}>
                <Stack spacing='10vh' sx={{ height:"100%"}}>
                  <Stack spacing='10vh' sx={{ height:"50vh"}} direction="row">
                    <Item href='/questions'> Вопросы </Item>
                    <Item href='/packs'> Пакеты </Item>
                  </Stack>
                  <Stack spacing='10vh' sx={{height:"50vh"}} direction="row">
                    <Item href='/users'> Пользователи </Item>
                    <Item href='/teams'> Команды </Item>
                  </Stack>
                </Stack>
            </Box>
        </ThemeProvider>
    );
};

export default Lobby;
