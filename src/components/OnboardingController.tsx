import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useProfileCompleteness } from '@/hooks/useProfileCompleteness';
import { useProfileSync } from '@/hooks/useProfileSync';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/navigation';

export interface OnboardingState {
  isFirstTimeUser: boolean;
  currentView: 'welcome' | 'dashboard' | 'wizard' | 'settings';
  currentStep: number;
  showWelcome: boolean;
  isInitialized: boolean;
  lastActivity: number;
}

export interface OnboardingActions {
  setCurrentView: (view: OnboardingState['currentView']) => void;
  setCurrentStep: (step: number) => void;
  setIsFirstTimeUser: (isFirst: boolean) => void;
  setShowWelcome: (show: boolean) => void;
  handleWizardComplete: () => Promise<void>;
  handleProfileUpdate: () => Promise<void>;
  navigateToSettings: (tab?: string) => void;
  navigateToDashboard: () => void;
  resetOnboarding: () => void;
}

interface OnboardingContextType {
  state: OnboardingState;
  actions: OnboardingActions;
  profile: any;
  user: any;
  userRole: any;
  completeness: number;
  breakdown: any;
  loading: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export const useOnboardingController = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboardingController must be used within OnboardingProvider');
  }
  return context;
};

interface OnboardingProviderProps {
  children: React.ReactNode;
  initialIsFirstTimeUser?: boolean;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ 
  children, 
  initialIsFirstTimeUser = false 
}) => {
  const { profile, user, userRole } = useSupabaseAuth();
  const { completeness, breakdown, loading, refreshCompleteness } = useProfileCompleteness();
  const { syncProfile, handleProfileUpdate } = useProfileSync();
  const navigate = useNavigate();

  // Centralized state management
  const [state, setState] = useState<OnboardingState>({
    isFirstTimeUser: initialIsFirstTimeUser,
    currentView: 'welcome',
    currentStep: 0,
    showWelcome: initialIsFirstTimeUser,
    isInitialized: false,
    lastActivity: Date.now(),
  });

  // Initialize state based on user data
  useEffect(() => {
    if (!user || !profile || loading) return;

    const isNewUser = (profile?.profile_completeness || 0) < 20;
    const hasCompletedBasics = (breakdown?.basic_info || 0) >= 30;
    const shouldShowWizard = isNewUser || !hasCompletedBasics;

    setState(prev => ({
      ...prev,
      isFirstTimeUser: isNewUser,
      currentView: shouldShowWizard ? 'wizard' : 'dashboard',
      showWelcome: isNewUser,
      isInitialized: true,
    }));

    // Restore saved progress
    try {
      const savedStep = localStorage.getItem(`onboarding.step.${user.id}`);
      const savedView = localStorage.getItem(`onboarding.view.${user.id}`);
      
      if (savedStep) {
        setState(prev => ({ ...prev, currentStep: parseInt(savedStep, 10) }));
      }
      if (savedView && ['welcome', 'dashboard', 'wizard', 'settings'].includes(savedView)) {
        setState(prev => ({ ...prev, currentView: savedView as OnboardingState['currentView'] }));
      }
    } catch (error) {
      console.warn('Error restoring onboarding state:', error);
    }
  }, [user, profile, breakdown, loading]);

  // Persist state changes
  useEffect(() => {
    if (!user?.id || !state.isInitialized) return;

    try {
      localStorage.setItem(`onboarding.step.${user.id}`, state.currentStep.toString());
      localStorage.setItem(`onboarding.view.${user.id}`, state.currentView);
      localStorage.setItem(`onboarding.lastActivity.${user.id}`, state.lastActivity.toString());
    } catch (error) {
      console.warn('Error persisting onboarding state:', error);
    }
  }, [state.currentStep, state.currentView, state.lastActivity, user?.id, state.isInitialized]);

  // Actions
  const setCurrentView = useCallback((view: OnboardingState['currentView']) => {
    setState(prev => ({ 
      ...prev, 
      currentView: view,
      lastActivity: Date.now() 
    }));
  }, []);

  const setCurrentStep = useCallback((step: number) => {
    setState(prev => ({ 
      ...prev, 
      currentStep: step,
      lastActivity: Date.now() 
    }));
  }, []);

  const setIsFirstTimeUser = useCallback((isFirst: boolean) => {
    setState(prev => ({ 
      ...prev, 
      isFirstTimeUser: isFirst,
      lastActivity: Date.now() 
    }));
  }, []);

  const setShowWelcome = useCallback((show: boolean) => {
    setState(prev => ({ 
      ...prev, 
      showWelcome: show,
      lastActivity: Date.now() 
    }));
  }, []);

  const handleWizardComplete = useCallback(async () => {
    try {
      console.log('🎉 Onboarding wizard completed!');
      
      // Force profile refresh
      await syncProfile();
      
      // Wait for data to propagate
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update state
      setState(prev => ({
        ...prev,
        isFirstTimeUser: false,
        currentView: 'dashboard',
        showWelcome: false,
        lastActivity: Date.now(),
      }));

      // Clear saved state since onboarding is complete
      if (user?.id) {
        localStorage.removeItem(`onboarding.step.${user.id}`);
        localStorage.setItem(`onboarding.completed.${user.id}`, Date.now().toString());
      }

    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  }, [syncProfile, user?.id]);

  const handleProfileUpdateAction = useCallback(async () => {
    try {
      await handleProfileUpdate();
      await refreshCompleteness();
      setState(prev => ({ ...prev, lastActivity: Date.now() }));
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  }, [handleProfileUpdate, refreshCompleteness]);

  const navigateToSettings = useCallback((tab?: string) => {
    const settingsUrl = tab ? `${ROUTES.SETTINGS_PROFILE}?tab=${tab}` : ROUTES.SETTINGS_PROFILE;
    navigate(settingsUrl);
  }, [navigate]);

  const navigateToDashboard = useCallback(() => {
    navigate(ROUTES.TALENT_DASHBOARD);
  }, [navigate]);

  const resetOnboarding = useCallback(() => {
    setState(prev => ({
      ...prev,
      isFirstTimeUser: true,
      currentView: 'welcome',
      currentStep: 0,
      showWelcome: true,
      lastActivity: Date.now(),
    }));

    if (user?.id) {
      localStorage.removeItem(`onboarding.step.${user.id}`);
      localStorage.removeItem(`onboarding.view.${user.id}`);
      localStorage.removeItem(`onboarding.completed.${user.id}`);
    }
  }, [user?.id]);

  const actions: OnboardingActions = {
    setCurrentView,
    setCurrentStep,
    setIsFirstTimeUser,
    setShowWelcome,
    handleWizardComplete,
    handleProfileUpdate: handleProfileUpdateAction,
    navigateToSettings,
    navigateToDashboard,
    resetOnboarding,
  };

  const contextValue: OnboardingContextType = {
    state,
    actions,
    profile,
    user,
    userRole,
    completeness,
    breakdown,
    loading,
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
};