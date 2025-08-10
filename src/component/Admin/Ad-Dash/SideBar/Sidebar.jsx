import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Sidebar.module.css";
import TrainerTab from "../pages/TrainerTab";
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  FileText, 
  DollarSign, 
  Settings, 
  HelpCircle, 
  X, 
  Menu, 
  Search, 
  Bell, 
  Mail, 
  ChevronDown, 
  ChevronUp, 
  LogOut
} from "lucide-react";
import axios from "axios";
import { baseurl } from "../../../../utils/encryptdecrypt";
const Sidebar = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeContent, setActiveContent] = useState('dashboard');

   const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: BarChart3, content: 'dashboard' },
    { path: "/trainers", label: "Trainers", icon: Users, content: 'trainers' },
    
  ];
   const token = localStorage.getItem('token');
  const getPageTitle = () => {
    const currentPath = location.pathname === "/" ? "/dashboard" : location.pathname;
    const currentItem = menuItems.find(item => item.path === currentPath);
    return currentItem ? currentItem.label : "Dashboard";
  };

  const getPageSubtitle = () => {
    const currentPath = location.pathname === "/" ? "/dashboard" : location.pathname;
    const subtitles = {
      "/dashboard": "Welcome back, manage your business insights",
      "/users": "Manage user accounts and permissions",
      "/analytics": "View detailed analytics and reports",
      "/products": "Manage your product catalog",
      "/orders": "Track and manage customer orders",
      "/reports": "Generate and view business reports",
      "/finance": "Monitor financial performance",
      "/settings": "Configure system settings",
      "/help": "Get help and support"
    };
    return subtitles[currentPath] || "Admin Dashboard";
  };

  const handleMenuClick = (path, content) => {
    setActiveContent(content);
    setSidebarOpen(false);
    // Don't navigate away from dashboard route, just change content
    if (location.pathname !== '/dashboard') {
      navigate('/dashboard');
    }
  };
  const handleLogout = async() => {
        try{
         const response = await axios.post(`${baseurl}/logout`,{},{
          headers : {
            Authorization: token
          }
         })

          console.log("Logout Response:", response.data);
          
          // Clear localStorage and redirect to login
          localStorage.removeItem('token');
          navigate('/');

        } catch(error) {
         console.error("Logout error:", error);
        }
  }
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Close sidebar on window resize if large screen
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={styles.adminLayout}>
      {/* Sidebar */}
      <div className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        {/* Sidebar Header */}
        <div className={styles.sidebarHeader}>
          <div className={styles.logoContainer}>
            <div className={styles.logoIcon}>
              <i className="fas fa-chart-line"></i>
            </div>
            <span className={styles.logoText}>AdminPro</span>
          </div>
          <button className={styles.closeButton} onClick={closeSidebar}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className={styles.navigation}>
          {menuItems.slice(0, 7).map((item) => {
            const isActive = activeContent === item.content;
            return (
              <button
                key={item.path}
                className={`${styles.menuItem} ${isActive ? styles.menuItemActive : ''}`}
                onClick={() => handleMenuClick(item.path, item.content)}
              >
                <i className={`${item.icon} ${styles.menuIcon}`}></i>
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className={styles.divider}></div>

          {menuItems.slice(7).map((item) => {
            const isActive = activeContent === item.content;
            return (
              <button
                key={item.path}
                className={`${styles.menuItem} ${isActive ? styles.menuItemActive : ''}`}
                onClick={() => handleMenuClick(item.path, item.content)}
              >
                <i className={`${item.icon} ${styles.menuIcon}`}></i>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className={styles.userProfile}>
          <button 
            className={styles.userCard}
            onClick={handleLogout}
            type="button"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        {/* Navbar */}
        <header className={styles.navbar}>
          <div className={styles.navbarLeft}>
            <button className={styles.menuToggle} onClick={toggleSidebar}>
              <i className="fas fa-bars"></i>
            </button>
            <div className={styles.pageHeader}>
              {/* <h1 className={styles.pageTitle}>{getPageTitle()}</h1> */}
              <h1 className={styles.pageTitle}>DevOps Admin</h1>
              {/* <p className={styles.pageSubtitle}>{getPageSubtitle()}</p> */}
            </div>
          </div>

          <div className={styles.navbarRight}>
            {/* Search Bar */}
            <div className={styles.searchBar}>
              <i className={`fas fa-search ${styles.searchIcon}`}></i>
              <input 
                type="text" 
                placeholder="Search anything..." 
                className={styles.searchInput}
              />
            </div>

            {/* Notifications */}
            {/* <button className={styles.notificationButton}>
              <i className="fas fa-bell"></i>
              <span className={styles.notificationBadge}>3</span>
            </button> */}

            {/* Messages */}
            {/* <button className={styles.notificationButton}>
              <i className="fas fa-envelope"></i>
              <span className={`${styles.notificationBadge} ${styles.messageBadge}`}>2</span>
            </button> */}

            {/* Profile Dropdown */}
            <button className={styles.profileButton}>
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150" 
                alt="Admin profile" 
                className={styles.profileAvatar}
              />
              <i className={`fas fa-chevron-down ${styles.profileChevron}`}></i>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className={styles.contentArea}>
          {activeContent === 'trainers' && <TrainerTab />}
          {activeContent === 'dashboard' && (
            <div>
              <h2>Dashboard Content</h2>
              <p>Welcome to the admin dashboard!</p>
            </div>
          )}
          {activeContent === 'analytics' && (
            <div>
              <h2>Analytics</h2>
              <p>Analytics content will be here</p>
            </div>
          )}
          {activeContent === 'products' && (
            <div>
              <h2>Products</h2>
              <p>Products content will be here</p>
            </div>
          )}
          {activeContent === 'orders' && (
            <div>
              <h2>Orders</h2>
              <p>Orders content will be here</p>
            </div>
          )}
          {activeContent === 'reports' && (
            <div>
              <h2>Reports</h2>
              <p>Reports content will be here</p>
            </div>
          )}
          {activeContent === 'finance' && (
            <div>
              <h2>Finance</h2>
              <p>Finance content will be here</p>
            </div>
          )}
          {activeContent === 'settings' && (
            <div>
              <h2>Settings</h2>
              <p>Settings content will be here</p>
            </div>
          )}
          {activeContent === 'help' && (
            <div>
              <h2>Help & Support</h2>
              <p>Help content will be here</p>
            </div>
          )}
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div 
        className={`${styles.overlay} ${sidebarOpen ? styles.overlayVisible : ''}`}
        onClick={closeSidebar}
      ></div>
    </div>
  );
};

export default Sidebar;