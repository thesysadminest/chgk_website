import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Routes, Route, useLocation } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import darkTheme from "./themes/appereance.js";

import LobbyNavBar from './components/LobbyNavBar';
import AuthorizationNavBar from './components/AuthorizationNavBar';
import NavBar from './components/NavBar';

import Lobby from './pages/Lobby';
import NewsPage from './pages/NewsPage';
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
import GameMain from './pages/GameMain';
import GameRedirect from './components/GameRedirect.js';

function MainContent() {
    const location = useLocation();
    const isLobby = location.pathname === '/';
    const isAuthorization = (location.pathname === '/registration' || location.pathname === '/login');
    
    if (isLobby) 
        return (
          <>
            <LobbyNavBar />
            <Routes>
              <Route path="/" element={<Lobby />} />
            </Routes>
          </>
        );
    else if (isAuthorization)
        return (
            <>
            <AuthorizationNavBar>
                <Routes>
                    <Route path='/registration' element={<Registration />} />
                    <Route path='/login' element={<Login />} />
                </Routes>
            </AuthorizationNavBar>
            </>
        );
    else return (
        <NavBar selected={location.pathname}>

            <Routes>
                <Route path="/" element={<Lobby />} />
                <Route path="/" element={<NewsPage />} />
                <Route path="/packs" element={<Packs />} />
                <Route path="/pack/:id" element={<PackDetail />} />
                <Route path="/pack/:id/question/:id" element={<QuestionDetail />} />
                <Route path="/users" element={<Users />} />
                <Route path="/user/:id" element={<UserDetail />} />
                <Route path="/questions" element={<Question />} />
                <Route path="/question/:id" element={<QuestionDetail />} />
                <Route path="/add-question" element={<AddQuestion />} />
                <Route path="/add-pack" element={<AddPack />} />
                <Route path="/registration" element={<Registration />} />
                <Route path="/login" element={<Login />} />
                <Route path="/myprofile" element={<MyProfile />} />
                <Route path="/game/:pack_id/" element={<GameRedirect />} />
                <Route path="/game/:pack_id/questions/:firstQuestionId" element={<GameMain />} />
                
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
