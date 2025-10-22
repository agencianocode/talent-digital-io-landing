import { UserRole, isBusinessRole, isTalentRole } from '@/contexts/SupabaseAuthContext';

/**
 * Navigation utilities for consistent routing throughout the app
 */

// Route definitions
export const ROUTES = {
  // Landing and Auth
  HOME: '/',
  AUTH: '/auth',
  
  // Registration
  REGISTER_BUSINESS: '/register-business',
  REGISTER_TALENT: '/register-talent',
  
  // Business Dashboard
  BUSINESS_DASHBOARD: '/business-dashboard',
  BUSINESS_OPPORTUNITIES: '/business-dashboard/opportunities',
  BUSINESS_NEW_OPPORTUNITY: '/business-dashboard/opportunities/new',
  BUSINESS_APPLICATIONS: '/business-dashboard/applications',
  BUSINESS_TALENT_SEARCH: '/business-dashboard/talent-discovery',
  
  // Talent Dashboard
  TALENT_DASHBOARD: '/talent-dashboard',
  TALENT_HOME: '/talent-dashboard/home',
  TALENT_EXPLORE: '/talent-dashboard/explore',
  TALENT_OPPORTUNITIES: '/talent-dashboard/opportunities',
  TALENT_MARKETPLACE: '/talent-dashboard/marketplace',
  TALENT_SAVED: '/talent-dashboard/saved',
  
  // Settings
  SETTINGS_PROFILE: '/settings/profile',
  SETTINGS_TALENT_PROFILE: '/settings/talent-profile',
  SETTINGS_COMPANY: '/business-dashboard/settings/company',
  
  // Onboarding
  ONBOARDING: '/onboarding',
  
  // Messages and other
  MESSAGES: '/messages',
  ADMIN: '/admin',
  NOT_FOUND: '/404',
} as const;

/**
 * Get the appropriate dashboard route based on user role
 */
export const getDashboardRoute = (userRole: UserRole | null): string => {
  if (userRole === 'admin') {
    return ROUTES.ADMIN;
  }
  if (isBusinessRole(userRole)) {
    return ROUTES.BUSINESS_DASHBOARD;
  }
  if (isTalentRole(userRole)) {
    return ROUTES.TALENT_DASHBOARD;
  }
  return ROUTES.HOME;
};

/**
 * Get the appropriate registration route based on user type
 */
export const getRegistrationRoute = (userType: 'business' | 'talent'): string => {
  return userType === 'business' ? ROUTES.REGISTER_BUSINESS : ROUTES.REGISTER_TALENT;
};

/**
 * Get the appropriate settings route based on user role
 */
export const getSettingsRoute = (userRole: UserRole | null): string => {
  if (isBusinessRole(userRole)) {
    return ROUTES.SETTINGS_COMPANY;
  }
  if (isTalentRole(userRole)) {
    return ROUTES.SETTINGS_PROFILE;
  }
  return ROUTES.SETTINGS_PROFILE;
};

/**
 * Check if a route is a dashboard route
 */
export const isDashboardRoute = (pathname: string): boolean => {
  return pathname.startsWith('/business-dashboard') || pathname.startsWith('/talent-dashboard');
};

/**
 * Check if a route is a talent dashboard route
 */
export const isTalentDashboardRoute = (pathname: string): boolean => {
  return pathname.startsWith('/talent-dashboard');
};

/**
 * Check if a route is a business dashboard route
 */
export const isBusinessDashboardRoute = (pathname: string): boolean => {
  return pathname.startsWith('/business-dashboard');
};

/**
 * Get redirect route for post-authentication based on user role and current path
 */
export const getPostAuthRedirect = (
  userRole: UserRole | null, 
  intendedPath?: string
): string => {
  // If there's an intended path and it's appropriate for the user role, use it
  if (intendedPath && intendedPath !== '/') {
    if (isTalentRole(userRole) && isTalentDashboardRoute(intendedPath)) {
      return intendedPath;
    }
    if (isBusinessRole(userRole) && isBusinessDashboardRoute(intendedPath)) {
      return intendedPath;
    }
  }
  
  // Default to appropriate dashboard
  return getDashboardRoute(userRole);
};

/**
 * Legacy route redirects for backward compatibility
 */
export const LEGACY_REDIRECTS: Record<string, string> = {
  '/talent-register': ROUTES.REGISTER_TALENT,
  '/registro-talento': ROUTES.REGISTER_TALENT,
  '/dashboard-talento': ROUTES.TALENT_DASHBOARD,
  '/talento-dashboard': ROUTES.TALENT_DASHBOARD,
  '/perfil-talento': ROUTES.SETTINGS_TALENT_PROFILE,
};