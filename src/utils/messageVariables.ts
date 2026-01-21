// Variables disponibles para mensajes automatizados
export const MESSAGE_VARIABLES = {
  first_name: {
    key: '{{first_name}}',
    label: 'Primer nombre',
    example: 'Juan',
  },
  last_name: {
    key: '{{last_name}}',
    label: 'Apellido',
    example: 'García',
  },
  full_name: {
    key: '{{full_name}}',
    label: 'Nombre completo',
    example: 'Juan García',
  },
  company_name: {
    key: '{{company_name}}',
    label: 'Nombre de empresa',
    example: 'Acme Corp',
  },
  opportunity_title: {
    key: '{{opportunity_title}}',
    label: 'Título de oportunidad',
    example: 'Desarrollador Frontend',
  },
};

// Variables disponibles según el tipo de trigger
export const VARIABLES_BY_TRIGGER: Record<string, (keyof typeof MESSAGE_VARIABLES)[]> = {
  new_company: ['first_name', 'full_name', 'company_name'],
  new_academy: ['first_name', 'full_name', 'company_name'],
  new_talent: ['first_name', 'full_name'],
  first_opportunity: ['first_name', 'full_name', 'company_name', 'opportunity_title'],
  new_opportunity: ['first_name', 'full_name', 'company_name', 'opportunity_title'],
};

// Notas de destinatario por trigger
export const RECIPIENT_NOTES: Record<string, string> = {
  new_company: 'El mensaje se enviará al propietario (owner) de la nueva empresa',
  new_academy: 'El mensaje se enviará al propietario (owner) de la nueva academia',
  new_talent: 'El mensaje se enviará al nuevo talento registrado',
  first_opportunity: 'El mensaje se enviará al propietario de la empresa que publicó su primera oportunidad',
  new_opportunity: 'El mensaje se enviará al propietario de la empresa que publicó la nueva oportunidad',
};

// Función para sustituir variables en un mensaje
export const substituteVariables = (
  template: string,
  context: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    companyName?: string;
    opportunityTitle?: string;
  }
): string => {
  return template
    .replace(/\{\{first_name\}\}/gi, context.firstName || '')
    .replace(/\{\{last_name\}\}/gi, context.lastName || '')
    .replace(/\{\{full_name\}\}/gi, context.fullName || '')
    .replace(/\{\{company_name\}\}/gi, context.companyName || '')
    .replace(/\{\{opportunity_title\}\}/gi, context.opportunityTitle || '');
};

// Variables disponibles para templates de email (subset)
export const EMAIL_TEMPLATE_VARIABLES = [
  MESSAGE_VARIABLES.first_name,
  MESSAGE_VARIABLES.last_name,
  MESSAGE_VARIABLES.full_name,
  MESSAGE_VARIABLES.company_name,
];

// Genera un preview con datos de ejemplo
export const generatePreview = (template: string): string => {
  return substituteVariables(template, {
    firstName: MESSAGE_VARIABLES.first_name.example,
    lastName: MESSAGE_VARIABLES.last_name.example,
    fullName: MESSAGE_VARIABLES.full_name.example,
    companyName: MESSAGE_VARIABLES.company_name.example,
    opportunityTitle: MESSAGE_VARIABLES.opportunity_title.example,
  });
};
