import React from "react";

import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import ButtonBase from "@mui/material/ButtonBase";
import {ThemeProvider, createTheme, styled} from '@mui/material/styles';

import purpleTheme from "../static/themes/divine_purple"

let dp_theme = createTheme(purpleTheme);

const Item = styled(ButtonBase, Paper)(({ dp_theme }) => ({ 
  width : '100%',
  height: '100%',
  textAlign: 'center',
  fontFamily: 'Roboto, sans-serif'

}));


const NavBar = ({ selected }) => {
    return (
        <ThemeProvider theme={dp_theme}>
            <Box sx={{ flexGrow: 0 }}>
                <Grid container spacing={2} coluumns={8}>
                  <Grid size={{xs: 6, md: 2 }}>
                    <Item variant={selected === "/home" ? "accent" : "default"} href='/'> Домой  </Item>
                  </Grid>
                  <Grid size={{xs: 6, md: 2}}>
                    <Item variant={selected === "/questions" ? "accent" : "default"} href='/questions'> Вопросы  </Item>
                  </Grid>
                  <Grid size={{ xs: 6, md: 2 }}>
                    <Item variant={selected === "/packs" ? "accent" : "default"} href='/packs'> Пакеты </Item>
                  </Grid>
                  <Grid size={{ xs: 6, md: 2 }}>
                    <Item variant={selected === "/users" ? "accent" : "default"} href='/users'> Пользователи  </Item>
                  </Grid>
                  <Grid size={{ xs: 6, md: 2 }}>
                    <Item> Команды </Item>
                  </Grid>

                </Grid>
            </Box>
            </ThemeProvider>
    );
}

export default NavBar;  