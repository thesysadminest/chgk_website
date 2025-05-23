import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AppBar, Toolbar, Box, Button, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { checkAuth } from "../utils/AuthUtils";
import { Person } from "@mui/icons-material";

const LobbyNavBar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null
  });

  useEffect(() => {
    const verifyAuthentication = async () => {
      try {
        const { isAuthorized, user } = await checkAuth();
        setAuthState({
          isAuthenticated: isAuthorized,
          user: isAuthorized ? user : null
        });
      } catch (error) {
        console.error("Authentication check failed:", error);
        setAuthState({
          isAuthenticated: false,
          user: null
        });
      }
    };

    verifyAuthentication();
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
  };

  const location = useLocation();
  const resolvePageName = () => {
    const path = location.pathname;

    switch (path) {
      case "/": return "ЧГК рейтинг";
      default: return "";
    }
  };

  function SetPageTitle() {
    React.useEffect(() => {
      if (resolvePageName()) document.title = resolvePageName();
      else document.title = "ЧГК рейтинг";
    }, []);
  }

  return (
    <>
    <SetPageTitle />
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

        <Box sx={{ display: "flex", gap: theme.spacing(1.8), mr: 1 }}>
          {authState.isAuthenticated ? (
            <>
              <Button
                onClick={() => handleNavigate("/myprofile")}
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
                }}
              >
                {authState.user?.username || "Профиль"}
                <Person sx={{ ml: 1 }} />
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => handleNavigate("/registration")}
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
                }}
              >
                Регистрация
              </Button>
              <Button
                onClick={() => handleNavigate("/login")}
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
                }}
              >
                Войти
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
      </>
  );
};

export default LobbyNavBar;
