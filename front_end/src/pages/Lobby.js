import React from "react";
import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const Lobby = () => {
  const theme = useTheme();

  return (
    <Box 
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Box 
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100vw", 
          height: "100vh", 
          mt: 1,
          overflow: "hidden", 
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Box
          sx={{
            width: "75vw",
            height: "80vh",
            backgroundImage: "url(/big_owl.jpg)", 
            backgroundSize: "100%", // масштаб изображения
            backgroundPosition: "center", 
            borderRadius: "40px",
            boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.5)",
          }}
        ></Box>

        <Box
          sx={{
            textAlign: "left",
            color: theme.palette.primary.contrastText, 
            position: "absolute",
            left: theme.spacing(27), 
            top: theme.spacing(37),
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: "bold",
              fontSize: "4rem",
            }}
          >
            Ваш сайт
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontWeight: "bold",
              fontSize: "4rem",
              ml: theme.spacing(24),
            }}
          >
            для соревнований
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontWeight: "bold",
              fontSize: "4rem",
              ml: theme.spacing(80), 
          }}
          >
            по <span style={{ color: theme.palette.primary.main }}>ЧГК</span>
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: "1.3rem",
              mt: 2,
            }}
          >
            Последние обновления доступны прямо здесь. Узнайте больше!
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Lobby;
