import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Box, Button, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { checkAuth } from "../utils/authCheck";
import UserMenu from "../components/UserMenu";
import { Person } from "@mui/icons-material";

const LobbyNavBar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { isAuthorized } = await checkAuth();
        setIsAuthenticated(isAuthorized);
      } catch (error) {
        console.error("Ошибка проверки авторизации:", error);
      } 
    };
    initializeAuth();
  }, []);
  
  let user;
  if (isAuthenticated) {
    try {
      user = JSON.parse(localStorage.getItem("user")) || { username: null, id: null };
    } catch (e) {
      console.error("Error parsing user data from localStorage:", e);
      user = { username: null, id: null };
    }
  }

  
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
        boxShadow: "none", 
        zIndex: theme.zIndex.drawer + 1,
        overflow: "hidden",
      }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: theme.palette.text.primary,
              cursor: "pointer",
              margin: 1,
            }}
            onClick={() => handleNavigate("/")}
            >
              CHGK Site
          </Typography>
          <Box sx={{ display: "flex", gap: theme.spacing(1.8) , mr: 1}}>
          {(isAuthenticated ?
            [[user.username, "/myprofile"]]
            :
            [
              ["Регистрация", "/registration"], 
              ["Войти", "/login"], 
            ]
          ).map((text, index) => {
            return (
            <Button
              onClick={() => handleNavigate(`${text[1]}`)}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                textTransform: "none",
                fontWeight: "bold",
                width: "120px",
                height: "35px",
                "&:hover": {
                  backgroundColor: theme.palette.primary.hover,
                },
                borderRadius: theme.components?.MuiButton?.styleOverrides?.root?.borderRadius || 10,
              }}>
                {text[0]}
                {isAuthenticated ? <Person sx={{ ml: 1 }} /> : null}
                
            </Button>
            );
          })}
          </Box>
        </Toolbar>
    </AppBar>
  );
};

export default LobbyNavBar;
