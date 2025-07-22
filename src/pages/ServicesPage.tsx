const ServicesPage = () => {
  // Mock services data
  const services = [
    {
      title: "Formación SalesXcelerator",
      description: "Entrena a tu equipo de ventas con el método Xcelerator para vendedores...",
    },
    {
      title: "Programa BusinessXcelerator", 
      description: "Impulsa tu negocio a +100k recurrentes con estrategias probadas"
    },
    {
      title: "Formación SettersXcelerator",
      description: "Conviértete en Appointment Setter en 45 días"
    }
  ];

  return (
    <div className="p-8">
      {/* Title */}
      <h1 className="text-3xl font-bold text-foreground mb-8">
        Marketplace Servicios
      </h1>
      
      {/* Services Grid */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {services.map((service, index) => (
          <div 
            key={index}
            className="bg-card rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow"
          >
            {/* Logo placeholder */}
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-secondary rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span className="text-2xl font-bold">SX</span>
              </div>
              <p className="text-xs text-muted-foreground font-semibold">
                SALES XCELERATOR
              </p>
            </div>
            
            {/* Content */}
            <h3 className="font-semibold text-foreground mb-2">
              {service.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {service.description}
            </p>
          </div>
        ))}
      </div>

      {/* Promotional Card */}
      <div className="bg-secondary rounded-lg p-12 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Próximamente podrás ver mas servicios, e incluso publicar tu propio servicio....
        </h2>
      </div>
    </div>
  );
};

export default ServicesPage;