import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera } from 'lucide-react';

interface TalentProfile {
  firstName: string;
  lastName: string;
  country: string;
  phone: string;
  profilePhoto?: File | null;
}

interface TalentOnboardingStep1Props {
  onComplete: (data: TalentProfile) => void;
  initialData: TalentProfile;
}

const TalentOnboardingStep1 = ({ onComplete, initialData }: TalentOnboardingStep1Props) => {
  const [firstName, setFirstName] = useState(initialData.firstName || '');
  const [lastName, setLastName] = useState(initialData.lastName || '');
  const [country, setCountry] = useState(initialData.country || '');
  const [phone, setPhone] = useState(initialData.phone || '');
  const [profilePhoto, setProfilePhoto] = useState<File | null>(initialData.profilePhoto || null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Países de LATAM
  const latinAmericaCountries = [
    'Colombia',
    'México', 
    'Argentina',
    'Chile',
    'Perú',
    'Ecuador',
    'Venezuela',
    'Costa Rica',
    'Panamá',
    'Guatemala',
    'Uruguay',
    'Paraguay',
    'Bolivia',
    'El Salvador',
    'Honduras',
    'Nicaragua',
    'República Dominicana'
  ];

  useEffect(() => {
    if (profilePhoto) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(profilePhoto);
    } else {
      setProfilePhotoPreview(null);
    }
  }, [profilePhoto]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 2MB.');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Solo se permiten archivos de imagen.');
        return;
      }

      setProfilePhoto(file);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  // Validar si el formulario está completo
  const isFormValid = firstName.trim().length > 0 && lastName.trim().length > 0 && 
                     country.length > 0 && phone.trim().length > 0;

  const handleContinue = () => {
    if (!isFormValid) return;
    
    onComplete({
      firstName,
      lastName,
      country,
      phone,
      profilePhoto
    });
  };

  return (
    <div className="w-full h-full flex flex-col justify-center mx-auto px-16 py-16 space-y-12 font-['Inter']">
      {/* Step Indicator */}
      <div className="text-center">
        <p className="text-sm text-gray-500 font-['Inter']">Paso 1/2</p>
      </div>

      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 font-['Inter']">
          Crea tu perfil
        </h1>
      </div>

      {/* Form */}
      <div className="space-y-8 flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        {/* Profile Photo */}
        <div className="flex justify-center">
          <div className="relative">
            <div 
              className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 cursor-pointer hover:bg-gray-300 transition-colors border-2 border-dashed border-gray-300 flex items-center justify-center"
              onClick={handlePhotoClick}
            >
              {profilePhotoPreview ? (
                <img 
                  src={profilePhotoPreview} 
                  alt="Profile preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <Camera className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Sube tu foto perfil</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Nombre"
              className="h-12 text-base border border-gray-300 rounded-lg px-4 focus:border-gray-400 focus:ring-0 font-['Inter']"
            />
          </div>
          <div>
            <Input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Apellido"
              className="h-12 text-base border border-gray-300 rounded-lg px-4 focus:border-gray-400 focus:ring-0 font-['Inter']"
            />
          </div>
        </div>

        {/* Country */}
        <div>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="h-12 text-base border border-gray-300 rounded-lg px-4 focus:border-gray-400 focus:ring-0 font-['Inter']">
              <SelectValue placeholder="País de residencia" />
            </SelectTrigger>
            <SelectContent>
              {latinAmericaCountries.map((countryOption) => (
                <SelectItem key={countryOption} value={countryOption} className="font-['Inter']">
                  {countryOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Phone */}
        <div>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Número de teléfono"
            className="h-12 text-base border border-gray-300 rounded-lg px-4 focus:border-gray-400 focus:ring-0 font-['Inter']"
          />
        </div>
      </div>

      {/* Continue Button */}
      <div className="pt-8">
        <Button 
          onClick={handleContinue}
          disabled={!isFormValid}
          className={`w-full h-14 rounded-lg font-medium text-lg font-['Inter'] transition-all ${
            isFormValid 
              ? 'bg-black hover:bg-gray-800 text-white' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
};

export default TalentOnboardingStep1;
