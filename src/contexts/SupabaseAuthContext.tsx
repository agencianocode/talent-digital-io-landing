import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export type UserRole = 'freemium_talent' | 'premium_talent' | 'freemium_business' | 'premium_business' | 'admin';

// Utility functions to check user types
export const isTalentRole = (role: UserRole | null): boolean => {
  return role === 'freemium_talent' || role === 'premium_talent';
};

export const isBusinessRole = (role: UserRole | null): boolean => {
  return role === 'freemium_business' || role === 'premium_business';
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
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  profile_completeness?: number;
  country?: string;
  city?: string;
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
  business_type?: 'company' | 'academy';
  employee_count_range?: string;
  annual_revenue_range?: string;
  social_links?: Record<string, string>;
  gallery_urls?: Array<{
    id: string;
    type: 'image' | 'video' | 'document' | 'link';
    url: string;
    title: string;
    description?: string;
    thumbnail?: string;
  }>;
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
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: any }>;
  updateCompany: (data: Partial<Company>) => Promise<{ error: any }>;
  createCompany: (data: Omit<Company, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<{ error: any }>;
  switchUserType: (newRole: UserRole) => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
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

  // Fetch user profile and role with retry mechanism
  const fetchUserData = async (userId: string, userType?: string, retryCount = 0) => {
    try {
      // Fetch profile
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      // Fetch role
      let { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      // If profile or role is missing and this is a recent signup, try to recover
      if ((!profile || !roleData) && retryCount < 3) {
        console.log(`Missing data detected for user ${userId}, attempting recovery (attempt ${retryCount + 1})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
        return fetchUserData(userId, userType, retryCount + 1);
      }

      // If profile doesn't exist after retries, create it
      if (!profile) {
        logger.debug('Profile not found after retries, creating new profile for user:', userId);
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({ user_id: userId })
          .select()
          .single();
        
        if (createError) {
          logger.error('Error creating profile', createError);
        } else {
          profile = newProfile;
        }
      }

      // If role doesn't exist after retries, create it
      if (!roleData) {
        logger.debug('Role not found after retries, creating role for user:', userId, 'with type:', userType);
        // Use the provided userType or default to 'freemium_talent'
        const defaultRole: UserRole = userType === 'business' ? 'freemium_business' : 'freemium_talent';
        const { data: newRole, error: createRoleError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: defaultRole })
          .select()
          .single();
        
        if (createRoleError) {
          logger.error('Error creating role', createRoleError);
        } else {
          roleData = newRole;
        }
      }

      // Fetch company if user is business
      let company = null;
      if (roleData?.role && isBusinessRole(roleData.role as UserRole)) {
        const { data: companyData } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', userId)
          .single();
        company = companyData ? {
          ...companyData,
          social_links: (companyData.social_links as Record<string, string>) || {},
          gallery_urls: ((companyData.gallery_urls as any[]) || []).map((item: any) => ({
            id: item?.id || Math.random().toString(),
            type: item?.type || 'image',
            url: item?.url || '',
            title: item?.title || 'Sin título',
            description: item?.description,
            thumbnail: item?.thumbnail
          }))
        } : null;
      }

      return {
        profile: profile || null,
        role: (roleData?.role as UserRole) || 'freemium_talent',
        company
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return {
        profile: null,
        role: 'freemium_talent' as UserRole,
        company: null
      };
    }
  };

  // Set up auth state listener with improved race condition handling
  useEffect(() => {
    let isMounted = true;
    let isProcessingAuth = false;

    const processAuthState = async (session: Session | null, isInitial = false) => {
      if (!isMounted || isProcessingAuth) return;
      isProcessingAuth = true;

      try {
        console.log('SupabaseAuth: Processing auth state', { 
          hasSession: !!session, 
          hasUser: !!session?.user,
          isInitial 
        });

        // Update basic auth state immediately
        setAuthState(prev => ({ 
          ...prev, 
          session, 
          user: session?.user ?? null,
          isAuthenticated: !!session?.user,
          isLoading: !!session?.user // Keep loading true while fetching user data
        }));
        
        if (session?.user) {
          console.log('SupabaseAuth: Fetching user data for:', session.user.id);
          
          try {
            const userData = await fetchUserData(session.user.id);
            
            if (!isMounted) return;
            
            console.log('SupabaseAuth: User data fetched:', {
              profile: !!userData.profile,
              role: userData.role,
              company: !!userData.company
            });
            
            setAuthState(prev => ({
              ...prev,
              profile: userData.profile,
              userRole: userData.role,
              company: userData.company,
              isLoading: false
            }));
          } catch (error) {
            console.error('SupabaseAuth: Error fetching user data:', error);
            if (!isMounted) return;
            setAuthState(prev => ({ ...prev, isLoading: false }));
          }
        } else {
          console.log('SupabaseAuth: No session, clearing state');
          setAuthState(prev => ({
            ...prev,
            profile: null,
            userRole: null,
            company: null,
            isAuthenticated: false,
            isLoading: false
          }));
        }
      } finally {
        isProcessingAuth = false;
      }
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        console.log('SupabaseAuth: Auth state changed:', event);
        processAuthState(session, false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      console.log('SupabaseAuth: Initial session check:', !!session);
      processAuthState(session, true);
    });

    return () => {
      console.log('SupabaseAuth: Cleaning up auth listener');
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, metadata?: { full_name?: string; user_type?: string }) => {
    const redirectUrl = `${window.location.origin}/welcome`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata
      }
    });

    // Don't fetch user data immediately after signup
    // The onAuthStateChange handler will handle this when the user is properly authenticated
    // and the trigger will handle profile/role creation

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google'
    });
    
    return { error };
  };

  const signOut = async () => {
    try {
      logger.debug('Iniciando proceso de logout...');
      
      // Set loading state first to prevent component rendering issues
      setAuthState(prev => ({
        ...prev,
        isLoading: true
      }));
      
      // Sign out from Supabase first
      const { error } = await supabase.auth.signOut();
      if (error) {
        logger.error('Error during Supabase signOut', error);
      }
      
      // Clear all local storage and session storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Force clear authentication state
      setAuthState({
        user: null,
        session: null,
        profile: null,
        company: null,
        userRole: null,
        isAuthenticated: false,
        isLoading: false
      });
      
      console.log('Logout completado, estado limpiado');
      
      // Immediate redirect without timeout to prevent race conditions
      window.location.replace('/');
      
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if there's an error, clear the state and redirect immediately
      setAuthState({
        user: null,
        session: null,
        profile: null,
        company: null,
        userRole: null,
        isAuthenticated: false,
        isLoading: false
      });
      // Immediate redirect on error too
      window.location.replace('/');
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!authState.user) return { error: new Error('User not authenticated') };

    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('user_id', authState.user.id);

    if (!error) {
      // Recargar los datos del perfil desde la base de datos
      try {
        const userData = await fetchUserData(authState.user.id);
        setAuthState(prev => ({
          ...prev,
          profile: userData.profile,
          userRole: userData.role,
          company: userData.company
        }));
        console.log('Perfil actualizado y recargado:', userData.profile);
      } catch (fetchError) {
        console.error('Error recargando datos del perfil:', fetchError);
        // Si falla la recarga, actualizar con los datos proporcionados
        if (authState.profile) {
          setAuthState(prev => ({
            ...prev,
            profile: { ...prev.profile!, ...data }
          }));
        }
      }
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
        company: { ...prev.company!, ...data } as Company
      }));
    }

    return { error };
  };

  const createCompany = async (data: Omit<Company, 'id' | 'user_id' | 'created_at' | 'updated_at'>, retryCount = 0) => {
    if (!authState.user) return { error: new Error('User not authenticated') };

    // Ensure user has a profile and role before creating company
    if (!authState.profile || !authState.userRole) {
      if (retryCount < 3) {
        console.log(`Profile/role missing, retrying company creation (attempt ${retryCount + 1})`);
        try {
          const userData = await fetchUserData(authState.user.id, undefined, 0);
          setAuthState(prev => ({
            ...prev,
            profile: userData.profile,
            userRole: userData.role,
            company: userData.company
          }));
          await new Promise(resolve => setTimeout(resolve, 1000));
          return createCompany(data, retryCount + 1);
        } catch (error) {
          console.error('Error fetching user data during company creation retry:', error);
        }
      } else {
        return { error: new Error('Profile configuration incomplete. Please refresh and try again.') };
      }
    }

    const { data: company, error } = await supabase
      .from('companies')
      .insert({ ...data, user_id: authState.user.id })
      .select()
      .single();

    if (!error && company) {
      setAuthState(prev => ({
        ...prev,
        company: company ? {
          ...company,
          social_links: (company.social_links as Record<string, string>) || {},
          gallery_urls: ((company.gallery_urls as any[]) || []).map((item: any) => ({
            id: item?.id || Math.random().toString(),
            type: item?.type || 'image',
            url: item?.url || '',
            title: item?.title || 'Sin título',
            description: item?.description,
            thumbnail: item?.thumbnail
          }))
        } as Company : null
      }));
    }

    return { error };
  };

  const switchUserType = async (newRole: UserRole) => {
    if (!authState.user) return { error: new Error('User not authenticated') };

    // Use the new security definer function
    const { data, error } = await supabase.rpc('switch_user_role', { 
      new_role: newRole 
    });

    if (!error && data) {
      // Update the local state immediately
      setAuthState(prev => ({
        ...prev,
        userRole: newRole
      }));
    }

    return { error };
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/auth?reset=true`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });

    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ 
      password: newPassword 
    });

    return { error };
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      updateProfile,
      updateCompany,
      createCompany,
      switchUserType,
      resetPassword,
      updatePassword
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