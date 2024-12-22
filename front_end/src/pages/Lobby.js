import React from "react";

import {Box, Stack, Paper, ButtonBase} from "@mui/material";
import {ThemeProvider, createTheme, styled} from '@mui/material/styles';

import purpleTheme from "../static/themes/divine_purple"

let dp_theme = createTheme(purpleTheme);

const Item = styled(ButtonBase, Paper)(({ dp_theme }) => ({ 
    width : '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 'calc(10px + 3vmin)',
    fontFamily: 'Roboto, sans-serif'
  }));


const Lobby = () => {
    return (
        <ThemeProvider theme={dp_theme}>
            <Box sx={{ height: '60vh', mr: '20vh', ml: '20vh', mb: '20vh', mt: '20vh', flexGrow: 0 }}>
                <Stack spacing='10vh' sx={{ height:"100%"}}>
                  <Stack spacing='10vh' sx={{ height:"50vh"}} direction="row">
                    <Item href='/questions'> Вопросы </Item>
                    <Item href='/packs'> Пакеты </Item>
                  </Stack>
                  <Stack spacing='10vh' sx={{height:"50vh"}} direction="row">
                    <Item href='/users'> Пользователи </Item>
                    <Item href='/'> вапа </Item>
                  </Stack>
                </Stack>
            </Box>
        </ThemeProvider>
    );
};

export default Lobby;