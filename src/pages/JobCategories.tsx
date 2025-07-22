const JobCategories = () => {
  const jobCategories = {
    "Ventas": ["Closer de ventas", "SDR / Vendedor remoto", "Appointment Setter", "Triage", "Director comercial"],
    "Marketing": ["Media Buyer", "Marketing Expert", "Content Specialist", "Editor de video"], 
    "Operaciones": ["Asistente Operativo", "Asistente Personal Virtual", "Project Manager", "Experto en Automatizaciones"],
    "Fulfillment": ["CSM", "Atención al cliente"]
  };

  // Featured categories as shown in wireframe
  const featuredCategories = [
    "Closer de ventas",
    "Appointment Setter", 
    "Closer de ventas",
    "Closer de ventas",
    "Closer de ventas"
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-foreground mb-12 text-center">
          ¿Qué tipo de trabajo buscas?
        </h1>
        
        {/* Featured Categories Grid */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Top row - 2 cards */}
          <div className="bg-secondary p-12 rounded-lg cursor-pointer hover:bg-card-hover transition-colors">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground">
                Closer de ventas
              </h2>
            </div>
          </div>

          <div className="bg-secondary p-12 rounded-lg cursor-pointer hover:bg-card-hover transition-colors">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground">
                Appointment Setter
              </h2>
            </div>
          </div>
        </div>

        {/* Bottom row - 3 cards */}
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div 
              key={i}
              className="bg-secondary p-12 rounded-lg cursor-pointer hover:bg-card-hover transition-colors"
            >
              <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground">
                  Closer de ventas
                </h2>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobCategories;