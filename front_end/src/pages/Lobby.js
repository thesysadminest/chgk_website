import React from "react";
import { Box, Typography } from "@mui/material";
import { ThemeProvider } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
  .blur-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    box-shadow: inset 0 0 50px 50px rgba(0, 255, 0, 0.3);
    pointer-events: none;
    z-index: 1000;
  }
`);

// document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];

//const overlay = document.createElement('div');
//overlay.className = 'blur-overlay';
//document.body.appendChild(overlay);

const Lobby = () => {
  const theme = useTheme();
  return (
      <Box 
        sx={{
          display: 'flex-height',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '80vh',
          
        }}
      >
        
        <Typography
          variant="h2"
          component="div"
          sx={{
            fontWeight: 'bold',
            fontSize: '4rem',
            color: theme.palette.primary.contrastText,
            textAlign: 'center',
            pr: 5
          }}
        >
          Новости

        </Typography>

        <Typography
          variant="h7"
          sx={{
            fontSize: '1.3rem',
            color: theme.palette.primary.contrastText,
            pr: 5,
            pl: 0
          }}
        >
          Введена примерная цветовая гамма сайта. Изменены (возможно непреднамеренно) некоторые кнопки. В качестве кнопки "домой" советуем использовать серый прямоугольник в левом верхнем углу. Enjoy!
        </Typography>
      </Box>
  );
};

export default Lobby;
