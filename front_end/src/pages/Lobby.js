import React from "react";
import { Box, Typography } from "@mui/material";
import { ThemeProvider } from '@mui/material/styles';

import burgundyTheme from "../themes/appereance.js";

const Lobby = () => {
  return (
    <ThemeProvider theme={burgundyTheme.palette}>
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
            color: burgundyTheme.palette.primary.main,
            textAlign: 'center',
            mr: 3
          }}
        >
          Новости

        </Typography>

        <Typography
          variant="h7"
          sx={{
            fontSize: '1.5rem',
            color: burgundyTheme.palette.primary.main,
            textAlign: 'center',
            mr: 3
          }}
        >
          Введена примерная цветовая гамма сайта. Изменены (возможно непреднамеренно) некоторые кнопки. В качестве кнопки "домой" советуем использовать серый прямоугольник в левом верхнем углу. Enjoy!
        </Typography>
      </Box>
    </ThemeProvider>
  );
};

export default Lobby;