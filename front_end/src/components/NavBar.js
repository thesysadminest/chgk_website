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
import { AddCircle, ChevronLeft, ChevronRight, HelpOutline, PlayArrow } from "@mui/icons-material";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import { checkAuth } from "../utils/AuthUtils";

const NewGame = React.lazy(() => import ("../components/NewGame"));
const UserMenu = React.lazy(() => import ("../components/UserMenu"));

const drawerWidth = 240;
const drawerHeight = 63.8;

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

const PlayButtonContainer = styled(Box, { shouldForwardProp: (prop) => prop !== "open" })
(({ theme, open }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: theme.spacing(1),
  padding: theme.spacing(2),
  
  transition: theme.transitions.create(['padding'], {
    duration: theme.transitions.duration.standard,
    easing: theme.transitions.easing.easeInOut
  }),
  
  ...(open && { 
    padding: theme.spacing(2),
  }),
  ...(!open && {
    padding: theme.spacing(1),
  }),
}),
);

const PlayButton = styled(Button)(({ theme }) => ({
  width: "100%",
  fontSize: "1.4rem",
  fontWeight: "bold",
  minWidth: "auto",
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
    const toolbar = document.getElementById("toolbar");
    const mainbox = document.getElementById("mainbox");
    if (toolbar && mainbox) {
      mainbox.style.marginTop = window.getComputedStyle(toolbar).height;
    }
    
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
  
  const drawerEvent = new CustomEvent('drawerEvent', {
    detail: { open: !open } 
  });

  const handleDrawerToggle = () => {
    document.getElementById('drawer').dispatchEvent(drawerEvent);
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
    case 5: return <img src="/rating_w.png" alt="rating" style={{ width: size, height: size }} />;
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
    case "/myteams": return "Мои команды";
    case "/rating": return "Рейтинг";
    case "/invitations": return "Мои приглашения"
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
    <div>
      <SetPageTitle />
      <Box
        sx={{
          display: "flex",
          filter: gameModalOpen ? 'blur(2px)' : 'none',
          transition: 'filter 0.3s ease'}}>
        <CssBaseline />

        <Modal
          open={gameModalOpen}
          onClose={handleCloseGameModal}
          aria-labelledby="new-game-modal"
          aria-describedby="new-game-modal-description"
        >
          <React.Suspense fallback={<div>Загрузка...</div>}>
            <NewGame onClose={handleCloseGameModal} />
          </React.Suspense>
        </Modal>

        {gameModalOpen && (
          <Box sx={{
                 zIndex: theme.zIndex.modal - 1
               }} />
        )}

        <Drawer variant="permanent" id="drawer" open={open}>
          <PlayButtonContainer open={open}>
            <img 
              src="/arrow.png" 
              alt="Логотип"
              style={{
                transition: 'width 0.3s ease',
                width: open ? "80%" : "95%", 
                maxWidth: "180px",
                marginBottom: "16px", 
              }} 
            />
            <PlayButton 
              variant="lightRed" 
              onClick={handlePlayClick}
            >
              <Box sx={{height: "36px", width: "0"}}/>
              <Typography variant="h5"
                          sx={{
                            position: 'absolute',
                            opacity: open ? 1 : 0,
                            transition: 'opacity 0.3s ease',
                          }}
              >
                Играть
              </Typography>

              <PlayArrow
                sx={{
                  position: 'absolute',
                  opacity: !open ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                }}
              />

              
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
              ["Рейтинг", "/rating", 5],
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
                    variant = {isActive ? "red" : "grey"}
                    sx={{
                      justifyContent: open ? "initial" : "center",
                      px: 2.5,
                      minWidth: open ? drawerWidth - 30 : `calc(${theme.spacing(4)} + 1px)`,
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

          <BottomButtonsContainer sx={{zIndex: 1200}}>
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
            height: `${drawerHeight}px`,
          }}>
          <Toolbar id="toolbar">
            <Typography variant="h5" noWrap component="div" sx={{ flexGrow: 1, pl: 2 }}>
              {resolvePageName()}
              
            </Typography>
            <React.Suspense fallback={<div>Загрузка...</div>}>
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
            overflow: "hidden",
          }}>
          {children}
        </Box>
      </Box>
    </div>
  );
}
