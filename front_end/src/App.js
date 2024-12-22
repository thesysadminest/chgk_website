// App.js

import React from "react";
import NavBar from "./components/NavBar";
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

import Lobby from "./pages/Lobby";
import Registration from "./pages/Registration";
import Question from "./pages/Questions";
import Packs from "./pages/Packs";
import Users from "./pages/Users";

import { ThemeProvider, createTheme } from '@mui/material/styles';
import purpleTheme from "./static/themes/divine_purple"

let dp_theme = createTheme(purpleTheme);

function App() {
    return (
        <ThemeProvider theme={dp_theme}>
            <Router>
                <MainContent/>
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
            <Route path="/registration" element={ <Registration/>}/>
        </Routes>
    );
}


export default App;
