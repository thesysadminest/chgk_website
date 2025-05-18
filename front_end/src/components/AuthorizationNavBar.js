import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { styled, useTheme } from "@mui/material/styles";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";


const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
}));


export default function NavBar({ children }) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);
  const fontSize = "2vh";
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthorization = (location.pathname === "/registration" || location.pathname === "/login");

  React.useEffect(() => {
    const toolbar = document.getElementById("toolbar");
    const mainbox = document.getElementById("mainbox");
    if (toolbar && mainbox) {
      mainbox.style.marginTop = window.getComputedStyle(toolbar).height;
    }
  }, []);

  const resolvePageName = () => {
    const path = location.pathname;

    switch (path) {
    case "/registration":
      return "Регистрация";
    case "/login":
      return "Вход";
    }
  };

  function SetPageTitle() {
    React.useEffect(() => {
      if (resolvePageName()) document.title = resolvePageName();
      else document.title = "ЧГК рейтинг";
    }, []);
  }

  return (
    <div>
      <SetPageTitle />
      <Box sx={{ display: "flex", width: "100vw", mb: 0 }}>
        <AppBar 
          position="fixed" 
          open={open} 
          sx={{ 
            zIndex: theme.zIndex.drawer + 1, 
          }}>
          <Toolbar id="toolbar">
            <Typography variant="h5" noWrap component="div" sx={{ flexGrow: 1, pl: 2 }}>
              {resolvePageName()}
            </Typography>
          </Toolbar>
        </AppBar>
        <Box
          id="mainbox"
          component="main"
          sx={{mt: 0}}>
          {children}
        </Box>
      </Box>
    </div>
  );
}
