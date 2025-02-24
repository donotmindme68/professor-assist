import {BrowserRouter as Router, Navigate, Route, Routes} from "react-router-dom";
import {ThemeToggle} from "./components/theme-toggle";
import AuthWrapper from "@/pages/auth-screen.tsx";
import React from "react";
import Home from "@/pages/home.tsx";


function App() {
  return (
    <Router>
      <div className="w-[100vw] h-[100vh] bg-background transition-colors duration-300">
        <ThemeToggle/>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/auth" element={<AuthWrapper/>}/>
          <Route path="*" element={<Navigate to="/"/>}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
