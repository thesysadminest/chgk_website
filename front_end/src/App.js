import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Routes, Route, useLocation } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import darkTheme from "./themes/appereance.js";

import NewsPage from './pages/NewsPage';
import LobbyNavBar from './components/LobbyNavBar';
import NavBar from './components/NavBar';
import Lobby from './pages/Lobby';
import Question from './pages/Questions';
import Packs from './pages/Packs';
import Users from './pages/Users';
import MyProfile from './pages/MyProfile';
import Registration from './pages/Registration';
import Login from './pages/Login';
import QuestionDetail from './pages/QuestionDetail';
import PackDetail from './pages/PackDetail';
import AddQuestion from './pages/AddQuestion';
import AddPack from './pages/AddPack';
import UserDetail from './pages/UserDetail';
import PackAddQuestion from './pages/PackAddQuestion';

import GameMain from './pages/GameMain';
import GameRedirect from './components/GameRedirect';

function MainContent() {
    const location = useLocation();
    const isLobby = location.pathname === '/';

    if (isLobby) 
        return (
            <>
            <LobbyNavBar />
                <Routes>
                    <Route path="/" element={<Lobby />} />
                    <Route path="/" element={<NewsPage />} />
                </Routes>
            </>
        );
    else
    return (
        <NavBar selected={location.pathname}>

            <Routes>
                <Route path="/" element={<Lobby />} />
                <Route path="/" element={<NewsPage />} />
                <Route path="/packs" element={<Packs />} />
                <Route path="/pack/:id" element={<PackDetail />} />
                <Route path="/users" element={<Users />} />
                <Route path="/user/:id" element={<UserDetail />} />
                <Route path="/questions" element={<Question />} />
                <Route path="/question/:id" element={<QuestionDetail />} />
                <Route path="/add-question" element={<AddQuestion />} />
                <Route path="/add-pack" element={<AddPack />} />
                <Route path="/registration" element={<Registration />} />
                <Route path="/login" element={<Login />} />
                <Route path="/add-pack/add-question" element={<PackAddQuestion />} />
                <Route path="/myprofile" element={<MyProfile />} />
                <Route path="/game/:id" element={<GameRedirect />} />
                <Route path="/game/:id/:firstQuestionId" element={<GameMain />} />
            </Routes>
        </NavBar>
    );
}

let dark_theme = createTheme(darkTheme);

function App() {
    return (
        <ThemeProvider theme={dark_theme}>
            <Router>
                <MainContent />
            </Router>
        </ThemeProvider>
    );
}

export default App;
