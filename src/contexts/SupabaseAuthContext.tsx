import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'business' | 'talent';

interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

interface Company {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: string;
  location?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: SupabaseUser | null;
  session: Session | null;
  profile: UserProfile | null;
  company: Company | null;
  userRole: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, metadata?: { full_name?: string; user_type?: string }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: any }>;
  updateCompany: (data: Partial<Company>) => Promise<{ error: any }>;
  createCompany: (data: Omit<Company, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<{ error: any }>;
  switchUserType: (newRole: UserRole) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    company: null,
    userRole: null,
    isAuthenticated: false,
    isLoading: true
  });

  // Fetch user profile and role
  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Fetch role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      // Fetch company if user is business
      let company = null;
      if (roleData?.role === 'business') {
        const { data: companyData } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', userId)
          .single();
        company = companyData;
      }

      return {
        profile: profile || null,
        role: roleData?.role || 'talent',
        company
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return {
        profile: null,
        role: 'talent' as UserRole,
        company: null
      };
    }
  };

  // Set up auth state listener
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthState(prev => ({ ...prev, session, user: session?.user ?? null }));
        
        if (session?.user) {
          // Defer user data fetching to prevent blocking
          setTimeout(async () => {
            const userData = await fetchUserData(session.user.id);
            setAuthState(prev => ({
              ...prev,
              profile: userData.profile,
              userRole: userData.role,
              company: userData.company,
              isAuthenticated: true,
              isLoading: false
            }));
          }, 0);
        } else {
          setAuthState(prev => ({
            ...prev,
            profile: null,
            userRole: null,
            company: null,
            isAuthenticated: false,
            isLoading: false
          }));
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(prev => ({ ...prev, session, user: session?.user ?? null }));
      
      if (session?.user) {
        setTimeout(async () => {
          const userData = await fetchUserData(session.user.id);
          setAuthState(prev => ({
            ...prev,
            profile: userData.profile,
            userRole: userData.role,
            company: userData.company,
            isAuthenticated: true,
            isLoading: false
          }));
        }, 0);
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata?: { full_name?: string; user_type?: string }) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata
      }
    });
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!authState.user) return { error: new Error('User not authenticated') };

    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('user_id', authState.user.id);

    if (!error && authState.profile) {
      setAuthState(prev => ({
        ...prev,
        profile: { ...prev.profile!, ...data }
      }));
    }

    return { error };
  };

  const updateCompany = async (data: Partial<Company>) => {
    if (!authState.user) return { error: new Error('User not authenticated') };

    const { error } = await supabase
      .from('companies')
      .update(data)
      .eq('user_id', authState.user.id);

    if (!error && authState.company) {
      setAuthState(prev => ({
        ...prev,
        company: { ...prev.company!, ...data }
      }));
    }

    return { error };
  };

  const createCompany = async (data: Omit<Company, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!authState.user) return { error: new Error('User not authenticated') };

    const { data: company, error } = await supabase
      .from('companies')
      .insert({ ...data, user_id: authState.user.id })
      .select()
      .single();

    if (!error && company) {
      setAuthState(prev => ({
        ...prev,
        company
      }));
    }

    return { error };
  };

  const switchUserType = async (newRole: UserRole) => {
    if (!authState.user) return { error: new Error('User not authenticated') };

    const { error } = await supabase
      .from('user_roles')
      .update({ role: newRole })
      .eq('user_id', authState.user.id);

    if (!error) {
      setAuthState(prev => ({
        ...prev,
        userRole: newRole
      }));
    }

    return { error };
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      signUp,
      signIn,
      signOut,
      updateProfile,
      updateCompany,
      createCompany,
      switchUserType
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useSupabaseAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};