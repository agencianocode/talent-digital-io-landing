import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera } from 'lucide-react';

interface UserProfile {
  professionalTitle: string;
  profilePhoto?: File | null;
  country: string;
  phoneNumber: string;
  countryCode: string;
  linkedinUrl: string;
}

interface CompanyOnboardingStep4Props {
  onComplete: (data: UserProfile) => void;
  initialData: UserProfile;
  onProfileChange: (profile: UserProfile) => void;
  onProfilePhotoChange: (photo: File | null) => void;
}

const CompanyOnboardingStep4 = ({ 
  onComplete, 
  initialData, 
  onProfileChange, 
  onProfilePhotoChange 
}: CompanyOnboardingStep4Props) => {
  const [professionalTitle, setProfessionalTitle] = useState(initialData.professionalTitle || '');
  const [profilePhoto, setProfilePhoto] = useState<File | null>(initialData.profilePhoto || null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [country, setCountry] = useState(initialData.country || '');
  const [phoneNumber, setPhoneNumber] = useState(initialData.phoneNumber || '');
  const [countryCode, setCountryCode] = useState(initialData.countryCode || '+57');
  const [linkedinUrl, setLinkedinUrl] = useState(initialData.linkedinUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Países de LATAM, USA y España con códigos y banderas
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
    { code: '+1-787', country: 'Puerto Rico', flag: '🇵🇷' },
    { code: '+1', country: 'Estados Unidos', flag: '🇺🇸' },
    { code: '+34', country: 'España', flag: '🇪🇸' }
  ];

  // Lista solo de países para el selector de país
  const countryNames = latinAmericaCountries.map(item => item.country);

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

  useEffect(() => {
    const profile = {
      professionalTitle,
      profilePhoto,
      country,
      phoneNumber,
      countryCode,
      linkedinUrl
    };
    onProfileChange(profile);
  }, [professionalTitle, profilePhoto, country, phoneNumber, countryCode, linkedinUrl, onProfileChange]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      onProfilePhotoChange(file);
    }
  };

  const handleProfessionalTitleChange = (value: string) => {
    setProfessionalTitle(value);
  };

  const handleCountryChange = (value: string) => {
    setCountry(value);
    
    // Buscar el código de país correspondiente y actualizarlo automáticamente
    const countryData = latinAmericaCountries.find(item => item.country === value);
    if (countryData) {
      setCountryCode(countryData.code);
    }
  };


  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
  };

  const handleCountryCodeChange = (value: string) => {
    setCountryCode(value);
  };

  const handleLinkedinChange = (value: string) => {
    setLinkedinUrl(value);
  };

  // Validar si el formulario está completo (todos los campos obligatorios excepto LinkedIn)
  const isFormValid = 
    professionalTitle.trim().length > 0 &&
    country.trim().length > 0 &&
    phoneNumber.trim().length > 0 &&
    countryCode.trim().length > 0;

  const handleContinue = () => {
    console.log('CompanyOnboardingStep4 - handleContinue called');
    console.log('CompanyOnboardingStep4 - isFormValid:', isFormValid);
    console.log('CompanyOnboardingStep4 - Form data:', {
      professionalTitle,
      hasProfilePhoto: !!profilePhoto,
      country,
      phoneNumber,
      countryCode,
      linkedinUrl
    });
    
    if (!isFormValid) {
      console.log('CompanyOnboardingStep4 - Form is invalid, not calling onComplete');
      return;
    }
    
    console.log('CompanyOnboardingStep4 - Calling onComplete');
    onComplete({
      professionalTitle,
      profilePhoto,
      country,
      phoneNumber,
      countryCode,
      linkedinUrl
    });
    console.log('CompanyOnboardingStep4 - onComplete called successfully');
  };

  return (
    <div className="w-full mx-auto px-6 py-4 sm:px-8 sm:py-6 lg:px-12 lg:py-8 space-y-6 sm:space-y-7 lg:space-y-8 font-['Inter']">
      {/* Step Indicator */}
      <div className="text-center">
        <p className="text-sm text-gray-500 font-['Inter']">Perfil del Usuario (4/4)</p>
      </div>

      {/* Title and Description */}
      <div className="text-center space-y-3">
        <h1 className="font-bold text-gray-900 font-['Inter']" style={{fontSize: '24px'}}>
          Mostrá quién sos a tu equipo y al talento
        </h1>
        <p className="text-gray-600 font-['Inter']" style={{fontSize: '14px'}}>
          Tu puesto en la empresa
        </p>
        <p className="text-sm text-gray-500 font-['Inter']">
          Los campos marcados con <span className="text-red-500">*</span> son obligatorios
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Professional Title */}
        <div>
          <h2 className="font-medium text-gray-900 mb-3 font-['Inter']" style={{fontSize: '16px'}}>
            ¿Qué haces? <span className="text-red-500">*</span>
          </h2>
          <Input
            type="text"
            value={professionalTitle}
            onChange={(e) => handleProfessionalTitleChange(e.target.value)}
            className="h-12 text-base border border-gray-300 rounded-lg px-4 focus:border-gray-400 focus:ring-0 font-['Inter']"
            placeholder="Ej: Product Manager, CEO, Desarrollador..."
          />
        </div>

        {/* Profile Photo */}
        <div className="text-center">
          <h2 className="font-medium text-gray-900 mb-3 font-['Inter']" style={{fontSize: '16px'}}>
            Sube tu foto perfil
          </h2>
          {profilePhotoPreview ? (
            <div className="mb-4 space-y-3">
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                <img 
                  src={profilePhotoPreview} 
                  alt="Profile preview" 
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 font-['Inter']"
                style={{fontSize: '14px'}}
              >
                <Camera className="w-4 h-4 mr-2" />
                Cambiar foto
              </Button>
            </div>
          ) : (
            <div className="mb-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="px-8 py-3 border-2 border-gray-300 rounded-full text-gray-600 hover:border-gray-400 font-['Inter']"
                style={{fontSize: '14px'}}
              >
                <Camera className="w-4 h-4 mr-2" />
                Sube tu foto perfil
              </Button>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*"
          />
        </div>

        {/* Country */}
        <div>
          <h2 className="font-medium text-gray-900 mb-3 font-['Inter']" style={{fontSize: '16px'}}>
            País <span className="text-red-500">*</span>
          </h2>
          <Select value={country} onValueChange={handleCountryChange}>
            <SelectTrigger className="h-12 text-base border border-gray-300 rounded-lg px-4 focus:border-gray-400 focus:ring-0 font-['Inter']">
              <SelectValue placeholder="Selecciona tu país" />
            </SelectTrigger>
            <SelectContent>
              {countryNames.map((countryOption) => (
                <SelectItem key={countryOption} value={countryOption} className="font-['Inter']">
                  {countryOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Phone */}
        <div>
          <h2 className="font-medium text-gray-900 mb-3 font-['Inter']" style={{fontSize: '16px'}}>
            Teléfono <span className="text-red-500">*</span>
          </h2>
          <div className="flex gap-3">
            {/* Country Code Selector */}
            <Select value={countryCode} onValueChange={handleCountryCodeChange}>
              <SelectTrigger className="h-12 w-32 text-base border border-gray-300 rounded-lg px-4 focus:border-gray-400 focus:ring-0 font-['Inter']">
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
              value={phoneNumber}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className="h-12 flex-1 text-base border border-gray-300 rounded-lg px-4 focus:border-gray-400 focus:ring-0 font-['Inter']"
              placeholder="300 123 4567"
            />
          </div>
        </div>

        {/* LinkedIn */}
        <div>
          <h2 className="font-medium text-gray-900 mb-3 font-['Inter']" style={{fontSize: '16px'}}>
            Link a tu LinkedIn u otra red profesional (opcional)
          </h2>
          <Input
            type="url"
            value={linkedinUrl}
            onChange={(e) => handleLinkedinChange(e.target.value)}
            className="h-12 text-base border border-gray-300 rounded-lg px-4 focus:border-gray-400 focus:ring-0 font-['Inter']"
            placeholder="https://linkedin.com/in/tu-perfil"
          />
        </div>

        {/* Continue Button */}
        <div className="pt-6 pb-4">
          <Button
            onClick={handleContinue}
            disabled={!isFormValid}
            variant="default"
            className="w-full h-12 font-medium rounded-lg font-['Inter']"
            style={{fontSize: '14px'}}
          >
            Comenzar 🚀
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompanyOnboardingStep4;
