import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, ExternalLink, User } from 'lucide-react';

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

const CompanyOnboardingStep2 = ({ onComplete, initialData, companyName }: CompanyOnboardingStep2Props) => {
  const [professionalTitle, setProfessionalTitle] = useState(initialData.professionalTitle);
  const [linkedinUrl, setLinkedinUrl] = useState(initialData.linkedinUrl);
  const [phoneNumber, setPhoneNumber] = useState(initialData.phoneNumber);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(initialData.profilePhoto || null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
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
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="text-sm text-muted-foreground">
        Paso 2/2
      </div>

      {/* Main Question */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-foreground">
          ¿Qué haces en {companyName}?
        </h1>
        <p className="text-muted-foreground">
          Configura tu perfil para este espacio de trabajo.
        </p>
        
        {/* Form Fields */}
        <div className="space-y-6">
          {/* Professional Title */}
          <div className="space-y-2">
            <Label htmlFor="professional-title">
              Título profesional
            </Label>
            <Input
              id="professional-title"
              type="text"
              placeholder="Ej: CEO, Director de Marketing, Fundador"
              value={professionalTitle}
              onChange={(e) => setProfessionalTitle(e.target.value)}
              className="h-12"
            />
          </div>

          {/* LinkedIn URL */}
          <div className="space-y-2">
            <Label htmlFor="linkedin-url" className="flex items-center gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn URL
            </Label>
            <Input
              id="linkedin-url"
              type="url"
              placeholder="https://linkedin.com/in/tu-perfil"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              className="h-12"
            />
            <div className="flex items-center gap-4 text-sm">
              <button className="text-primary hover:underline">
                No tengo una cuenta de LinkedIn
              </button>
              <button className="text-primary hover:underline flex items-center gap-1">
                Obtener tu URL de LinkedIn
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone-number">
              Agrega tu número de teléfono de negocio
            </Label>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 px-3 border rounded-md bg-muted">
                <span className="text-sm">🇺🇸</span>
                <span className="text-sm">+1</span>
              </div>
              <Input
                id="phone-number"
                type="tel"
                placeholder="(000) 000-0000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="h-12 flex-1"
              />
            </div>
            <p className="text-sm text-muted-foreground">Opcional</p>
          </div>

          {/* Profile Photo */}
          <div className="space-y-4">
            <div>
              <Label className="text-base">
                Agrega una foto para ayudar a construir conexión y confianza.
              </Label>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Photo Preview */}
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {profilePhotoPreview ? (
                  <img
                    src={profilePhotoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleUploadPhoto}
                className="flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
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
      </div>

      {/* Continue Button */}
      <div className="pt-4">
        <Button
          onClick={handleContinue}
          disabled={!isValid}
          className="w-full h-12 text-lg"
        >
          Continuar
        </Button>
      </div>

      {/* Help Text */}
      <div className="text-sm text-muted-foreground">
        <p>
          Esta información te ayudará a conectarte mejor con talentos y construir relaciones profesionales.
        </p>
      </div>
    </div>
  );
};

export default CompanyOnboardingStep2;
