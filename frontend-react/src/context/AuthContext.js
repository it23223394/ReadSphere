import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUserId = localStorage.getItem('userId');
    const savedRole = localStorage.getItem('role');

    // Prefer role from JWT to avoid stale localStorage values
    const decodeRoleFromToken = (tok) => {
      try {
        const payload = JSON.parse(atob(tok.split('.')[1] || ''));
        return payload && payload.role ? payload.role : null;
      } catch {
        return null;
      }
    };

    if (savedToken && savedUserId) {
      setToken(savedToken);
      setUser({ id: savedUserId });
      const jwtRole = decodeRoleFromToken(savedToken);
      setRole(jwtRole || savedRole || 'USER');
    }
    setLoading(false);
  }, []);

  const login = (userId, userRole = 'USER') => {
    const savedToken = localStorage.getItem('token');
    setToken(savedToken);
    setUser({ id: userId });
    setRole(userRole);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    setToken(null);
    setUser(null);
    setRole(null);
  };

  const isAuthenticated = () => {
    return token !== null;
  };

  const isAdmin = () => {
    return role === 'ADMIN';
  };

  const value = {
    user,
    token,
    role,
    loading,
    login,
    logout,
    isAuthenticated,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
