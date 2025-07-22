import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface Company {
  id: string;
  name: string;
  description: string;
  website?: string;
  location?: string;
  logo?: string;
}

interface UserProfile {
  position?: string;
  linkedin?: string;
  photo?: string;
  country?: string;
  role?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  type: 'business' | 'talent';
  company?: Company;
  profile?: UserProfile;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  userType: 'business' | 'talent' | null;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  updateCompany: (companyData: Partial<Company>) => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'talento_digital_user',
  COMPANY: 'talento_digital_company',
  PROFILE: 'talento_digital_profile',
  SESSION: 'talento_digital_session'
};

// Auto-save utility
const autoSave = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(`${key}_timestamp`, Date.now().toString());
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

// Auto-load utility
const autoLoad = (key: string) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  // Load persisted data on mount
  useEffect(() => {
    const loadPersistedData = async () => {
      const savedUser = autoLoad(STORAGE_KEYS.USER);
      const savedCompany = autoLoad(STORAGE_KEYS.COMPANY);
      const savedProfile = autoLoad(STORAGE_KEYS.PROFILE);
      const sessionValid = autoLoad(STORAGE_KEYS.SESSION);

      if (savedUser && sessionValid) {
        const user: User = {
          ...savedUser,
          company: savedCompany || savedUser.company,
          profile: savedProfile || savedUser.profile
        };

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadPersistedData();
  }, []);

  // Sync across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.USER && e.newValue) {
        try {
          const newUser = JSON.parse(e.newValue);
          setAuthState(prev => ({
            ...prev,
            user: newUser,
            isAuthenticated: !!newUser
          }));
        } catch (error) {
          console.error('Failed to sync user data across tabs:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = useCallback(async (userData: User) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    autoSave(STORAGE_KEYS.USER, userData);
    autoSave(STORAGE_KEYS.SESSION, { loggedInAt: Date.now() });
    
    if (userData.company) {
      autoSave(STORAGE_KEYS.COMPANY, userData.company);
    }
    
    if (userData.profile) {
      autoSave(STORAGE_KEYS.PROFILE, userData.profile);
    }

    setAuthState({
      user: userData,
      isAuthenticated: true,
      isLoading: false
    });
  }, []);

  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Clear all stored data
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}_timestamp`);
    });

    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  }, []);

  const updateUser = useCallback(async (userData: Partial<User>) => {
    if (!authState.user) return;

    const updatedUser = { ...authState.user, ...userData };
    autoSave(STORAGE_KEYS.USER, updatedUser);

    setAuthState(prev => ({
      ...prev,
      user: updatedUser
    }));
  }, [authState.user]);

  const updateCompany = useCallback(async (companyData: Partial<Company>) => {
    if (!authState.user) return;

    const updatedCompany = { ...authState.user.company, ...companyData } as Company;
    const updatedUser = { ...authState.user, company: updatedCompany };
    
    autoSave(STORAGE_KEYS.USER, updatedUser);
    autoSave(STORAGE_KEYS.COMPANY, updatedCompany);

    setAuthState(prev => ({
      ...prev,
      user: updatedUser
    }));
  }, [authState.user]);

  const updateProfile = useCallback(async (profileData: Partial<UserProfile>) => {
    if (!authState.user) return;

    const updatedProfile = { ...authState.user.profile, ...profileData };
    const updatedUser = { ...authState.user, profile: updatedProfile };
    
    autoSave(STORAGE_KEYS.USER, updatedUser);
    autoSave(STORAGE_KEYS.PROFILE, updatedProfile);

    setAuthState(prev => ({
      ...prev,
      user: updatedUser
    }));
  }, [authState.user]);

  return (
    <AuthContext.Provider value={{
      ...authState,
      userType: authState.user?.type || null,
      login,
      logout,
      updateUser,
      updateCompany,
      updateProfile
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