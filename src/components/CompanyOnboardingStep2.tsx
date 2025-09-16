import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, ExternalLink, MapPin, Globe } from 'lucide-react';
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
  const [professionalTitle, setProfessionalTitle] = useState(initialData.professionalTitle);
  const [linkedinUrl, setLinkedinUrl] = useState(initialData.linkedinUrl);
  const [phoneNumber, setPhoneNumber] = useState(initialData.phoneNumber);
  const [location, setLocation] = useState(initialData.location || '');
  const [profilePhoto, setProfilePhoto] = useState<File | null>(initialData.profilePhoto || null);
  const [, setProfilePhotoPreview] = useState<string | null>(null);
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
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleContinue = () => {
    onComplete({
      professionalTitle: professionalTitle.trim(),
      linkedinUrl: linkedinUrl.trim(),
      phoneNumber: phoneNumber.trim(),
      location: location.trim(),
      profilePhoto: profilePhoto || undefined
    });
  };

  const isValid = professionalTitle.trim().length > 0;

  const countries = [
    'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Costa Rica', 'Cuba', 'Ecuador', 
    'El Salvador', 'España', 'Guatemala', 'Honduras', 'México', 'Nicaragua', 'Panamá', 
    'Paraguay', 'Perú', 'Puerto Rico', 'República Dominicana', 'Uruguay', 'Venezuela'
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column - Form */}
        <div className="space-y-8 flex flex-col justify-center">
          {/* Step Indicator */}
          <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Paso 2/2
          </div>

          {/* Main Question */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white leading-tight">
                ¿Qué haces?
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Configura tu perfil para este espacio de trabajo.
              </p>
            </div>
            
            {/* Form Fields */}
            <div className="space-y-8">
              {/* Professional Title */}
              <div className="space-y-3">
                <Label htmlFor="professional-title" className="text-slate-700 dark:text-slate-300 font-medium">
                  Título profesional
                </Label>
                <Input
                  id="professional-title"
                  type="text"
                  placeholder="Ej: CEO, Director de Marketing, Fundador"
                  value={professionalTitle}
                  onChange={(e) => setProfessionalTitle(e.target.value)}
                  className="h-14 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/30 dark:border-slate-600/30 rounded-xl text-lg"
                />
              </div>

              {/* LinkedIn URL */}
              <div className="space-y-3">
                <Label htmlFor="linkedin-url" className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn URL
                </Label>
                <Input
                  id="linkedin-url"
                  type="url"
                  placeholder="LinkedIn URL"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="h-14 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/30 dark:border-slate-600/30 rounded-xl text-lg"
                />
                <div className="flex items-center gap-4 text-sm">
                  <button className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:underline">
                    No tengo una cuenta de LinkedIn
                  </button>
                  <span className="text-slate-400">•</span>
                  <button className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:underline flex items-center gap-1">
                    Obtener tu URL de LinkedIn
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-3">
                <Label htmlFor="location" className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                  <MapPin className="h-4 w-4" />
                  Ubicación
                </Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="h-14 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/30 dark:border-slate-600/30 rounded-xl text-lg">
                    <SelectValue placeholder="Selecciona tu país" />
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

              {/* Phone Number */}
              <div className="space-y-3">
                <Label htmlFor="phone-number" className="text-slate-700 dark:text-slate-300 font-medium">
                  Agrega tu número de teléfono de negocio
                </Label>
                <div className="flex gap-3">
                  <div className="flex items-center gap-2 px-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/30 dark:border-slate-600/30 rounded-xl">
                    <span className="text-lg">🌍</span>
                    <span className="text-slate-600 dark:text-slate-400">+XX</span>
                  </div>
                  <Input
                    id="phone-number"
                    type="tel"
                    placeholder="(000) 000-0000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="h-14 flex-1 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/30 dark:border-slate-600/30 rounded-xl text-lg"
                  />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Opcional</p>
              </div>

              {/* Profile Photo */}
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">
                    Agrega una foto para ayudar a construir conexión y confianza.
                  </Label>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUploadPhoto}
                  className="flex items-center gap-3 h-14 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/30 dark:border-slate-600/30 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
                >
                  <Camera className="h-5 w-5" />
                  {profilePhoto ? 'Reemplazar foto de perfil' : 'Subir foto de perfil'}
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
              className="h-14 px-8 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 rounded-xl"
            >
              Atrás
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!isValid}
              className="flex-1 h-14 text-lg font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 rounded-xl"
            >
              Continuar
            </Button>
          </div>
        </div>
        
        {/* Right Column - Company Preview Card */}
        <div className="flex items-center justify-center">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl p-8 border border-white/20 dark:border-slate-600/20 shadow-2xl max-w-md w-full">
            <div className="text-center space-y-6">
              {/* Company Logo Placeholder */}
              <div className="w-20 h-20 mx-auto bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2M7 21h2m3-18v18m4-18v18" />
                </svg>
              </div>

              {/* Company Name */}
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {companyName || 'Tu Empresa'}
                </h3>
                
                {/* Company Status */}
                {isCheckingCompany ? (
                  <span className="inline-block px-3 py-1 mt-2 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-full">
                    Verificando...
                  </span>
                ) : companyExists !== null && (
                  <span className={`inline-block px-3 py-1 mt-2 text-xs font-medium rounded-full ${
                    companyExists 
                      ? 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30' 
                      : 'text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-900/30'
                  }`}>
                    {companyExists ? 'EMPRESA REGISTRADA' : 'NO RECLAMADO'}
                  </span>
                )}
              </div>

              {/* Professional Title */}
              {professionalTitle && (
                <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                  <span className="text-sm">{professionalTitle}</span>
                </div>
              )}

              {/* Location */}
              {location && (
                <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{location}</span>
                </div>
              )}

              {/* LinkedIn */}
              {linkedinUrl && (
                <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">LinkedIn configurado</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyOnboardingStep2;
