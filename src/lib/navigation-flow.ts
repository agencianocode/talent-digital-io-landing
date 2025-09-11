import { UserRole, isTalentRole, isBusinessRole } from '@/contexts/SupabaseAuthContext';

/**
 * Profile state definitions based on completion level and experience
 */
export enum ProfileState {
  NEW = 'new',
  IN_PROGRESS = 'in-progress', 
  COMPLETE = 'complete',
  PROFESSIONAL = 'professional'
}

export interface ProfileStateInfo {
  state: ProfileState;
  label: string;
  description: string;
  color: string;
  icon: string;
  nextSteps: string[];
  completionRange: [number, number];
  benefits: string[];
}

/**
 * Get profile state based on completion percentage and additional factors
 */
export const getProfileState = (
  completeness: number,
  hasPortfolio: boolean = false,
  hasWorkExperience: boolean = false,
  hasEducation: boolean = false,
  socialLinksCount: number = 0
): ProfileState => {
  // Professional: 80%+ completion with portfolio and rich content
  if (completeness >= 80 && hasPortfolio && (hasWorkExperience || hasEducation) && socialLinksCount >= 2) {
    return ProfileState.PROFESSIONAL;
  }
  
  // Complete: 60%+ completion with good coverage
  if (completeness >= 60) {
    return ProfileState.COMPLETE;
  }
  
  // In Progress: 20%+ completion
  if (completeness >= 20) {
    return ProfileState.IN_PROGRESS;
  }
  
  // New: Less than 20% completion
  return ProfileState.NEW;
};

/**
 * Profile state configuration and information
 */
export const PROFILE_STATES: Record<ProfileState, ProfileStateInfo> = {
  [ProfileState.NEW]: {
    state: ProfileState.NEW,
    label: 'Nuevo',
    description: 'Recién registrado, necesita configuración inicial',
    color: 'bg-gray-500',
    icon: '🌟',
    completionRange: [0, 19],
    nextSteps: [
      'Completa tu información básica',
      'Agrega tu foto de perfil',
      'Define tu especialidad profesional'
    ],
    benefits: [
      'Configuración guiada paso a paso',
      'Plantillas profesionales disponibles',
      'Soporte dedicado para nuevos usuarios'
    ]
  },
  
  [ProfileState.IN_PROGRESS]: {
    state: ProfileState.IN_PROGRESS,
    label: 'En Progreso',
    description: 'Perfil parcialmente completo, continúa mejorando',
    color: 'bg-blue-500',
    icon: '⚡',
    completionRange: [20, 59],
    nextSteps: [
      'Agrega tus habilidades clave',
      'Escribe una biografía atractiva',
      'Incluye tu experiencia laboral'
    ],
    benefits: [
      'Mayor visibilidad en búsquedas',
      'Acceso a oportunidades básicas',
      'Recomendaciones personalizadas'
    ]
  },
  
  [ProfileState.COMPLETE]: {
    state: ProfileState.COMPLETE,
    label: 'Completo',
    description: 'Perfil listo para recibir oportunidades',
    color: 'bg-green-500',
    icon: '✅',
    completionRange: [60, 79],
    nextSteps: [
      'Agrega tu portfolio o trabajos previos',
      'Conecta más redes sociales',
      'Obtén recomendaciones'
    ],
    benefits: [
      'Acceso completo a oportunidades',
      'Prioridad en recomendaciones',
      'Contacto directo de empresas'
    ]
  },
  
  [ProfileState.PROFESSIONAL]: {
    state: ProfileState.PROFESSIONAL,
    label: 'Profesional',
    description: 'Perfil optimizado con portfolio y experiencia destacada',
    color: 'bg-purple-500',
    icon: '🏆',
    completionRange: [80, 100],
    nextSteps: [
      'Mantén tu información actualizada',
      'Comparte contenido profesional',
      'Participa en proyectos destacados'
    ],
    benefits: [
      'Máxima visibilidad y prioridad',
      'Acceso a oportunidades premium',
      'Invitaciones exclusivas a proyectos',
      'Perfil verificado y destacado'
    ]
  }
};

/**
 * Navigation flow states for registration to dashboard journey
 */
export enum NavigationFlowState {
  REGISTRATION = 'registration',
  EMAIL_VERIFICATION = 'email-verification',
  WELCOME = 'welcome',
  ONBOARDING = 'onboarding',
  DASHBOARD = 'dashboard'
}

/**
 * Get next navigation step based on current state and user data
 */
export const getNextNavigationStep = (
  currentState: NavigationFlowState,
  userRole: UserRole | null,
  isEmailConfirmed: boolean,
  profileState: ProfileState
): NavigationFlowState => {
  switch (currentState) {
    case NavigationFlowState.REGISTRATION:
      return isEmailConfirmed 
        ? NavigationFlowState.WELCOME 
        : NavigationFlowState.EMAIL_VERIFICATION;
        
    case NavigationFlowState.EMAIL_VERIFICATION:
      return isEmailConfirmed 
        ? NavigationFlowState.WELCOME 
        : NavigationFlowState.EMAIL_VERIFICATION;
        
    case NavigationFlowState.WELCOME:
      return profileState === ProfileState.NEW 
        ? NavigationFlowState.ONBOARDING 
        : NavigationFlowState.DASHBOARD;
        
    case NavigationFlowState.ONBOARDING:
      return profileState === ProfileState.COMPLETE || profileState === ProfileState.PROFESSIONAL
        ? NavigationFlowState.DASHBOARD 
        : NavigationFlowState.ONBOARDING;
        
    default:
      return NavigationFlowState.DASHBOARD;
  }
};

/**
 * Get appropriate route for current user state
 */
export const getRouteForUserState = (
  userRole: UserRole | null,
  isEmailConfirmed: boolean,
  profileState: ProfileState,
  currentPath: string = '/'
): string => {
  // Not authenticated
  if (!userRole) {
    return '/auth';
  }
  
  // Business users go to business dashboard
  if (isBusinessRole(userRole)) {
    return '/business-dashboard';
  }
  
  // Talent users flow
  if (isTalentRole(userRole)) {
    // Email not confirmed
    if (!isEmailConfirmed) {
      return '/email-verification';
    }
    
    // New users need onboarding
    if (profileState === ProfileState.NEW) {
      return '/onboarding';
    }
    
    // Others go to dashboard
    return '/talent-dashboard';
  }
  
  // Default fallback
  return '/';
};

/**
 * Progressive disclosure configuration
 */
export interface DisclosureConfig {
  showAdvancedSettings: boolean;
  showPortfolioSection: boolean;
  showNetworkingFeatures: boolean;
  showPremiumOptions: boolean;
  recommendedActions: string[];
  availableFeatures: string[];
}

/**
 * Get progressive disclosure configuration based on profile state
 */
export const getProgressiveDisclosure = (profileState: ProfileState): DisclosureConfig => {
  const baseConfig: DisclosureConfig = {
    showAdvancedSettings: false,
    showPortfolioSection: false,
    showNetworkingFeatures: false,
    showPremiumOptions: false,
    recommendedActions: [],
    availableFeatures: ['Perfil básico', 'Búsqueda de oportunidades']
  };

  switch (profileState) {
    case ProfileState.NEW:
      return {
        ...baseConfig,
        recommendedActions: [
          'Completa tu información básica',
          'Agrega tu foto de perfil',
          'Define tu especialidad'
        ],
        availableFeatures: ['Configuración guiada', 'Plantillas de perfil']
      };

    case ProfileState.IN_PROGRESS:
      return {
        ...baseConfig,
        showPortfolioSection: true,
        recommendedActions: [
          'Agrega tus habilidades',
          'Escribe tu biografía',
          'Conecta redes sociales'
        ],
        availableFeatures: [
          'Perfil básico',
          'Búsqueda de oportunidades',
          'Portfolio básico',
          'Aplicaciones a trabajos'
        ]
      };

    case ProfileState.COMPLETE:
      return {
        ...baseConfig,
        showAdvancedSettings: true,
        showPortfolioSection: true,
        showNetworkingFeatures: true,
        recommendedActions: [
          'Optimiza tu portfolio',
          'Conecta más redes sociales',
          'Solicita recomendaciones'
        ],
        availableFeatures: [
          'Perfil completo',
          'Portfolio avanzado',
          'Networking profesional',
          'Prioridad en búsquedas',
          'Aplicaciones ilimitadas'
        ]
      };

    case ProfileState.PROFESSIONAL:
      return {
        ...baseConfig,
        showAdvancedSettings: true,
        showPortfolioSection: true,
        showNetworkingFeatures: true,
        showPremiumOptions: true,
        recommendedActions: [
          'Mantén perfil actualizado',
          'Comparte contenido profesional',
          'Participa en proyectos premium'
        ],
        availableFeatures: [
          'Perfil verificado',
          'Portfolio premium',
          'Networking avanzado',
          'Oportunidades exclusivas',
          'Perfil destacado',
          'Soporte prioritario'
        ]
      };

    default:
      return baseConfig;
  }
};
