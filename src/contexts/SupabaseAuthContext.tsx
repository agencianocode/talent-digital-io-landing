import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export type UserRole = 'talent' | 'business' | 'freemium_talent' | 'premium_talent' | 'freemium_business' | 'premium_business' | 'academy_premium' | 'admin';

// Function to map database roles to frontend roles
// NOTA: Ya no se hace mapeo de 'talent' -> 'freemium_talent' 
// Todos los roles ahora coinciden directamente con la BD
const mapDatabaseRoleToUserRole = (dbRole: string): UserRole => {
  // Retornar directamente el rol de la BD sin conversiones
  return dbRole as UserRole;
};

// Utility functions to check user types
export const isTalentRole = (role: UserRole | null): boolean => {
  return role === 'talent' || role === 'freemium_talent' || role === 'premium_talent';
};

export const isBusinessRole = (role: UserRole | null): boolean => {
  return role === 'business' || role === 'freemium_business' || role === 'premium_business' || role === 'academy_premium';
};

export const isPremiumRole = (role: UserRole | null): boolean => {
  return role === 'premium_talent' || role === 'premium_business';
};

export const isAdminRole = (role: UserRole | null): boolean => {
  return role === 'admin';
};

export const isAcademyRole = (role: UserRole | null): boolean => {
  return role === 'academy_premium';
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
  location?: string | null;
  logo_url?: string | null;
  business_type?: 'company' | 'academy' | null;
  employee_count_range?: string | null;
  annual_revenue_range?: string | null;
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
  signUp: (email: string, password: string, metadata?: { full_name?: string; user_type?: string }) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signUpWithGoogle: (userType: 'business' | 'talent' | 'freemium_talent' | 'freemium_business' | 'academy_premium' | 'premium_talent') => Promise<{ error: Error | null }>;
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
  const pendingInviteProcessedRef = useRef(false);

  // Fetch user profile and role with retry mechanism
  const fetchUserData = async (userId: string, userType?: string, retryCount = 0) => {
    try {
      // Fetch profile
      const { data: profile, error: _profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      // Fetch role
      const { data: roleData, error: _roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      
      console.log('🔍 RAW ROLE FROM DB:', { roleData, error: _roleError, userId });

      // If profile or role is missing and this is a recent signup, try to recover
      if ((!profile || !roleData) && retryCount < 3) {
        console.log(`Missing data detected for user ${userId}, attempting recovery (attempt ${retryCount + 1})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
        return fetchUserData(userId, userType, retryCount + 1);
      }

      // If profile doesn't exist after retries, create it with upsert to avoid 409
      if (!profile) {
        logger.debug('Profile not found after retries, creating new profile for user:', userId);
        const { error: createError } = await supabase
          .from('profiles')
          .upsert({ user_id: userId }, { onConflict: 'user_id' })
          .select()
          .single();
        
        if (createError) {
          logger.error('Error creating profile', createError);
        }
      }

      // Role should be created by database trigger, just log if missing
      if (!roleData) {
        logger.warn('Role not found for user:', userId, '- should have been created by trigger');
      }

      // Fetch company if user is business
      let company = null;
      const mappedRole = roleData?.role ? mapDatabaseRoleToUserRole(roleData.role as string) : 'freemium_talent';
      console.log('🔄 ROLE MAPPING:', { 
        originalRole: roleData?.role, 
        mappedRole, 
        isBusinessRole: isBusinessRole(mappedRole) 
      });
      if (isBusinessRole(mappedRole)) {
        // Try to get company owned by the user
        let companyData = (await supabase
          .from('companies')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle()
        ).data;

        // Fallback: if no owned company, try membership (accepted) to get company
        if (!companyData) {
          const { data: membership } = await supabase
            .from('company_user_roles')
            .select('company_id, status, accepted_at')
            .eq('user_id', userId)
            .eq('status', 'accepted')
            .order('accepted_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (membership?.company_id) {
            companyData = (await supabase
              .from('companies')
              .select('*')
              .eq('id', membership.company_id)
              .maybeSingle()
            ).data || null;
          }
        }

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

      // Use the already mapped role
      const normalizedRole: UserRole = mappedRole;

      return {
        profile: profile || null,
        role: normalizedRole,
        company
      };
    } catch (error) {
      logger.error('Error fetching user data:', error);
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
        logger.debug('SupabaseAuth: Processing auth state', { 
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
          logger.debug('SupabaseAuth: Fetching user data for:', session.user.id);
          
          try {
            // Check if this is a Google OAuth signup
            const pendingUserType = localStorage.getItem('pending_user_type');
            console.log('Auth state change - pendingUserType:', pendingUserType);
            
            let userData = await fetchUserData(session.user.id, pendingUserType || undefined);
            console.log('Initial userData fetched:', { role: userData.role, profile: !!userData.profile });
            
            // Check for original_user_type in metadata (for academy_premium registrations)
            const originalUserType = (session.user.user_metadata as any)?.original_user_type;
            console.log('Checking original_user_type from metadata:', originalUserType);
            
            // If original_user_type is academy_premium but current role is not, fix it
            if (originalUserType === 'academy_premium' && userData.role !== 'academy_premium') {
              console.log('Detected academy_premium registration - fixing role from', userData.role, 'to academy_premium');
              const fixResult = await fixUserRoleForGoogleAuth(session.user.id, 'academy_premium');
              if (!fixResult.error) {
                console.log('Academy role fixed successfully, refetching user data');
                userData = await fetchUserData(session.user.id, 'academy_premium');
                console.log('Refetched userData:', { role: userData.role, profile: !!userData.profile });
              } else {
                console.error('Failed to fix academy role:', fixResult.error);
              }
            }
            
            // If this is a Google OAuth user and role doesn't match expected type, fix it
            if (pendingUserType && userData.role) {
              const isBusinessType = pendingUserType === 'business' || pendingUserType === 'freemium_business' || pendingUserType === 'academy_premium';
              const hasBusinessRole = isBusinessRole(userData.role as UserRole);
              const isAcademyType = pendingUserType === 'academy_premium';
              
              console.log('Google OAuth role check:', { 
                pendingUserType, 
                isBusinessType, 
                isAcademyType,
                currentRole: userData.role, 
                hasBusinessRole,
                shouldFixToBusiness: isBusinessType && !hasBusinessRole,
                shouldFixToTalent: !isBusinessType && hasBusinessRole
              });
              
              // Special handling for academy_premium
              if (isAcademyType && userData.role !== 'academy_premium') {
                console.log('Role mismatch detected - fixing Google OAuth user role to academy_premium');
                const fixResult = await fixUserRoleForGoogleAuth(session.user.id, 'academy_premium');
                if (!fixResult.error) {
                  console.log('Academy role fixed successfully, refetching user data');
                  userData = await fetchUserData(session.user.id, 'academy_premium');
                  console.log('Refetched userData:', { role: userData.role, profile: !!userData.profile });
                } else {
                  console.error('Failed to fix academy role:', fixResult.error);
                }
              } else if (isBusinessType && !hasBusinessRole) {
                console.log('Role mismatch detected - fixing Google OAuth user role from talent to business');
                const fixResult = await fixUserRoleForGoogleAuth(session.user.id, pendingUserType);
                if (!fixResult.error) {
                  console.log('Role fixed successfully, refetching user data');
                  // Refetch user data with corrected role
                  userData = await fetchUserData(session.user.id, pendingUserType);
                  console.log('Refetched userData:', { role: userData.role, profile: !!userData.profile });
                } else {
                  console.error('Failed to fix role:', fixResult.error);
                }
              } else if (!isBusinessType && hasBusinessRole) {
                console.log('Role mismatch detected - fixing Google OAuth user role from business to talent');
                const fixResult = await fixUserRoleForGoogleAuth(session.user.id, pendingUserType);
                if (!fixResult.error) {
                  console.log('Role fixed successfully, refetching user data');
                  // Refetch user data with corrected role
                  userData = await fetchUserData(session.user.id, pendingUserType);
                  console.log('Refetched userData:', { role: userData.role, profile: !!userData.profile });
                } else {
                  console.error('Failed to fix role:', fixResult.error);
                }
              }
            }
            
            // Clear the pending user type after use
            if (pendingUserType) {
              localStorage.removeItem('pending_user_type');
              console.log('Cleared pending_user_type from localStorage');
            }
            
            if (!isMounted) return;
            
            logger.debug('SupabaseAuth: User data fetched:', {
              profile: !!userData.profile,
              role: userData.role,
              company: !!userData.company
            });
            
            setAuthState(prev => ({
              ...prev,
              profile: userData.profile as UserProfile | null,
              userRole: userData.role,
              company: userData.company as Company | null,
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

  // Set up realtime listener for role changes
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setupRealtimeListener = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) return;
      
      const userId = session.user.id;
      console.log('🔄 Setting up realtime listener for user role changes:', userId);

      channel = supabase
        .channel('user-role-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'user_roles',
            filter: `user_id=eq.${userId}`
          },
          async (payload) => {
            console.log('🔔 Role change detected:', payload);
            const newRole = payload.new?.role;
            if (newRole) {
              const mappedRole = mapDatabaseRoleToUserRole(newRole as string);
              console.log('✅ Updating role in real-time:', mappedRole);
              setAuthState(prev => ({
                ...prev,
                userRole: mappedRole
              }));
            }
          }
        )
        .subscribe();
    };

    setupRealtimeListener();

    return () => {
      if (channel) {
        console.log('🔄 Cleaning up realtime listener for user role changes');
        supabase.removeChannel(channel);
      }
    };
  }, [authState.user?.id]);

  // Process pending academy invitation after auth
  useEffect(() => {
    if (!authState.isAuthenticated || !authState.user?.email) return;
    if (pendingInviteProcessedRef.current) return;
    const raw = localStorage.getItem('pendingAcademyInvitation');
    if (!raw) return;
    const pending = JSON.parse(raw);
    const academyId = pending?.academyId as string | undefined;
    const status = pending?.status as string | undefined;
    if (!academyId) {
      localStorage.removeItem('pendingAcademyInvitation');
      pendingInviteProcessedRef.current = true;
      return;
    }
    (async () => {
      try {
        // Check if already exists
        const { data: existing } = await supabase
          .from('academy_students')
          .select('id')
          .eq('academy_id', academyId)
          .eq('student_email', authState.user!.email as string)
          .maybeSingle();
        if (!existing) {
          // Verificar si ya tiene un nombre válido en el perfil
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', authState.user!.id)
            .maybeSingle();

          // Obtener el nombre del usuario (de metadata, perfil existente o email)
          const getUserName = () => {
            // 1. Si ya tiene un nombre válido en el perfil, usarlo
            if (existingProfile?.full_name && 
                existingProfile.full_name.trim() !== '' && 
                existingProfile.full_name !== 'Sin nombre') {
              return existingProfile.full_name;
            }
            
            // 2. Intentar obtener de user_metadata (Google OAuth puede usar diferentes campos)
            const metadata = authState.user!.user_metadata as any;
            
            // 2a. full_name directo
            if (metadata?.full_name && metadata.full_name.trim() !== '') {
              return metadata.full_name;
            }
            
            // 2b. name directo
            if (metadata?.name && metadata.name.trim() !== '') {
              return metadata.name;
            }
            
            // 2c. Combinar first_name y last_name (Google OAuth a veces usa estos)
            const firstName = metadata?.first_name || '';
            const lastName = metadata?.last_name || '';
            if (firstName || lastName) {
              return `${firstName} ${lastName}`.trim();
            }
            
            // 3. Fallback: extraer del email de manera inteligente
            const email = authState.user!.email as string;
            if (email) {
              const emailParts = email.split('@');
              if (emailParts.length > 0 && emailParts[0]) {
                const localPart = emailParts[0];
                if (localPart.includes('.') || localPart.includes('_') || localPart.includes('-')) {
                  return localPart
                    .split(/[._-]/)
                    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
                    .join(' ');
                }
                return localPart.charAt(0).toUpperCase() + localPart.slice(1).toLowerCase();
              }
            }
            
            return email || 'Sin nombre';
          };

          const userName = getUserName();

          // Solo actualizar si no tiene nombre o tiene 'Sin nombre'
          if (!existingProfile?.full_name || 
              existingProfile.full_name.trim() === '' || 
              existingProfile.full_name === 'Sin nombre') {
            // Actualizar o crear el perfil con el nombre correcto
            await supabase.from('profiles').upsert({
              user_id: authState.user!.id,
              full_name: userName
            }, { onConflict: 'user_id' });
          }

          await supabase.from('academy_students').insert({
            academy_id: academyId,
            student_email: authState.user!.email as string,
            student_name: userName,
            status: status === 'graduated' ? 'graduated' : 'enrolled',
            enrollment_date: new Date().toISOString().split('T')[0],
            ...(status === 'graduated' ? { graduation_date: new Date().toISOString().split('T')[0] } : {})
          });
        }
        localStorage.removeItem('pendingAcademyInvitation');
      } catch (e) {
        console.error('Error processing pending academy invitation:', e);
      } finally {
        pendingInviteProcessedRef.current = true;
      }
    })();
  }, [authState.isAuthenticated, authState.user?.email]);

  const signUp = async (email: string, password: string, metadata?: { full_name?: string; user_type?: string }) => {
    // For academy registrations, normalize to 'business' for compatibility
    // but keep the original intent in metadata
    // Preserve freemium_business and freemium_talent as-is
    const actualUserType = metadata?.user_type === 'academy_premium' ? 'business' : metadata?.user_type;
    const metadataToSend = {
      ...metadata,
      user_type: actualUserType,
      // Keep original intent for logging and future use
      original_user_type: metadata?.user_type
    };
    
    // Set different redirect URLs based on user type
    const redirectUrl = metadata?.user_type === 'academy_premium'
      ? `${window.location.origin}/business-dashboard`
      : metadata?.user_type === 'business' || metadata?.user_type === 'freemium_business'
        ? `${window.location.origin}/company-onboarding`
        : `${window.location.origin}/talent-onboarding`;
    
    console.log('SignUp - Original user type:', metadata?.user_type);
    console.log('SignUp - Normalized user type:', actualUserType);
    console.log('SignUp - Redirect URL:', redirectUrl);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadataToSend
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

  const signUpWithGoogle = async (userType: 'business' | 'talent' | 'freemium_talent' | 'freemium_business' | 'academy_premium' | 'premium_talent') => {
    // Store the user type in localStorage temporarily for after OAuth redirect
    localStorage.setItem('pending_user_type', userType);
    console.log('Google OAuth: Stored pending_user_type as:', userType);
    
    // For Google OAuth, redirect directly to onboarding since Google verifies email automatically
    const redirectUrl = userType === 'academy_premium'
      ? `${window.location.origin}/business-dashboard`
      : userType === 'business' || userType === 'freemium_business'
        ? `${window.location.origin}/company-onboarding`
        : `${window.location.origin}/talent-onboarding`;
    
    console.log('Google OAuth: Redirect URL set to:', redirectUrl);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });
    
    return { error };
  };

  // Fix user role for Google OAuth users
  const fixUserRoleForGoogleAuth = async (userId: string, targetUserType: string) => {
    try {
      // Use database role values, not frontend mapped values
      const targetRole = targetUserType === 'academy_premium'
        ? 'academy_premium'
        : targetUserType === 'business' || targetUserType === 'freemium_business'
        ? 'freemium_business' 
        : targetUserType === 'freemium_talent'
        ? 'freemium_talent'
        : 'freemium_talent'; // Default to freemium_talent instead of 'talent'
      
      console.log(`Fixing Google OAuth user role: ${userId} -> ${targetRole}`);
      
      // First, check if user_roles record exists
      const { data: existingRole, error: checkError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing role:', checkError);
      }

      console.log('Existing role data:', existingRole);

      // Update user role in database (use UPDATE not UPSERT since record exists)
      const { error } = await supabase
        .from('user_roles')
        .update({ role: targetRole })
        .eq('user_id', userId);

      if (error) {
        console.error('Error fixing user role:', error);
        return { error };
      }

      console.log('User role updated successfully in database');

      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          user_type: targetUserType
        }
      });

      if (metadataError) {
        console.warn('Warning updating metadata:', metadataError);
      } else {
        console.log('User metadata updated successfully');
      }

      console.log(`User role fixed successfully: ${userId} -> ${targetRole}`);
      return { error: null };
    } catch (error) {
      console.error('Error in fixUserRoleForGoogleAuth:', error);
      return { error: error as Error };
    }
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

    try {
      // 1. Actualizar tabla profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update(data)
        .eq('user_id', authState.user.id);

      if (profileError) {
        throw profileError;
      }

      // 2. También actualizar user_metadata para mantener sincronización
      const metadataUpdates: any = {
        ...authState.user.user_metadata
      };

      if (data.full_name) metadataUpdates.full_name = data.full_name;
      if (data.phone) metadataUpdates.phone = data.phone;
      if (data.country) metadataUpdates.country = data.country;
      if (data.city) metadataUpdates.city = data.city;
      if (data.avatar_url) metadataUpdates.avatar_url = data.avatar_url;

      const { error: metadataError } = await supabase.auth.updateUser({
        data: metadataUpdates
      });

      if (metadataError) {
        console.warn('Error updating user_metadata:', metadataError);
        // No lanzar error, el profile ya se actualizó
      }

      // 3. Recargar los datos del perfil desde la base de datos
      try {
        const userData = await fetchUserData(authState.user.id);
        setAuthState(prev => ({
          ...prev,
          profile: userData.profile as UserProfile | null,
          userRole: userData.role,
          company: userData.company as Company | null
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

      return { error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error: error as Error };
    }
  };

  const updateCompany = async (data: Partial<Company>) => {
    if (!authState.user) return { error: new Error('User not authenticated') };

    // Use company ID if available, otherwise use user_id
    const updateQuery = authState.company?.id 
      ? supabase.from('companies').update(data).eq('id', authState.company.id)
      : supabase.from('companies').update(data).eq('user_id', authState.user.id);

    const { error } = await updateQuery;

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
            profile: userData.profile as UserProfile | null,
            userRole: userData.role,
            company: userData.company as Company | null
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

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({ ...data, user_id: authState.user.id })
      .select()
      .single();

    if (companyError) {
      return { error: companyError };
    }

    if (!company) {
      return { error: new Error('Company creation failed') };
    }

    // Crear el rol de owner en company_user_roles
    const { error: roleError } = await supabase
      .from('company_user_roles')
      .insert({
        company_id: company.id,
        user_id: authState.user.id,
        role: 'owner',
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        invited_at: new Date().toISOString()
      });

    if (roleError) {
      console.error('Error creating owner role:', roleError);
      // Si falla la creación del rol, intentar crear la empresa de todos modos
      // pero mostrar un warning al usuario
      // Podría ser que ya existe el rol o hay un problema de permisos
      // Nota: El rol podría ser creado por un trigger en la base de datos
      if (roleError.code !== '23505') { // 23505 = unique_violation, significa que el rol ya existe
        console.warn('Owner role creation failed, but company was created. Error:', roleError);
      }
    }

    // NO actualizar authState.company automáticamente cuando se crea una nueva empresa
    // El CompanyContext se encargará de manejar la empresa activa
    // Solo actualizar si no hay empresa actual (primera empresa del usuario)
    if (!authState.company) {
      setAuthState(prev => ({
        ...prev,
        company: {
          ...company,
          user_id: authState.user!.id,
          social_links: (company.social_links as Record<string, string>) || {},
          gallery_urls: ((company.gallery_urls as any[]) || []).map((item: any) => ({
            id: item?.id || Math.random().toString(),
            type: item?.type || 'image',
            url: item?.url || '',
            title: item?.title || 'Sin título',
            description: item?.description,
            thumbnail: item?.thumbnail
          }))
        } as Company
      }));
    }

    return { error: null };
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

  const hasCompletedBusinessOnboarding = async (userId: string) => {
    try {
      // Use RPC to check membership (accepted OR pending - bypasses RLS restrictions)
      const { data: hasMembership, error: rpcError } = await supabase.rpc(
        'has_company_membership',
        { p_user_id: userId }
      );

      if (!rpcError && hasMembership === true) {
        console.log('✅ User has company membership (accepted or pending via RPC)');
        return true;
      }

      // Fallback: check if user created their own company with minimum data
      const { data: company, error } = await supabase
        .from('companies')
        .select('id, name, description, location')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking company:', error);
        return false;
      }

      if (!company) {
        console.log('❌ No company found for user');
        return false;
      }

      // Validate minimum company data
      if (!company.name || company.name.trim() === '') {
        console.log('❌ Company has no name - incomplete onboarding');
        return false;
      }

      console.log('✅ User has own company:', company.name);
      return true;
    } catch (error) {
      console.error('Error checking business onboarding:', error);
      return false;
    }
  };

  const hasCompletedTalentOnboarding = async (userId: string): Promise<boolean> => {
    try {
      // Check if user has a record in talent_profiles table (marks onboarding completion)
      // Note: 406 errors for business users are expected and handled silently
      const { data, error } = await supabase
        .from('talent_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        // Silently handle 406 errors (expected for non-talent users)
        if (error.code === 'PGRST116') {
          return false;
        }
        console.error('Error checking talent onboarding:', error);
        return false;
      }

      // If we found a record, onboarding is complete
      const isComplete = !!data;
      
      console.log('Talent onboarding check:', {
        userId,
        hasRecord: !!data,
        isComplete
      });

      return isComplete;
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