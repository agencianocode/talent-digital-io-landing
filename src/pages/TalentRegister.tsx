import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TalentRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: ""
  });

  const roleOptions = [
    "Closer de ventas",
    "Appointment Setter", 
    "SDR (Sales Development Representative)",
    "Account Executive",
    "Sales Manager",
    "Business Development"
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    if (formData.name && formData.email && formData.role) {
      // Navigate to talent dashboard
      navigate('/talent-dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 pt-6">
        <button 
          onClick={() => navigate('/login')}
          className="text-foreground hover:text-muted-foreground transition-colors"
        >
          Cambiar tipo de cuenta
        </button>
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-100px)] px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Registro de Talento
            </h1>
            <p className="text-muted-foreground">
              Crea tu perfil profesional en TalentoDigital.io
            </p>
          </div>

          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Nombre completo"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />

            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />

            <select
              className="flex h-12 w-full rounded-md bg-secondary px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
            >
              <option value="">Selecciona tu especialidad</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>

            <Button 
              onClick={handleSubmit}
              disabled={!formData.name || !formData.email || !formData.role}
              className="w-full h-12 text-base font-semibold"
            >
              Crear Perfil
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentRegister;