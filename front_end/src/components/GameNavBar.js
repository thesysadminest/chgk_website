import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Box, Button, Typography, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Close, Person } from "@mui/icons-material";
import { checkAuth, getUserData } from "../utils/AuthUtils";
import QuitGame from "./QuitGame";

const GameNavBar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null
  });
  const [quitDialogOpen, setQuitDialogOpen] = useState(false);

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

  const handleOpenQuitDialog = () => {
    setQuitDialogOpen(true);
  };

  const handleCloseQuitDialog = () => {
    setQuitDialogOpen(false);
  };

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          backgroundColor: theme.palette.background.main, 
          boxShadow: "none", 
          zIndex: theme.zIndex.drawer,
          overflow: "hidden"
        }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <IconButton
            onClick={handleOpenQuitDialog}
            sx={{
              color: theme.palette.text.primary,
              zIndex: theme.zIndex.drawer + 5,
            }}
          >
            <Close fontSize="large" />
          </IconButton>

          {authState.isAuthenticated && (
            <Box sx={{ 
              display: "flex", 
              alignItems: "center",
              gap: 1,
              color: theme.palette.text.white4
            }}>
              <Typography variant='h6'>
                  Вы играете как {authState.user?.username}         
              </Typography>
              <Person sx={{ color: theme.palette.default.white4 }} />
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <QuitGame 
        open={quitDialogOpen}
        onClose={handleCloseQuitDialog}
      />
    </>
  );
};

export default GameNavBar;