import react from "react"
import { BrowserRouter, Routes, Route, Navigation } from "react-router-dom"

import Home from "./pages/Home"
function App() {
  return (
      <BrowserRouter>
          <Routes>
              <Route path="/home" element={<Home/>}/>
          </Routes>
      </BrowserRouter>
  );
}

export default App;
