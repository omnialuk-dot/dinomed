import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('dinomedUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    // Mock login - in production this would call backend API
    if (username === 'admin' && password === 'DinoMed2025!') {
      const userData = {
        username: 'admin',
        role: 'admin',
        loginTime: new Date().toISOString()
      };
      setUser(userData);
      localStorage.setItem('dinomedUser', JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, error: 'Credenziali non valide' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dinomedUser');
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
