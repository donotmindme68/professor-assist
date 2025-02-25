import {BrowserRouter as Router, Navigate, Route, Routes} from "react-router-dom";
import AuthWrapper from "@/pages/AuthPage.tsx";
import React from "react";
import DashboardPage from "@/pages/DashboardPage.tsx";
import NotFound from "@/pages/NotFound.tsx";
import WelcomePage from "@/pages/WelcomePage.tsx";


function App() {
  return (
    <Router>
      <div className="w-[100vw] h-[100vh]">
        <Routes>
          <Route path="/dashboard" element={<DashboardPage/>}/>
          <Route path="/auth" element={<AuthWrapper/>}/>
          <Route path="/" element={<WelcomePage/>}/>
          <Route path="*" element={<NotFound/>}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
