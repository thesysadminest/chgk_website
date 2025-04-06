import React, { useState, useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { useNavigate } from "react-router-dom";

const Lobby = () => {
  const theme = useTheme();
  const navigate = useNavigate(); 
  const [showButton, setShowButton] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const scrollToNext = () => {
    const nextSection = document.getElementById("next-section");
    if (nextSection) {
      const topPosition = nextSection.offsetTop;
      window.scrollTo({
        top: topPosition,
        behavior: "smooth",
      });
    }
  };

  const scrollToTop = () => {
    setIsClicked(true);
    setTimeout(() => {
      setIsClicked(false);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 200);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setShowButton(scrollPosition > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "99vw",
        margin: 0,
        padding: 0,
        overflowX: "hidden",
        backgroundColor: theme.palette.background.default,
        scrollBehavior: "smooth",
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
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Box
          sx={{
            width: "75vw",
            height: "80vh",
            backgroundImage: "url(/big_owl.jpg)",
            backgroundSize: "100%",
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
            Последние обновления доступны прямо здесь.{" "}
            <Button
              onClick={scrollToNext}
              sx={{
                textDecoration: "underline",
                color: theme.palette.text.primary,
                fontSize: "1.3rem",
                padding: 0,
                background: "none",
                minWidth: "auto",
              }}
            >
              Узнать больше
            </Button>
          </Typography>
        </Box>
      </Box>


      <Box
  id="next-section"
  sx={{
    display: "flex",
    flexDirection: "column",
    //justifyContent: "flex-start",
    alignItems: "center",
    width: "100vw",
    height: "100vh",
    padding: theme.spacing(4),
    backgroundColor: theme.palette.background.paper,
    position: "relative", 
  }}
>

  <Box
    sx={{
      width: "265px",
      height: "218px",
      backgroundImage: "url(/arrow.png)",
      backgroundSize: "contain",
      backgroundPosition: "center",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "absolute", 
      zIndex: 1,
      ml: 2,
      mt: 5,
      overflow: "visible",
    }}
  ></Box>

  <Box
    sx={{
      width: "62vw",
      height: "50vh",
      backgroundImage: "url(/birds.png)",
      backgroundSize: "95%",
      backgroundPosition: "center",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "relative", 
      zIndex: 2,
      marginBottom: 6.3,
    }}
  ></Box>

  <Typography
    variant="h4"
    sx={{
      color: theme.palette.text.primary,
      fontWeight: "bold",
      marginBottom: theme.spacing(0),
    }}
  >
    ЧГК Рейтинг
  </Typography>

  <Typography
    variant="body1"
    sx={{
      textAlign: "center",
      marginBottom: theme.spacing(1),
      color: theme.palette.text.secondary,
    }}
  >
    “Что? Где? Когда?” — советская и российская интеллектуальная игра. <br />
    Интеллектуальный клуб телевидения «знатоков».
  </Typography>

  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: theme.spacing(2.5),
      justifyItems: "center",
      marginBottom: 10.5,
    }}
  >
    {["СОСТАВЛЯЙТЕ СВОИ ВОПРОСЫ", 
    "СОЗДАВАЙТЕ ПАКЕТЫ", 
    "СОРЕВНУЙТЕСЬ", 
    "ИЩИТЕ КОМАНДЫ"].map((text, idx) => (
      <Box
        key={idx}
        onClick={() => navigate("/login")}
        sx={{
          width: "13vw",
          height: "13vh",
          display: "flex",
          justifyContent: "center",
          padding: 1,
          alignItems: "center",
          borderRadius: "20px",
          boxShadow: "-4px 7px 0px 0px rgba(154, 14, 14, 1)",
          backgroundColor: theme.palette.background.light,
          cursor: "pointer",
        }}
      >
        <Typography
          variant="body1"
          sx={{
            fontSize: "1rem",
            textAlign: "center",
            padding: theme.spacing(2),
            color: theme.palette.text.primary,
            fontWeight: "bold",
          }}
        >
          {text}
        </Typography>
      </Box>
    ))}
  </Box>
</Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100vw",
          height: "100vh",
          padding: theme.spacing(4),
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Typography
          variant="h3"
          sx={{
            color: theme.palette.primary.main,
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          Третий экран
        </Typography>
        <Typography
          variant="body1"
          sx={{
            textAlign: "center",
            marginTop: theme.spacing(2),
            color: theme.palette.text.primary,
          }}
        >
          Добро пожаловать на третий экран! Здесь может быть ваш контент.
        </Typography>
      </Box>

      <Box
        onClick={scrollToTop}
        sx={{
          position: "fixed",
          bottom: theme.spacing(4),
          right: theme.spacing(4),
          width: "50px",
          height: "50px",
          backgroundColor: showButton
            ? isClicked
              ? theme.palette.text.disabled
              : theme.palette.common.white
            : theme.palette.text.disabled,
          borderRadius: "50%",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          zIndex: 1000,
        }}
      >
        <ArrowUpwardIcon
          sx={{
            color: theme.palette.primary.main,
            fontSize: "24px",
          }}
        />
      </Box>
    </Box>
  );
};

export default Lobby;
