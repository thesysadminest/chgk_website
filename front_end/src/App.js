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
import Authorization from "./pages/Authorization";
import QuestionDetail from './pages/QuestionDetail';
import PackDetail from './pages/PackDetail';
import AddQuestion from './pages/AddQuestion';
import AddPack from './pages/AddPack';
import UserDetail from './pages/UserDetail';

// I AM AN INTRUDER!!! DELETE ME IF YOU DON'T WANT ME HERE
//import GameMain from './pages/GameMain';
//import GameRedirect from "./components/GameRedirect";

import burgundyTheme from "./themes/appereance.js";
let dp_theme = createTheme(burgundyTheme);

function MainContent() {
    const location = useLocation();

    return (
        <NavBar selected={location.pathname}>
        
            <Routes>
                <Route path="/" element={<Lobby />} />
                <Route path="/packs" element={<Packs />} />
                <Route path="/pack/:id" element={<PackDetail />} />
                <Route path="/users" element={<Users />} />
                <Route path="/questions" element={<Question />} />
                <Route path="/question/:id" element={<QuestionDetail />} />
                <Route path="/add-question" element={<AddQuestion />} />
                <Route path="/add-pack" element={<AddPack />} />
                <Route path="/user/:id" element={<UserDetail />} />
                <Route path="/authorization" element={<Authorization />} />
                
                


            </Routes>
            {console.log("Current pathname:", window.location.pathname)}

           
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
