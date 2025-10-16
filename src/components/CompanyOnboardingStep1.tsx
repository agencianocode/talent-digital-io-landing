import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CompanyData {
  name: string;
  isIndividual: boolean;
}

interface CompanyOnboardingStep1Props {
  onComplete: (data: CompanyData) => void;
  initialData: CompanyData;
  onCompanyNameChange: (name: string) => void;
  onIndividualChange?: (isIndividual: boolean) => void;
}

const CompanyOnboardingStep1 = ({ onComplete, initialData, onCompanyNameChange, onIndividualChange }: CompanyOnboardingStep1Props) => {
  const [companyName, setCompanyName] = useState(initialData.name);
  const [isIndividual, setIsIndividual] = useState(initialData.isIndividual);
  const [isValid, setIsValid] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{name: string, logo_url?: string | null, id?: string}>>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const searchCompanies = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const { data: companies, error } = await supabase
        .from('companies')
        .select('id, name, logo_url')
        .ilike('name', `%${query}%`)
        .limit(5);

      if (error) {
        console.error('Error searching companies:', error);
        setSuggestions([]);
      } else {
        const companyList = companies?.map(c => ({
          id: c.id,
          name: c.name,
          logo_url: c.logo_url
        })) || [];
        
        console.log('Company search results:', companyList);
        companyList.forEach(company => {
          console.log(`Company: ${company.name}, Logo URL: ${company.logo_url}, ID: ${company.id}`);
        });
        
        // Siempre agregar la opción de crear nueva empresa
        const finalSuggestions = [
          ...companyList,
          { name: `Crear "${query}"`, logo_url: null, id: 'create-new' }
        ];
        
        setSuggestions(finalSuggestions);
        setShowSuggestions(finalSuggestions.length > 0);
      }
    } catch (error) {
      console.error('Error searching companies:', error);
      setSuggestions([]);
    }
  };

  const handleCompanyNameChange = (value: string) => {
    setCompanyName(value);
    setIsValid(value.trim().length > 0);
    onCompanyNameChange(value);
    
    if (!isIndividual) {
      searchCompanies(value);
    }
  };

  const handleSuggestionClick = (suggestion: {name: string, logo_url?: string | null, id?: string}) => {
    let finalCompanyName = '';
    
    if (suggestion.id === 'create-new') {
      // Extraer el nombre de la empresa del texto "Crear 'Nombre'"
      finalCompanyName = suggestion.name.match(/Crear "(.+)"/)?.[1] || '';
    } else {
      // Empresa existente
      finalCompanyName = suggestion.name;
    }
    
    setCompanyName(finalCompanyName);
    onCompanyNameChange(finalCompanyName);
    setIsValid(finalCompanyName.length > 0);
    setShowSuggestions(false);

    // Pasar automáticamente al siguiente paso
    setTimeout(() => {
      onComplete({
        name: finalCompanyName.trim(),
        isIndividual: isIndividual,
      });
    }, 100); // Pequeño delay para que el usuario vea la selección
  };

  const handleIndividualChange = (checked: boolean) => {
    setIsIndividual(checked);
    if (onIndividualChange) {
      onIndividualChange(checked);
    }
    
    // Si es individual, activar automáticamente el botón y pasar al siguiente paso
    if (checked) {
      setIsValid(true);
      setShowSuggestions(false);
      
      // Pasar automáticamente al siguiente paso
      setTimeout(() => {
        onComplete({
          name: companyName.trim() || 'Individuo', // Usar 'Individuo' si no hay nombre
          isIndividual: checked,
        });
      }, 100); // Pequeño delay
    } else {
      // Si no es individual, validar que haya nombre de empresa
      setIsValid(companyName.length > 0);
    }
  };

  const handleContinue = () => {
    if (isValid) {
      onComplete({
        name: companyName.trim(),
        isIndividual
      });
    }
  };

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full mx-auto px-6 py-8 sm:px-12 sm:py-16 lg:px-16 lg:py-20 space-y-8 sm:space-y-10 lg:space-y-12 font-['Inter']">
      {/* Title and Description - RESPONSIVE */}
      <div className="text-left space-y-4 sm:space-y-5 lg:space-y-6">
        <h1 className="font-bold text-gray-900 font-['Inter']" style={{fontSize: 'clamp(20px, 4vw, 24px)'}}>
          Empecemos creando tu empresa
        </h1>
        <p className="text-gray-600 leading-relaxed font-['Inter']" style={{fontSize: 'clamp(12px, 3vw, 14px)'}}>
          Para comenzar a publicar oportunidades y gestionar tu equipo, necesitamos los datos básicos de tu empresa.
        </p>
      </div>

      {/* Form - RESPONSIVE */}
      <div className="space-y-6 sm:space-y-7 lg:space-y-8">
        {/* Question */}
        <div>
          <h2 className="font-medium text-gray-900 mb-4 sm:mb-5 lg:mb-6 font-['Inter']" style={{fontSize: 'clamp(14px, 3.5vw, 16px)'}}>
            ¿Cómo se llama tu empresa?
          </h2>
          
          {/* Company Name Input - RESPONSIVE */}
          <div className="relative" ref={dropdownRef}>
            <Input
              type="text"
              placeholder={isIndividual ? "Nombre personal" : "Nombre de empresa"}
              value={companyName}
              onChange={(e) => handleCompanyNameChange(e.target.value)}
              disabled={isIndividual}
              className="h-10 sm:h-12 text-sm sm:text-base border border-gray-300 rounded-lg px-3 sm:px-4 focus:border-gray-400 focus:ring-0 font-['Inter']"
              autoFocus
            />
            
            {/* Dropdown de sugerencias - RESPONSIVE */}
            {showSuggestions && suggestions.length > 0 && !isIndividual && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 sm:max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.id || index}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSuggestionClick(suggestion);
                    }}
                    className="w-full text-left px-3 py-2 sm:px-4 sm:py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer flex items-center gap-3 font-['Inter']"
                  >
                    {suggestion.id === 'create-new' ? (
                      <>
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Plus className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-blue-600 font-medium font-['Inter'] text-sm">{suggestion.name}</span>
                      </>
                    ) : (
                      <>
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {suggestion.logo_url ? (
                            <>
                              <img 
                                src={suggestion.logo_url} 
                                alt={`Logo de ${suggestion.name}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.log('Logo failed to load:', suggestion.logo_url);
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                                onLoad={() => {
                                  console.log('Logo loaded successfully:', suggestion.logo_url);
                                }}
                              />
                              <Building2 className="h-4 w-4 text-gray-500" style={{display: 'none'}} />
                            </>
                          ) : (
                            <Building2 className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                        <span className="text-gray-900 font-['Inter'] text-sm">{suggestion.name}</span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Individual Checkbox - RESPONSIVE */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Checkbox
            id="individual"
            checked={isIndividual}
            onCheckedChange={(checked) => handleIndividualChange(checked as boolean)}
            className="rounded w-4 h-4 sm:w-5 sm:h-5"
          />
          <Label htmlFor="individual" className="text-gray-700 font-['Inter']" style={{fontSize: 'clamp(11px, 2.5vw, 12px)'}}>
            Estoy contratando de manera personal
          </Label>
        </div>

        {/* Continue Button - RESPONSIVE */}
        <div className="pt-8 sm:pt-10 lg:pt-12 pb-8 sm:pb-12 lg:pb-16">
          <Button
            onClick={handleContinue}
            disabled={!isValid}
            variant="default"
            className="w-full h-10 sm:h-12 font-medium rounded-lg font-['Inter']"
            style={{fontSize: 'clamp(12px, 3vw, 14px)'}}
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompanyOnboardingStep1;