import { Badge } from "@/components/ui/badge";

export interface JobTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  skills: string[];
  requirements: string;
}

export const JOB_TEMPLATES: Record<string, JobTemplate[]> = {
  ventas: [
    {
      id: "closer-ventas",
      title: "Closer de Ventas",
      category: "ventas",
      description: "Especialista en cierre de ventas encargado de convertir leads calificados en clientes. Responsable de negociar, presentar propuestas y cerrar acuerdos comerciales.",
      skills: ["Cierre de ventas", "Negociación", "CRM", "Prospección", "Cold calling"],
      requirements: "Experiencia mínima de 2 años en ventas, conocimiento de técnicas de cierre, habilidades de comunicación excepcionales."
    },
    {
      id: "sales-development",
      title: "Sales Development Representative (SDR)",
      category: "ventas",
      description: "Generador de oportunidades de venta enfocado en prospección y calificación de leads. Primer contacto con potenciales clientes.",
      skills: ["Prospección", "Lead generation", "Cold calling", "Email marketing", "CRM"],
      requirements: "Experiencia en prospección, conocimiento de herramientas de CRM, habilidades de comunicación telefónica."
    }
  ],
  marketing: [
    {
      id: "marketing-digital",
      title: "Especialista en Marketing Digital",
      category: "marketing",
      description: "Responsable de desarrollar y ejecutar estrategias de marketing digital para incrementar la visibilidad online y generar leads.",
      skills: ["Marketing Digital", "SEO", "SEM", "Social Media", "Google Analytics", "Content Marketing"],
      requirements: "Experiencia en campañas digitales, conocimiento de Google Ads y Facebook Ads, certificaciones en marketing digital preferibles."
    },
    {
      id: "growth-marketer",
      title: "Growth Marketer",
      category: "marketing",
      description: "Especialista en crecimiento enfocado en identificar y ejecutar estrategias para acelerar el crecimiento del negocio.",
      skills: ["Growth Hacking", "Analytics", "A/B Testing", "Marketing automation", "Funnel optimization"],
      requirements: "Experiencia en growth marketing, conocimiento de herramientas de analytics, mentalidad orientada a datos."
    }
  ],
  tecnologia: [
    {
      id: "full-stack-developer",
      title: "Desarrollador Full Stack",
      category: "tecnologia",
      description: "Desarrollador con experiencia en frontend y backend, capaz de crear aplicaciones web completas y escalables.",
      skills: ["JavaScript", "React", "Node.js", "TypeScript", "Git", "API Development", "Database Design"],
      requirements: "Experiencia mínima de 3 años en desarrollo web, portafolio de proyectos, conocimiento de metodologías ágiles."
    },
    {
      id: "qa-tester",
      title: "QA Tester",
      category: "tecnologia",
      description: "Especialista en aseguramiento de calidad responsable de testing manual y automatizado de aplicaciones.",
      skills: ["Testing manual", "Testing automatizado", "Selenium", "Bug tracking", "Test cases"],
      requirements: "Experiencia en testing de software, conocimiento de herramientas de automatización, atención al detalle."
    }
  ]
};

interface OpportunityTemplatesProps {
  category: string;
  onSelectTemplate: (template: JobTemplate) => void;
}

export const OpportunityTemplates = ({ category, onSelectTemplate }: OpportunityTemplatesProps) => {
  const templates = JOB_TEMPLATES[category.toLowerCase()] || [];

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