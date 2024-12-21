import * as React from "react";
import { 
    Divider, 
    ListItemIcon, 
    ListItemText, 
    MenuItem, 
    MenuList, 
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
import {ThemeProvider} from '@mui/material/styles';
import {theme} from "../App.js";
import borders from '@mui/system';
import { spacing } from '@mui/system';

const Item = styled(ButtonBase, Paper)(({ theme }) => ({ 
  width : '100%',
  height: '100%',
  //backgroundColor: '#fff',
  //...theme.typography.body2,
  //padding: theme.spacing(1),
  textAlign: 'center',
  // fontSize: 'calc(10px + 2vmin)',
  fontFamily: 'Roboto, sans-serif'
  //color: theme.palette.text.secondary,
  //...theme.applyStyles('dark', {
  //  backgroundColor: '#1A2027',
  //}),

}));


const NavBar = ({ selected }) => {
    return (
        <ThemeProvider theme={theme}>
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