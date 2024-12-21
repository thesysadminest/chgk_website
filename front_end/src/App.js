// App.js

import * as React from "react";
import NavBar from "./components/NavBar";
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { createTheme, alpha, getContrastRatio, ThemeProvider } from '@mui/material/styles';
import { spacing } from '@mui/system';

import Lobby from "./pages/Lobby";
import Question from "./pages/Questions";
import Packs from "./pages/Packs";
import Users from "./pages/Users";

const violetBase = '#7F00FF';
const violetMain = alpha(violetBase, 0.7);

const STEP = 10;

const theme = createTheme({
  palette: {
    violet: {
      main: violetMain,
      light: alpha(violetBase, 0.3),
      dark: alpha(violetBase, 0.9),
      contrastText: getContrastRatio(violetMain, '#fff') > 4.5 ? '#fff' : '#111',
    },
  },

  components: {
      MuiButtonBase: {
          styleOverrides: {
              root: {
                  backgroundColor: violetMain,
                  borderRadius: 10,
                  variants: 
                  [ 
                      {
                         props: 
                          { variant: 'accent' }, 
                          style: ({ theme }) => ({ 
                              backgroundColor: theme.palette.violet.light, 
                          }) 
                      }, 
                      { 
                          props: 
                      { variant: 'default' }, 
                      }, 
                  ]
              }
          }
      }
  },
});


export {theme};

function App() {
    return (
        <ThemeProvider theme={theme}>
            <Router>
                <MainContent />
            </Router>
        </ThemeProvider>
    );
}

function MainContent() {
    const location = useLocation();

    return (
        <Routes>
            <Route path="/" element={<Lobby />} />
            <Route path="/packs" element={<><NavBar selected={location.pathname}/> <Packs/> </>} />
            <Route path="/users" element={<><NavBar selected={location.pathname}/> <Users/> </>} />
            <Route path="/questions" element={<><NavBar selected={location.pathname}/> <Question/> </>} />
        </Routes>
    );
}

export default App;
