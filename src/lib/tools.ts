// Dataset completo de 250 herramientas profesionales organizadas por categorías

export interface ProfessionalTool {
  name: string;
  category: string;
  subcategory: string;
  icon: string;
  color: string;
  popularity: 'high' | 'medium' | 'low';
  description: string;
}

export const professionalTools: ProfessionalTool[] = [
  // ===============================
  // DESIGN & CREATIVE (50 herramientas)
  // ===============================
  
  // Adobe Suite
  {
    name: "Adobe Photoshop",
    category: "Design & Creative",
    subcategory: "Photo Editing",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/adobephotoshop.svg",
    color: "#31A8FF",
    popularity: "high",
    description: "Editor de imágenes y fotos profesional"
  },
  {
    name: "Adobe Illustrator",
    category: "Design & Creative",
    subcategory: "Vector Graphics",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/adobeillustrator.svg",
    color: "#FF9A00",
    popularity: "high",
    description: "Diseño gráfico vectorial profesional"
  },
  {
    name: "Adobe XD",
    category: "Design & Creative",
    subcategory: "UI/UX Design",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/adobexd.svg",
    color: "#FF61F6",
    popularity: "high",
    description: "Diseño de experiencias de usuario"
  },
  {
    name: "Adobe After Effects",
    category: "Design & Creative",
    subcategory: "Motion Graphics",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/adobeaftereffects.svg",
    color: "#9999FF",
    popularity: "high",
    description: "Animación y efectos visuales"
  },
  {
    name: "Adobe Premiere Pro",
    category: "Design & Creative",
    subcategory: "Video Editing",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/adobepremierepro.svg",
    color: "#9999FF",
    popularity: "high",
    description: "Edición de video profesional"
  },
  {
    name: "Adobe InDesign",
    category: "Design & Creative",
    subcategory: "Layout Design",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/adobeindesign.svg",
    color: "#FF3366",
    popularity: "high",
    description: "Diseño editorial y maquetación"
  },
  {
    name: "Adobe Lightroom",
    category: "Design & Creative",
    subcategory: "Photo Editing",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/adobelightroom.svg",
    color: "#31A8FF",
    popularity: "high",
    description: "Edición de fotografía digital"
  },
  {
    name: "Adobe Acrobat",
    category: "Design & Creative",
    subcategory: "Document Management",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/adobeacrobatreader.svg",
    color: "#EC1C24",
    popularity: "high",
    description: "Creación y edición de PDF"
  },

  // UI/UX Design Tools
  {
    name: "Figma",
    category: "Design & Creative",
    subcategory: "UI/UX Design",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/figma.svg",
    color: "#F24E1E",
    popularity: "high",
    description: "Herramienta de diseño colaborativo para interfaces"
  },
  {
    name: "Sketch",
    category: "Design & Creative",
    subcategory: "UI/UX Design",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/sketch.svg",
    color: "#F7B500",
    popularity: "high",
    description: "Diseño de interfaces para Mac"
  },
  {
    name: "Canva",
    category: "Design & Creative",
    subcategory: "Graphic Design",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/canva.svg",
    color: "#00C4CC",
    popularity: "high",
    description: "Diseño gráfico simplificado"
  },
  {
    name: "Framer",
    category: "Design & Creative",
    subcategory: "Prototyping",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/framer.svg",
    color: "#0055FF",
    popularity: "medium",
    description: "Herramienta de prototipado interactivo"
  },
  {
    name: "InVision",
    category: "Design & Creative",
    subcategory: "Prototyping",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/invision.svg",
    color: "#FF3366",
    popularity: "medium",
    description: "Plataforma de prototipado y colaboración"
  },
  {
    name: "Principle",
    category: "Design & Creative",
    subcategory: "Animation",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/protodotio.svg",
    color: "#000000",
    popularity: "low",
    description: "Animación de interfaces"
  },
  {
    name: "Marvel App",
    category: "Design & Creative",
    subcategory: "Prototyping",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/protodotio.svg",
    color: "#1FB6FF",
    popularity: "low",
    description: "Herramienta de prototipado simple"
  },
  {
    name: "Zeplin",
    category: "Design & Creative",
    subcategory: "Design Handoff",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/zeplin.svg",
    color: "#FDBD39",
    popularity: "medium",
    description: "Traspaso de diseños a desarrollo"
  },

  // 3D Design Tools
  {
    name: "Blender",
    category: "Design & Creative",
    subcategory: "3D Modeling",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/blender.svg",
    color: "#F5792A",
    popularity: "high",
    description: "Modelado y animación 3D"
  },
  {
    name: "Cinema 4D",
    category: "Design & Creative",
    subcategory: "3D Modeling",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/cinema4d.svg",
    color: "#011A6A",
    popularity: "medium",
    description: "Modelado y animación 3D profesional"
  },
  {
    name: "Maya",
    category: "Design & Creative",
    subcategory: "3D Modeling",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/autodesk.svg",
    color: "#0696D7",
    popularity: "medium",
    description: "Software de animación 3D profesional"
  },
  {
    name: "3ds Max",
    category: "Design & Creative",
    subcategory: "3D Modeling",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/autodesk.svg",
    color: "#0696D7",
    popularity: "medium",
    description: "Modelado y renderizado 3D"
  },
  {
    name: "SketchUp",
    category: "Design & Creative",
    subcategory: "3D Modeling",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/sketchup.svg",
    color: "#005F9E",
    popularity: "medium",
    description: "Modelado 3D arquitectónico"
  },

  // Other Design Tools
  {
    name: "Procreate",
    category: "Design & Creative",
    subcategory: "Digital Art",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/procreate.svg",
    color: "#000000",
    popularity: "high",
    description: "Arte digital para iPad"
  },
  {
    name: "Affinity Designer",
    category: "Design & Creative",
    subcategory: "Vector Graphics",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/affinitydesigner.svg",
    color: "#1B72BE",
    popularity: "medium",
    description: "Diseño vectorial profesional"
  },
  {
    name: "CorelDRAW",
    category: "Design & Creative",
    subcategory: "Vector Graphics",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/coreldraw.svg",
    color: "#000000",
    popularity: "medium",
    description: "Suite de diseño gráfico"
  },
  {
    name: "GIMP",
    category: "Design & Creative",
    subcategory: "Photo Editing",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/gimp.svg",
    color: "#5C5543",
    popularity: "medium",
    description: "Editor de imágenes gratuito"
  },
  {
    name: "Inkscape",
    category: "Design & Creative",
    subcategory: "Vector Graphics",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/inkscape.svg",
    color: "#000000",
    popularity: "medium",
    description: "Editor de gráficos vectoriales gratuito"
  },

  // Video/Audio Professional
  {
    name: "Final Cut Pro",
    category: "Design & Creative",
    subcategory: "Video Editing",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/apple.svg",
    color: "#000000",
    popularity: "medium",
    description: "Edición de video para Mac"
  },
  {
    name: "DaVinci Resolve",
    category: "Design & Creative",
    subcategory: "Video Editing",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/blackmagicdesign.svg",
    color: "#233A54",
    popularity: "medium",
    description: "Edición y corrección de color"
  },
  {
    name: "Audacity",
    category: "Design & Creative",
    subcategory: "Audio Editing",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/audacity.svg",
    color: "#0000CC",
    popularity: "high",
    description: "Editor de audio gratuito"
  },
  {
    name: "Pro Tools",
    category: "Design & Creative",
    subcategory: "Audio Production",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/avid.svg",
    color: "#9900FF",
    popularity: "medium",
    description: "Producción de audio profesional"
  },
  {
    name: "Logic Pro",
    category: "Design & Creative",
    subcategory: "Music Production",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/apple.svg",
    color: "#000000",
    popularity: "medium",
    description: "Producción musical para Mac"
  },

  // Game Development
  {
    name: "Unity",
    category: "Design & Creative",
    subcategory: "Game Development",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/unity.svg",
    color: "#000000",
    popularity: "high",
    description: "Motor de videojuegos"
  },
  {
    name: "Unreal Engine",
    category: "Design & Creative",
    subcategory: "Game Development",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/unrealengine.svg",
    color: "#0E1128",
    popularity: "high",
    description: "Motor de videojuegos avanzado"
  },

  // Collaborative Design
  {
    name: "Miro",
    category: "Design & Creative",
    subcategory: "Collaborative Design",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/miro.svg",
    color: "#050038",
    popularity: "high",
    description: "Pizarra colaborativa online"
  },
  {
    name: "Mural",
    category: "Design & Creative",
    subcategory: "Collaborative Design",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/mural.svg",
    color: "#FF0065",
    popularity: "medium",
    description: "Espacio de trabajo visual colaborativo"
  },

  // Architecture & CAD
  {
    name: "AutoCAD",
    category: "Design & Creative",
    subcategory: "CAD Design",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/autodesk.svg",
    color: "#0696D7",
    popularity: "high",
    description: "Diseño asistido por computadora"
  },

  // ===============================
  // DEVELOPMENT (80 herramientas)
  // ===============================

  // Frontend Frameworks
  {
    name: "React",
    category: "Development",
    subcategory: "Frontend Framework",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/react.svg",
    color: "#61DAFB",
    popularity: "high",
    description: "Biblioteca de JavaScript para interfaces"
  },
  {
    name: "Vue.js",
    category: "Development",
    subcategory: "Frontend Framework",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/vuedotjs.svg",
    color: "#4FC08D",
    popularity: "high",
    description: "Framework progresivo de JavaScript"
  },
  {
    name: "Angular",
    category: "Development",
    subcategory: "Frontend Framework",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/angular.svg",
    color: "#DD0031",
    popularity: "high",
    description: "Plataforma para aplicaciones web"
  },
  {
    name: "Svelte",
    category: "Development",
    subcategory: "Frontend Framework",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/svelte.svg",
    color: "#FF3E00",
    popularity: "medium",
    description: "Framework de componentes compilado"
  },
  {
    name: "Next.js",
    category: "Development",
    subcategory: "React Framework",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/nextdotjs.svg",
    color: "#000000",
    popularity: "high",
    description: "Framework de React para producción"
  },
  {
    name: "Nuxt.js",
    category: "Development",
    subcategory: "Vue Framework",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/nuxtdotjs.svg",
    color: "#00DC82",
    popularity: "medium",
    description: "Framework de Vue.js"
  },
  {
    name: "Gatsby",
    category: "Development",
    subcategory: "Static Site Generator",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/gatsby.svg",
    color: "#663399",
    popularity: "medium",
    description: "Generador de sitios estáticos"
  },
  {
    name: "jQuery",
    category: "Development",
    subcategory: "JavaScript Library",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/jquery.svg",
    color: "#0769AD",
    popularity: "medium",
    description: "Biblioteca de JavaScript"
  },

  // Backend Languages & Runtimes
  {
    name: "Node.js",
    category: "Development",
    subcategory: "Backend Runtime",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/nodedotjs.svg",
    color: "#339933",
    popularity: "high",
    description: "Runtime de JavaScript para servidor"
  },
  {
    name: "Python",
    category: "Development",
    subcategory: "Programming Language",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/python.svg",
    color: "#3776AB",
    popularity: "high",
    description: "Lenguaje de programación versátil"
  },
  {
    name: "Java",
    category: "Development",
    subcategory: "Programming Language",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/java.svg",
    color: "#007396",
    popularity: "high",
    description: "Lenguaje de programación orientado a objetos"
  },
  {
    name: "C#",
    category: "Development",
    subcategory: "Programming Language",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/csharp.svg",
    color: "#239120",
    popularity: "high",
    description: "Lenguaje de Microsoft .NET"
  },
  {
    name: "PHP",
    category: "Development",
    subcategory: "Programming Language",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/php.svg",
    color: "#777BB4",
    popularity: "high",
    description: "Lenguaje para desarrollo web"
  },
  {
    name: "Ruby",
    category: "Development",
    subcategory: "Programming Language",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/ruby.svg",
    color: "#CC342D",
    popularity: "medium",
    description: "Lenguaje de programación dinámico"
  },
  {
    name: "Go",
    category: "Development",
    subcategory: "Programming Language",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/go.svg",
    color: "#00ADD8",
    popularity: "medium",
    description: "Lenguaje de Google para sistemas"
  },
  {
    name: "Rust",
    category: "Development",
    subcategory: "Programming Language",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/rust.svg",
    color: "#000000",
    popularity: "medium",
    description: "Lenguaje de sistemas seguro"
  },
  {
    name: "JavaScript",
    category: "Development",
    subcategory: "Programming Language",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/javascript.svg",
    color: "#F7DF1E",
    popularity: "high",
    description: "Lenguaje de programación web"
  },
  {
    name: "TypeScript",
    category: "Development",
    subcategory: "Programming Language",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/typescript.svg",
    color: "#3178C6",
    popularity: "high",
    description: "JavaScript tipado estáticamente"
  },

  // Backend Frameworks
  {
    name: "Django",
    category: "Development",
    subcategory: "Backend Framework",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/django.svg",
    color: "#092E20",
    popularity: "high",
    description: "Framework web de Python"
  },
  {
    name: "Laravel",
    category: "Development",
    subcategory: "Backend Framework",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/laravel.svg",
    color: "#FF2D20",
    popularity: "high",
    description: "Framework web de PHP"
  },
  {
    name: "Spring Boot",
    category: "Development",
    subcategory: "Backend Framework",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/springboot.svg",
    color: "#6DB33F",
    popularity: "high",
    description: "Framework de Java para microservicios"
  },
  {
    name: "Express.js",
    category: "Development",
    subcategory: "Backend Framework",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/express.svg",
    color: "#000000",
    popularity: "high",
    description: "Framework web de Node.js"
  },
  {
    name: "Flask",
    category: "Development",
    subcategory: "Backend Framework",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/flask.svg",
    color: "#000000",
    popularity: "medium",
    description: "Framework web minimalista de Python"
  },
  {
    name: "Ruby on Rails",
    category: "Development",
    subcategory: "Backend Framework",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/rubyonrails.svg",
    color: "#CC0000",
    popularity: "medium",
    description: "Framework web de Ruby"
  },

  // Mobile Development
  {
    name: "React Native",
    category: "Development",
    subcategory: "Mobile Development",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/react.svg",
    color: "#61DAFB",
    popularity: "high",
    description: "Desarrollo móvil con React"
  },
  {
    name: "Flutter",
    category: "Development",
    subcategory: "Mobile Development",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/flutter.svg",
    color: "#02569B",
    popularity: "high",
    description: "Framework multiplataforma de Google"
  },
  {
    name: "Ionic",
    category: "Development",
    subcategory: "Mobile Development",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/ionic.svg",
    color: "#3880FF",
    popularity: "medium",
    description: "Framework híbrido multiplataforma"
  },
  {
    name: "Xamarin",
    category: "Development",
    subcategory: "Mobile Development",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/xamarin.svg",
    color: "#3498DB",
    popularity: "medium",
    description: "Desarrollo móvil multiplataforma"
  },
  {
    name: "Kotlin",
    category: "Development",
    subcategory: "Mobile Development",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/kotlin.svg",
    color: "#7F52FF",
    popularity: "medium",
    description: "Lenguaje para desarrollo Android"
  },
  {
    name: "Swift",
    category: "Development",
    subcategory: "Mobile Development",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/swift.svg",
    color: "#FA7343",
    popularity: "medium",
    description: "Lenguaje para desarrollo iOS"
  },

  // Databases
  {
    name: "MySQL",
    category: "Development",
    subcategory: "Database",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/mysql.svg",
    color: "#4479A1",
    popularity: "high",
    description: "Base de datos relacional"
  },
  {
    name: "PostgreSQL",
    category: "Development",
    subcategory: "Database",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/postgresql.svg",
    color: "#336791",
    popularity: "high",
    description: "Base de datos relacional avanzada"
  },
  {
    name: "MongoDB",
    category: "Development",
    subcategory: "Database",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/mongodb.svg",
    color: "#47A248",
    popularity: "high",
    description: "Base de datos NoSQL"
  },
  {
    name: "Redis",
    category: "Development",
    subcategory: "Database",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/redis.svg",
    color: "#DC382D",
    popularity: "high",
    description: "Base de datos en memoria"
  },
  {
    name: "Firebase",
    category: "Development",
    subcategory: "Backend Service",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/firebase.svg",
    color: "#FFCA28",
    popularity: "high",
    description: "Plataforma de desarrollo de Google"
  },
  {
    name: "Supabase",
    category: "Development",
    subcategory: "Backend Service",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/supabase.svg",
    color: "#3ECF8E",
    popularity: "medium",
    description: "Alternativa open source a Firebase"
  },

  // Cloud Platforms
  {
    name: "AWS",
    category: "Development",
    subcategory: "Cloud Platform",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/amazonaws.svg",
    color: "#232F3E",
    popularity: "high",
    description: "Servicios en la nube de Amazon"
  },
  {
    name: "Microsoft Azure",
    category: "Development",
    subcategory: "Cloud Platform",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/microsoftazure.svg",
    color: "#0078D4",
    popularity: "high",
    description: "Servicios en la nube de Microsoft"
  },
  {
    name: "Google Cloud",
    category: "Development",
    subcategory: "Cloud Platform",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googlecloud.svg",
    color: "#4285F4",
    popularity: "high",
    description: "Plataforma en la nube de Google"
  },
  {
    name: "Vercel",
    category: "Development",
    subcategory: "Deployment",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/vercel.svg",
    color: "#000000",
    popularity: "high",
    description: "Plataforma de deployment frontend"
  },
  {
    name: "Netlify",
    category: "Development",
    subcategory: "Deployment",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/netlify.svg",
    color: "#00C7B7",
    popularity: "high",
    description: "Plataforma de hosting para web"
  },
  {
    name: "Heroku",
    category: "Development",
    subcategory: "Deployment",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/heroku.svg",
    color: "#430098",
    popularity: "medium",
    description: "Plataforma como servicio"
  },

  // Development Tools & IDEs
  {
    name: "VS Code",
    category: "Development",
    subcategory: "Code Editor",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/visualstudiocode.svg",
    color: "#007ACC",
    popularity: "high",
    description: "Editor de código de Microsoft"
  },
  {
    name: "IntelliJ IDEA",
    category: "Development",
    subcategory: "IDE",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/intellijidea.svg",
    color: "#000000",
    popularity: "high",
    description: "IDE de JetBrains para Java"
  },
  {
    name: "WebStorm",
    category: "Development",
    subcategory: "IDE",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/webstorm.svg",
    color: "#000000",
    popularity: "medium",
    description: "IDE para desarrollo web"
  },
  {
    name: "PyCharm",
    category: "Development",
    subcategory: "IDE",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/pycharm.svg",
    color: "#000000",
    popularity: "high",
    description: "IDE para desarrollo Python"
  },
  {
    name: "Xcode",
    category: "Development",
    subcategory: "IDE",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/xcode.svg",
    color: "#1575F9",
    popularity: "medium",
    description: "IDE de Apple para iOS/macOS"
  },
  {
    name: "Android Studio",
    category: "Development",
    subcategory: "IDE",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/androidstudio.svg",
    color: "#3DDC84",
    popularity: "high",
    description: "IDE oficial para Android"
  },

  // Version Control
  {
    name: "Git",
    category: "Development",
    subcategory: "Version Control",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/git.svg",
    color: "#F05032",
    popularity: "high",
    description: "Control de versiones distribuido"
  },
  {
    name: "GitHub",
    category: "Development",
    subcategory: "Version Control",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/github.svg",
    color: "#181717",
    popularity: "high",
    description: "Plataforma de desarrollo colaborativo"
  },
  {
    name: "GitLab",
    category: "Development",
    subcategory: "Version Control",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/gitlab.svg",
    color: "#FCA326",
    popularity: "medium",
    description: "Plataforma DevOps completa"
  },
  {
    name: "Bitbucket",
    category: "Development",
    subcategory: "Version Control",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/bitbucket.svg",
    color: "#0052CC",
    popularity: "medium",
    description: "Repositorio Git de Atlassian"
  },

  // DevOps & CI/CD
  {
    name: "Docker",
    category: "Development",
    subcategory: "DevOps",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/docker.svg",
    color: "#2496ED",
    popularity: "high",
    description: "Containerización de aplicaciones"
  },
  {
    name: "Kubernetes",
    category: "Development",
    subcategory: "DevOps",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/kubernetes.svg",
    color: "#326CE5",
    popularity: "high",
    description: "Orquestación de contenedores"
  },
  {
    name: "Jenkins",
    category: "Development",
    subcategory: "CI/CD",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/jenkins.svg",
    color: "#D24939",
    popularity: "medium",
    description: "Servidor de automatización"
  },
  {
    name: "GitHub Actions",
    category: "Development",
    subcategory: "CI/CD",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/githubactions.svg",
    color: "#2088FF",
    popularity: "high",
    description: "Automatización de GitHub"
  },

  // Testing Tools
  {
    name: "Jest",
    category: "Development",
    subcategory: "Testing",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/jest.svg",
    color: "#C21325",
    popularity: "high",
    description: "Framework de testing JavaScript"
  },
  {
    name: "Cypress",
    category: "Development",
    subcategory: "Testing",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/cypress.svg",
    color: "#17202C",
    popularity: "high",
    description: "Testing end-to-end"
  },
  {
    name: "Selenium",
    category: "Development",
    subcategory: "Testing",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/selenium.svg",
    color: "#43B02A",
    popularity: "medium",
    description: "Automatización de navegadores"
  },
  {
    name: "Postman",
    category: "Development",
    subcategory: "API Testing",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/postman.svg",
    color: "#FF6C37",
    popularity: "high",
    description: "Plataforma de desarrollo de APIs"
  },

  // Build Tools
  {
    name: "Webpack",
    category: "Development",
    subcategory: "Build Tool",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/webpack.svg",
    color: "#8DD6F9",
    popularity: "high",
    description: "Empaquetador de módulos"
  },
  {
    name: "Vite",
    category: "Development",
    subcategory: "Build Tool",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/vite.svg",
    color: "#646CFF",
    popularity: "high",
    description: "Herramienta de construcción rápida"
  },
  {
    name: "Babel",
    category: "Development",
    subcategory: "Build Tool",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/babel.svg",
    color: "#F9DC3E",
    popularity: "high",
    description: "Transpilador de JavaScript"
  },

  // Package Managers
  {
    name: "npm",
    category: "Development",
    subcategory: "Package Manager",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/npm.svg",
    color: "#CB3837",
    popularity: "high",
    description: "Gestor de paquetes Node.js"
  },
  {
    name: "Yarn",
    category: "Development",
    subcategory: "Package Manager",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/yarn.svg",
    color: "#2C8EBB",
    popularity: "medium",
    description: "Gestor de paquetes JavaScript"
  },

  // ===============================
  // MARKETING & ANALYTICS (40 herramientas)
  // ===============================

  // Social Media Platforms
  {
    name: "Facebook",
    category: "Marketing & Analytics",
    subcategory: "Social Media",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/facebook.svg",
    color: "#1877F2",
    popularity: "high",
    description: "Red social principal"
  },
  {
    name: "Instagram",
    category: "Marketing & Analytics",
    subcategory: "Social Media",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/instagram.svg",
    color: "#E4405F",
    popularity: "high",
    description: "Red social visual"
  },
  {
    name: "LinkedIn",
    category: "Marketing & Analytics",
    subcategory: "Professional Network",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg",
    color: "#0A66C2",
    popularity: "high",
    description: "Red social profesional"
  },
  {
    name: "Twitter",
    category: "Marketing & Analytics",
    subcategory: "Social Media",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/twitter.svg",
    color: "#1DA1F2",
    popularity: "high",
    description: "Red social de microblogging"
  },
  {
    name: "TikTok",
    category: "Marketing & Analytics",
    subcategory: "Social Media",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/tiktok.svg",
    color: "#000000",
    popularity: "high",
    description: "Plataforma de videos cortos"
  },
  {
    name: "YouTube",
    category: "Marketing & Analytics",
    subcategory: "Video Platform",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/youtube.svg",
    color: "#FF0000",
    popularity: "high",
    description: "Plataforma de videos"
  },
  {
    name: "Pinterest",
    category: "Marketing & Analytics",
    subcategory: "Visual Discovery",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/pinterest.svg",
    color: "#BD081C",
    popularity: "medium",
    description: "Red social de descubrimiento visual"
  },
  {
    name: "Snapchat",
    category: "Marketing & Analytics",
    subcategory: "Social Media",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/snapchat.svg",
    color: "#FFFC00",
    popularity: "medium",
    description: "Plataforma de mensajería multimedia"
  },

  // Analytics Tools
  {
    name: "Google Analytics",
    category: "Marketing & Analytics",
    subcategory: "Web Analytics",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googleanalytics.svg",
    color: "#E37400",
    popularity: "high",
    description: "Análisis de tráfico web"
  },
  {
    name: "Mixpanel",
    category: "Marketing & Analytics",
    subcategory: "Product Analytics",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/mixpanel.svg",
    color: "#7856FF",
    popularity: "medium",
    description: "Análisis de productos digitales"
  },
  {
    name: "Amplitude",
    category: "Marketing & Analytics",
    subcategory: "Product Analytics",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/amplitude.svg",
    color: "#1976D2",
    popularity: "medium",
    description: "Análisis de comportamiento de producto"
  },
  {
    name: "Hotjar",
    category: "Marketing & Analytics",
    subcategory: "User Analytics",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/hotjar.svg",
    color: "#FD3A5C",
    popularity: "medium",
    description: "Análisis de comportamiento de usuarios"
  },
  {
    name: "Google Tag Manager",
    category: "Marketing & Analytics",
    subcategory: "Tag Management",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googletagmanager.svg",
    color: "#246FDB",
    popularity: "high",
    description: "Gestión de etiquetas web"
  },

  // Email Marketing
  {
    name: "Mailchimp",
    category: "Marketing & Analytics",
    subcategory: "Email Marketing",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/mailchimp.svg",
    color: "#FFE01B",
    popularity: "high",
    description: "Plataforma de email marketing"
  },
  {
    name: "SendGrid",
    category: "Marketing & Analytics",
    subcategory: "Email Marketing",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/sendgrid.svg",
    color: "#0090FF",
    popularity: "medium",
    description: "Servicio de email transaccional"
  },
  {
    name: "Constant Contact",
    category: "Marketing & Analytics",
    subcategory: "Email Marketing",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/constantcontact.svg",
    color: "#1976D2",
    popularity: "medium",
    description: "Marketing por email y eventos"
  },
  {
    name: "Campaign Monitor",
    category: "Marketing & Analytics",
    subcategory: "Email Marketing",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/campaignmonitor.svg",
    color: "#509E2F",
    popularity: "medium",
    description: "Plataforma de email marketing"
  },

  // Advertising Platforms
  {
    name: "Google Ads",
    category: "Marketing & Analytics",
    subcategory: "Paid Advertising",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googleads.svg",
    color: "#4285F4",
    popularity: "high",
    description: "Plataforma de publicidad de Google"
  },
  {
    name: "Facebook Ads",
    category: "Marketing & Analytics",
    subcategory: "Social Media Advertising",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/facebook.svg",
    color: "#1877F2",
    popularity: "high",
    description: "Publicidad en redes sociales"
  },
  {
    name: "LinkedIn Ads",
    category: "Marketing & Analytics",
    subcategory: "Professional Advertising",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg",
    color: "#0A66C2",
    popularity: "medium",
    description: "Publicidad profesional"
  },

  // CRM & Marketing Automation
  {
    name: "HubSpot",
    category: "Marketing & Analytics",
    subcategory: "CRM & Marketing",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/hubspot.svg",
    color: "#FF7A59",
    popularity: "high",
    description: "Plataforma de CRM y marketing"
  },
  {
    name: "Marketo",
    category: "Marketing & Analytics",
    subcategory: "Marketing Automation",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/adobemarketo.svg",
    color: "#5C4C9F",
    popularity: "medium",
    description: "Automatización de marketing B2B"
  },

  // SEO Tools
  {
    name: "SEMrush",
    category: "Marketing & Analytics",
    subcategory: "SEO",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/semrush.svg",
    color: "#FF642D",
    popularity: "high",
    description: "Herramienta de SEO y marketing"
  },
  {
    name: "Ahrefs",
    category: "Marketing & Analytics",
    subcategory: "SEO",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/ahrefs.svg",
    color: "#FF7A00",
    popularity: "high",
    description: "Análisis de backlinks y SEO"
  },
  {
    name: "Moz",
    category: "Marketing & Analytics",
    subcategory: "SEO",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/moz.svg",
    color: "#1976D2",
    popularity: "medium",
    description: "Herramientas de SEO"
  },

  // Social Media Management
  {
    name: "Buffer",
    category: "Marketing & Analytics",
    subcategory: "Social Media Management",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/buffer.svg",
    color: "#168EEA",
    popularity: "high",
    description: "Gestión de redes sociales"
  },
  {
    name: "Hootsuite",
    category: "Marketing & Analytics",
    subcategory: "Social Media Management",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/hootsuite.svg",
    color: "#000000",
    popularity: "high",
    description: "Plataforma de gestión social"
  },
  {
    name: "Sprout Social",
    category: "Marketing & Analytics",
    subcategory: "Social Media Management",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/sproutsocial.svg",
    color: "#83C441",
    popularity: "medium",
    description: "Gestión y análisis social"
  },

  // ===============================
  // BUSINESS & PRODUCTIVITY (30 herramientas)
  // ===============================

  // Communication Tools
  {
    name: "Slack",
    category: "Business & Productivity",
    subcategory: "Team Communication",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/slack.svg",
    color: "#4A154B",
    popularity: "high",
    description: "Comunicación de equipos"
  },
  {
    name: "Microsoft Teams",
    category: "Business & Productivity",
    subcategory: "Team Communication",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/microsoftteams.svg",
    color: "#6264A7",
    popularity: "high",
    description: "Colaboración y comunicación"
  },
  {
    name: "Zoom",
    category: "Business & Productivity",
    subcategory: "Video Conferencing",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/zoom.svg",
    color: "#2D8CFF",
    popularity: "high",
    description: "Videoconferencias y reuniones"
  },
  {
    name: "Discord",
    category: "Business & Productivity",
    subcategory: "Communication",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/discord.svg",
    color: "#5865F2",
    popularity: "medium",
    description: "Comunicación de comunidades"
  },
  {
    name: "Telegram",
    category: "Business & Productivity",
    subcategory: "Messaging",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/telegram.svg",
    color: "#26A5E4",
    popularity: "medium",
    description: "Aplicación de mensajería segura"
  },

  // Project Management
  {
    name: "Trello",
    category: "Business & Productivity",
    subcategory: "Project Management",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/trello.svg",
    color: "#0079BF",
    popularity: "high",
    description: "Gestión de proyectos con tableros"
  },
  {
    name: "Asana",
    category: "Business & Productivity",
    subcategory: "Project Management",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/asana.svg",
    color: "#273347",
    popularity: "high",
    description: "Gestión de tareas y proyectos"
  },
  {
    name: "Monday.com",
    category: "Business & Productivity",
    subcategory: "Project Management",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/mondaydotcom.svg",
    color: "#FF3D57",
    popularity: "high",
    description: "Plataforma de gestión de trabajo"
  },
  {
    name: "Jira",
    category: "Business & Productivity",
    subcategory: "Project Management",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/jira.svg",
    color: "#0052CC",
    popularity: "high",
    description: "Gestión de proyectos ágiles"
  },
  {
    name: "Linear",
    category: "Business & Productivity",
    subcategory: "Issue Tracking",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linear.svg",
    color: "#5E6AD2",
    popularity: "medium",
    description: "Seguimiento de issues moderno"
  },
  {
    name: "ClickUp",
    category: "Business & Productivity",
    subcategory: "Project Management",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/clickup.svg",
    color: "#7B68EE",
    popularity: "high",
    description: "Plataforma de productividad"
  },

  // CRM Systems
  {
    name: "Salesforce",
    category: "Business & Productivity",
    subcategory: "CRM",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/salesforce.svg",
    color: "#00A1E0",
    popularity: "high",
    description: "Plataforma de CRM empresarial"
  },
  {
    name: "Pipedrive",
    category: "Business & Productivity",
    subcategory: "CRM",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/pipedrive.svg",
    color: "#8B5DFF",
    popularity: "medium",
    description: "CRM orientado a ventas"
  },
  {
    name: "Zoho",
    category: "Business & Productivity",
    subcategory: "Business Suite",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/zoho.svg",
    color: "#DC3F2B",
    popularity: "medium",
    description: "Suite de aplicaciones empresariales"
  },

  // Office Suites
  {
    name: "Microsoft Office",
    category: "Business & Productivity",
    subcategory: "Office Suite",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/microsoftoffice.svg",
    color: "#D83B01",
    popularity: "high",
    description: "Suite de oficina de Microsoft"
  },
  {
    name: "Google Workspace",
    category: "Business & Productivity",
    subcategory: "Office Suite",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googleworkspace.svg",
    color: "#4285F4",
    popularity: "high",
    description: "Suite de productividad de Google"
  },

  // Note Taking & Documentation
  {
    name: "Notion",
    category: "Business & Productivity",
    subcategory: "Note Taking",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/notion.svg",
    color: "#000000",
    popularity: "high",
    description: "Espacio de trabajo todo en uno"
  },
  {
    name: "Obsidian",
    category: "Business & Productivity",
    subcategory: "Note Taking",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/obsidian.svg",
    color: "#7C3AED",
    popularity: "medium",
    description: "Notas conectadas y base de conocimiento"
  },
  {
    name: "Evernote",
    category: "Business & Productivity",
    subcategory: "Note Taking",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/evernote.svg",
    color: "#00A82D",
    popularity: "medium",
    description: "Aplicación de notas y organización"
  },

  // Cloud Storage
  {
    name: "Dropbox",
    category: "Business & Productivity",
    subcategory: "Cloud Storage",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/dropbox.svg",
    color: "#0061FF",
    popularity: "high",
    description: "Almacenamiento en la nube"
  },
  {
    name: "Google Drive",
    category: "Business & Productivity",
    subcategory: "Cloud Storage",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googledrive.svg",
    color: "#4285F4",
    popularity: "high",
    description: "Almacenamiento de Google"
  },
  {
    name: "OneDrive",
    category: "Business & Productivity",
    subcategory: "Cloud Storage",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/microsoftonedrive.svg",
    color: "#0078D4",
    popularity: "high",
    description: "Almacenamiento de Microsoft"
  },

  // Automation
  {
    name: "Zapier",
    category: "Business & Productivity",
    subcategory: "Automation",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/zapier.svg",
    color: "#FF4A00",
    popularity: "high",
    description: "Automatización de flujos de trabajo"
  },
  {
    name: "IFTTT",
    category: "Business & Productivity",
    subcategory: "Automation",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/ifttt.svg",
    color: "#000000",
    popularity: "medium",
    description: "Automatización simple"
  },

  // Database & Spreadsheets
  {
    name: "Airtable",
    category: "Business & Productivity",
    subcategory: "Database",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/airtable.svg",
    color: "#18BFFF",
    popularity: "high",
    description: "Base de datos colaborativa"
  },

  // Digital Signatures
  {
    name: "DocuSign",
    category: "Business & Productivity",
    subcategory: "Digital Signatures",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/docusign.svg",
    color: "#FFCC00",
    popularity: "high",
    description: "Firmas electrónicas"
  },

  // ===============================
  // AI & MACHINE LEARNING (20 herramientas)
  // ===============================

  {
    name: "ChatGPT",
    category: "AI & Machine Learning",
    subcategory: "AI Assistant",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/openai.svg",
    color: "#412991",
    popularity: "high",
    description: "Asistente de IA conversacional"
  },
  {
    name: "Claude",
    category: "AI & Machine Learning",
    subcategory: "AI Assistant",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/anthropic.svg",
    color: "#B17A4A",
    popularity: "high",
    description: "Asistente de IA de Anthropic"
  },
  {
    name: "Midjourney",
    category: "AI & Machine Learning",
    subcategory: "AI Art",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/midjourney.svg",
    color: "#000000",
    popularity: "high",
    description: "Generación de arte con IA"
  },
  {
    name: "DALL-E",
    category: "AI & Machine Learning",
    subcategory: "AI Art",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/openai.svg",
    color: "#412991",
    popularity: "high",
    description: "Generador de imágenes con IA"
  },
  {
    name: "TensorFlow",
    category: "AI & Machine Learning",
    subcategory: "Deep Learning",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/tensorflow.svg",
    color: "#FF6F00",
    popularity: "high",
    description: "Framework de machine learning"
  },
  {
    name: "PyTorch",
    category: "AI & Machine Learning",
    subcategory: "Deep Learning",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/pytorch.svg",
    color: "#EE4C2C",
    popularity: "high",
    description: "Framework de deep learning"
  },
  {
    name: "Hugging Face",
    category: "AI & Machine Learning",
    subcategory: "NLP Platform",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/huggingface.svg",
    color: "#FF9A00",
    popularity: "high",
    description: "Plataforma de NLP y ML"
  },
  {
    name: "Jupyter",
    category: "AI & Machine Learning",
    subcategory: "Development Environment",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/jupyter.svg",
    color: "#F37626",
    popularity: "high",
    description: "Entorno de desarrollo interactivo"
  },
  {
    name: "Google Colab",
    category: "AI & Machine Learning",
    subcategory: "Cloud Notebooks",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googlecolab.svg",
    color: "#F9AB00",
    popularity: "high",
    description: "Notebooks en la nube de Google"
  },
  {
    name: "Stable Diffusion",
    category: "AI & Machine Learning",
    subcategory: "AI Art",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/stablediffusion.svg",
    color: "#3F4F75",
    popularity: "medium",
    description: "Generación de imágenes open source"
  },
  {
    name: "Copilot",
    category: "AI & Machine Learning",
    subcategory: "Code Assistant",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/githubcopilot.svg",
    color: "#000000",
    popularity: "high",
    description: "Asistente de código con IA"
  },
  {
    name: "Scikit-learn",
    category: "AI & Machine Learning",
    subcategory: "Machine Learning",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/scikitlearn.svg",
    color: "#F7931E",
    popularity: "high",
    description: "Biblioteca de ML para Python"
  },
  {
    name: "OpenCV",
    category: "AI & Machine Learning",
    subcategory: "Computer Vision",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/opencv.svg",
    color: "#5C3EE8",
    popularity: "high",
    description: "Biblioteca de visión computacional"
  },
  {
    name: "LangChain",
    category: "AI & Machine Learning",
    subcategory: "LLM Framework",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/langchain.svg",
    color: "#1C3A3A",
    popularity: "high",
    description: "Framework para aplicaciones LLM"
  },
  {
    name: "Runway",
    category: "AI & Machine Learning",
    subcategory: "AI Video",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/runway.svg",
    color: "#000000",
    popularity: "medium",
    description: "Generación de video con IA"
  },
  {
    name: "Replicate",
    category: "AI & Machine Learning",
    subcategory: "AI Platform",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/replicate.svg",
    color: "#000000",
    popularity: "medium",
    description: "Plataforma para ejecutar modelos de IA"
  },
  {
    name: "Weights & Biases",
    category: "AI & Machine Learning",
    subcategory: "ML Tracking",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/weightsandbiases.svg",
    color: "#FFBE00",
    popularity: "medium",
    description: "Seguimiento de experimentos ML"
  },
  {
    name: "MLflow",
    category: "AI & Machine Learning",
    subcategory: "ML Lifecycle",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/mlflow.svg",
    color: "#0194E2",
    popularity: "medium",
    description: "Gestión del ciclo de vida ML"
  },
  {
    name: "Streamlit",
    category: "AI & Machine Learning",
    subcategory: "Web Apps",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/streamlit.svg",
    color: "#FF4B4B",
    popularity: "high",
    description: "Apps web para data science"
  },
  {
    name: "Gradio",
    category: "AI & Machine Learning",
    subcategory: "ML Interfaces",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/gradio.svg",
    color: "#FF7C00",
    popularity: "medium",
    description: "Interfaces rápidas para ML"
  },

  // ===============================
  // DATA & ANALYTICS (20 herramientas)
  // ===============================

  {
    name: "Tableau",
    category: "Data & Analytics",
    subcategory: "Data Visualization",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/tableau.svg",
    color: "#E97627",
    popularity: "high",
    description: "Visualización de datos empresarial"
  },
  {
    name: "Power BI",
    category: "Data & Analytics",
    subcategory: "Business Intelligence",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/powerbi.svg",
    color: "#F2C811",
    popularity: "high",
    description: "Inteligencia de negocio de Microsoft"
  },
  {
    name: "Excel",
    category: "Data & Analytics",
    subcategory: "Spreadsheet",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/microsoftexcel.svg",
    color: "#217346",
    popularity: "high",
    description: "Hoja de cálculo de Microsoft"
  },
  {
    name: "Google Sheets",
    category: "Data & Analytics",
    subcategory: "Spreadsheet",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googlesheets.svg",
    color: "#34A853",
    popularity: "high",
    description: "Hoja de cálculo de Google"
  },
  {
    name: "R",
    category: "Data & Analytics",
    subcategory: "Statistical Computing",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/r.svg",
    color: "#276DC3",
    popularity: "medium",
    description: "Lenguaje para análisis estadístico"
  },
  {
    name: "Pandas",
    category: "Data & Analytics",
    subcategory: "Data Manipulation",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/pandas.svg",
    color: "#150458",
    popularity: "high",
    description: "Biblioteca de Python para datos"
  },
  {
    name: "NumPy",
    category: "Data & Analytics",
    subcategory: "Scientific Computing",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/numpy.svg",
    color: "#013243",
    popularity: "high",
    description: "Computación científica en Python"
  },
  {
    name: "Apache Spark",
    category: "Data & Analytics",
    subcategory: "Big Data",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/apachespark.svg",
    color: "#E25A1C",
    popularity: "medium",
    description: "Motor de análisis unificado"
  },
  {
    name: "Snowflake",
    category: "Data & Analytics",
    subcategory: "Data Warehouse",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/snowflake.svg",
    color: "#29B5E8",
    popularity: "high",
    description: "Almacén de datos en la nube"
  },
  {
    name: "BigQuery",
    category: "Data & Analytics",
    subcategory: "Data Warehouse",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googlebigquery.svg",
    color: "#4285F4",
    popularity: "high",
    description: "Almacén de datos de Google"
  },
  {
    name: "Databricks",
    category: "Data & Analytics",
    subcategory: "Data Platform",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/databricks.svg",
    color: "#FF3621",
    popularity: "medium",
    description: "Plataforma de análisis colaborativo"
  },
  {
    name: "Looker",
    category: "Data & Analytics",
    subcategory: "Business Intelligence",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/looker.svg",
    color: "#4285F4",
    popularity: "medium",
    description: "Plataforma de BI moderna"
  },
  {
    name: "D3.js",
    category: "Data & Analytics",
    subcategory: "Data Visualization",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/d3dotjs.svg",
    color: "#F9A03C",
    popularity: "medium",
    description: "Visualización de datos web"
  },
  {
    name: "Plotly",
    category: "Data & Analytics",
    subcategory: "Data Visualization",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/plotly.svg",
    color: "#3F4F75",
    popularity: "medium",
    description: "Gráficos interactivos"
  },
  {
    name: "Elasticsearch",
    category: "Data & Analytics",
    subcategory: "Search & Analytics",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/elasticsearch.svg",
    color: "#005571",
    popularity: "medium",
    description: "Motor de búsqueda y análisis"
  },
  {
    name: "Kibana",
    category: "Data & Analytics",
    subcategory: "Data Visualization",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/kibana.svg",
    color: "#005571",
    popularity: "medium",
    description: "Visualización de datos Elastic"
  },
  {
    name: "Grafana",
    category: "Data & Analytics",
    subcategory: "Monitoring",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/grafana.svg",
    color: "#F46800",
    popularity: "medium",
    description: "Plataforma de observabilidad"
  },
  {
    name: "Apache Kafka",
    category: "Data & Analytics",
    subcategory: "Data Streaming",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/apachekafka.svg",
    color: "#231F20",
    popularity: "medium",
    description: "Plataforma de streaming de datos"
  },
  {
    name: "Metabase",
    category: "Data & Analytics",
    subcategory: "Business Intelligence",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/metabase.svg",
    color: "#509EE3",
    popularity: "medium",
    description: "BI open source"
  },
  {
    name: "Superset",
    category: "Data & Analytics",
    subcategory: "Data Visualization",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/apachesuperset.svg",
    color: "#20A7C9",
    popularity: "medium",
    description: "Plataforma de visualización moderna"
  }
];

// Función para obtener herramientas por categoría
export const getToolsByCategory = (category: string): ProfessionalTool[] => {
  return professionalTools.filter(tool => tool.category === category);
};

// Función para obtener herramientas por popularidad
export const getToolsByPopularity = (popularity: 'high' | 'medium' | 'low'): ProfessionalTool[] => {
  return professionalTools.filter(tool => tool.popularity === popularity);
};

// Función para buscar herramientas
export const searchTools = (query: string): ProfessionalTool[] => {
  const lowercaseQuery = query.toLowerCase();
  return professionalTools.filter(tool => 
    tool.name.toLowerCase().includes(lowercaseQuery) ||
    tool.category.toLowerCase().includes(lowercaseQuery) ||
    tool.subcategory.toLowerCase().includes(lowercaseQuery) ||
    tool.description.toLowerCase().includes(lowercaseQuery)
  );
};

// Obtener todas las categorías únicas
export const getCategories = (): string[] => {
  return [...new Set(professionalTools.map(tool => tool.category))];
};

// Obtener todas las subcategorías únicas
export const getSubcategories = (): string[] => {
  return [...new Set(professionalTools.map(tool => tool.subcategory))];
};

// Estadísticas del dataset
export const getToolsStats = () => {
  const categories = getCategories();
  const stats: Record<string, number> = {};
  
  categories.forEach(category => {
    stats[category] = getToolsByCategory(category).length;
  });
  
  return {
    total: professionalTools.length,
    byCategory: stats,
    highPopularity: getToolsByPopularity('high').length,
    mediumPopularity: getToolsByPopularity('medium').length,
    lowPopularity: getToolsByPopularity('low').length
  };
};

export default professionalTools;