import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const CompanyOnboarding = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: "",
    description: "",
    website: "",
    location: "",
    logo: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContinue = () => {
    // Save company data to context/localStorage
    localStorage.setItem('companyData', JSON.stringify(formData));
    navigate('/user-profile');
  };

  const isFormValid = formData.companyName && formData.description;

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
            <p className="text-sm text-muted-foreground mb-2">Paso 1/2</p>
            <h1 className="text-2xl font-bold text-foreground">
              Crear tu perfil de empresa
            </h1>
          </div>

          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Nombre de empresa"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
            />

            <Textarea
              placeholder="Descripción"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="min-h-[100px]"
            />

            <Input
              type="url"
              placeholder="Página web"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
            />

            <Input
              type="text"
              placeholder="Ubicación"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
            />

            <Input
              type="text"
              placeholder="Logo"
              value={formData.logo}
              onChange={(e) => handleInputChange('logo', e.target.value)}
            />

            <Button 
              onClick={handleContinue}
              disabled={!isFormValid}
              className="w-full h-12 text-base font-semibold"
            >
              Continuar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyOnboarding;