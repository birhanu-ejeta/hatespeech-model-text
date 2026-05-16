import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get('/api/me');
        setUser(res.data);
      } catch (err) {
        console.error('Auth check failed:', err);
        setUser(null);
        // Clear any stale auth data
        localStorage.removeItem('sidebarCollapsed');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/api/login', { email, password });
      setUser(res.data);
      router.push(res.data.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Login failed' };
    }
  };

  const signup = async (firstName, lastName, username, email, password) => {
  try {
    await api.post('/api/signup', { first_name: firstName, last_name: lastName, username, email, password });
    return { success: true };
  } catch (err) {
    const errorMsg = err.response?.data?.error || 'Signup failed';
    return { success: false, error: errorMsg };
  }
};

  const logout = async () => {
    try {
      await api.post('/api/logout');
    } catch (err) {
      console.error(err);
    } finally {
      setUser(null);
      router.push('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);