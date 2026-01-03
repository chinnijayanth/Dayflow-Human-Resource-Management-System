import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  employee_id: string;
  username?: string;
  email: string;
  role: 'employee' | 'admin' | 'hr';
  profile?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

interface SignupData {
  employee_id: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  role: 'employee' | 'hr';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      const userData = response.data.user;
      setUser(userData);
      // Update localStorage with latest user data
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await axios.post('/api/auth/signin', { email, password });
    const { token, user } = response.data;
    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const signup = async (data: SignupData) => {
    await axios.post('/api/auth/signup', data);
  };

  const logout = async () => {
    // Auto checkout if user is an employee and has checked in but not checked out today
    if (user && (user.role === 'employee')) {
      try {
        // Check if user has checked in today
        const todayResponse = await axios.get('/api/attendance/today');
        const todayAttendance = todayResponse.data;
        
        // If checked in but not checked out, perform checkout
        if (todayAttendance && todayAttendance.check_in && !todayAttendance.check_out) {
          try {
            await axios.post('/api/attendance/checkout');
            console.log('Auto checkout successful');
          } catch (checkoutError) {
            // Log error but don't block logout
            console.warn('Auto checkout failed, proceeding with logout:', checkoutError);
          }
        }
      } catch (error) {
        // If we can't check attendance, just proceed with logout
        console.warn('Could not check attendance status, proceeding with logout:', error);
      }
    }
    
    // Proceed with logout
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

