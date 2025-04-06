import React from 'react';
import { AppBar, Toolbar, Box, Button, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const LobbyNavBar = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        backgroundColor: theme.palette.background.default, 
        boxShadow: 'none', 
        zIndex: theme.zIndex.drawer + 1,
        overflow: "hidden",
      }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              color: theme.palette.text.primary,
              cursor: 'pointer',
              margin: 1,
            }}
            onClick={() => handleNavigate('/')}
            >
              CHGK Site
          </Typography>
          <Box sx={{ display: 'flex', gap: theme.spacing(1.8) , mr: 1}}>
            <Button
              onClick={() => handleNavigate('/registration')}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                textTransform: 'none',
                fontWeight: 'bold',
                width: '120px',
                height: '35px',
                '&:hover': {
                  backgroundColor: theme.palette.primary.hover,
                },
                borderRadius: theme.components?.MuiButton?.styleOverrides?.root?.borderRadius || 10,
              }}>
                Регистрация
            </Button>
            <Button
              onClick={() => handleNavigate('/login')}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                textTransform: 'none',
                fontWeight: 'bold',
                width: '100px',
                height: '35px',
                '&:hover': {
                  backgroundColor: theme.palette.primary.hover,
                },
                borderRadius: theme.components?.MuiButton?.styleOverrides?.root?.borderRadius || 10,
              }}>
                Войти
            </Button>
          </Box>
        </Toolbar>
    </AppBar>
  );
};

export default LobbyNavBar;
