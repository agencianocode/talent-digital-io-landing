import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera } from 'lucide-react';
import { ProfilePhotoEditModal } from './ProfilePhotoEditModal';

interface TalentProfile {
  firstName: string;
  lastName: string;
  country: string;
  phone: string;
  phoneCountryCode: string;
  profilePhoto?: File | null;
  profilePhotoUrl?: string | null;
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
  const [phoneCountryCode, setPhoneCountryCode] = useState(initialData.phoneCountryCode || '+57');
  const [profilePhoto, setProfilePhoto] = useState<File | null>(initialData.profilePhoto || null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(initialData.profilePhotoUrl || null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Country codes for LATAM + USA + Spain
  const countryCodes = [
    { country: 'Colombia', code: '+57', flag: '🇨🇴', short: 'CO' },
    { country: 'México', code: '+52', flag: '🇲🇽', short: 'MX' },
    { country: 'Argentina', code: '+54', flag: '🇦🇷', short: 'AR' },
    { country: 'Chile', code: '+56', flag: '🇨🇱', short: 'CL' },
    { country: 'Perú', code: '+51', flag: '🇵🇪', short: 'PE' },
    { country: 'Ecuador', code: '+593', flag: '🇪🇨', short: 'EC' },
    { country: 'Venezuela', code: '+58', flag: '🇻🇪', short: 'VE' },
    { country: 'Bolivia', code: '+591', flag: '🇧🇴', short: 'BO' },
    { country: 'Paraguay', code: '+595', flag: '🇵🇾', short: 'PY' },
    { country: 'Uruguay', code: '+598', flag: '🇺🇾', short: 'UY' },
    { country: 'Guatemala', code: '+502', flag: '🇬🇹', short: 'GT' },
    { country: 'Honduras', code: '+504', flag: '🇭🇳', short: 'HN' },
    { country: 'El Salvador', code: '+503', flag: '🇸🇻', short: 'SV' },
    { country: 'Nicaragua', code: '+505', flag: '🇳🇮', short: 'NI' },
    { country: 'Costa Rica', code: '+506', flag: '🇨🇷', short: 'CR' },
    { country: 'Panamá', code: '+507', flag: '🇵🇦', short: 'PA' },
    { country: 'República Dominicana', code: '+1', flag: '🇩🇴', short: 'DO' },
    { country: 'Cuba', code: '+53', flag: '🇨🇺', short: 'CU' },
    { country: 'Puerto Rico', code: '+1', flag: '🇵🇷', short: 'PR' },
    { country: 'Estados Unidos', code: '+1', flag: '🇺🇸', short: 'US' },
    { country: 'España', code: '+34', flag: '🇪🇸', short: 'ES' }
  ];

  const countries = [
    'Colombia', 'México', 'Argentina', 'Chile', 'Perú', 'Ecuador', 'Venezuela',
    'Bolivia', 'Paraguay', 'Uruguay', 'Guatemala', 'Honduras', 'El Salvador',
    'Nicaragua', 'Costa Rica', 'Panamá', 'República Dominicana', 'Cuba',
    'Puerto Rico', 'Estados Unidos', 'España'
  ];

  const getCurrentCountry = () => {
    return countryCodes.find(c => c.code === phoneCountryCode) || countryCodes[0] || { country: 'Colombia', code: '+57', flag: '🇨🇴', short: 'CO' };
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      setShowPhotoModal(true);
    }
  };

  const handlePhotoSave = (croppedImageBlob: Blob) => {
    // Create a File object from the blob
    const file = new File([croppedImageBlob], 'profile-photo.png', { type: 'image/png' });
    setProfilePhoto(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(croppedImageBlob);
    setProfilePhotoUrl(previewUrl);
    
    setShowPhotoModal(false);
  };

  const handleContinue = () => {
    if (!isFormValid) return;
    
    onComplete({
      firstName,
      lastName,
      country,
      phone,
      phoneCountryCode,
      profilePhoto,
      profilePhotoUrl
    });
  };

  const isFormValid = firstName.trim().length > 0 && lastName.trim().length > 0 && country.trim().length > 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 font-['Inter']">
          Crea tu perfil
        </h1>
        <p className="text-muted-foreground font-['Inter']">
          Completa tu información personal para comenzar
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Photo */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {profilePhotoUrl ? (
                <img
                  src={profilePhotoUrl}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            {profilePhotoUrl && (
              <Button
                variant="outline"
                size="sm"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                onClick={() => setShowPhotoModal(true)}
              >
                <Camera className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="font-['Inter']"
          >
            {profilePhotoUrl ? 'Cambiar foto' : 'Sube tu foto perfil'}
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          
          <p className="text-xs text-muted-foreground text-center font-['Inter']">
            PNG, JPG hasta 2MB
          </p>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground font-['Inter']">
              Nombre
            </label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Nombre"
              className="h-12 bg-white font-['Inter']"
            />
            <p className="text-xs text-muted-foreground font-['Inter']">
              Su nombre de pila.
            </p>
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground font-['Inter']">
              Apellido
            </label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Apellido"
              className="h-12 bg-white font-['Inter']"
            />
            <p className="text-xs text-muted-foreground font-['Inter']">
              Su apellido completo.
            </p>
          </div>
        </div>

        {/* Country */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground font-['Inter']">
            País de residencia
          </label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="h-12 bg-white font-['Inter']">
              <SelectValue placeholder="Seleccione su país" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((countryOption) => (
                <SelectItem key={countryOption} value={countryOption}>
                  {countryOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground font-['Inter']">
            Seleccione el país donde reside actualmente.
          </p>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground font-['Inter']">
            Número de teléfono (opcional)
          </label>
          <div className="flex gap-3">
            <Select value={phoneCountryCode} onValueChange={setPhoneCountryCode}>
              <SelectTrigger className="h-12 w-32 bg-white font-['Inter']">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2">
                  <Input
                    placeholder="Buscar país..."
                    className="mb-2 h-8"
                    onChange={(e) => {
                      const searchTerm = e.target.value.toLowerCase();
                      // Filter countries based on search
                    }}
                  />
                </div>
                {countryCodes.map((country) => (
                  <SelectItem key={country.code + country.country} value={country.code}>
                    {country.flag} {country.code} {country.short}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Número de teléfono (opcional)"
              className="h-12 bg-white font-['Inter']"
            />
          </div>
          <p className="text-xs text-muted-foreground font-['Inter']">
            Opcional. Útil para comunicación directa.
          </p>
        </div>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end mt-8">
        <Button
          onClick={handleContinue}
          disabled={!isFormValid}
          className="h-12 px-8 font-['Inter']"
        >
          Siguiente
        </Button>
      </div>

      {/* Photo Edit Modal */}
      {showPhotoModal && (
        <ProfilePhotoEditModal
          isOpen={showPhotoModal}
          onClose={() => setShowPhotoModal(false)}
          onSave={handlePhotoSave}
          imageFile={profilePhoto}
        />
      )}
    </div>
  );
};

export default TalentOnboardingStep1;