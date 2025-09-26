import { Badge } from "@/components/ui/badge";

export interface JobTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  skills: string[];
  tools: string[];
  requirements: string;
}

export const JOB_TEMPLATES: Record<string, JobTemplate[]> = {
  "Ventas": [
    {
      id: "closer-ventas",
      title: "Closer de Ventas",
      category: "ventas",
      description: "Especialista en cierre de ventas encargado de convertir leads calificados en clientes. Responsable de negociar, presentar propuestas y cerrar acuerdos comerciales.",
      skills: ["Cierre de ventas", "Negociación", "CRM", "Prospección", "Cold calling"],
      tools: ["HubSpot", "Salesforce", "Pipedrive", "Zoom", "GoHighLevel"],
      requirements: "Experiencia mínima de 2 años en ventas, conocimiento de técnicas de cierre, habilidades de comunicación excepcionales."
    },
    {
      id: "sales-development",
      title: "Sales Development Representative (SDR)",
      category: "ventas",
      description: "Generador de oportunidades de venta enfocado en prospección y calificación de leads. Primer contacto con potenciales clientes.",
      skills: ["Prospección", "Lead generation", "Cold calling", "Email marketing", "CRM"],
      tools: ["LinkedIn Sales Navigator", "HubSpot", "Outreach", "Calendly", "Cold Email Tools"],
      requirements: "Experiencia en prospección, conocimiento de herramientas de CRM, habilidades de comunicación telefónica."
    }
  ],
  "Marketing": [
    {
      id: "marketing-digital",
      title: "Especialista en Marketing Digital",
      category: "marketing",
      description: "Responsable de desarrollar y ejecutar estrategias de marketing digital para incrementar la visibilidad online y generar leads.",
      skills: ["Marketing Digital", "SEO", "SEM", "Social Media", "Google Analytics", "Content Marketing"],
      tools: ["Google Ads", "Facebook Ads", "Google Analytics", "SEMrush", "Hootsuite"],
      requirements: "Experiencia en campañas digitales, conocimiento de Google Ads y Facebook Ads, certificaciones en marketing digital preferibles."
    },
    {
      id: "growth-marketer",
      title: "Growth Marketer",
      category: "marketing",
      description: "Especialista en crecimiento enfocado en identificar y ejecutar estrategias para acelerar el crecimiento del negocio.",
      skills: ["Growth Hacking", "Analytics", "A/B Testing", "Marketing automation", "Funnel optimization"],
      tools: ["Mixpanel", "Amplitude", "Optimizely", "HubSpot", "Klaviyo"],
      requirements: "Experiencia en growth marketing, conocimiento de herramientas de analytics, mentalidad orientada a datos."
    }
  ],
  "Tecnología y Automatizaciones": [
    {
      id: "full-stack-developer",
      title: "Desarrollador Full Stack",
      category: "tecnologia",
      description: "Desarrollador con experiencia en frontend y backend, capaz de crear aplicaciones web completas y escalables.",
      skills: ["JavaScript", "React", "Node.js", "TypeScript", "Git", "API Development", "Database Design"],
      tools: ["Visual Studio Code", "Git", "Docker", "PostgreSQL", "Figma"],
      requirements: "Experiencia mínima de 3 años en desarrollo web, portafolio de proyectos, conocimiento de metodologías ágiles."
    },
    {
      id: "qa-tester",
      title: "QA Tester",
      category: "tecnologia",
      description: "Especialista en aseguramiento de calidad responsable de testing manual y automatizado de aplicaciones.",
      skills: ["Testing manual", "Testing automatizado", "Selenium", "Bug tracking", "Test cases"],
      tools: ["Selenium", "Jira", "TestRail", "Postman", "Cypress"],
      requirements: "Experiencia en testing de software, conocimiento de herramientas de automatización, atención al detalle."
    }
  ],
  "Atención al cliente": [
    {
      id: "customer-success",
      title: "Customer Success Manager",
      category: "atención al cliente",
      description: "Especialista en éxito del cliente enfocado en garantizar la satisfacción, retención y crecimiento de la base de clientes.",
      skills: ["Customer Success", "CRM", "Análisis de datos", "Comunicación", "Resolución de problemas", "Onboarding"],
      tools: ["Intercom", "Zendesk", "HubSpot", "Calendly", "Slack"],
      requirements: "Experiencia en atención al cliente o customer success, habilidades de comunicación excepcionales, orientación a resultados."
    },
    {
      id: "soporte-tecnico",
      title: "Especialista en Soporte Técnico",
      category: "atención al cliente",
      description: "Responsable de brindar soporte técnico a usuarios, resolver incidencias y mantener la satisfacción del cliente.",
      skills: ["Soporte técnico", "Troubleshooting", "Zendesk", "Help desk", "Comunicación técnica", "Documentación"],
      tools: ["Zendesk", "Freshdesk", "TeamViewer", "Jira Service Desk", "Confluence"],
      requirements: "Conocimientos técnicos básicos, experiencia en soporte al usuario, paciencia y habilidades de comunicación."
    },
    {
      id: "chat-support",
      title: "Agente de Chat en Vivo",
      category: "atención al cliente",
      description: "Especialista en atención al cliente via chat en tiempo real, resolviendo consultas y brindando asistencia inmediata.",
      skills: ["Chat en vivo", "Comunicación escrita", "Multitasking", "CRM", "Resolución de conflictos"],
      tools: ["Intercom", "LiveChat", "Zendesk Chat", "Crisp", "Drift"],
      requirements: "Excelente redacción, velocidad de escritura, experiencia en atención al cliente digital."
    }
  ],
  "Operaciones": [
    {
      id: "project-manager",
      title: "Project Manager",
      category: "operaciones",
      description: "Responsable de planificar, ejecutar y supervisar proyectos, asegurando que se completen a tiempo y dentro del presupuesto.",
      skills: ["Gestión de proyectos", "Metodologías ágiles", "Scrum", "Jira", "Planificación", "Liderazgo"],
      tools: ["Jira", "Asana", "Trello", "Microsoft Project", "Slack"],
      requirements: "Experiencia en gestión de proyectos, certificación PMP o similar preferible, habilidades de liderazgo."
    },
    {
      id: "operations-analyst",
      title: "Analista de Operaciones",
      category: "operaciones",
      description: "Especialista en análisis de procesos operativos, identificación de mejoras y optimización de la eficiencia organizacional.",
      skills: ["Análisis de procesos", "Excel avanzado", "Power BI", "Lean Six Sigma", "KPIs", "Automatización"],
      tools: ["Microsoft Excel", "Power BI", "Tableau", "Visio", "Lucidchart"],
      requirements: "Experiencia en análisis de datos, conocimiento de herramientas de BI, pensamiento analítico."
    },
    {
      id: "supply-chain",
      title: "Coordinador de Supply Chain",
      category: "operaciones",
      description: "Responsable de coordinar la cadena de suministro, gestionar inventarios y optimizar procesos logísticos.",
      skills: ["Supply Chain", "Logística", "Gestión de inventarios", "SAP", "Negociación con proveedores"],
      tools: ["SAP", "Oracle", "Microsoft Excel", "WMS", "EDI"],
      requirements: "Experiencia en logística o supply chain, conocimiento de sistemas ERP, habilidades analíticas."
    }
  ],
  "Creativo": [
    {
      id: "diseñador-grafico",
      title: "Diseñador Gráfico",
      category: "creativo",
      description: "Creativo especializado en diseño visual, desarrollo de identidad de marca y materiales gráficos para medios digitales e impresos.",
      skills: ["Adobe Creative Suite", "Diseño gráfico", "Branding", "Illustrator", "Photoshop", "InDesign"],
      tools: ["Adobe Photoshop", "Adobe Illustrator", "Adobe InDesign", "Figma", "Canva"],
      requirements: "Portafolio de diseño, dominio de herramientas Adobe, creatividad y atención al detalle."
    },
    {
      id: "copywriter",
      title: "Copywriter",
      category: "creativo",
      description: "Redactor creativo especializado en crear contenido persuasivo para marketing, publicidad y comunicaciones de marca.",
      skills: ["Copywriting", "Redacción publicitaria", "SEO Writing", "Content Marketing", "Storytelling"],
      tools: ["Google Docs", "Grammarly", "Hemingway Editor", "WordPress", "Notion"],
      requirements: "Portafolio de redacción, experiencia en marketing de contenidos, excelente ortografía y gramática."
    },
    {
      id: "video-editor",
      title: "Editor de Video",
      category: "creativo",
      description: "Especialista en edición de video, post-producción y creación de contenido audiovisual para diversas plataformas.",
      skills: ["Edición de video", "After Effects", "Premiere Pro", "Motion Graphics", "Color grading"],
      tools: ["Adobe Premiere Pro", "After Effects", "DaVinci Resolve", "Final Cut Pro", "Adobe Audition"],
      requirements: "Portafolio de videos editados, dominio de software de edición, creatividad visual."
    },
    {
      id: "ux-ui-designer",
      title: "Diseñador UX/UI",
      category: "creativo",
      description: "Diseñador especializado en experiencia de usuario e interfaces, creando diseños intuitivos y funcionales.",
      skills: ["UX Design", "UI Design", "Figma", "Prototipado", "User Research", "Wireframing"],
      tools: ["Figma", "Sketch", "Adobe XD", "InVision", "Miro"],
      requirements: "Portafolio de proyectos UX/UI, conocimiento de principios de usabilidad, experiencia con herramientas de diseño."
    }
  ],
  "Soporte Profesional": [
    {
      id: "asistente-virtual",
      title: "Asistente Virtual",
      category: "soporte profesional",
      description: "Profesional de apoyo remoto especializado en tareas administrativas, gestión de agenda y soporte ejecutivo.",
      skills: ["Asistencia virtual", "Gestión de agenda", "Microsoft Office", "Comunicación", "Organización"],
      tools: ["Microsoft Office", "Google Workspace", "Calendly", "Zoom", "Notion"],
      requirements: "Experiencia como asistente, excelentes habilidades organizativas, dominio de herramientas ofimáticas."
    },
    {
      id: "contador",
      title: "Contador",
      category: "soporte profesional",
      description: "Profesional contable responsable de llevar la contabilidad, estados financieros y cumplimiento fiscal de la empresa.",
      skills: ["Contabilidad", "Estados financieros", "Impuestos", "Excel", "Software contable", "NIIF"],
      tools: ["QuickBooks", "SAP", "Microsoft Excel", "Sage", "Xero"],
      requirements: "Título en Contaduría, experiencia en contabilidad empresarial, conocimiento de normativas fiscales."
    },
    {
      id: "abogado-corporativo",
      title: "Abogado Corporativo",
      category: "soporte profesional",
      description: "Abogado especializado en derecho empresarial, contratos comerciales y asesoría legal corporativa.",
      skills: ["Derecho empresarial", "Contratos", "Asesoría legal", "Compliance", "Derecho laboral"],
      tools: ["LexisNexis", "Microsoft Word", "DocuSign", "Legal databases", "Adobe Acrobat"],
      requirements: "Título en Derecho, especialización en derecho empresarial, experiencia en asesoría corporativa."
    },
    {
      id: "rrhh-specialist",
      title: "Especialista en Recursos Humanos",
      category: "soporte profesional",
      description: "Profesional de RRHH responsable de reclutamiento, gestión del talento y desarrollo organizacional.",
      skills: ["Reclutamiento", "Gestión del talento", "HRIS", "Compensación", "Desarrollo organizacional"],
      tools: ["BambooHR", "Workday", "LinkedIn Recruiter", "Indeed", "ATS Systems"],
      requirements: "Experiencia en recursos humanos, conocimiento de legislación laboral, habilidades interpersonales."
    }
  ]
};

interface OpportunityTemplatesProps {
  category: string;
  onSelectTemplate: (template: JobTemplate) => void;
}

export const OpportunityTemplates = ({ category, onSelectTemplate }: OpportunityTemplatesProps) => {
  const templates = JOB_TEMPLATES[category] || [];

  if (templates.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-foreground">Plantillas sugeridas para {category}:</h4>
      <div className="flex flex-wrap gap-2">
        {templates.map((template) => (
          <Badge
            key={template.id}
            variant="outline"
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={() => onSelectTemplate(template)}
          >
            {template.title}
          </Badge>
        ))}
      </div>
    </div>
  );
};