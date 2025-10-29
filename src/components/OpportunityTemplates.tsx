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
      description: `**Descripción general del rol:**

El Closer de Ventas es el profesional que toma el relevo de los leads ya cualificados para llevarlos hacia el "sí". Trabaja principalmente con leads inbound o agendados por setters, se conecta con ellos por llamada o videollamada, identifica sus necesidades, objeciones y consigue el cierre de la venta. Este rol exige alta capacidad de persuasión, automatismos de aprendizaje y dominio de procesos de ventas complejas, especialmente en entornos digital-high ticket.

**Responsabilidades:**

- Conducir llamadas o videollamadas de venta con leads previamente cualificados.
- Presentar la solución adecuada al cliente y negociar términos, asegurando que los acuerdos sean beneficiosos para ambas partes.
- Utilizar y actualizar el CRM con información de clientes, seguimiento y cierre.
- Colaborar con los setters, marketing y operaciones para optimizar el proceso de conversión.
- Cumplir y exceder cuotas de cierre mensuales o trimestrales.
- Manejar objeciones, generar confianza y cerrar ventas con eficiencia en ciclos de tiempo definidos.

**Requisitos:**

- Experiencia comprobada en cierre de ventas (preferiblemente en entornos digitales o high ticket).
- Excelentes habilidades de comunicación y negociación.
- Conocimiento de CRM y herramientas de ventas.
- Orientación a resultados, resiliencia ante rechazo y capacidad de autogestión`,
      skills: ["ventas", "cierre", "negociación", "CRM", "comunicación", "high ticket"],
      tools: ["CRM", "Zoom", "Google Meet"],
      requirements: "Experiencia comprobada en cierre de ventas (preferiblemente en entornos digitales o high ticket). Excelentes habilidades de comunicación y negociación."
    },
    {
      id: "appointment-setter",
      title: "Appointment Setter",
      category: "ventas",
      description: `**Descripción general del rol:**

Un Appointment Setter es el puente entre el interés inicial del cliente potencial y el equipo de ventas. Su misión es contactar leads, validar su interés, agendar citas o demostraciones con los closers, y asegurar que los prospectos lleguen al equipo de ventas con un nivel mínimo de preparación.

**Responsabilidades:**

- Realizar llamadas o contactos outbound / inbound mediante teléfono, email o redes sociales a una base de leads.
- Calificar el prospecto según criterios definidos (interés, presupuesto, necesidad) y registrar los datos en CRM.
- Coordinar y agendar citas con el equipo de ventas (closers), asegurando disponibilidad y seguimiento.
- Mantener registros actualizados de llamadas, citas y estatus de prospectos.
- Colaborar con marketing para retroalimentar información de calidad de leads, objeciones comunes o mejoras en el proceso.
- Cumplir objetivos de citas agendadas, tasa de conversión y calidad de leads según indicadores.

**Requisitos:**

- Buen nivel de comunicación verbal y escrita.
- Capacidad organizativa, habilidad para multitarea y seguimiento.
- Familiaridad con herramientas CRM y capacidad para aprender nuevas plataformas.
- Actitud proactiva, orientada a resultados y al trabajo en entorno dinámico.
- No necesariamente se requiere larga experiencia, pero se valora conocimiento en ventas, atención al cliente o telemarketing.`,
      skills: ["prospección", "comunicación", "CRM", "seguimiento", "organización"],
      tools: ["CRM", "Calendly", "Google Calendar"],
      requirements: "Buen nivel de comunicación verbal y escrita. Capacidad organizativa, habilidad para multitarea y seguimiento. Familiaridad con herramientas CRM."
    },
    {
      id: "sdr-representante-ventas",
      title: "SDR / Representante de Ventas",
      category: "ventas",
      description: `Buscamos un **Ejecutivo de Ventas Full-Cycle**, capaz de liderar **todo el proceso comercial de principio a fin**: desde la prospección y calificación de leads hasta el cierre de las oportunidades.

Este rol combina la mentalidad estratégica de un **SDR** con la habilidad persuasiva de un **Closer**, ideal para profesionales que disfrutan tanto de generar nuevas oportunidades como de concretarlas.

Vas a formar parte de un equipo dinámico, con procesos definidos y herramientas digitales modernas (CRM, automatizaciones y flujos de seguimiento). Tu objetivo será conectar con potenciales clientes, entender sus necesidades y guiarlos hacia una decisión de compra informada y segura.

---

### ⚙️ **Responsabilidades**

- Generar y gestionar tu propia cartera de prospectos (inbound y outbound).
- Calificar leads mediante llamadas o mensajes para identificar necesidades y nivel de interés.
- Realizar presentaciones, demostraciones o llamadas de diagnóstico según el proceso comercial.
- Llevar a cabo reuniones de cierre, negociaciones y acuerdos finales con los prospectos calificados.
- Mantener actualizado el CRM con todas las interacciones y etapas del pipeline.
- Colaborar con los equipos de marketing y operaciones para optimizar los mensajes y la experiencia del cliente.
- Alcanzar y superar los objetivos mensuales de cierre, facturación y tasa de conversión.

---

### 🧠 **Requisitos**

- Experiencia comprobable en ventas consultivas, preferentemente en negocios digitales, SaaS, agencias o infoproductos.
- Conocimiento sólido del ciclo completo de ventas: prospección, calificación, presentación, seguimiento y cierre.
- Excelentes habilidades de comunicación verbal y escrita, empatía y escucha activa.
- Alta orientación a resultados, autonomía y organización personal.
- Familiaridad con herramientas CRM (HubSpot, Airtable, GoHighLevel, Pipedrive o similares).
- Valoramos experiencia en ventas remotas y trabajo por objetivos.

---

### 🚀 **Lo que ofrecemos**

- Oportunidad de trabajar con marcas digitales en expansión.
- Procesos claros, soporte y acompañamiento constante.
- Ambiente meritocrático, 100 % remoto y con posibilidad de crecimiento profesional.
- Bonos por desempeño y resultados excepcionales.`,
      skills: ["ventas B2B", "prospección", "comunicación", "estrategia", "CRM"],
      tools: ["HubSpot", "Airtable", "GoHighLevel", "Pipedrive"],
      requirements: "Experiencia comprobable en ventas consultivas, preferentemente en negocios digitales, SaaS, agencias o infoproductos. Conocimiento sólido del ciclo completo de ventas."
    },
    {
      id: "triage-setter",
      title: "Triage Setter",
      category: "ventas",
      description: `**Descripción general del rol:**

El Triage Setter es el primer punto de contacto dentro del proceso comercial o de atención. Su función principal es recibir leads, calificarlos rápidamente mediante una llamada con base en criterios predefinidos, filtrar los que corresponden al cliente ideal y redirigirlos al equipo comercial o de closers. En el contexto digital, este rol es clave para optimizar tiempo, calidad y eficiencia del pipeline de ventas.

**Responsabilidades:**

- Atender, evaluar y filtrar leads entrantes (por formulario, chat, llamada) asegurando que cumplan los criterios de cliente ideal.
- Llevar a cabo preguntas de diagnóstico iniciales, entender la necesidad del prospecto y registrar datos en CRM.
- Derivar leads calificados al siguiente nivel del proceso (closer o SDR) con toda la información relevante.
- Realizar seguimiento de leads no calificados, indicar motivos o tomar acciones de nurturing si corresponde.
- Mantener la base de datos limpia y organizada, asegurando que el proceso de filtro permita optimizar el cierre de ventas.
- Trabajar con objetivos de volumen de leads revisados, tasa de calificación y tiempo de respuesta.

**Requisitos:**

- Excelentes habilidades de comunicación y escucha activa.
- Capacidad de trabajar en entornos con alta velocidad y volumen de leads.
- Familiaridad con CRM o disposición a aprender rápidamente sistemas de gestión de leads.
- Buena capacidad organizativa, atención al detalle y disposición al aprendizaje.
- Ideal experiencia en atención al cliente, ventas o telemarketing.`,
      skills: ["triage", "filtrado", "atención al cliente", "comunicación", "organización"],
      tools: ["CRM", "Chat systems", "Call center software"],
      requirements: "Excelentes habilidades de comunicación y escucha activa. Capacidad de trabajar en entornos con alta velocidad y volumen de leads. Familiaridad con CRM."
    },
    {
      id: "lider-comercial",
      title: "Líder Comercial",
      category: "ventas",
      description: `**Descripción general del rol:**

El Líder Comercial es el responsable de orquestar todo el proceso comercial de una empresa o unidad de negocio. Supervisa al equipo de ventas (SDRs, setters y closers), define estrategias de conversión, elabora métricas, scripts, indicadores clave de rendimiento (KPIs) y asegura que el equipo logre sus objetivos de ventas. Este rol es estratégico, con foco en crecimiento sostenible, optimización y gestión de talento comercial.

**Responsabilidades:**

- Liderar, motivar y desarrollar al equipo comercial, estableciendo metas claras, coaching y seguimiento de desempeño.
- Definir y optimizar procesos de ventas, scripts, CRM, pipeline y tácticas de conversión.
- Analizar métricas de ventas, ciclo comercial, tasa de cierre, ticket promedio y proponer mejoras continuas.
- Colaborar con marketing, operaciones y producto para alinear la estrategia comercial con la oferta y mercado.
- Implementar programas de formación, seguimiento individual y gestión de talento dentro del equipo.
- Asegurar cumplimiento de objetivos de ingresos y crecimiento del negocio.

**Requisitos:**

- Experiencia sólida en ventas y gestión comercial (preferiblemente en entornos digitales o B2B).
- Fuertes habilidades de liderazgo, coaching y desarrollo de equipos.
- Excelentes capacidades analíticas, dominio de CRM y manejo de indicadores (KPI).
- Capacidad para diseñar y ejecutar estrategias de ventas, adaptarse a cambios rápidos y liderar bajo objetivos exigentes.`,
      skills: ["liderazgo", "métricas", "CRM", "coaching", "cierre"],
      tools: ["CRM", "Analytics platforms", "Performance dashboards"],
      requirements: "Experiencia sólida en ventas y gestión comercial. Fuertes habilidades de liderazgo, coaching y desarrollo de equipos. Excelentes capacidades analíticas."
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