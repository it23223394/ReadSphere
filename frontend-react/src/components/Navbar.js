import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

export const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Hide navbar for unauthenticated users and admins to keep UIs separate
  if (!isAuthenticated() || isAdmin()) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <button className="navbar-logo-btn" onClick={() => navigate('/dashboard')}>
            📚 ReadSphere
          </button>
        </div>
        
        <ul className="navbar-menu">
          {/* User navigation */}
          <li><a href="/dashboard">Dashboard</a></li>
          <li><a href="/bookshelf">Bookshelf</a></li>
          <li><a href="/notes-quotes">Notes & Quotes</a></li>
          <li><a href="/recommendations">Recommendations</a></li>
          <li><a href="/tracking">Tracker</a></li>
          <li><a href="/profile">Profile</a></li>
          <li><a href="/settings">Settings</a></li>

          {/* Admin navigation (visible only to admins) */}
          {isAdmin() && (
            <>
              <li><a href="/admin/dashboard">Admin Dashboard</a></li>
              <li><a href="/admin/users">User Management</a></li>
              <li><a href="/admin/catalog">Catalog Management</a></li>
            </>
          )}
        </ul>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
};
