// frontend/src/Context/AuthContext.jsx
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);
const STORAGE_KEY = 'userInfo';

const readStoredUser = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(true);

  const persistUser = useCallback((nextUser) => {
    if (nextUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setUser(nextUser);
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const stored = readStoredUser();

      if (!stored?.token) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const { data } = await API.get('/auth/profile');

        if (mounted) {
          persistUser({ ...stored, ...data, token: stored.token });
        }
      } catch {
        if (mounted) {
          localStorage.removeItem(STORAGE_KEY);
          setUser(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [persistUser]);

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', {
      email: email.trim().toLowerCase(),
      password,
    });
    persistUser(data);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await API.post('/auth/register', {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    });
    persistUser(data);
    return data;
  };

  const logout = () => {
    const userId = user?._id || user?.id;
    if (userId) {
      localStorage.removeItem(`cart_${userId}`);
    }
    localStorage.removeItem('guest_cart');
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    window.location.href = '/';
  };

  const updateUser = (data) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...data };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    loading,
    isAdmin: user?.role === 'admin',
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Hook alag se export - ESLint fix
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }

  return context;
};