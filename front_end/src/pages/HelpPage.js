import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import axios from "axios";
import { useTheme } from "@mui/material/styles";
import { Link } from "react-router-dom";

const HelpPage = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (error) {
    return (
      <Box sx={{ textAlign: "center", p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center"
         sx={{height: `calc(100vh - ${theme.drawers.drawerHeight}px - 8*16px)`,
             maxHeight: `calc(100vh - ${theme.drawers.drawerHeight}px - 8*16px)`}}
    >
    <Box
      sx={{
        width: "60vw",
        maxHeight: "inherit",
        overflowY: "auto",
        mx: "auto",
        p: 4,
        backgroundColor: theme.palette.background.window,
        borderRadius: 6,
        boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
      }}
    >
      <Typography variant="h4" sx={{ mb: 3, color: theme.palette.primary.main, fontWeight: 'bold', textAlign: "center" }}>
        Правила сайта
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography 
          variant="h6" 
          component={Link} 
          to="/help/about" 
          sx={{
            color: theme.palette.text.dark,
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline'
            }
          }}
        >
          1. О нас
        </Typography>
        
        <Typography 
          variant="h6" 
          component={Link} 
          to="/help/what-is-chgk" 
          sx={{ 
            color: theme.palette.text.dark,
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline'
            }
          }}
        >
          2. Об игре "Что? Где? Когда?"
        </Typography>
        
        <Typography 
          variant="h6" 
          component={Link} 
          to="/help/basic-rules" 
          sx={{ 
            color: theme.palette.text.dark,
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline'
            }
          }}
        >
          3. Правила базового режима
        </Typography>
        
        <Typography 
          variant="h6" 
          component={Link} 
          to="/help/game-mode-rules" 
          sx={{ 
            color: theme.palette.text.dark,
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline'
            }
          }}
        >
          4. Правила игрового режима
        </Typography>
        
        <Typography 
          variant="h6" 
          component={Link} 
          to="/help/faq" 
          sx={{ 
            color: theme.palette.text.dark, 
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline'
            }
          }}
        >
          5. Часто задаваемые вопросы
        </Typography>
      </Box>
    </Box>
          </Box>
  );
};

export default HelpPage;
