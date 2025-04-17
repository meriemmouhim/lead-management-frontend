import { useState, createContext, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing token on initial load
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await fetchUserProfile();
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/login`,
        { email, password }
      );
      
      localStorage.setItem('token', res.data.token);
      await fetchUserProfile();
      return { success: true };
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
    } catch (err) {
      throw new Error('Session expired. Please login again.');
    }
  };

  const updateToken = (newToken) => {
    localStorage.setItem('token', newToken);
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        fetchUserProfile,
        updateToken,
        isAuthenticated,
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};