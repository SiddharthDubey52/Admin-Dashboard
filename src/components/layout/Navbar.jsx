import React from 'react';
import styles from './Navbar.module.css';


const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        Admin Dashboard
      </div>
      <div className={styles.rightSection}>
        <div className={styles.searchBar}>
          <input type="search" placeholder="Search..." />
        </div>
        <div className={styles.profile}>
          <img src="/avatar.png" alt="Profile" />
          <span>Admin User</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;