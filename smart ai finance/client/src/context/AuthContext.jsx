import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('finance_token') || '');
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    const storedToken = localStorage.getItem('finance_token');
    if (!storedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const userData = await authApi.getMe();
      if (userData && (userData.id || userData._id)) {
        setUser(userData);
      } else {
        // Token might be invalid
        logout();
      }
    } catch (err) {
      console.warn("Session restore note:", err.message);
      // If server returns error, we can still fallback to stored user info if exists
      const savedUser = localStorage.getItem('finance_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          logout();
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    if (data.token) {
      localStorage.setItem('finance_token', data.token);
      setToken(data.token);
      const userInfo = {
        id: data._id || data.id,
        name: data.name,
        email: data.email,
      };
      localStorage.setItem('finance_user', JSON.stringify(userInfo));
      setUser(userInfo);
      return userInfo;
    }
    throw new Error(data.message || 'Login failed');
  };

  const register = async (name, email, password) => {
    const data = await authApi.register(name, email, password);
    if (data.token) {
      localStorage.setItem('finance_token', data.token);
      setToken(data.token);
      const userInfo = {
        id: data._id || data.id,
        name: data.name,
        email: data.email,
      };
      localStorage.setItem('finance_user', JSON.stringify(userInfo));
      setUser(userInfo);
      return userInfo;
    }
    throw new Error(data.message || 'Registration failed');
  };

  const demoLogin = async () => {
    try {
      // Try login with standard demo account first
      return await login('test@example.com', 'password123');
    } catch (e) {
      // If not exists, register demo account
      return await register('Alex Morgan', 'test@example.com', 'password123');
    }
  };

  const logout = () => {
    localStorage.removeItem('finance_token');
    localStorage.removeItem('finance_user');
    setToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        demoLogin,
        logout,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
