import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// Current components
import AdminLog from "../component/Admin/Ad-Login/AdminLog";

// Future components (uncomment when ready)
import Home from "../pages/Home";
import About from "../pages/About";
import Dashboard from "../pages/Dashboard";

import TrainerLogin from "../component/Trainers/TrainerLogin/TrainerLogin";
import AddTrainer from "../component/Admin/Ad-Dash/pages/AddTrainer";



import TrainerTab from "../component/Admin/Ad-Dash/pages/TrainerTab";


// import LandingNavbar from "../components/landing-page/Navbar/LandingNavbar";
// import DashboardLayout from "../components/User_dashboard/DashboardLayout";
// import Footer from "../components/landing-page/Footer/Footer";

const RouteWrapper = () => {
  const location = useLocation();

  // Define special routes that don't need navbar/footer
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
      {/* Show Navbar only on non-login, non-dashboard pages */}
      {/* {!isLoginPage && !isDashboardPage && <LandingNavbar />} */}

      <Routes>
        {/* Landing/Public Routes */}
        <Route path="/" element={<AdminLog />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />

        {/* Authentication Routes */}
        <Route path="/admin" element={<AdminLog />} />
        <Route path="/login" element={<AdminLog />} />
        <Route path="/trainer" element={<TrainerLogin />} />

        <Route path="/addtrainer" element={<AddTrainer/>}/>
        

        <Route path="/TrainerTab" element={<TrainerTab />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Future Dashboard Routes under layout */}
        {/* <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/organizations" element={<Organizations />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/members" element={<Members />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route> */}

        {/* Future API and Other Routes */}
        {/* <Route path="/api-explorer" element={<ApiExploral />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/enterprise" element={<Enterprise />} /> */}

        {/* Fallback - redirect to admin login */}
        <Route path="*" element={<AdminLog />} />
      </Routes>

      {/* Show Footer only on non-login, non-dashboard pages */}
      {/* {!isLoginPage && !isDashboardPage && <Footer />} */}
    </>
  );
};

export default RouteWrapper;
