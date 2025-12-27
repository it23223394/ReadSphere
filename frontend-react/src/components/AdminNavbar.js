import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/AdminNavbar.css';

export const AdminNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-container">
        <div className="admin-navbar-logo">
          <h2>📚 ReadSphere Admin</h2>
        </div>
        
        <ul className="admin-navbar-menu">
          <li>
            <a 
              href="/admin/dashboard" 
              className={isActive('/admin/dashboard') ? 'active' : ''}
            >
              Dashboard
            </a>
          </li>
          <li>
            <a 
              href="/admin/users" 
              className={isActive('/admin/users') ? 'active' : ''}
            >
              Users
            </a>
          </li>
          <li>
            <a 
              href="/admin/catalog" 
              className={isActive('/admin/catalog') ? 'active' : ''}
            >
              Catalog
            </a>
          </li>
          <li>
            <a 
              href="/admin/analytics" 
              className={isActive('/admin/analytics') ? 'active' : ''}
            >
              Analytics
            </a>
          </li>
          <li>
            <a 
              href="/admin/system" 
              className={isActive('/admin/system') ? 'active' : ''}
            >
              System
            </a>
          </li>
        </ul>

        <button onClick={handleLogout} className="admin-logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
};
