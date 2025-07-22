import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from "lucide-react";

const CompanySearch = () => {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState("");
  const [isPersonal, setIsPersonal] = useState(false);

  const handleContinue = () => {
    if (companyName.trim()) {
      navigate('/company-profile', { 
        state: { 
          companyName: companyName.trim(),
          isPersonal 
        } 
      });
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
            <h1 className="text-3xl font-bold text-foreground mb-8">
              ¿Cuál es el nombre de su empresa?
            </h1>
          </div>

          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Nombre de empresa"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="pl-10"
              />
            </div>

            {companyName.trim() && (
              <div className="text-center">
                <button 
                  onClick={handleContinue}
                  className="text-foreground hover:text-muted-foreground inline-flex items-center space-x-2"
                >
                  <span>Crear "{companyName}"</span>
                  <span>→</span>
                </button>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="personal"
                checked={isPersonal}
                onCheckedChange={(checked) => setIsPersonal(!!checked)}
              />
              <label 
                htmlFor="personal"
                className="text-sm text-foreground cursor-pointer"
              >
                Estoy contratando de manera personal
              </label>
            </div>

            <Button 
              onClick={handleContinue}
              disabled={!companyName.trim()}
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

export default CompanySearch;