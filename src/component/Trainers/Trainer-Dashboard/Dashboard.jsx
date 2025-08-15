import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Dashboard.module.css";
import TrainerTab from "../../Admin/Ad-Dash/pages/TrainerTab";
import BatchTab from "../Trainer-pages/BatchTab";
import Profile from "../Trainer-pages/Profile";
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
  LogOut,
  Home,
  Activity,
  User
} from "lucide-react";
import axios from "axios";
import { baseurl } from "../../../utils/encryptdecrypt";



const Dashboard = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeContent, setActiveContent] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: BarChart3, content: 'dashboard' },
    { path: "/Batches", label: "Batch", icon: Users, content: 'Batches' },
    // { path: "/Profile", label: "Profile", icon: User, content: 'Profile' },
  ];

  const token = localStorage.getItem('token');

  const handleMenuClick = (path, content) => {
    setIsLoading(true);
    setActiveContent(content);
    
    setTimeout(() => {
      setIsLoading(false);
      setSidebarOpen(false);
    }, 300);
    
   
  };

  const handleLogout = async() => {
    try{
      const response = await axios.post(`${baseurl}/logout`,{},{
        headers : {
          Authorization: token
        }
      })

      console.log("Logout Response:", response.data);
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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    const handleClickOutside = (event) => {
      if (!event.target.closest('[data-profile-dropdown]')) {
        setProfileDropdownOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.adminLayout}>
      {/* Sidebar */}
      <div className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        {/* Sidebar Header */}
        <div className={styles.sidebarHeader}>
          <div className={styles.logoContainer}>
            <div className={styles.logoIcon}>
              <Activity size={20} />
            </div>
            <span className={styles.logoText}>DevOps Pro</span>
          </div>
          <button className={styles.closeButton} onClick={closeSidebar}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className={styles.navigation}>
          <div className={styles.menuSection}>
            <span className={styles.sectionLabel}>Main</span>
            {menuItems.map((item, index) => {
              const isActive = activeContent === item.content;
              const IconComponent = item.icon;
              return (
                <button
                  key={item.path}
                  className={`${styles.menuItem} ${isActive ? styles.menuItemActive : ''}`}
                  onClick={() => handleMenuClick(item.path, item.content)}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={styles.menuItemContent}>
                    <IconComponent size={20} className={styles.menuIcon} />
                    <span className={styles.menuLabel}>{item.label}</span>
                  </div>
                  {isActive && <div className={styles.activeIndicator}></div>}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className={styles.userProfile}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150" 
                alt="User" 
                className={styles.avatarImage}
              />
              <div className={styles.statusIndicator}></div>
            </div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>Trainer</span>
              <span className={styles.userRole}>Trainer-1</span>
            </div>
          </div>
          <div className={styles.profileActions}>
            <button 
              className={styles.profileButton}
              onClick={() => handleMenuClick('/Profile', 'Profile')}
              type="button"
              title="Profile"
            >
              <User size={18} />
            </button>
            <button 
              className={styles.logoutButton}
              onClick={handleLogout}
              type="button"
              title="Logout"
            >
              <LogOut size={18} />
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
              <Menu size={24} />
            </button>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Trainer Dashboard</h1>
              <span className={styles.pageBreadcrumb}>Dashboard / Overview</span>
            </div>
          </div>

          <div className={styles.navbarRight}>
            {/* Search Bar */}
            <div className={`${styles.searchContainer} ${searchFocused ? styles.searchFocused : ''}`}>
              <Search size={18} className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className={styles.searchInput}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              <div className={styles.searchShortcut}>⌘K</div>
            </div>

            {/* Notifications */}
            <button className={styles.notificationButton}>
              <Bell size={20} />
              <span className={styles.notificationBadge}>3</span>
            </button>

            {/* Profile Dropdown */}
            <div className={styles.profileDropdown} data-profile-dropdown>
              <button 
                className={styles.profileButton}
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150" 
                  alt="Profile" 
                  className={styles.profileAvatar}
                />
                <ChevronDown size={16} className={styles.profileChevron} />
              </button>
              
              {profileDropdownOpen && (
                <div className={styles.profileDropdownMenu}>
                  <button
                    className={styles.dropdownItem}
                    onClick={() => {
                      handleMenuClick('/Profile', 'Profile');
                      setProfileDropdownOpen(false);
                    }}
                  >
                    <User size={16} />
                    Profile
                  </button>
                  <button
                    className={styles.dropdownItem}
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className={styles.contentArea}>
          {isLoading && (
            <div className={styles.loadingOverlay}>
              <div className={styles.loadingSpinner}>
                <div className={styles.spinner}></div>
                <span className={styles.loadingText}>Loading...</span>
              </div>
            </div>
          )}
          
          <div className={`${styles.contentWrapper} ${isLoading ? styles.contentLoading : ''}`}>
            {activeContent === 'trainers' && <TrainerTab />}
            {activeContent === 'Batches' && <BatchTab />}
            {activeContent === 'Profile' && <Profile />}
            {activeContent === 'dashboard' && (
              <div className={styles.dashboardContent}>
                <div className={styles.welcomeCard}>
                  <div className={styles.cardHeader}>
                    <Home size={24} className={styles.cardIcon} />
                    <div>
                      <h2 className={styles.cardTitle}>Welcome Back!</h2>
                      <p className={styles.cardSubtitle}>Here's what's happening with your projects today.</p>
                    </div>
                  </div>
                  <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                      <div className={styles.statValue}>24</div>
                      <div className={styles.statLabel}>Active Projects</div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statValue}>156</div>
                      <div className={styles.statLabel}>Total Users</div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statValue}>98%</div>
                      <div className={styles.statLabel}>Uptime</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {children}
          </div>
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

export default Dashboard;