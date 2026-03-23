import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ROLES, User } from '../utils/constants';

interface AuthContextType {
  user: User | null;
  currentRole: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = 'http://localhost:5000/api/auth';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedRole = localStorage.getItem('role');
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (savedRole && savedUser && token && ROLES[savedRole]) {
      setCurrentRole(savedRole);
      const parsedUser = JSON.parse(savedUser);
      // Always merge with latest ROLES data to get updated nav paths/icons
      const updatedUser: User = {
        ...ROLES[savedRole],
        ...parsedUser,
        token
      };
      setUser(updatedUser);
      document.documentElement.style.setProperty('--accent', ROLES[savedRole].accent);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    const userData: User = {
      ...ROLES[data.role],
      _id: data.id || data._id,
      name: data.name,
      initials: data.initials,
      email: data.email,
      token: data.token,
      semester: data.semester,
      department: data.department,
    };

    setUser(userData);
    setCurrentRole(data.role);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('role', data.role);
    localStorage.setItem('token', data.token);
    document.documentElement.style.setProperty('--accent', ROLES[data.role].accent);
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');

    const userData: User = {
      ...ROLES[data.role],
      _id: data.id || data._id,
      name: data.name,
      initials: data.initials,
      email: data.email,
      token: data.token,
      semester: data.semester,
      department: data.department,
    };

    setUser(userData);
    setCurrentRole(data.role);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('role', data.role);
    localStorage.setItem('token', data.token);
    document.documentElement.style.setProperty('--accent', ROLES[data.role].accent);
  };

  const logout = () => {
    setUser(null);
    setCurrentRole(null);
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('token');
    document.documentElement.style.setProperty('--accent', ROLES.student.accent);
  };

  return (
    <AuthContext.Provider value={{ user, currentRole, loading, login, register, logout }}>
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
