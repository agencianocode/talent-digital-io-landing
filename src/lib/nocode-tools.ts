// Lista completa de 100 herramientas No-Code/Low-Code
// Organizadas por categorías con iconos válidos de Simple Icons

export interface NoCodeTool {
  name: string;
  category: string;
  description: string;
  icon: string;
  color: string;
  pricing: 'free' | 'freemium' | 'paid';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  popular: boolean;
}

export const noCodeTools: NoCodeTool[] = [
  // ===============================
  // AUTOMATION & WORKFLOWS (10 herramientas)
  // ===============================
  {
    name: "Zapier",
    category: "Automation",
    description: "Conecta aplicaciones y automatiza flujos de trabajo",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/zapier.svg",
    color: "#FF4A00",
    pricing: "freemium",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "Make",
    category: "Automation", 
    description: "Plataforma de automatización visual (ex-Integromat)",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/integromat.svg",
    color: "#6366F1",
    pricing: "freemium",
    difficulty: "intermediate",
    popular: true
  },
  {
    name: "n8n",
    category: "Automation",
    description: "Automatización de workflows de código abierto",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/n8n.svg",
    color: "#EA4B71",
    pricing: "freemium",
    difficulty: "intermediate",
    popular: true
  },
  {
    name: "Microsoft Power Automate",
    category: "Automation",
    description: "Automatización de procesos empresariales de Microsoft",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/microsoftpowerautomate.svg",
    color: "#0078D4",
    pricing: "freemium",
    difficulty: "intermediate",
    popular: true
  },
  {
    name: "IFTTT",
    category: "Automation",
    description: "Si esto entonces aquello - automatización simple",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/ifttt.svg",
    color: "#000000",
    pricing: "freemium",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "Parabola",
    category: "Automation",
    description: "Automatiza procesos de datos sin código",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/databricks.svg",
    color: "#FF3621",
    pricing: "paid",
    difficulty: "intermediate",
    popular: false
  },
  {
    name: "Automate.io",
    category: "Automation",
    description: "Integración de aplicaciones empresariales",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/automation.svg",
    color: "#0052CC",
    pricing: "freemium",
    difficulty: "beginner",
    popular: false
  },
  {
    name: "Integrately",
    category: "Automation",
    description: "Automatizaciones listas para usar de 1 clic",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/integromat.svg",
    color: "#4A90E2",
    pricing: "freemium",
    difficulty: "beginner",
    popular: false
  },
  {
    name: "Pabbly Connect",
    category: "Automation",
    description: "Automatización de workflows asequible",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/workflow.svg",
    color: "#6C5CE7",
    pricing: "paid",
    difficulty: "beginner",
    popular: false
  },
  {
    name: "Workato",
    category: "Automation",
    description: "Automatización empresarial e integración",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/workflow.svg",
    color: "#FF6B6B",
    pricing: "paid",
    difficulty: "advanced",
    popular: false
  },

  // ===============================
  // WEBSITE & LANDING PAGE BUILDERS (12 herramientas)
  // ===============================
  {
    name: "Framer",
    category: "Website Builders",
    description: "Diseño y desarrollo web interactivo",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/framer.svg",
    color: "#0055FF",
    pricing: "freemium",
    difficulty: "intermediate",
    popular: true
  },
  {
    name: "Webflow",
    category: "Website Builders",
    description: "Diseñador visual para sitios web responsivos",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/webflow.svg",
    color: "#4353FF",
    pricing: "freemium",
    difficulty: "intermediate",
    popular: true
  },
  {
    name: "Wix",
    category: "Website Builders",
    description: "Constructor de sitios web drag-and-drop",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/wix.svg",
    color: "#0C6EFC",
    pricing: "freemium",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "Squarespace",
    category: "Website Builders",
    description: "Plantillas elegantes para sitios web",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/squarespace.svg",
    color: "#000000",
    pricing: "paid",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "Editor X",
    category: "Website Builders",
    description: "Plataforma de desarrollo web avanzada de Wix",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/wix.svg",
    color: "#7C3AED",
    pricing: "freemium",
    difficulty: "intermediate",
    popular: false
  },
  {
    name: "Carrd",
    category: "Website Builders",
    description: "Landing pages simples de una página",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/carrd.svg",
    color: "#000000",
    pricing: "freemium",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "Unbounce",
    category: "Website Builders",
    description: "Constructor de landing pages para marketing",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/unbounce.svg",
    color: "#FF6900",
    pricing: "paid",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "Leadpages",
    category: "Website Builders",
    description: "Landing pages optimizadas para conversión",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/leadpages.svg",
    color: "#3B82F6",
    pricing: "paid",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "Instapage",
    category: "Website Builders",
    description: "Plataforma de optimización de landing pages",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/instapaper.svg",
    color: "#3B82F6",
    pricing: "paid",
    difficulty: "intermediate",
    popular: false
  },
  {
    name: "Tilda",
    category: "Website Builders",
    description: "Constructor visual de sitios web y tiendas online",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/tidal.svg",
    color: "#FF6900",
    pricing: "freemium",
    difficulty: "beginner",
    popular: false
  },
  {
    name: "Ghost",
    category: "Website Builders",
    description: "Plataforma moderna de publicación y membresías",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/ghost.svg",
    color: "#15171A",
    pricing: "freemium",
    difficulty: "intermediate",
    popular: true
  },
  {
    name: "Readymag",
    category: "Website Builders",
    description: "Herramienta de diseño para revistas digitales",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/readme.svg",
    color: "#00D4AA",
    pricing: "freemium",
    difficulty: "intermediate",
    popular: false
  },

  // ===============================
  // APP BUILDERS & MOBILE (10 herramientas)
  // ===============================
  {
    name: "Bubble",
    category: "App Builders",
    description: "Desarrollo de aplicaciones web sin código",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/bubbletea.svg",
    color: "#1652F0",
    pricing: "freemium",
    difficulty: "intermediate",
    popular: true
  },
  {
    name: "Adalo",
    category: "App Builders",
    description: "Constructor de aplicaciones móviles nativas",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/adobe.svg",
    color: "#5469D4",
    pricing: "freemium",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "FlutterFlow",
    category: "App Builders",
    description: "Constructor visual para aplicaciones Flutter",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/flutter.svg",
    color: "#02569B",
    pricing: "freemium",
    difficulty: "intermediate",
    popular: true
  },
  {
    name: "Glide",
    category: "App Builders",
    description: "Convierte hojas de cálculo en aplicaciones",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/glitch.svg",
    color: "#667EEA",
    pricing: "freemium",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "Thunkable",
    category: "App Builders",
    description: "Constructor drag-and-drop para aplicaciones móviles",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/thunderbird.svg",
    color: "#3F51B5",
    pricing: "freemium",
    difficulty: "beginner",
    popular: false
  },
  {
    name: "BuildFire",
    category: "App Builders",
    description: "Plataforma de desarrollo de aplicaciones móviles",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/buildkite.svg",
    color: "#30A14E",
    pricing: "paid",
    difficulty: "beginner",
    popular: false
  },
  {
    name: "Microsoft PowerApps",
    category: "App Builders",
    description: "Desarrollo de aplicaciones empresariales low-code",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/microsoftpowerapps.svg",
    color: "#742774",
    pricing: "freemium",
    difficulty: "intermediate",
    popular: true
  },
  {
    name: "AppGyver",
    category: "App Builders",
    description: "Plataforma no-code para aplicaciones",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/appveyor.svg",
    color: "#FF6B6B",
    pricing: "free",
    difficulty: "intermediate",
    popular: false
  },
  {
    name: "Draftbit",
    category: "App Builders",
    description: "Constructor visual para aplicaciones React Native",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/draftbit.svg",
    color: "#7C3AED",
    pricing: "paid",
    difficulty: "intermediate",
    popular: false
  },
  {
    name: "Kodular",
    category: "App Builders",
    description: "Constructor de aplicaciones Android gratuito",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/kotlin.svg",
    color: "#FF6B35",
    pricing: "free",
    difficulty: "beginner",
    popular: false
  },

  // ===============================
  // DATABASE & BACKEND (10 herramientas)
  // ===============================
  {
    name: "Airtable",
    category: "Database",
    description: "Base de datos como hoja de cálculo",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/airtable.svg",
    color: "#18BFFF",
    pricing: "freemium",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "Notion",
    category: "Database",
    description: "Workspace todo-en-uno con bases de datos",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/notion.svg",
    color: "#000000",
    pricing: "freemium",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "Coda",
    category: "Database",
    description: "Documentos que funcionan como aplicaciones",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/coda.svg",
    color: "#FF6F2C",
    pricing: "freemium",
    difficulty: "intermediate",
    popular: true
  },
  {
    name: "Monday.com",
    category: "Database",
    description: "Plataforma de gestión de trabajo visual",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/mondaydotcom.svg",
    color: "#FF158A",
    pricing: "paid",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "ClickUp",
    category: "Database",
    description: "Plataforma de productividad todo-en-uno",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/clickup.svg",
    color: "#7B68EE",
    pricing: "freemium",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "Smartsheet",
    category: "Database",
    description: "Plataforma de trabajo colaborativo empresarial",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/smartsheet.svg",
    color: "#CC0000",
    pricing: "paid",
    difficulty: "intermediate",
    popular: true
  },
  {
    name: "Retool",
    category: "Database",
    description: "Constructor de herramientas internas",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/retool.svg",
    color: "#3D3D3D",
    pricing: "freemium",
    difficulty: "intermediate",
    popular: true
  },
  {
    name: "Supabase",
    category: "Database",
    description: "Alternativa open source a Firebase",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/supabase.svg",
    color: "#3ECF8E",
    pricing: "freemium",
    difficulty: "intermediate",
    popular: true
  },
  {
    name: "Firebase",
    category: "Database",
    description: "Plataforma de desarrollo de aplicaciones de Google",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/firebase.svg",
    color: "#FFCA28",
    pricing: "freemium",
    difficulty: "intermediate",
    popular: true
  },
  {
    name: "Baserow",
    category: "Database",
    description: "Base de datos colaborativa open source",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/basecamp.svg",
    color: "#4C51BF",
    pricing: "freemium",
    difficulty: "beginner",
    popular: false
  },

  // ===============================
  // E-COMMERCE & MARKETPLACE (10 herramientas)
  // ===============================
  {
    name: "Shopify",
    category: "E-commerce",
    description: "Plataforma de comercio electrónico líder",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/shopify.svg",
    color: "#7AB55C",
    pricing: "paid",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "WooCommerce",
    category: "E-commerce",
    description: "Plugin de e-commerce para WordPress",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/woocommerce.svg",
    color: "#96588A",
    pricing: "free",
    difficulty: "intermediate",
    popular: true
  },
  {
    name: "BigCommerce",
    category: "E-commerce",
    description: "Plataforma SaaS de comercio electrónico",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/bigcommerce.svg",
    color: "#121118",
    pricing: "paid",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "Gumroad",
    category: "E-commerce",
    description: "Vende productos digitales fácilmente",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/gumroad.svg",
    color: "#36A9AE",
    pricing: "freemium",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "Teachable",
    category: "E-commerce",
    description: "Plataforma para crear y vender cursos online",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/teachable.svg",
    color: "#FD6F53",
    pricing: "freemium",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "Kajabi",
    category: "E-commerce",
    description: "Plataforma todo-en-uno para cursos y marketing",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/kahoot.svg",
    color: "#FF6B35",
    pricing: "paid",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "Podia",
    category: "E-commerce",
    description: "Vende cursos, membresías y descargas",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/podman.svg",
    color: "#4D1A7F",
    pricing: "paid",
    difficulty: "beginner",
    popular: false
  },
  {
    name: "Sellfy",
    category: "E-commerce",
    description: "Vende productos digitales y físicos",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/sellfy.svg",
    color: "#21C5BA",
    pricing: "paid",
    difficulty: "beginner",
    popular: false
  },
  {
    name: "Etsy Pattern",
    category: "E-commerce",
    description: "Constructor de sitios web para vendedores de Etsy",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/etsy.svg",
    color: "#F16521",
    pricing: "paid",
    difficulty: "beginner",
    popular: false
  },
  {
    name: "Square Online",
    category: "E-commerce",
    description: "Constructor gratuito de tiendas online",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/square.svg",
    color: "#3E4348",
    pricing: "freemium",
    difficulty: "beginner",
    popular: true
  },

  // ===============================
  // FORMS & SURVEYS (9 herramientas)
  // ===============================
  {
    name: "Typeform",
    category: "Forms",
    description: "Formularios interactivos y encuestas",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/typeform.svg",
    color: "#262627",
    pricing: "freemium",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "Google Forms",
    category: "Forms",
    description: "Formularios gratuitos de Google",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googleforms.svg",
    color: "#673AB7",
    pricing: "free",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "JotForm",
    category: "Forms",
    description: "Constructor de formularios drag-and-drop",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/jotform.svg",
    color: "#FF6100",
    pricing: "freemium",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "Formstack",
    category: "Forms",
    description: "Formularios empresariales con workflows",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/formspree.svg",
    color: "#5CB3CC",
    pricing: "paid",
    difficulty: "intermediate",
    popular: false
  },
  {
    name: "Gravity Forms",
    category: "Forms",
    description: "Plugin de formularios para WordPress",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/gravatar.svg",
    color: "#1E8CBE",
    pricing: "paid",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "Wufoo",
    category: "Forms",
    description: "Constructor de formularios web",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/webcomponentsdotorg.svg",
    color: "#AD74A6",
    pricing: "freemium",
    difficulty: "beginner",
    popular: false
  },
  {
    name: "SurveyMonkey",
    category: "Forms",
    description: "Plataforma líder en encuestas online",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/surveymonkey.svg",
    color: "#00BF6F",
    pricing: "freemium",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "Tally",
    category: "Forms",
    description: "Formularios gratuitos ilimitados",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/tally.svg",
    color: "#FF6B6B",
    pricing: "freemium",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "Microsoft Forms",
    category: "Forms",
    description: "Formularios y encuestas de Microsoft",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/microsoftforms.svg",
    color: "#7719AA",
    pricing: "freemium",
    difficulty: "beginner",
    popular: true
  },

  // ===============================
  // EMAIL & MARKETING AUTOMATION (8 herramientas)
  // ===============================
  {
    name: "Mailchimp",
    category: "Email Marketing",
    description: "Plataforma de email marketing todo-en-uno",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/mailchimp.svg",
    color: "#FFE01B",
    pricing: "freemium",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "ConvertKit",
    category: "Email Marketing",
    description: "Email marketing para creadores de contenido",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/convertkit.svg",
    color: "#FB6970",
    pricing: "freemium",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "Klaviyo",
    category: "Email Marketing",
    description: "Email marketing avanzado para e-commerce",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/klaviyo.svg",
    color: "#FF9500",
    pricing: "freemium",
    difficulty: "intermediate",
    popular: true
  },
  {
    name: "ActiveCampaign",
    category: "Email Marketing",
    description: "Automatización de marketing por email",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/activecampaign.svg",
    color: "#356AE6",
    pricing: "paid",
    difficulty: "intermediate",
    popular: true
  },
  {
    name: "GetResponse",
    category: "Email Marketing",
    description: "Plataforma de marketing online completa",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/getresponse.svg",
    color: "#00BAFF",
    pricing: "paid",
    difficulty: "beginner",
    popular: false
  },
  {
    name: "Drip",
    category: "Email Marketing",
    description: "CRM de email marketing para e-commerce",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/dribbble.svg",
    color: "#EA4C89",
    pricing: "paid",
    difficulty: "intermediate",
    popular: false
  },
  {
    name: "Campaign Monitor",
    category: "Email Marketing",
    description: "Email marketing para diseñadores",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/campaignmonitor.svg",
    color: "#509E2F",
    pricing: "paid",
    difficulty: "beginner",
    popular: false
  },
  {
    name: "Beehiiv",
    category: "Email Marketing",
    description: "Plataforma moderna para newsletters",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/behance.svg",
    color: "#FFD23F",
    pricing: "freemium",
    difficulty: "beginner",
    popular: true
  },

  // ===============================
  // CHATBOTS & VOICE (8 herramientas)
  // ===============================
  {
    name: "Chatfuel",
    category: "Chatbots",
    description: "Constructor de chatbots para Facebook Messenger",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/chatbot.svg",
    color: "#00D2FF",
    pricing: "freemium",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "ManyChat",
    category: "Chatbots",
    description: "Automatización de marketing conversacional",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/messenger.svg",
    color: "#3F7CE0",
    pricing: "freemium",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "Landbot",
    category: "Chatbots",
    description: "Constructor visual de chatbots",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/landbot.svg",
    color: "#00B2CA",
    pricing: "freemium",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "Voiceflow",
    category: "Chatbots",
    description: "Diseña interfaces de voz y chat",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/voiceflow.svg",
    color: "#3D82F7",
    pricing: "freemium",
    difficulty: "intermediate",
    popular: true
  },
  {
    name: "Dialogflow",
    category: "Chatbots",
    description: "Plataforma de IA conversacional de Google",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/dialogflow.svg",
    color: "#FF9800",
    pricing: "freemium",
    difficulty: "intermediate",
    popular: true
  },
  {
    name: "Drift",
    category: "Chatbots",
    description: "Marketing conversacional y ventas",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/drift.svg",
    color: "#1A202C",
    pricing: "freemium",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "Intercom",
    category: "Chatbots",
    description: "Plataforma de mensajería para clientes",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/intercom.svg",
    color: "#338FFF",
    pricing: "paid",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "Botpress",
    category: "Chatbots",
    description: "Plataforma de chatbots de código abierto",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/botpress.svg",
    color: "#1A73E8",
    pricing: "freemium",
    difficulty: "intermediate",
    popular: false
  },

  // ===============================
  // ANALYTICS & TRACKING (8 herramientas)
  // ===============================
  {
    name: "Google Analytics",
    category: "Analytics",
    description: "Análisis de tráfico web líder mundial",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googleanalytics.svg",
    color: "#E37400",
    pricing: "freemium",
    difficulty: "intermediate",
    popular: true
  },
  {
    name: "Mixpanel",
    category: "Analytics",
    description: "Análisis de eventos y comportamiento de usuarios",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/mixpanel.svg",
    color: "#7856FF",
    pricing: "freemium",
    difficulty: "intermediate",
    popular: true
  },
  {
    name: "Hotjar",
    category: "Analytics",
    description: "Mapas de calor y grabaciones de sesiones",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/hotjar.svg",
    color: "#FD3A5C",
    pricing: "freemium",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "Amplitude",
    category: "Analytics",
    description: "Análisis de productos digitales",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/amplitude.svg",
    color: "#1976D2",
    pricing: "freemium",
    difficulty: "intermediate",
    popular: true
  },
  {
    name: "Plausible",
    category: "Analytics",
    description: "Análisis web simple y respetuoso con la privacidad",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/plausibleanalytics.svg",
    color: "#5850EC",
    pricing: "paid",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "Fathom Analytics",
    category: "Analytics",
    description: "Análisis web enfocado en privacidad",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/fathom.svg",
    color: "#FF4500",
    pricing: "paid",
    difficulty: "beginner",
    popular: false
  },
  {
    name: "Crazy Egg",
    category: "Analytics",
    description: "Mapas de calor y análisis de clics",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/crazyegg.svg",
    color: "#FF6900",
    pricing: "paid",
    difficulty: "beginner",
    popular: false
  },
  {
    name: "FullStory",
    category: "Analytics",
    description: "Captura completa de experiencia digital",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/fullstory.svg",
    color: "#FF6A00",
    pricing: "paid",
    difficulty: "intermediate",
    popular: false
  },

  // ===============================
  // PROJECT MANAGEMENT (7 herramientas)
  // ===============================
  {
    name: "Asana",
    category: "Project Management",
    description: "Gestión de proyectos y equipos",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/asana.svg",
    color: "#273347",
    pricing: "freemium",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "Trello",
    category: "Project Management",
    description: "Tableros Kanban para organizar proyectos",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/trello.svg",
    color: "#0079BF",
    pricing: "freemium",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "Linear",
    category: "Project Management",
    description: "Gestión de issues moderna para equipos",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linear.svg",
    color: "#5E6AD2",
    pricing: "freemium",
    difficulty: "intermediate",
    popular: true
  },
  {
    name: "Height",
    category: "Project Management",
    description: "Gestión de proyectos con automatización inteligente",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/heightapp.svg",
    color: "#3B82F6",
    pricing: "freemium",
    difficulty: "intermediate",
    popular: false
  },
  {
    name: "Basecamp",
    category: "Project Management",
    description: "Organización simple de proyectos y equipos",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/basecamp.svg",
    color: "#1D2D35",
    pricing: "paid",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "Teamwork",
    category: "Project Management",
    description: "Gestión de proyectos para equipos creativos",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/teamwork.svg",
    color: "#FF6B35",
    pricing: "freemium",
    difficulty: "beginner",
    popular: false
  },
  {
    name: "Wrike",
    category: "Project Management",
    description: "Plataforma de gestión de trabajo colaborativo",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/wrike.svg",
    color: "#1D72AA",
    pricing: "freemium",
    difficulty: "intermediate",
    popular: true
  },

  // ===============================
  // CONTENT CREATION & CMS (8 herramientas)
  // ===============================
  {
    name: "WordPress.com",
    category: "Content Creation",
    description: "Plataforma de blogs y sitios web más popular",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/wordpress.svg",
    color: "#21759B",
    pricing: "freemium",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "Medium",
    category: "Content Creation",
    description: "Plataforma de publicación social",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/medium.svg",
    color: "#000000",
    pricing: "freemium",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "Substack",
    category: "Content Creation",
    description: "Newsletters y publicaciones independientes",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/substack.svg",
    color: "#FF6719",
    pricing: "freemium",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "ConvertKit Landing Pages",
    category: "Content Creation",
    description: "Landing pages para creadores",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/convertkit.svg",
    color: "#FB6970",
    pricing: "freemium",
    difficulty: "beginner",
    popular: false
  },
  {
    name: "Linktree",
    category: "Content Creation",
    description: "Bio links para redes sociales",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linktree.svg",
    color: "#39E09B",
    pricing: "freemium",
    difficulty: "beginner",
    popular: true
  },
  {
    name: "Beacons",
    category: "Content Creation",
    description: "Bio links avanzados para creadores",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/beacon.svg",
    color: "#FF6B9D",
    pricing: "freemium",
    difficulty: "beginner",
    popular: false
  },
  {
    name: "Contentful",
    category: "Content Creation",
    description: "CMS headless para desarrolladores",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/contentful.svg",
    color: "#2478CC",
    pricing: "freemium",
    difficulty: "intermediate",
    popular: true
  },
  {
    name: "Strapi",
    category: "Content Creation",
    description: "CMS headless de código abierto",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/strapi.svg",
    color: "#2F2E8B",
    pricing: "freemium",
    difficulty: "intermediate",
    popular: true
  }
];

// Función para obtener herramientas por categoría
export const getToolsByCategory = (category: string): NoCodeTool[] => {
  return noCodeTools.filter(tool => tool.category === category);
};

// Función para obtener herramientas populares
export const getPopularTools = (): NoCodeTool[] => {
  return noCodeTools.filter(tool => tool.popular === true);
};

// Función para obtener herramientas gratuitas
export const getFreeTools = (): NoCodeTool[] => {
  return noCodeTools.filter(tool => tool.pricing === 'free' || tool.pricing === 'freemium');
};

// Función para obtener herramientas por dificultad
export const getToolsByDifficulty = (difficulty: 'beginner' | 'intermediate' | 'advanced'): NoCodeTool[] => {
  return noCodeTools.filter(tool => tool.difficulty === difficulty);
};

// Función para buscar herramientas
export const searchNoCodeTools = (query: string): NoCodeTool[] => {
  const lowercaseQuery = query.toLowerCase();
  return noCodeTools.filter(tool => 
    tool.name.toLowerCase().includes(lowercaseQuery) ||
    tool.category.toLowerCase().includes(lowercaseQuery) ||
    tool.description.toLowerCase().includes(lowercaseQuery)
  );
};

// Categorías disponibles
export const noCodeCategories = [
  'Automation',
  'Website Builders', 
  'App Builders',
  'Database',
  'E-commerce',
  'Forms',
  'Email Marketing',
  'Chatbots',
  'Analytics',
  'Project Management',
  'Content Creation'
];

// Estadísticas del dataset
export const getNoCodeToolsStats = () => {
  const stats: Record<string, number> = {};
  
  noCodeCategories.forEach(category => {
    stats[category] = getToolsByCategory(category).length;
  });
  
  return {
    total: noCodeTools.length,
    byCategory: stats,
    popular: getPopularTools().length,
    free: getFreeTools().length,
    beginner: getToolsByDifficulty('beginner').length,
    intermediate: getToolsByDifficulty('intermediate').length,
    advanced: getToolsByDifficulty('advanced').length
  };
};

export default noCodeTools;
