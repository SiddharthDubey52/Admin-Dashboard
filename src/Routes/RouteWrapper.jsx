import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// Current components
import AdminLog from "../component/Admin/Ad-Login/AdminLog";

// Future components (uncomment when ready)
import Home from "../pages/Home";
import About from "../pages/About";
import TrainerLogin from "../component/Trainers/TrainerLogin/TrainerLogin";
import AddTrainer from "../component/Admin/Ad-Dash/pages/AddTrainer";
import Sidebar from "../component/Admin/Ad-Dash/SideBar/Sidebar";

import TrainerTab from "../component/Admin/Ad-Dash/pages/TrainerTab";
import BatchTab from "../component/Trainers/Trainer-pages/BatchTab";
import Dashboard from "../component/Trainers/Trainer-Dashboard/Dashboard";


const RouteWrapper = () => {
  const location = useLocation();

  const isLoginPage = ["/admin", "/trainer", "/login"].includes(location.pathname);
  
  // Define dashboard routes (for future use)
  const isDashboardPage = [
    "/dashboard",
    "/profile",
    "/settings",
    "/organizations",
    "/teams",
    "/members",
    "/roles",
    "/groups",
    "/projects"
    // Add more dashboard routes here as needed
  ].some(path => location.pathname.startsWith(path));

  return (
    <>
    
      <Routes>
        {/* Landing/Public Routes */}
        <Route path="/zshadmin" element={<AdminLog />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />

        
        <Route path="/admin" element={<AdminLog />} />
        <Route path="/login" element={<AdminLog />} />
        <Route path="/trainer" element={<TrainerLogin />} />
        <Route path="/addtrainer" element={<AddTrainer/>}/>
        
        <Route path="/TrainerTab" element={<TrainerTab />} />
     
        <Route path="/dashboard" element={<Sidebar />} />
        <Route path="/Ad-Dashboard" element={<Sidebar />} />

        

      


        <Route path="*" element={<TrainerLogin/>} />
        <Route path="/Tra-Dashboard" element={<Dashboard />} />
        <Route path="/Batches" element={<BatchTab />} />
      </Routes>

    </>
  );
};

export default RouteWrapper;
