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
import { AddCircle, ChevronLeft, ChevronRight, HelpOutline } from "@mui/icons-material";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import { checkAuth } from "../utils/AuthUtils";

const NewGame = React.lazy(() => import ("../components/NewGame"));
const UserMenu = React.lazy(() => import ("../components/UserMenu"));

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowY: "hidden",
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowY: "hidden",
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  marginLeft: `calc(${theme.spacing(8)} + 1px)`,
  width: `calc(100% - ${theme.spacing(8)} - 1px)`,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    ...(open && {
      ...openedMixin(theme),
      "& .MuiDrawer-paper": openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      "& .MuiDrawer-paper": closedMixin(theme),
    }),
  }),
);

const Item = styled(ButtonBase)(({ theme }) => ({
  height: 30,
  width: 30,
  display: "flex",
  justifyContent: "center",
  position: "absolute",
  top: "15%",
  right: 20,
  zIndex: 3,
}));

const PlayButtonContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1),
}));

const PlayButton = styled(Button)(({ theme }) => ({
  width: "100%",
  fontSize: "1.4rem",
  fontWeight: "bold",
}));

const BottomButtonsContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  display: 'flex',
  gap: theme.spacing(1),
}));

const RoundIconButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.primary.menu,
  color: theme.palette.text.light,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const UserGreeting = styled(Typography)(({ theme }) => ({
  marginLeft: theme.spacing(2),
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));

export default function NavBar({ children }) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);
  const [gameModalOpen, setGameModalOpen] = React.useState(false);
  const [authState, setAuthState] = React.useState({
    isAuthenticated: false,
    user: null,
    isLoading: true
  });
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const verifyAuth = async () => {
      try {
        const { isAuthorized, user } = await checkAuth();
        setAuthState({
          isAuthenticated: isAuthorized,
          user: isAuthorized ? user : null,
          isLoading: false
        });
      } catch (error) {
        console.error("Auth check error:", error);
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false
        });
      }
    };

    verifyAuth();
  }, []);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleAddQuestionClick = (event) => {
    event.stopPropagation();
    navigate("/add-question");
  };

  const handleAddPackClick = (event) => {
    event.stopPropagation();
    navigate("/add-pack");
  };

  const handlePlayClick = () => {
    setGameModalOpen(true); 
  };

  const handleCloseGameModal = () => {
    setGameModalOpen(false);
  };

  const handleHelpClick = () => {
    navigate("/help");
  };

  const renderIcon = (index) => {
    const size = 28;
    switch (index) {
      case 0: return <img src="/question_w.ico" alt="question" style={{ width: size, height: size }} />;
      case 1: return <img src="/bag_w.ico" alt="bag" style={{ width: size, height: size }} />;
      case 2: return <img src="/user_w.ico" alt="user" style={{ width: size, height: size }} />;
      case 3: return <img src="/team_w.ico" alt="team" style={{ width: size, height: size }} />;
      case 4: return <img src="/home_w.ico" alt="home" style={{ width: size, height: size }} />;
      default: return null;
    }
  };

  const resolvePageName = () => {
    const path = location.pathname;
    if (/^\/question\/\d+$/.test(path)) return "Внимание, вопрос";
    if (/^\/pack\/\d+$/.test(path)) return "Внимание, пакет";
    if (/^\/user\/\d+$/.test(path)) return "Информация о пользователе";
    if (/^\/team\/\d+$/.test(path)) return "Информация о команде";

    switch (path) {
      case "/news": return "Главная";
      case "/questions": return "Вопросы";
      case "/packs": return "Пакеты";
      case "/users": return "Пользователи";
      case "/teams": return "Команды";
      case "/add-question": return "Добавить вопрос";
      case "/add-pack": return "Добавить пак";
      case "/add-pack/add-question": return "Добавить пак";
      case "/myprofile": return "Мой профиль";
      default: return "";
    }
  };

  return (
    <div>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />

        <Modal
          open={gameModalOpen}
          onClose={handleCloseGameModal}
          aria-labelledby="new-game-modal"
          aria-describedby="new-game-modal-description"
        >
         <React.Suspense fallback={<div>Loading...</div>}>
            <NewGame onClose={handleCloseGameModal} />
          </React.Suspense>
        </Modal>

        {gameModalOpen && (
          <Box sx={{
            zIndex: theme.zIndex.modal - 1
          }} />
        )}

        <Drawer variant="permanent" open={open}>
          <PlayButtonContainer>
            <img 
              src="/arrow.png" 
              alt="Логотип" 
              style={{ 
                width: "80%", 
                maxWidth: "180px",
                marginBottom: "16px" 
              }} 
            />
            <PlayButton 
              variant="contained" 
              color="secondary"
              onClick={handlePlayClick}
            >
              Играть
            </PlayButton>
          </PlayButtonContainer>

          <Divider />

          <List sx={{ zIndex: theme.zIndex.drawer }}>
            {[
              ["Главная", "/news", 4],
              ["Вопросы", "/questions", 0],
              ["Пакеты", "/packs", 1],
              ["Пользователи", "/users", 2],
              ["Команды", "/teams", 3],
            ].map(([text, path, iconIndex]) => {
              const isActive = location.pathname === path;
              return (
                <ListItem disablePadding key={text} sx={{ 
                  display: "block", 
                  position: "relative", 
                  pt: 0, 
                  pb: 0.5, 
                  pr: 1, 
                  pl: 1 
                }}>
                  <ListItemButton
                      component={Link}
                      to={path}
                      className={isActive ? "MuiListItemButton-red" : "MuiListItemButton-grey"}
                      sx={{
                        justifyContent: open ? "initial" : "center",
                        px: 2.5,
                        minWidth: open ? drawerWidth - 30 : `calc(${theme.spacing(4)} + 1px)`,
                        '&.MuiListItemButton-red': {
                          color: theme.palette.text.primary,
                        },
                        '&.MuiListItemButton-grey': {
                          color: theme.palette.primary.contrastText,
                        },
                      }}
                  >
                        <ListItemIcon
                          sx={{
                            ml: 1,
                            minWidth: open ? "auto" : `calc(100% - 8px)`,
                            justifyContent: "left",
                          }}
                        >
                          {renderIcon(iconIndex)}
                        </ListItemIcon>
                        <ListItemText
                          primary={text}
                          sx={{
                            ml: 1.2,
                            opacity: open ? 1 : 0,
                            whiteSpace: "nowrap",
                          }}
                        />
                  </ListItemButton>
                  {open && text === "Вопросы" && (
                    <Item onClick={handleAddQuestionClick} sx={{ ml: 1.2 }}>
                      <AddCircle/>
                    </Item>
                  )}
                  {open && text === "Пакеты" && (
                    <Item onClick={handleAddPackClick} sx={{ ml: 1.2 }}>
                      <AddCircle/>
                    </Item>
                  )}
                </ListItem>
              );
            })}
          </List>

          <BottomButtonsContainer>
            {open && (
              <>
                <RoundIconButton onClick={handleHelpClick}>
                  <HelpOutline />
                </RoundIconButton>
                <RoundIconButton onClick={handleDrawerToggle}>
                  <ChevronLeft />
                </RoundIconButton>
              </>
            )}
            {!open && (
              <RoundIconButton onClick={handleDrawerToggle}>
                <ChevronRight />
              </RoundIconButton>
            )}
          </BottomButtonsContainer>
        </Drawer>

        <AppBar 
          position="fixed" 
          open={open} 
          sx={{ 
            zIndex: theme.zIndex.drawer + 1, 
            height: "63.8px",
          }}>
          <Toolbar id="toolbar">
            <Typography variant="h5" noWrap component="div" sx={{ flexGrow: 1, pl: 2 }}>
              {resolvePageName()}
              
            </Typography>
            <React.Suspense fallback={<div>Loading...</div>}>
              <UserMenu 
                user={authState.user} 
                onLogout={() => setAuthState(prev => ({...prev, user: null}))} 
              />
            </React.Suspense>
          </Toolbar>
        </AppBar>
         <Box
           id="mainbox"
           component="main"
           sx={{
             flexGrow: 1,
             p: 10,
             pt: 6,
             display: "flex",
             flexDirection: "column",
             height: "100vh",
             overflow: "hidden",
             filter: gameModalOpen ? 'blur(2px)' : 'none',
             transition: 'filter 0.3s ease'
         }}>
            {children}
         </Box>
      </Box>
    </div>
  );
}