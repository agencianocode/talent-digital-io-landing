import React, { useState, useEffect } from 'react';
import { useSupabaseAuth, isTalentRole } from '@/contexts/SupabaseAuthContext';
import { UnifiedOnboardingFlow } from '@/components/UnifiedOnboardingFlow';
import { useLocation } from 'react-router-dom';

const OnboardingPage: React.FC = () => {
  const { userRole, profile } = useSupabaseAuth();
  const location = useLocation();
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);

  // Redirect talent users to the new talent onboarding flow
  useEffect(() => {
    if (userRole === 'talent') {
      console.log('OnboardingPage: Redirecting talent user to /talent-onboarding');
      window.location.href = '/talent-onboarding';
      return;
    }
  }, [userRole]);

  // Check if this is a first-time user (coming from registration)
  useEffect(() => {
    // Check if user came from registration or has very low profile completeness
    const isFromRegistration = document.referrer.includes('/register-talent') || 
                              location.state?.fromRegistration ||
                              (profile?.profile_completeness || 0) < 20;
    setIsFirstTimeUser(isFromRegistration);
  }, [profile, location]);

  return <UnifiedOnboardingFlow isFirstTimeUser={isFirstTimeUser} />;
};

export default OnboardingPage;