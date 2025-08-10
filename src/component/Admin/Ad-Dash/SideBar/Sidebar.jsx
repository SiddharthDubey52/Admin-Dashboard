import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Sidebar.module.css";
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
  ChevronUp 
} from "lucide-react";
const Sidebar = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

   const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { path: "/users", label: "Users", icon: Users },
    { path: "/analytics", label: "Analytics", icon: TrendingUp },
    { path: "/products", label: "Products", icon: Package },
    { path: "/orders", label: "Orders", icon: ShoppingCart },
    { path: "/reports", label: "Reports", icon: FileText },
    { path: "/finance", label: "Finance", icon: DollarSign },
    { path: "/settings", label: "Settings", icon: Settings },
    { path: "/help", label: "Help & Support", icon: HelpCircle }
  ];

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

  const handleMenuClick = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

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
            const isActive = location.pathname === item.path || (location.pathname === "/" && item.path === "/dashboard");
            return (
              <button
                key={item.path}
                className={`${styles.menuItem} ${isActive ? styles.menuItemActive : ''}`}
                onClick={() => handleMenuClick(item.path)}
              >
                <i className={`${item.icon} ${styles.menuIcon}`}></i>
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className={styles.divider}></div>

          {menuItems.slice(7).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                className={`${styles.menuItem} ${isActive ? styles.menuItemActive : ''}`}
                onClick={() => handleMenuClick(item.path)}
              >
                <i className={`${item.icon} ${styles.menuIcon}`}></i>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className={styles.userProfile}>
          <div className={styles.userCard}>
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150" 
              alt="Admin profile" 
              className={styles.userAvatar}
            />
            <div className={styles.userInfo}>
              <p className={styles.userName}>John Anderson</p>
              <p className={styles.userRole}>Administrator</p>
            </div>
            <button className={styles.userMenuButton}>
              <i className="fas fa-chevron-up"></i>
            </button>
          </div>
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
