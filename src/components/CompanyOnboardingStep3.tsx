import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Camera, MapPin } from 'lucide-react';
import LogoEditModal from './LogoEditModal';

interface CompanyDetails {
  description: string;
  url: string;
  location: string;
  logo?: File | null;
  businessTypes?: string[];
}

interface CompanyOnboardingStep3Props {
  onComplete: (data: CompanyDetails) => void;
  onCompleteLater: (data: CompanyDetails) => void;
  initialData: CompanyDetails;
  onDetailsChange: (details: CompanyDetails) => void;
  onLogoChange: (logo: File | null) => void;
}

const CompanyOnboardingStep3 = ({ onComplete, onCompleteLater, initialData, onDetailsChange, onLogoChange }: CompanyOnboardingStep3Props) => {
  const [website, setWebsite] = useState(initialData.url || '');
  const [location, setLocation] = useState(initialData.location || '');
  const [logo, setLogo] = useState<File | null>(initialData.logo || null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

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
    'Alajuela, Alajuela, Costa Rica',
    
    // Panamá
    'Ciudad de Panamá, Panamá, Panamá',
    
    // Guatemala
    'Ciudad de Guatemala, Guatemala, Guatemala',
    
    // Uruguay
    'Montevideo, Montevideo, Uruguay',
    
    // Paraguay
    'Asunción, Central, Paraguay',
    
    // Bolivia
    'La Paz, La Paz, Bolivia',
    'Santa Cruz, Santa Cruz, Bolivia',
    'Cochabamba, Cochabamba, Bolivia'
  ];

  useEffect(() => {
    onDetailsChange({
      ...initialData,
      url: website,
      location,
      logo
    });
  }, [website, location, logo, onDetailsChange, initialData]);

  useEffect(() => {
    if (logo) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(logo);
    } else {
      setLogoPreview(null);
    }
  }, [logo]);

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

  const searchLocations = (query: string) => {
    if (query.length < 2) {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
      return;
    }

    const filtered = latinAmericaCities.filter(city =>
      city.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8);

    setLocationSuggestions(filtered);
    setShowLocationSuggestions(filtered.length > 0);
  };

  const handleLocationChange = (value: string) => {
    setLocation(value);
    searchLocations(value);
  };

  const handleLocationSelect = (selectedLocation: string) => {
    setLocation(selectedLocation);
    setShowLocationSuggestions(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTempImageUrl(e.target?.result as string);
        setShowLogoModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoSave = (editedImageUrl: string) => {
    fetch(editedImageUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'logo.png', { type: 'image/png' });
        setLogo(file);
        onLogoChange(file);
        setShowLogoModal(false);
      });
  };

  const handleCompleteLater = async () => {
    try {
      // Guardar los datos actuales y navegar al dashboard
      const companyData = {
        description: initialData.description || '',
        url: website,
        location,
        logo,
        businessTypes: initialData.businessTypes || []
      };
      
      console.log('Step3 - handleCompleteLater - companyData:', companyData);
      
      // Llamar a onCompleteLater para guardar los datos y navegar al dashboard
      await onCompleteLater(companyData);
    } catch (error) {
      console.error('Error in handleCompleteLater:', error);
    }
  };

  const handleSaveAndContinue = () => {
    onComplete({
      description: initialData.description || '',
      url: website,
      location,
      logo,
      businessTypes: initialData.businessTypes || []
    });
  };

  return (
    <div className="w-full mx-auto px-6 py-4 sm:px-8 sm:py-6 lg:px-12 lg:py-8 space-y-6 sm:space-y-7 lg:space-y-8 font-['Inter']">
      {/* Step Indicator */}
      <div className="text-center">
        <p className="text-sm text-gray-500 font-['Inter']">Información de la Empresa (3/4)</p>
      </div>

      {/* Title and Description */}
      <div className="text-center space-y-3">
        <h1 className="font-bold text-gray-900 font-['Inter']" style={{fontSize: '24px'}}>
          Completa el perfil de tu empresa
        </h1>
        <p className="text-gray-600 font-['Inter']" style={{fontSize: '14px'}}>
          Los perfiles de empresa con logo y ubicación reciben 3x más aplicaciones de talento.
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Logo Upload */}
        <div className="text-center">
          {logoPreview ? (
            <div className="mb-4 space-y-3">
              <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center">
                <img 
                  src={logoPreview} 
                  alt="Logo preview" 
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
                Cambiar logo
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
                <Upload className="w-4 h-4 mr-2" />
                Cargar logo de empresa
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
          <p className="text-xs text-gray-500 font-['Inter']">
            Formatos: JPG, PNG. Tamaño recomendado: 300×300 px
          </p>
        </div>

        {/* Website */}
        <div>
          <h2 className="font-medium text-gray-900 mb-3 font-['Inter']" style={{fontSize: '16px'}}>
            Página web
          </h2>
          <Input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="h-12 text-base border border-gray-300 rounded-lg px-4 focus:border-gray-400 focus:ring-0 font-['Inter']"
            placeholder="Página web"
          />
        </div>

        {/* Location */}
        <div>
          <h2 className="font-medium text-gray-900 mb-3 font-['Inter']" style={{fontSize: '16px'}}>
            Ubicación
          </h2>
          <div className="relative" ref={locationRef}>
            <div className="relative">
              <Input
                type="text"
                value={location}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="h-12 text-base border border-gray-300 rounded-lg px-4 pl-10 focus:border-gray-400 focus:ring-0 font-['Inter']"
                placeholder="Ej: Cali, Valle del Cauca, Colombia"
                autoComplete="off"
              />
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            
            {/* Dropdown de sugerencias */}
            {showLocationSuggestions && locationSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {locationSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleLocationSelect(suggestion)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer flex items-center gap-3 font-['Inter']"
                  >
                    <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-900">{suggestion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCompleteLater}
            className="flex-1 h-12 font-medium rounded-lg text-gray-600 hover:bg-black hover:text-white font-['Inter']"
            style={{fontSize: '14px'}}
          >
            Completar luego
          </Button>
          <Button
            onClick={handleSaveAndContinue}
            className="flex-1 h-12 font-medium rounded-lg bg-black hover:bg-gray-800 text-white transition-colors font-['Inter']"
            style={{fontSize: '14px'}}
          >
            Guardar y continuar
          </Button>
        </div>
      </div>

      <LogoEditModal
        isOpen={showLogoModal}
        onClose={() => setShowLogoModal(false)}
        onSave={handleLogoSave}
        imageUrl={tempImageUrl || ''}
      />
    </div>
  );
};

export default CompanyOnboardingStep3;