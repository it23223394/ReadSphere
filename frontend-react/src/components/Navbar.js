import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

export const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMenu = () => setMenuOpen(false);

  // Hide navbar for unauthenticated users and admins to keep UIs separate
  if (!isAuthenticated() || isAdmin()) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-header">
          <button className="navbar-logo-btn" onClick={() => navigate('/dashboard')}>
            📚 ReadSphere
          </button>
          <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            ☰
          </button>
        </div>
        
        <ul className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
          {/* User navigation */}
          <li><a href="/dashboard" onClick={closeMenu}>Dashboard</a></li>
          <li><a href="/bookshelf" onClick={closeMenu}>Bookshelf</a></li>
          <li><a href="/notes-quotes" onClick={closeMenu}>Notes & Quotes</a></li>
          <li><a href="/recommendations" onClick={closeMenu}>Recommendations</a></li>
          <li><a href="/tracking" onClick={closeMenu}>Tracker</a></li>
          <li><a href="/settings" onClick={closeMenu}>Settings</a></li>

          {/* Admin navigation (visible only to admins) */}
          {isAdmin() && (
            <>
              <li><a href="/admin/dashboard" onClick={closeMenu}>Admin Dashboard</a></li>
              <li><a href="/admin/users" onClick={closeMenu}>User Management</a></li>
              <li><a href="/admin/catalog" onClick={closeMenu}>Catalog Management</a></li>
            </>
          )}
        </ul>
        <button onClick={handleLogout} className="logout-btn" title="Sign out from your account">
          Logout
        </button>
      </div>
    </nav>
  );
};
