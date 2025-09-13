
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[+]?[1-9][\d]{0,15}$/,
  url: /^https?:\/\/(?:[-\w.])+(?::[0-9]+)?(?:\/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:[\w.])*)?)?$/,
  linkedin: /^https:\/\/(?:www\.)?linkedin\.com\/in\/[\w-]+\/?$/,
  noSpaces: /^\S*$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  name: /^[a-zA-ZÀ-ÿ\s]+$/
};

export const validateField = (value: unknown, rule: ValidationRule): string | null => {
  if (rule.required && (!value || value.toString().trim() === '')) {
    return 'Este campo es requerido';
  }

  if (!value) return null;

  const stringValue = value.toString();

  if (rule.minLength && stringValue.length < rule.minLength) {
    return `Debe tener al menos ${rule.minLength} caracteres`;
  }

  if (rule.maxLength && stringValue.length > rule.maxLength) {
    return `No puede tener más de ${rule.maxLength} caracteres`;
  }

  if (rule.pattern && !rule.pattern.test(stringValue)) {
    if (rule.pattern === validationPatterns.email) {
      return 'Ingresa un email válido';
    }
    if (rule.pattern === validationPatterns.phone) {
      return 'Ingresa un número de teléfono válido';
    }
    if (rule.pattern === validationPatterns.url) {
      return 'Ingresa una URL válida';
    }
    return 'Formato inválido';
  }

  if (rule.custom) {
    return rule.custom(value);
  }

  return null;
};

export const validateForm = (data: Record<string, unknown>, rules: ValidationRules): ValidationErrors => {
  const errors: ValidationErrors = {};

  Object.keys(rules).forEach(field => {
    const error = validateField(data[field], rules[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
};

export const isFormValid = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length === 0;
};

// Validation rules for common forms
export const opportunityValidationRules: ValidationRules = {
  title: { required: true, minLength: 10, maxLength: 100 },
  description: { required: true, minLength: 50, maxLength: 2000 },
  location: { required: true, minLength: 2, maxLength: 100 },
  salary: { required: false, minLength: 5, maxLength: 50 },
  tags: { required: true, minLength: 3 }
};

export const profileValidationRules: ValidationRules = {
  name: { required: true, minLength: 2, maxLength: 50, pattern: validationPatterns.name },
  email: { required: true, pattern: validationPatterns.email },
  position: { required: true, minLength: 2, maxLength: 100 },
  description: { required: false, maxLength: 500 },
  linkedin: { required: false, pattern: validationPatterns.linkedin },
  website: { required: false, pattern: validationPatterns.url }
};

export const companyValidationRules: ValidationRules = {
  name: { required: true, minLength: 2, maxLength: 100 },
  description: { required: true, minLength: 20, maxLength: 1000 },
  website: { required: false, pattern: validationPatterns.url },
  location: { required: true, minLength: 2, maxLength: 100 }
};
