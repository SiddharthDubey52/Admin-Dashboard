import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const menuItems = [
    { title: 'Dashboard', path: '/Dashboard' },
    { title: 'Users', path: '/users' },
    { title: 'Settings', path: '/settings' },
    { title: 'Profile', path: '/profile' },
  ];

  return (
    <div className={styles.sidebar}>
      
      {menuItems.map((item, index) => (
        
        <React.Fragment key={item.title}>
         
          
          
          <Link to={item.path} className={styles.menuItem}>
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.title}>{item.title}</span>
          </Link>

          
          
        
        </React.Fragment>
      ))}
    </div>
  );
};

export default Sidebar;
