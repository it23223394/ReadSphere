import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUserId = localStorage.getItem('userId');
    
    if (savedToken && savedUserId) {
      setToken(savedToken);
      setUser({ id: savedUserId });
    }
    setLoading(false);
  }, []);

  const login = (response) => {
    localStorage.setItem('token', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('userId', response.userId);
    setToken(response.token);
    setUser({ id: response.userId });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = () => {
    return token !== null;
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated
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
