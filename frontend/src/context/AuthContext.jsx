import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('patient');
    const token = localStorage.getItem('token');
    if (stored && token) {
      setPatient(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = (token, patientData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('patient', JSON.stringify(patientData));
    setPatient(patientData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('patient');
    setPatient(null);
  };

  return (
    <AuthContext.Provider value={{ patient, loading, login, logout, isAuthenticated: !!patient }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
