import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Grid from '@mui/material/Grid';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu'; 
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import Button from '@mui/material/Button'; 
import Popover from '@mui/material/Popover';

import {PersonAdd, Person, ChevronLeft, ChevronRight} from '@mui/icons-material';

import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { Link } from 'react-router-dom';
import User from '../components/User.js'
import UserMenu from '../components/UserMenu.js'

const drawerWidth = 240; // фиксированная ширина бокового меню

const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowY: 'hidden', // скрываем вертикальный скролл
    overflowX: 'hidden', // скрываем горизонтальный скролл
});

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowY: 'hidden', // скрываем вертикальный скролл
    overflowX: 'hidden', // скрываем горизонтальный скролл
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
);

const Item = styled(ButtonBase)(({ dp_theme }) => ({ 
    height: '100',
    textAlign: 'center',
    //fontSize: 'h6',
    fontFamily: 'Roboto, sans-serif'
}));

let user = Object.create(
    Object.getPrototypeOf(User), 
    Object.getOwnPropertyDescriptors(JSON.parse(localStorage.getItem('user')))
);

export default function NavBar({ children }) {
    const theme = useTheme();
    const [open, setOpen] = React.useState(true);
    const fontSize = '2vh';

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    }
    
    const renderIcon = (index) => {
        const size = 28;
        switch (index) {
        case 0:
            return <img src="/home_w.ico" alt="home" style={{ width: size, height: size}} />;
        case 1:
            return <img src="/question_w.ico" alt="question" style={{ width: size, height: size }} />;
        case 2:
            return <img src="/bag_w.ico" alt="bag" style={{ width: size, height: size }} />;
        case 3:
            return <img src="/user_w.ico" alt="user" style={{ width: size, height: size }} />;
        default:
            return <img src="/team_w.ico" alt="user" style={{ width: size, height: size }} />;
        }
    };
    
    const location = useLocation();
    const resolvePageName = () => {
        switch (location.pathname) {
        case "/":
            return "Главная";
        case "/me":
            return "Авторизация";
        case "/questions":
            return "Вопросы";
        case "/packs":
            return "Пакеты";
        case "/users":
            return "Пользователи";
        case "/teams":
            return "Команды";
        default:
            return "";
        }
    };

    return (
        <div>
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            
             
            <Drawer variant="permanent" open={open} sx={{ mt: "6vh" }}>
                <DrawerHeader ></DrawerHeader>

                <Divider />
                <List>
                    {[['Главная', '/'], ['Вопросы', '/questions'], ['Пакеты', '/packs'], ['Пользователи', '/users'], ['Команды', '/teams']].map((text, index) => (
                        <ListItem disablePadding key={text[0]} sx={{ display: 'block', pt: 0, pb: 2, pr: 1, pl: 1 }}>
                            <ListItemButton component={Link} to={text[1]}
                                            sx={{
                                                justifyContent: open ? 'initial' : 'center',
                                                px: 2.5,
                                                minWidth: open ? drawerWidth - 30 : `calc(${theme.spacing(4)} + 1px)`, // контролируем ширину кнопки
                                            }}
                            >
                                <ListItemIcon
                                    sx={{
                                        ml: 1,
                                        minWidth: open ? 'auto' : 'calc(100% - 8px)', // контролируем ширину иконки
                                        justifyContent: 'left',
                                    }}
                                >
                                    {renderIcon(index)}
                                </ListItemIcon>
                                <ListItemText
                                    primary={text[0]}
                                    sx={{
                                        ml:1.2,
                                        opacity: open ? 1 : 0,
                                        whiteSpace: 'nowrap',
                                        fontSize: fontSize,
                                        color: "#FFFFFF",
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
                <Divider />
                <List sx={{ pt: 2 }}>
                    {['Добавить вопрос', 'Добавить пак'].map((text, index) => (
                        <ListItem disablePadding key={text} sx={{ display: 'block', pb: 2, pr: 1, pl: 1 }}>
                            <ListItemButton component={Link} to="/packs"
                                            sx={{
                                                justifyContent: open ? 'initial' : 'center',
                                                px: 2.5,
                                                minWidth: open ? drawerWidth - 30 : `calc(${theme.spacing(4)} + 1px)`, // контролируем ширину кнопки
                                            }}
                            >
                                <ListItemIcon
                                    sx={{
                                        ml: 1,
                                        minWidth: open ? 'auto' : 'calc(100% - 8px)', // контролируем ширину иконки
                                        justifyContent: 'left',
                                    }}
                                >
                                    <img src="/question_w.ico" alt="question" style={{ width: 28, height: 28 }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary={text}
                                    sx={{
                                        ml:1.2,
                                        opacity: open ? 1 : 0,
                                        whiteSpace: 'nowrap',
                                        fontSize: fontSize,
                                        color: "#FFFFFF",
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>

            <AppBar position="fixed" open={open}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={open ? handleDrawerClose : handleDrawerOpen}
                        edge="start"
                        sx={{
                            marginRight: 5,
                            minHeight: "5vh", // устанавливаем высоту для кнопки
                        }}
                    >
                        {open ? <ChevronLeft /> : <MenuIcon />}
                    </IconButton>
                    
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        {resolvePageName()}
                    </Typography>
                    
                    <UserMenu></UserMenu>
                    
                </Toolbar>
            </AppBar>

            <Box
                component="main"
                sx={{ mt: "8vh", ml: "2vw", flexGrow: 1, p: 3, transition: theme.transitions.create('margin', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                      ...(open && {
                          transition: theme.transitions.create('margin', {
                              easing: theme.transitions.easing.sharp,
                              duration: theme.transitions.duration.enteringScreen,
                          }),
                      }),
                    }}
            >
                {children}
                <DrawerHeader />
            </Box>
        </Box>
        </div>
    );
}
