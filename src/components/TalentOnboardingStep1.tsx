import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera } from 'lucide-react';
import ProfilePhotoEditModal from './ProfilePhotoEditModal';

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

  // Países de LATAM con códigos y banderas (igual que business)
  const latinAmericaCountries = [
    { code: '+57', country: 'Colombia', flag: '🇨🇴' },
    { code: '+52', country: 'México', flag: '🇲🇽' },
    { code: '+54', country: 'Argentina', flag: '🇦🇷' },
    { code: '+56', country: 'Chile', flag: '🇨🇱' },
    { code: '+51', country: 'Perú', flag: '🇵🇪' },
    { code: '+593', country: 'Ecuador', flag: '🇪🇨' },
    { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
    { code: '+506', country: 'Costa Rica', flag: '🇨🇷' },
    { code: '+507', country: 'Panamá', flag: '🇵🇦' },
    { code: '+502', country: 'Guatemala', flag: '🇬🇹' },
    { code: '+598', country: 'Uruguay', flag: '🇺🇾' },
    { code: '+595', country: 'Paraguay', flag: '🇵🇾' },
    { code: '+591', country: 'Bolivia', flag: '🇧🇴' },
    { code: '+504', country: 'Honduras', flag: '🇭🇳' },
    { code: '+503', country: 'El Salvador', flag: '🇸🇻' },
    { code: '+505', country: 'Nicaragua', flag: '🇳🇮' },
    { code: '+1-809', country: 'República Dominicana', flag: '🇩🇴' },
    { code: '+53', country: 'Cuba', flag: '🇨🇺' },
    { code: '+1', country: 'Estados Unidos', flag: '🇺🇸' },
    { code: '+34', country: 'España', flag: '🇪🇸' }
  ];

  // Countries list
  const countries = [
    'Colombia', 'México', 'Argentina', 'Chile', 'Perú', 'Ecuador', 'Venezuela', 
    'Bolivia', 'Paraguay', 'Uruguay', 'Guatemala', 'Honduras', 'El Salvador', 
    'Nicaragua', 'Costa Rica', 'Panamá', 'República Dominicana', 'Cuba', 
    'Estados Unidos', 'España'
  ];

  const handlePhotoSave = (croppedImageBlob: Blob) => {
    const file = new File([croppedImageBlob], 'profile-photo.jpg', { type: 'image/jpeg' });
    setProfilePhoto(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(croppedImageBlob);
    setProfilePhotoUrl(previewUrl);
    
    setShowPhotoModal(false);
  };

  const handleCountryCodeChange = (value: string) => {
    setPhoneCountryCode(value);
  };

  const handleCountryChange = (selectedCountry: string) => {
    setCountry(selectedCountry);
    
    // Buscar el código de país correspondiente
    const countryData = latinAmericaCountries.find(item => item.country === selectedCountry);
    if (countryData) {
      setPhoneCountryCode(countryData.code);
    }
  };

  const handleContinue = () => {
    const profileData: TalentProfile = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      country: country.trim(),
      phone: phone.trim(),
      phoneCountryCode,
      profilePhoto,
      profilePhotoUrl,
    };
    onComplete(profileData);
  };

  const isFormValid = firstName.trim().length > 0 && lastName.trim().length > 0 && country.trim().length > 0;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 font-['Inter']">Crea tu perfil</h2>
      </div>

      {/* Profile Photo Upload */}
      <div className="flex justify-center">
        <div
          onClick={() => setShowPhotoModal(true)}
          className="w-24 h-24 border-2 border-dashed border-gray-300 hover:border-gray-400 bg-white rounded-full cursor-pointer overflow-hidden relative"
        >
          {profilePhotoUrl ? (
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={profilePhotoUrl}
                alt="Foto de perfil"
                className="w-full h-full object-cover rounded-full"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center rounded-full">
                <Camera className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity duration-200" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-2">
              <Camera className="w-6 h-6 text-gray-400" />
              <span className="text-sm text-gray-600 font-['Inter']">Sube tu Foto perfil</span>
            </div>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Name Fields - Two Columns */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Nombre"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-12 text-base border border-gray-300 rounded-lg px-4 focus:border-gray-400 focus:ring-0 bg-white font-['Inter']"
            />
          </div>
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Apellido"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="h-12 text-base border border-gray-300 rounded-lg px-4 focus:border-gray-400 focus:ring-0 bg-white font-['Inter']"
            />
          </div>
        </div>

        {/* Country Field */}
        <div className="space-y-2">
          <Select value={country} onValueChange={handleCountryChange}>
            <SelectTrigger className="h-12 text-base border border-gray-300 rounded-lg px-4 focus:border-gray-400 focus:ring-0 bg-white font-['Inter']">
              <SelectValue placeholder="País de residencia" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((countryName) => (
                <SelectItem key={countryName} value={countryName} className="font-['Inter']">
                  {countryName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Phone Field with Country Code Selector */}
        <div className="space-y-2">
          <div className="flex gap-3">
            {/* Country Code Selector */}
            <Select value={phoneCountryCode} onValueChange={handleCountryCodeChange}>
              <SelectTrigger className="h-12 w-32 text-base border border-gray-300 rounded-lg px-4 focus:border-gray-400 focus:ring-0 bg-white font-['Inter']">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {latinAmericaCountries.map((item) => (
                  <SelectItem key={item.code} value={item.code} className="font-['Inter']">
                    <div className="flex items-center gap-2">
                      <span>{item.flag}</span>
                      <span>{item.code}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Phone Number Input */}
            <Input
              type="tel"
              placeholder="Número de teléfono (opcional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12 flex-1 text-base border border-gray-300 rounded-lg px-4 focus:border-gray-400 focus:ring-0 bg-white font-['Inter']"
            />
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="flex justify-center pt-10">
        <Button
          onClick={handleContinue}
          disabled={!isFormValid}
          className="w-full bg-black hover:bg-gray-800 text-white font-['Inter'] disabled:opacity-50 disabled:cursor-not-allowed"
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