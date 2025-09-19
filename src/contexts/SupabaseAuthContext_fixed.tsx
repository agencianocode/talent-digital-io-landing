import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export type UserRole = 'talent' | 'business' | 'freemium_talent' | 'premium_talent' | 'freemium_business' | 'premium_business' | 'admin';

// Utility functions to check user types
export const isTalentRole = (role: UserRole | null): boolean => {
  return role === 'talent' || role === 'freemium_talent' || role === 'premium_talent';
};

export const isBusinessRole = (role: UserRole | null): boolean => {
  return role === 'business' || role === 'freemium_business' || role === 'premium_business';
};

export const isPremiumRole = (role: UserRole | null): boolean => {
  return role === 'premium_talent' || role === 'premium_business';
};

export const isAdminRole = (role: UserRole | null): boolean => {
  return role === 'admin';
};

// Check if user's company is an academy
export const isAcademy = (company: Company | null): boolean => {
  return company?.business_type === 'academy';
};

interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  profile_completeness?: number | null;
  country?: string | null;
  city?: string | null;
  created_at: string;
  updated_at: string;
}

interface Company {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  website?: string | null;
  industry?: string | null;
  size?: string | null;
  business_type?: string | null;
  logo_url?: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: SupabaseUser | null;
  session: Session | null;
  profile: UserProfile | null;
  company: Company | null;
  userRole: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSessionReady: boolean;
}

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, metadata?: { full_name?: string; user_type?: string }) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signUpWithGoogle: (userType: 'business' | 'talent') => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  updateCompany: (data: Partial<Company>) => Promise<{ error: Error | null }>;
  createCompany: (data: Omit<Company, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<{ error: Error | null }>;
  switchUserType: (newRole: UserRole) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  hasCompletedBusinessOnboarding: (userId: string) => Promise<boolean>;
  hasCompletedTalentOnboarding: (userId: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useSupabaseAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    company: null,
    userRole: null,
    isLoading: true,
    isAuthenticated: false,
    isSessionReady: false,
  });

  // Load initial session
  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
        }

        if (mounted) {
          if (session?.user) {
            await loadUserData(session.user);
          } else {
            setAuthState(prev => ({
              ...prev,
              isLoading: false,
              isSessionReady: true,
            }));
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) {
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            isSessionReady: true,
          }));
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      
      if (mounted) {
        if (session?.user) {
          await loadUserData(session.user);
        } else {
          setAuthState({
            user: null,
            session: null,
            profile: null,
            company: null,
            userRole: null,
            isLoading: false,
            isAuthenticated: false,
            isSessionReady: true,
          });
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserData = async (user: SupabaseUser) => {
    try {
      console.log('Loading user data for:', user.id);
      
      // Load profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error loading profile:', profileError);
      }

      // Load company if user has one
      let company = null;
      if (profile?.company_id) {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', profile.company_id)
          .single();

        if (companyError && companyError.code !== 'PGRST116') {
          console.error('Error loading company:', companyError);
        } else {
          company = companyData;
        }
      }

      // Determine user role from user_metadata
      const userRole = (user.user_metadata?.user_type as UserRole) || 'talent';

      console.log('User data loaded:', {
        userId: user.id,
        profile: profile?.id,
        company: company?.id,
        userRole
      });

      setAuthState({
        user,
        session: { user, access_token: '', refresh_token: '', expires_at: 0, expires_in: 0, token_type: 'bearer' },
        profile,
        company,
        userRole,
        isLoading: false,
        isAuthenticated: true,
        isSessionReady: true,
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        isSessionReady: true,
      }));
    }
  };

  const signUp = async (email: string, password: string, metadata?: { full_name?: string; user_type?: string }) => {
    // Set different redirect URLs based on user type
    const redirectUrl = metadata?.user_type === 'business' 
      ? `${window.location.origin}/company-onboarding`
      : `${window.location.origin}/talent-onboarding`;
    
    console.log('SignUp - User type:', metadata?.user_type);
    console.log('SignUp - Redirect URL:', redirectUrl);
    console.log('SignUp - Window origin:', window.location.origin);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: metadata?.full_name || '',
          user_type: metadata?.user_type || 'talent'
        }
      }
    });

    if (error) {
      console.error('SignUp error:', error);
      return { error };
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('SignIn error:', error);
      return { error };
    }

    return { error: null };
  };

  const signInWithGoogle = async () => {
    // Check if there's a pending user type from registration
    const pendingUserType = localStorage.getItem('pending_user_type') as 'business' | 'talent';
    
    const redirectUrl = pendingUserType === 'business' 
      ? `${window.location.origin}/company-onboarding`
      : `${window.location.origin}/talent-onboarding`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('Google SignIn error:', error);
      return { error };
    }

    return { error: null };
  };

  const signUpWithGoogle = async (userType: 'business' | 'talent') => {
    // Store the user type in localStorage temporarily for after OAuth redirect
    localStorage.setItem('pending_user_type', userType);
    
    // For Google OAuth, redirect directly to onboarding since Google verifies email automatically
    const redirectUrl = userType === 'business' 
      ? `${window.location.origin}/company-onboarding`
      : `${window.location.origin}/talent-onboarding`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('Google SignUp error:', error);
      return { error };
    }

    return { error: null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('SignOut error:', error);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!authState.user) {
      return { error: new Error('No authenticated user') };
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', authState.user.id);

    if (error) {
      console.error('Update profile error:', error);
      return { error };
    }

    // Reload user data
    await loadUserData(authState.user);
    return { error: null };
  };

  const updateCompany = async (data: Partial<Company>) => {
    if (!authState.company) {
      return { error: new Error('No company found') };
    }

    const { error } = await supabase
      .from('companies')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', authState.company.id);

    if (error) {
      console.error('Update company error:', error);
      return { error };
    }

    // Reload user data
    if (authState.user) {
      await loadUserData(authState.user);
    }
    return { error: null };
  };

  const createCompany = async (data: Omit<Company, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!authState.user) {
      return { error: new Error('No authenticated user') };
    }

    const { data: company, error } = await supabase
      .from('companies')
      .insert({
        ...data,
        user_id: authState.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Create company error:', error);
      return { error };
    }

    // Update profile with company_id
    await updateProfile({ company_id: company.id });

    return { error: null };
  };

  const switchUserType = async (newRole: UserRole) => {
    if (!authState.user) {
      return { error: new Error('No authenticated user') };
    }

    const { error } = await supabase.auth.updateUser({
      data: {
        user_type: newRole,
        updated_at: new Date().toISOString(),
      },
    });

    if (error) {
      console.error('Switch user type error:', error);
      return { error };
    }

    // Reload user data
    await loadUserData(authState.user);
    return { error: null };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?reset=true`,
    });

    if (error) {
      console.error('Reset password error:', error);
      return { error };
    }

    return { error: null };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error('Update password error:', error);
      return { error };
    }

    return { error: null };
  };

  const hasCompletedBusinessOnboarding = async (userId: string): Promise<boolean> => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user || user.id !== userId) {
        console.error('Error getting user for business onboarding check:', error);
        return false;
      }

      // Check if user has completed basic onboarding (has company info)
      const hasCompanyInfo = !!(
        user.user_metadata?.company_name && 
        user.user_metadata?.industry
      );

      console.log('Business onboarding check:', {
        userId,
        company_name: user.user_metadata?.company_name,
        industry: user.user_metadata?.industry,
        hasCompanyInfo
      });

      return hasCompanyInfo;
    } catch (error) {
      console.error('Error checking business onboarding:', error);
      return false;
    }
  };

  const hasCompletedTalentOnboarding = async (userId: string): Promise<boolean> => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user || user.id !== userId) {
        console.error('Error getting user for talent onboarding check:', error);
        return false;
      }

      // Check if user has completed basic onboarding (has first_name and last_name)
      const hasBasicInfoInMetadata = !!(
        user.user_metadata?.first_name && 
        user.user_metadata?.last_name
      );

      console.log('Talent onboarding check - user_metadata:', {
        userId,
        first_name: user.user_metadata?.first_name,
        last_name: user.user_metadata?.last_name,
        hasBasicInfoInMetadata,
        full_user_metadata: user.user_metadata
      });

      // If user_metadata has the info, return true
      if (hasBasicInfoInMetadata) {
        return true;
      }

      // Fallback: check talent_profiles table (only created when onboarding is complete)
      const { data: talentProfile, error: talentProfileError } = await supabase
        .from('talent_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (talentProfileError) {
        console.error('Error checking talent_profiles table:', talentProfileError);
        return false;
      }

      const hasCompletedOnboarding = !!talentProfile?.id;

      console.log('Talent onboarding check - talent_profiles table:', {
        userId,
        talentProfile,
        hasCompletedOnboarding
      });

      return hasCompletedOnboarding;
    } catch (error) {
      console.error('Error in hasCompletedTalentOnboarding:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      signUp,
      signIn,
      signInWithGoogle,
      signUpWithGoogle,
      signOut,
      updateProfile,
      updateCompany,
      createCompany,
      switchUserType,
      resetPassword,
      hasCompletedBusinessOnboarding,
      hasCompletedTalentOnboarding,
      updatePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default SupabaseAuthProvider;
