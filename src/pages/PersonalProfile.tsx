import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const PersonalProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { companyData, isPersonal } = location.state || {};

  const [formData, setFormData] = useState({
    position: "",
    description: "",
    linkedin: "",
    country: "",
    photo: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContinue = () => {
    // Complete registration - navigate to business dashboard
    navigate('/business-dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 pt-6">
        <button 
          onClick={() => navigate('/company-profile', { state: { companyName: companyData?.companyName, isPersonal } })}
          className="text-foreground hover:text-muted-foreground transition-colors"
        >
          Cambiar tipo de cuenta
        </button>
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-100px)] px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Paso 2/2</p>
            <h1 className="text-2xl font-bold text-foreground">
              Crear tu perfil
            </h1>
          </div>

          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Puesto en SalesXcelerator"
              value={formData.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
            />

            <Textarea
              placeholder="Descripción"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="min-h-[100px]"
            />

            <Input
              type="url"
              placeholder="Perfil LinkedIn o redes"
              value={formData.linkedin}
              onChange={(e) => handleInputChange('linkedin', e.target.value)}
            />

            <Input
              type="text"
              placeholder="País"
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
            />

            <Input
              type="text"
              placeholder="Foto perfil"
              value={formData.photo}
              onChange={(e) => handleInputChange('photo', e.target.value)}
            />

            <Button 
              onClick={handleContinue}
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

export default PersonalProfile;