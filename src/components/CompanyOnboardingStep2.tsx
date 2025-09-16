import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, ExternalLink } from 'lucide-react';

interface ProfileData {
  professionalTitle: string;
  linkedinUrl: string;
  phoneNumber: string;
  profilePhoto?: File;
}

interface CompanyOnboardingStep2Props {
  onComplete: (data: ProfileData) => void;
  initialData: ProfileData;
  companyName: string;
}

const CompanyOnboardingStep2 = ({ onComplete, initialData }: CompanyOnboardingStep2Props) => {
  const [professionalTitle, setProfessionalTitle] = useState(initialData.professionalTitle);
  const [linkedinUrl, setLinkedinUrl] = useState(initialData.linkedinUrl);
  const [phoneNumber, setPhoneNumber] = useState(initialData.phoneNumber);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(initialData.profilePhoto || null);
  const [, setProfilePhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      profilePhoto: profilePhoto || undefined
    });
  };

  const isValid = professionalTitle.trim().length > 0;

  return (
    <div className="space-y-8">
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

          {/* Phone Number */}
          <div className="space-y-3">
            <Label htmlFor="phone-number" className="text-slate-700 dark:text-slate-300 font-medium">
              Agrega tu número de teléfono de negocio
            </Label>
            <div className="flex gap-3">
              <div className="flex items-center gap-2 px-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/30 dark:border-slate-600/30 rounded-xl">
                <span className="text-lg">🇺🇸</span>
                <span className="text-slate-600 dark:text-slate-400">+1</span>
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
  );
};

export default CompanyOnboardingStep2;
