import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  type: 'business' | 'talent';
  companyName?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  userType: 'business' | 'talent' | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'business' | 'talent' | null>(null);

  useEffect(() => {
    // Load user data from localStorage on app start
    const savedUser = localStorage.getItem('userData');
    const savedCompany = localStorage.getItem('companyData');
    
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      const companyData = savedCompany ? JSON.parse(savedCompany) : {};
      
      setUser({
        ...userData,
        companyName: companyData.companyName,
        type: userData.type || 'business'
      });
      setUserType(userData.type || 'business');
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setUserType(userData.type);
    localStorage.setItem('userData', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setUserType(null);
    localStorage.removeItem('userData');
    localStorage.removeItem('companyData');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userType,
      isAuthenticated: !!user,
      login,
      logout,
      updateUser
    }}>
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