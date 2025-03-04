import {BrowserRouter as Router, Navigate, Route, Routes} from "react-router-dom";
import AuthWrapper from "@/pages/AuthPage.tsx";
import React from "react";
import DashboardPage from "@/pages/DashboardPage.tsx";
import NotFound from "@/pages/NotFound.tsx";
import WelcomePage from "@/pages/WelcomePage.tsx";
import {LoadPreferences} from "@/components/LoadPreferences.tsx";
import {ContentsPage} from "@/pages/ContentsPage.tsx";


function App() {
  return (
    <Router>
      <div className="w-[100vw] h-[100vh]">
        <LoadPreferences/>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage/>}/>
          <Route path="/auth" element={<AuthWrapper/>}/>
          <Route path="/contents/:contentId" element={<ContentsPage/>}/>
          <Route path="/" element={<WelcomePage/>}/>
          <Route path="*" element={<NotFound/>}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
