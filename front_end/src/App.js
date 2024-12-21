// Filename - App.js

import React from "react";
import Navbar from "./components/Navbar";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import Packs from "./pages/Packs";
import Users from "./pages/Users";
import Question from "./pages/Questions";

function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/packs" element={<Packs />} />
                <Route path="/users" element={<Users />} />
                <Route path="/qs" element={<Question />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;