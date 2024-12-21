import React from "react";

import { 
    Table,
    Paper, 
    Typography, 
    Link,
    Card
} from "@mui/material";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import { styled } from '@mui/material/styles';
import ButtonBase from "@mui/material/ButtonBase";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import {ThemeProvider} from '@mui/material/styles';
import {theme} from "../App.js";
import { spacing } from '@mui/system';

const Item = styled(ButtonBase, Paper)(({ theme }) => ({ 
  width : '100%',
  height: '100%',
  textAlign: 'center',
  fontSize: 'calc(10px + 3vmin)',
  fontFamily: 'Roboto, sans-serif'
}));

const Lobby = () => {
    return (
        <ThemeProvider theme={theme}>
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