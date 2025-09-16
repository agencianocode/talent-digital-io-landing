import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProfileData {
  professionalTitle: string;
  linkedinUrl: string;
  phoneNumber: string;
  location: string;
  profilePhoto?: File;
}

interface CompanyOnboardingStep2Props {
  onComplete: (data: ProfileData) => void;
  initialData: ProfileData;
  companyName: string;
}

const CompanyOnboardingStep2 = ({ onComplete, initialData, companyName }: CompanyOnboardingStep2Props) => {
  const [location, setLocation] = useState(initialData.location || '');
  const [profilePhoto, setProfilePhoto] = useState<File | null>(initialData.profilePhoto || null);
  const [companyExists, setCompanyExists] = useState<boolean | null>(null);
  const [isCheckingCompany, setIsCheckingCompany] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if company exists in directory
  useEffect(() => {
    const checkCompanyExists = async () => {
      if (!companyName) return;
      
      setIsCheckingCompany(true);
      try {
        const { data, error } = await supabase
          .from('company_directory')
          .select('*')
          .ilike('name', companyName)
          .limit(1);
        
        if (error) throw error;
        setCompanyExists(data && data.length > 0);
      } catch (error) {
        console.error('Error checking company:', error);
        setCompanyExists(false);
      } finally {
        setIsCheckingCompany(false);
      }
    };

    checkCompanyExists();
  }, [companyName]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
    }
  };

  const handleUploadPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleContinue = () => {
    onComplete({
      professionalTitle: '',
      linkedinUrl: '',
      phoneNumber: '',
      location: location.trim(),
      profilePhoto: profilePhoto || undefined
    });
  };

  const isValid = true;

  const countries = [
    'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Costa Rica', 'Cuba', 'Ecuador', 
    'El Salvador', 'España', 'Guatemala', 'Honduras', 'México', 'Nicaragua', 'Panamá', 
    'Paraguay', 'Perú', 'Puerto Rico', 'República Dominicana', 'Uruguay', 'Venezuela'
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Cambiar el tipo de cuenta
          </button>
          <span className="text-gray-400">|</span>
          <span className="text-gray-600 dark:text-gray-400">Configuración de cuenta de contratación</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Form */}
          <div className="space-y-8">
            {/* Step Indicator */}
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Paso 2 / 2
            </div>

            {/* Main Question */}
            <div className="space-y-6">
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                  ¿Cómo se llama su empresa?
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Complete algunos detalles sobre su empresa/espacio de trabajo de contratación
                </p>
              </div>
              
              {/* Form Fields */}
              <div className="space-y-6">
                {/* Company Name */}
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder={companyName || "Nombre de la empresa"}
                    value={companyName || ""}
                    readOnly
                    className="h-12 bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 rounded-lg text-base"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <textarea
                    placeholder="Descripción de la Empresa"
                    className="w-full h-24 p-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-base resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="text-right text-sm text-gray-500">25/160</div>
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Input
                    type="url"
                    placeholder="https://agenciadenocode.com/"
                    className="h-12 bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 rounded-lg text-base"
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="h-12 bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 rounded-lg text-base">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <SelectValue placeholder="Colombia" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Upload Logo */}
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleUploadPhoto}
                    className="flex items-center gap-3 h-12 w-full bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Subir el logotipo de la empresa
                  </Button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-8">
              <Button
                type="button"
                variant="ghost"
                onClick={() => window.history.back()}
                className="h-12 px-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 rounded-lg"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <Button
                onClick={handleContinue}
                disabled={!isValid}
                className="flex-1 h-12 text-base font-medium bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 rounded-lg text-white"
              >
                Continuar
              </Button>
            </div>
          </div>
          
          {/* Right Column - Company Preview Card */}
          <div className="flex items-start justify-center pt-16">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg max-w-sm w-full border border-gray-200 dark:border-slate-700">
              <div className="text-center space-y-6">
                {/* Company Logo Placeholder */}
                <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>

                {/* Company Name */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {companyName || 'Agencia de No Code'}
                  </h3>
                  
                  {/* Company Status */}
                  {isCheckingCompany ? (
                    <span className="inline-block px-3 py-1 mt-2 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 rounded-full">
                      Verificando...
                    </span>
                  ) : companyExists !== null && (
                    <span className={`inline-block px-3 py-1 mt-2 text-xs font-medium rounded-full ${
                      companyExists 
                        ? 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30' 
                        : 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30'
                    }`}>
                      {companyExists ? 'EMPRESA REGISTRADA' : 'NO RECLAMADO'}
                    </span>
                  )}
                </div>

                {/* Website */}
                <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">agenciadenocode.com</span>
                </div>

                {/* Location */}
                {location && (
                  <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{location}</span>
                  </div>
                )}

                {/* Description */}
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Descripción de la empresa
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyOnboardingStep2;
