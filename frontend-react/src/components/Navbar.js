import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

export const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <h2>📚 ReadSphere</h2>
        </div>
        
        <ul className="navbar-menu">
          <li><a href="/dashboard">Dashboard</a></li>
          <li><a href="/bookshelf">Bookshelf</a></li>
          <li><a href="/recommendations">Recommendations</a></li>
          <li><a href="/notes-quotes">Notes & Quotes</a></li>
        </ul>

        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
};
