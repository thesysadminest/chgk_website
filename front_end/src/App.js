import React from "react";
import NavBar from "./components/NavBar.js";
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import Lobby from "./pages/Lobby";
import Question from "./pages/Questions";
import Packs from "./pages/Packs";
import Users from "./pages/Users";
import Me from "./pages/Me";
import User from "./components/User";
import Registration from "./pages/Registration";
import QuestionDetail from './pages/QuestionDetail';

import purpleTheme from "./themes/appereance.js";
let dp_theme = createTheme(purpleTheme);

function MainContent() {
    const location = useLocation();

    return (
        <NavBar selected={location.pathname}>
        
            <Routes>
                <Route path="/" element={<Lobby />} />
                <Route path="/packs" element={<Packs />} />
                <Route path="/users" element={<Users />} />
                <Route path="/questions" element={<Question />} />
                <Route path="/question/:id" element={<QuestionDetail />} />
                <Route path="/me" element={<Me />} />
            </Routes>
           
        </NavBar>
    );
}

function App() {
    return (
        <ThemeProvider theme={dp_theme}>
            <Router>
                <MainContent />
            </Router>
        </ThemeProvider>
    );
}

export default App;
