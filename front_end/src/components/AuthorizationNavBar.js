import * as React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { styled, useTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar from "@mui/material/AppBar";
import MuiDrawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { AddCircle, ChevronLeft, ChevronRight } from "@mui/icons-material";
import UserMenu from "../components/UserMenu";



const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
  }),
);

const Item = styled(ButtonBase)(({ theme }) => ({
  height: 30,
  width: 30,
  display: "flex",
  justifyContent: "center",
  position: "fixed",
  top: "15%",
  right: 20,
  zIndex: 3,
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

  return (
    <div>
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
