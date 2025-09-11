// Utility functions for onboarding flow
export const validateProfileCompleteness = (profile: any, talentProfile: any) => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Basic validations
  if (!profile?.full_name) {
    errors.push('Nombre completo es requerido');
  }
  
  if (!profile?.avatar_url) {
    warnings.push('Agrega una foto de perfil para mejor impresión');
  }
  
  if (!profile?.phone) {
    warnings.push('Agrega tu teléfono para contacto directo');
  }
  
  // Professional validations
  if (!talentProfile?.primary_category_id) {
    errors.push('Selecciona tu categoría profesional');
  }
  
  if (!talentProfile?.title) {
    warnings.push('Define tu título profesional');
  }
  
  return { errors, warnings, isValid: errors.length === 0 };
};

export const getNextIncompleteStep = (steps: any[]) => {
  return steps.findIndex(step => !step.completed && step.id !== 'welcome');
};

export const calculateStepProgress = (steps: any[]) => {
  const completedSteps = steps.filter(step => step.completed).length;
  return (completedSteps / steps.length) * 100;
};

export const shouldShowAdvancedView = (completeness: number) => {
  return completeness >= 50;
};

export const getStepRecommendation = (currentStep: number, completeness: number) => {
  if (completeness < 30) {
    return 'Completa la información básica para comenzar';
  }
  
  if (completeness < 60) {
    return 'Agrega tu información profesional para destacar';
  }
  
  if (completeness < 80) {
    return 'Casi terminamos, completa los últimos detalles';
  }
  
  return '¡Excelente! Tu perfil está completo';
};