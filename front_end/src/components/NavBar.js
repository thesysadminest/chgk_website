import * as React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import MuiDrawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { AddCircle, ChevronLeft, ChevronRight } from '@mui/icons-material';
import UserMenu from '../components/UserMenu';


const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowY: 'hidden',
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowY: 'hidden',
  overflowX: 'hidden',
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
  backgroundColor: '#d4d4d4',
  borderBottom: `1px solid ${theme.palette.divider}`,
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#c4c4c4',
  },
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  marginLeft: `calc(${theme.spacing(8)} + 1px)`,
  width: `calc(100% - ${theme.spacing(8)} - 1px)`,
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

const Item = styled(ButtonBase)(({ theme }) => ({
  height: 30,
  width: 30,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'Roboto, sans-serif',
  position: 'absolute',
  top: '50%',
  right: 20,
  transform: 'translateY(-70%)',
  zIndex: 2,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));


export default function NavBar({ children }) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);
  const fontSize = '2vh';
  const navigate = useNavigate();
  const location = useLocation();
  const isLobby = location.pathname === '/';

  React.useEffect(() => {
    if (isLobby) {
      setOpen(true);
    }
  }, [isLobby]);
  
  React.useEffect(() => {
    const toolbar = document.getElementById('toolbar');
    const mainbox = document.getElementById('mainbox');
    if (toolbar && mainbox) {
      mainbox.style.marginTop = window.getComputedStyle(toolbar).height;
    }
  }, []);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    if (!isLobby) {
      setOpen(false);
    }
    
  };

  const handleAddQuestionClick = (event) => {
    event.stopPropagation();
    navigate('/add-question');
  };

  const handleAddPackClick = (event) => {
    event.stopPropagation();
    navigate('/add-pack');
  };

  const renderIcon = (index) => {
    const size = 28;
    switch (index) {
      case 0:
        return <img src="/question_w.ico" alt="question" style={{ width: size, height: size }} />;
      case 1:
        return <img src="/bag_w.ico" alt="bag" style={{ width: size, height: size }} />;
      case 2:
        return <img src="/user_w.ico" alt="user" style={{ width: size, height: size }} />;
      default:
        return <img src="/team_w.ico" alt="user" style={{ width: size, height: size }} />;
    }
  };

  const resolvePageName = () => {
  const path = location.pathname;

  if (/^\/question\/\d+$/.test(path)) {
    return 'Внимание, вопрос';
  }
  else if (/^\/pack\/\d+$/.test(path)) {
    return 'Внимание, пакет';
  }
  else if (/^\/user\/\d+$/.test(path)) {
    return 'Информация о пользователе';
  }
  else if (/^\/team\/\d+$/.test(path)) {
    return 'Информация о команде';
  }

  switch (path) {
    case '/':
      return 'Главная';
    case '/authorization':
      return 'Авторизация';
    case '/questions':
      return 'Вопросы';
    case '/packs':
      return 'Пакеты';
    case '/users':
      return 'Пользователи';
    case '/teams':
      return 'Команды';
    case '/add-question':
      return 'Добавить вопрос';
    case '/add-pack':
      return 'Добавить пак';
    case '/add-pack/add-question':
      return 'Добавить пак';
    case '/myprofile':
      return 'Мой профиль';
    default:
      return '';
  }
};

  return (
    <div>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />

        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: drawerWidth,
            height: '63.8px',
            backgroundColor: 'background.gray',
            zIndex: theme.zIndex.drawer + 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: '#c4c4c4',
            },
          ...(open && {
              ...openedMixin(theme),
              '& .MuiDrawer-paper': openedMixin(theme),
            }),
            ...(!open && {
              ...closedMixin(theme),
              '& .MuiDrawer-paper': closedMixin(theme),
            }),
          }}
          component={Link}
          to="/"
        >
        </Box>

        <Drawer variant="permanent" open={open} sx={{ mt: '6vh' }}>
          <Divider />
          <List sx={{ mt: '11vh' }}>
            {[
              ['Вопросы', '/questions'],
              ['Пакеты', '/packs'],
              ['Пользователи', '/users'],
              ['Команды', '/teams'],
            ].map((text, index) => {
              const isActive = location.pathname === text[1];
              return (
                <ListItem disablePadding key={text[0]} sx={{ display: 'block', position: 'relative', pt: 0, pb: 2, pr: 1, pl: 1 }}>
                  <ListItemButton
                    component={Link}
                    to={text[1]}
                    sx={{
                      justifyContent: open ? 'initial' : 'center',
                      px: 2.5,
                      minWidth: open ? drawerWidth - 30 : `calc(${theme.spacing(4)} + 1px)`,
                      backgroundColor: isActive ? '#cd5c5c' : theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: isActive ? '#cd5c5c' : theme.palette.primary.dark,
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        ml: 1,
                        minWidth: open ? 'auto' : 'calc(100% - 8px)',
                        justifyContent: 'left',
                      }}
                    >
                      {renderIcon(index)}
                    </ListItemIcon>
                    <ListItemText
                      primary={text[0]}
                      sx={{
                        ml: 1.2,
                        opacity: open ? 1 : 0,
                        whiteSpace: 'nowrap',
                        fontSize: fontSize,
                        color: '#FFFFFF',
                      }}
                    />
                  </ListItemButton>
                  {open && index === 0 && (
                    <Item onClick={handleAddQuestionClick} sx={{ ml: 1.2 }}>
                      <AddCircle sx={{ 
                        color: '#FFFFFF',
                        //opacity: '0',
                        //'pointer-events': 'none',
                        //transition: theme.transitions.create('opacity', {
                        //   easing: theme.transitions.easing.sharp,
                        //   duration: theme.transitions.duration.leavingScreen,
                        // }),
                        // ...(open && {
                        //   opacity: '1',
                        //   transition: theme.transitions.create('opacity', {
                        //     easing: theme.transitions.easing.sharp,
                        //     duration: theme.transitions.duration.enteringScreen,
                        //   }),
                        // }),
                      }} />
                    </Item>
                  )}
                  {open && index === 1 && (
                    <Item onClick={handleAddPackClick} sx={{ ml: 1.2 }}>
                      <AddCircle sx={{ color: '#FFFFFF' }} />
                    </Item>
                  )}
                </ListItem>
              );
            })}
          
          {!isLobby && (
              <ListItem disablePadding sx={{ display: 'block', position: 'relative', pt: 0, pb: 2, pr: 1, pl: 1 }}>
                <ListItemButton
                  onClick={open ? handleDrawerClose : handleDrawerOpen}
                  sx={{
                    justifyContent: 'center',
                    px: 2.5,
                    minWidth: open ? drawerWidth - 30 : `calc(${theme.spacing(4)} + 1px)`,
                    border: '0.5px solid grey',
                    backgroundColor: 'transparent',
                    '&:hover': {
                      backgroundColor: '#c0c0c0',
                    },
                  }}
                >
                  {open ? (
                    <ChevronLeft sx={{ color: 'inherit' }} />
                  ) : (
                    <ChevronRight sx={{ color: 'inherit' }} />
                  )}
                </ListItemButton>
              </ListItem>
            )}
            
          </List>
          <Divider />

        </Drawer>

        <AppBar position="fixed" open={open}>
          <Toolbar id="toolbar">
            <Typography variant="h5" noWrap component="div" sx={{ flexGrow: 1, pl: 2 }}>
              {resolvePageName()}
            </Typography>

            <UserMenu />
          </Toolbar>
        </AppBar>

        <Box
          id='mainbox'
          component="main"
          sx={{
            flexGrow: 1,
            pt: 2.5,
            justifyContent: 'center',
            display: 'flex',
            minHeight: 'calc(100vh - 64px)',
            boxShadow: 'inset 0 0 30px 30px rgba(5, 5, 5, 0.2)',
            position: 'relative', 
            overflow: 'visible', 
            marginBottom: 0, 
            pb: 0, 
            transition: theme.transitions.create('margin', {
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
         
            <Box sx={{
              width: '100%',
              pt: 2, 
              pl: 5.2,
              position: 'relative',
              zIndex: 1
            }}>
              {children}
            </Box>
         </Box>
      </Box>
    </div>
  );
}
