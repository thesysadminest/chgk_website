import React, { useState, useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { useNavigate } from "react-router-dom";

const Lobby = () => {
  const theme = useTheme();
  const navigate = useNavigate(); 
  const [showButton, setShowButton] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [activeBox, setActiveBox] = useState(null);

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

  const handleBoxClick = (index) => {
    setActiveBox(index);
    setTimeout(() => {
      navigate("/login");
    }, 200);
  };

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        marginTop: 1.2,
        padding: 0,
        overflow: "hidden",
        backgroundColor: theme.palette.background.default,
        scrollBehavior: "smooth",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
      }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "1380px",
            height: "680px",
            backgroundColor: theme.palette.background.default,
          }}>
          <Box
            sx={{
              width: "1040px",
              height: "550px",
              backgroundImage: "url(/big_owl.jpg)",
              backgroundSize: "100%",
              backgroundPosition: "center",
              borderRadius: "40px",
              boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.5)",
            }}/>
          <Box
            sx={{
              textAlign: "left",
              color: theme.palette.primary.contrastText,
              position: "absolute",
              // left: theme.spacing(27),
              top: theme.spacing(37),
            }}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: "bold",
                  fontSize: "4rem",
               }}>
                  Ваш сайт
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: "bold",
                  fontSize: "4rem",
                  ml: theme.spacing(24),
                }}>
                  для соревнований
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: "bold",
                  fontSize: "4rem",
                  ml: theme.spacing(80),
                }}>
                  по <span style={{ color: theme.palette.primary.main }}>ЧГК</span>
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: "1.3rem",
                  mt: 2,
                }}>
                  Последние обновления доступны прямо здесь.{" "}
                  <Button
                    onClick={scrollToNext}
                    sx={{
                      textDecoration: "underline",
                      color: theme.palette.text.primary,
                      fontSize: "1.3rem",
                      minWidth: "auto",
                    }}>
                      Узнать больше
                  </Button>
               </Typography>
        </Box>
    </Box>

    {/*второй экран*/}
    <Box
      id="next-section"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "1380px",
        height: "680px",
        overflow: "hidden",
        padding: 0,
        backgroundColor: theme.palette.background.paper,
        position: "relative", 
      }}>
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
            mb: 42,
          }}/>
        <Box
          sx={{
            width: "925px",
            height: "260px",
            backgroundImage: "url(/birds.png)",
            backgroundSize: "95%",
            backgroundPosition: "center",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative", 
            zIndex: 2,
            marginBottom: 4,
            marginTop: 0.5,
          }}/>
        <Typography
          variant="h4"
          sx={{
            color: theme.palette.text.primary,
            fontWeight: "bold",
            marginBottom: theme.spacing(0),
          }}>
            ЧГК Рейтинг
        </Typography>
        <Typography
          variant="body1"
          sx={{
            textAlign: "center",
            marginBottom: theme.spacing(1),
            color: theme.palette.text.secondary,
          }}>
            "Что? Где? Когда?" — советская и российская интеллектуальная игра. <br />
            Интеллектуальный клуб телевидения «знатоков».
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: theme.spacing(2.5),
            marginBottom: theme.spacing(8),
            justifyItems: "center",
          }}>
            {["СОСТАВЛЯЙТЕ СВОИ ВОПРОСЫ", 
            "СОЗДАВАЙТЕ ПАКЕТЫ", 
            "СОРЕВНУЙТЕСЬ", 
            "ИЩИТЕ КОМАНДЫ"].map((text, idx) => (
              <Box
                className = {`lobbybtn${idx}`}
                key={idx}
                onClick={() => handleBoxClick(idx)}
                sx={{
                  width: "200px",
                  height: "100px",
                  display: "flex",
                  justifyContent: "center",
                  padding: 0,
                  alignItems: "center",
                  borderRadius: "20px",
                  boxShadow: "none",
                  backgroundColor: activeBox === idx ? 
                    theme.palette.primary.light : 
                    theme.palette.background.light,
                  cursor: "pointer",
                  
                  boxShadow: "0px 0px 0px 0px rgba(154, 14, 14, 1)",
                  transition: theme => `
                    background-color 0.3s ease,
                    box-shadow ${theme.transitions.duration.shortest}ms ease-in-out
                  `,
                  "&:hover": {
                    boxShadow: "-4px 7px 0px 0px rgba(154, 14, 14, 1)",
                  },
                  "&:active": {
                    backgroundColor: theme.palette.primary.light,
                  },
                }}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: "1rem",
                      textAlign: "center",
                      color: theme.palette.text.primary,
                      fontWeight: "bold",
                      [`.lobbybtn${idx}:active &`]: {
                        color: theme.palette.text.gray,
                      },
                    }}>
                      {text}
                  </Typography>
              </Box> 
            ))}
        </Box>
    </Box>

    {/*третий экран*/}
    <Box
      sx={{
        display: "flex",
        justifyContent: "left",
        alignItems: "center",
        width: "1380px",
        height: "540px",
        overflow: "hidden", 
        backgroundColor: theme.palette.background.default,
        marginLeft: 9,
        marginBottom: 5,
      }}>
      <Box
        sx={{
          width: "600px",
          height: "520px",
          backgroundImage: "url(/side_owl.jpg)",
          backgroundSize: "95%",
          borderRadius: "40px",
          boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.5)",
          backgroundPosition: "left",
          display: "flex",
          justifyContent: "left",
          position: "relative",
          zIndex: 2,
        }}/>
      <Box
        sx={{
          color: theme.palette.primary.contrastText,
          ml: 5, 
          width: "40%", 
        }}>
          <Typography
            variant="h6"
            sx={{
              fontSize: "1.5rem",
              textAlign: "left",
              mb: 8,
            }}>
              ЧГК - это не только интеллектуальное соревнование, но и увлечение, развивающее командный дух. <br />
              Найдите себя и своих друзей в нашем коммьюнити сегодня!
          </Typography>
          <Button
            onClick={() => navigate("/login")}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              fontSize: "2.4rem",
              width: "450px",
              height: "80px",
              borderRadius: "50px",
              marginBottom: 8,
              zIndex: 4,
              "&:hover": {
                backgroundColor: theme.palette.primary.hover,
              },
              borderRadius: theme.components?.MuiButton?.styleOverrides?.root?.borderRadius || 10,
            }}>
              Попробовать
          </Button>
      </Box>
    </Box>


    {/*стрелка*/}
    <Box
      onClick={scrollToTop}
      sx={{
        position: "fixed",
        bottom: theme.spacing(4),
        right: theme.spacing(4),
        width: "50px",
        height: "50px",
        backgroundColor: showButton ? isClicked ? theme.palette.text.disabled : theme.palette.common.white : theme.palette.text.disabled,
        borderRadius: "50%",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
        zIndex: 10,
      }}>
        <ArrowUpwardIcon
          sx={{
            color: theme.palette.primary.main,
            fontSize: "24px",
          }}/>
    </Box>
  </Box> );
  
  };

export default Lobby;
