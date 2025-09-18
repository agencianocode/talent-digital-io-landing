import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, MapPin } from 'lucide-react';

interface UserProfile {
  professionalTitle: string;
  profilePhoto?: File | null;
  country: string;
  city: string;
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
  const [city, setCity] = useState(initialData.city || '');
  const [phoneNumber, setPhoneNumber] = useState(initialData.phoneNumber || '');
  const [countryCode, setCountryCode] = useState(initialData.countryCode || '+57');
  const [linkedinUrl, setLinkedinUrl] = useState(initialData.linkedinUrl || '');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  // Países de LATAM con códigos y banderas
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
    { code: '+1-787', country: 'Puerto Rico', flag: '🇵🇷' }
  ];

  // Lista solo de países para el selector de país
  const countryNames = latinAmericaCountries.map(item => item.country);

  // Ciudades principales de LATAM
  const latinAmericaCities = [
    // Colombia
    'Bogotá, Cundinamarca, Colombia',
    'Medellín, Antioquia, Colombia',
    'Cali, Valle del Cauca, Colombia',
    'Barranquilla, Atlántico, Colombia',
    'Cartagena, Bolívar, Colombia',
    'Bucaramanga, Santander, Colombia',
    'Pereira, Risaralda, Colombia',
    'Manizales, Caldas, Colombia',
    'Santa Marta, Magdalena, Colombia',
    'Ibagué, Tolima, Colombia',
    
    // México
    'Ciudad de México, CDMX, México',
    'Guadalajara, Jalisco, México',
    'Monterrey, Nuevo León, México',
    'Puebla, Puebla, México',
    'Tijuana, Baja California, México',
    'León, Guanajuato, México',
    'Juárez, Chihuahua, México',
    'Zapopan, Jalisco, México',
    'Mérida, Yucatán, México',
    'Cancún, Quintana Roo, México',
    
    // Argentina
    'Buenos Aires, Buenos Aires, Argentina',
    'Córdoba, Córdoba, Argentina',
    'Rosario, Santa Fe, Argentina',
    'Mendoza, Mendoza, Argentina',
    'La Plata, Buenos Aires, Argentina',
    'Mar del Plata, Buenos Aires, Argentina',
    'Salta, Salta, Argentina',
    'Tucumán, Tucumán, Argentina',
    
    // Chile
    'Santiago, Región Metropolitana, Chile',
    'Valparaíso, Valparaíso, Chile',
    'Concepción, Biobío, Chile',
    'Antofagasta, Antofagasta, Chile',
    'Viña del Mar, Valparaíso, Chile',
    'Temuco, La Araucanía, Chile',
    
    // Perú
    'Lima, Lima, Perú',
    'Arequipa, Arequipa, Perú',
    'Trujillo, La Libertad, Perú',
    'Chiclayo, Lambayeque, Perú',
    'Piura, Piura, Perú',
    'Cusco, Cusco, Perú',
    
    // Ecuador
    'Quito, Pichincha, Ecuador',
    'Guayaquil, Guayas, Ecuador',
    'Cuenca, Azuay, Ecuador',
    'Machala, El Oro, Ecuador',
    
    // Venezuela
    'Caracas, Distrito Capital, Venezuela',
    'Maracaibo, Zulia, Venezuela',
    'Valencia, Carabobo, Venezuela',
    'Barquisimeto, Lara, Venezuela',
    
    // Costa Rica
    'San José, San José, Costa Rica',
    'Cartago, Cartago, Costa Rica',
    'Puntarenas, Puntarenas, Costa Rica',
    
    // Panamá
    'Ciudad de Panamá, Panamá, Panamá',
    'San Miguelito, Panamá, Panamá',
    'Tocumen, Panamá, Panamá',
    
    // Guatemala
    'Ciudad de Guatemala, Guatemala, Guatemala',
    'Mixco, Guatemala, Guatemala',
    'Villa Nueva, Guatemala, Guatemala',
    
    // Uruguay
    'Montevideo, Montevideo, Uruguay',
    'Salto, Salto, Uruguay',
    'Paysandú, Paysandú, Uruguay',
    
    // Paraguay
    'Asunción, Central, Paraguay',
    'Ciudad del Este, Alto Paraná, Paraguay',
    'San Lorenzo, Central, Paraguay',
    
    // Bolivia
    'La Paz, La Paz, Bolivia',
    'Santa Cruz, Santa Cruz, Bolivia',
    'Cochabamba, Cochabamba, Bolivia',
    
    // Honduras
    'Tegucigalpa, Francisco Morazán, Honduras',
    'San Pedro Sula, Cortés, Honduras',
    'Choloma, Cortés, Honduras',
    
    // El Salvador
    'San Salvador, San Salvador, El Salvador',
    'Santa Ana, Santa Ana, El Salvador',
    'San Miguel, San Miguel, El Salvador',
    
    // Nicaragua
    'Managua, Managua, Nicaragua',
    'León, León, Nicaragua',
    'Granada, Granada, Nicaragua',
    
    // República Dominicana
    'Santo Domingo, Distrito Nacional, República Dominicana',
    'Santiago, Santiago, República Dominicana',
    'La Romana, La Romana, República Dominicana',
    
    // Cuba
    'La Habana, La Habana, Cuba',
    'Santiago de Cuba, Santiago de Cuba, Cuba',
    'Camagüey, Camagüey, Cuba',
    
    // Puerto Rico
    'San Juan, San Juan, Puerto Rico',
    'Bayamón, Bayamón, Puerto Rico',
    'Carolina, Carolina, Puerto Rico'
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

  useEffect(() => {
    const profile = {
      professionalTitle,
      profilePhoto,
      country,
      city,
      phoneNumber,
      countryCode,
      linkedinUrl
    };
    onProfileChange(profile);
  }, [professionalTitle, profilePhoto, country, city, phoneNumber, countryCode, linkedinUrl, onProfileChange]);

  // Manejar clicks fuera del dropdown de ubicación
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocationSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
  };

  // Función para buscar ciudades
  const searchLocations = (query: string) => {
    if (query.length < 2) {
      setLocationSuggestions([]);
      return;
    }
    
    const filtered = latinAmericaCities.filter(city =>
      city.toLowerCase().includes(query.toLowerCase())
    );
    setLocationSuggestions(filtered.slice(0, 5));
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCity(value);
    searchLocations(value);
    setShowLocationSuggestions(true);
  };

  const handleLocationSelect = (selectedLocation: string) => {
    setCity(selectedLocation);
    setShowLocationSuggestions(false);
    setLocationSuggestions([]);
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

  // Validar si el formulario está completo (solo título profesional es requerido)
  const isFormValid = professionalTitle.trim().length > 0;

  const handleContinue = () => {
    if (!isFormValid) return;
    
    onComplete({
      professionalTitle,
      profilePhoto,
      country,
      city,
      phoneNumber,
      countryCode,
      linkedinUrl
    });
  };

  return (
    <div className="w-full mx-auto px-6 py-4 sm:px-8 sm:py-6 lg:px-12 lg:py-8 space-y-6 sm:space-y-7 lg:space-y-8 font-['Inter']">
      {/* Step Indicator */}
      <div className="text-center">
        <p className="text-sm text-gray-500 font-['Inter']">Paso 2/2</p>
      </div>

      {/* Title and Description */}
      <div className="text-center space-y-3">
        <h1 className="font-bold text-gray-900 font-['Inter']" style={{fontSize: '24px'}}>
          Mostrá quién sos a tu equipo y al talento
        </h1>
        <p className="text-gray-600 font-['Inter']" style={{fontSize: '14px'}}>
          Tu puesto en la empresa
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Professional Title */}
        <div>
          <h2 className="font-medium text-gray-900 mb-3 font-['Inter']" style={{fontSize: '16px'}}>
            ¿Qué haces?
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
            País
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

        {/* City */}
        <div ref={locationRef}>
          <h2 className="font-medium text-gray-900 mb-3 font-['Inter']" style={{fontSize: '16px'}}>
            Ciudad
          </h2>
          <div className="relative">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                value={city}
                onChange={handleLocationChange}
                placeholder="Ej: Cali, Valle del Cauca, Colombia"
                className="h-12 pl-10 pr-4 text-base border border-gray-300 rounded-lg focus:border-gray-400 focus:ring-0 font-['Inter']"
              />
            </div>
            {showLocationSuggestions && locationSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {locationSuggestions.map((location, index) => (
                  <div
                    key={index}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => handleLocationSelect(location)}
                  >
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700 font-['Inter']">{location}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Phone */}
        <div>
          <h2 className="font-medium text-gray-900 mb-3 font-['Inter']" style={{fontSize: '16px'}}>
            Teléfono
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
            className={`w-full h-12 font-medium rounded-lg transition-colors font-['Inter'] ${
              isFormValid 
                ? 'bg-black hover:bg-gray-800 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
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
