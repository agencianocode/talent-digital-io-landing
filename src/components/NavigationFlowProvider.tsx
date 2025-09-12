import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSupabaseAuth, isBusinessRole } from '@/contexts/SupabaseAuthContext';
import { useProfileCompleteness } from '@/hooks/useProfileCompleteness';
import { 
  ProfileState, 
  NavigationFlowState, 
  getProfileState, 
  getNextNavigationStep, 
  getRouteForUserState,
  getProgressiveDisclosure,
  DisclosureConfig,
  PROFILE_STATES
} from '@/lib/navigation-flow';

interface NavigationFlowContextType {
  // Current state
  profileState: ProfileState;
  navigationState: NavigationFlowState;
  disclosureConfig: DisclosureConfig;
  
  // State info
  profileStateInfo: typeof PROFILE_STATES[ProfileState];
  
  // Navigation actions
  navigateToNextStep: () => void;
  navigateToOnboarding: () => void;
  navigateToDashboard: () => void;
  navigateToWelcome: () => void;
  
  // State checks
  shouldShowOnboarding: boolean;
  shouldShowWelcome: boolean;
  canAccessDashboard: boolean;
  
  // Progress tracking
  isTransitioning: boolean;
  lastNavigationTime: Date | null;
}

const NavigationFlowContext = createContext<NavigationFlowContextType | null>(null);

export const useNavigationFlow = () => {
  const context = useContext(NavigationFlowContext);
  if (!context) {
    throw new Error('useNavigationFlow must be used within NavigationFlowProvider');
  }
  return context;
};

interface NavigationFlowProviderProps {
  children: React.ReactNode;
}

export const NavigationFlowProvider: React.FC<NavigationFlowProviderProps> = ({ children }) => {
  const { user, userRole, profile } = useSupabaseAuth();
  const { completeness, breakdown } = useProfileCompleteness();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [navigationState, setNavigationState] = useState<NavigationFlowState>(NavigationFlowState.REGISTRATION);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [lastNavigationTime, setLastNavigationTime] = useState<Date | null>(null);

  // Calculate profile state
  const profileState = getProfileState(
    completeness,
    Boolean(completeness > 50), // has portfolio/good content (inferred from high completeness)
    Boolean(completeness > 40), // has some experience data (inferred from completeness)
    Boolean(completeness > 30), // has education data (inferred from completeness)
    1 // social links count (simplified for now)
  );

  // Get profile state info
  const profileStateInfo = PROFILE_STATES[profileState];

  // Get progressive disclosure configuration
  const disclosureConfig = getProgressiveDisclosure(profileState);

  // Determine current navigation state based on location
  useEffect(() => {
    const path = location.pathname;
    
    if (path.includes('/register') || path.includes('/user-selector')) {
      setNavigationState(NavigationFlowState.REGISTRATION);
    } else if (path.includes('/email-verification')) {
      setNavigationState(NavigationFlowState.EMAIL_VERIFICATION);
    } else if (path.includes('/welcome')) {
      setNavigationState(NavigationFlowState.WELCOME);
    } else if (path.includes('/onboarding')) {
      setNavigationState(NavigationFlowState.ONBOARDING);
    } else if (path.includes('/dashboard')) {
      setNavigationState(NavigationFlowState.DASHBOARD);
    }
  }, [location.pathname]);

  // Navigation action helpers
  const navigateToNextStep = useCallback(() => {
    setIsTransitioning(true);
    const nextStep = getNextNavigationStep(
      navigationState,
      userRole,
      Boolean(user?.email_confirmed_at),
      profileState
    );

    const route = getRouteForUserState(
      userRole,
      Boolean(user?.email_confirmed_at),
      profileState,
      location.pathname
    );

    console.log('🧭 Navigating to next step:', { nextStep, route, profileState });
    
    setTimeout(() => {
      navigate(route);
      setLastNavigationTime(new Date());
      setIsTransitioning(false);
    }, 300);
  }, [navigationState, userRole, user, profileState, location.pathname, navigate]);

  const navigateToOnboarding = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      navigate('/onboarding');
      setLastNavigationTime(new Date());
      setIsTransitioning(false);
    }, 200);
  }, [navigate]);

  const navigateToDashboard = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      // Navigate to appropriate dashboard based on user role
      const dashboardRoute = userRole && isBusinessRole(userRole) 
        ? '/business-dashboard' 
        : '/talent-dashboard';
      navigate(dashboardRoute);
      setLastNavigationTime(new Date());
      setIsTransitioning(false);
    }, 200);
  }, [navigate, userRole]);

  const navigateToWelcome = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      navigate('/welcome');
      setLastNavigationTime(new Date());
      setIsTransitioning(false);
    }, 200);
  }, [navigate]);

  // State checks
  const shouldShowOnboarding = profileState === ProfileState.NEW || profileState === ProfileState.IN_PROGRESS;
  const shouldShowWelcome = profileState === ProfileState.NEW;
  const canAccessDashboard = profileState !== ProfileState.NEW;

  // Auto-navigation for authenticated users (optional, can be disabled)
  useEffect(() => {
    if (!user || !userRole || isTransitioning) return;

    // Block auto-navigation during password recovery/reset flows so the user can update their password
    const isRecoveryFlow = (() => {
      if (typeof window === 'undefined') return false;
      const search = window.location.search;
      const hash = window.location.hash;
      return (
        search.includes('reset=true') ||
        hash.includes('type=recovery') ||
        hash.includes('error=') ||
        hash.includes('error_code=')
      );
    })();

    if (isRecoveryFlow && location.pathname === '/auth') {
      return; // Do not auto-redirect away from the Auth page during recovery
    }

    const currentPath = location.pathname;
    const idealRoute = getRouteForUserState(
      userRole,
      Boolean(user.email_confirmed_at),
      profileState,
      currentPath
    );

    // Only auto-navigate if user is on a route that doesn't match their state
    // and they're not already on the correct route
    const shouldAutoNavigate = (
      currentPath !== idealRoute &&
      !currentPath.includes('/settings') && // Don't interrupt settings
      !currentPath.includes('/opportunities') && // Don't interrupt browsing
      (
        (currentPath === '/' && idealRoute !== '/') ||
        (currentPath === '/auth' && idealRoute !== '/auth') ||
        (currentPath.includes('/register') && user) || // Redirect if authenticated and on registration
        (currentPath.includes('/onboarding') && !shouldShowOnboarding) ||
        (currentPath.includes('/onboarding') && userRole && ['business', 'freemium_business'].includes(userRole)) // Redirect business users away from onboarding
      )
    );

    if (shouldAutoNavigate) {
      console.log('🤖 Auto-navigating from', currentPath, 'to', idealRoute);
      navigateToNextStep();
    }
  }, [user, userRole, profileState, location.pathname, shouldShowOnboarding, isTransitioning, navigateToNextStep]);

  const contextValue: NavigationFlowContextType = {
    // Current state
    profileState,
    navigationState,
    disclosureConfig,
    
    // State info
    profileStateInfo,
    
    // Navigation actions
    navigateToNextStep,
    navigateToOnboarding,
    navigateToDashboard,
    navigateToWelcome,
    
    // State checks
    shouldShowOnboarding,
    shouldShowWelcome,
    canAccessDashboard,
    
    // Progress tracking
    isTransitioning,
    lastNavigationTime,
  };

  return (
    <NavigationFlowContext.Provider value={contextValue}>
      {children}
    </NavigationFlowContext.Provider>
  );
};