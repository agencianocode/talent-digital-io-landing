import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Plus, DollarSign, MapPin, Phone, User, Camera, Upload } from 'lucide-react';
import { useProfileData } from '@/hooks/useProfileData';
import { ProfileEditData } from '@/types/profile';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CURRENCIES = [
  { value: 'USD', label: 'USD - Dólar Americano' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'MXN', label: 'MXN - Peso Mexicano' },
  { value: 'COP', label: 'COP - Peso Colombiano' },
  { value: 'ARS', label: 'ARS - Peso Argentino' },
  { value: 'CLP', label: 'CLP - Peso Chileno' }
];

const AVAILABILITY_OPTIONS = [
  { value: 'full-time', label: 'Tiempo Completo' },
  { value: 'part-time', label: 'Medio Tiempo' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'project-based', label: 'Por Proyecto' },
  { value: 'consulting', label: 'Consultoría' }
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, userProfile, updateProfile, updateAvatar, validateProfile } = useProfileData();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<ProfileEditData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('🔍 EditProfileModal - Modal opened, checking data:', {
        isOpen,
        hasProfile: !!profile,
        hasUserProfile: !!userProfile,
        profile: profile ? {
          location: profile.location,
          country: profile.country,
          city: profile.city,
          title: profile.title,
          bio: profile.bio,
          skills: profile.skills
        } : null,
        userProfile: userProfile ? {
          full_name: userProfile.full_name,
          avatar_url: userProfile.avatar_url,
          phone: userProfile.phone
        } : null
      });
    }
    
    if (isOpen && userProfile) {
      // Initialize form data even if profile is not fully loaded yet
      setFormData({
        full_name: userProfile.full_name || '',
        title: profile?.title || '',
        bio: profile?.bio || '',
        skills: profile?.skills || [],
        location: profile?.location || '',
        country: (userProfile as any)?.country || profile?.country || '',
        city: (userProfile as any)?.city || profile?.city || '',
        phone: userProfile.phone || profile?.phone || '',
        video_presentation_url: profile?.video_presentation_url || '',
        hourly_rate_min: profile?.hourly_rate_min || 0,
        hourly_rate_max: profile?.hourly_rate_max || 0,
        currency: profile?.currency || 'USD',
        availability: profile?.availability || ''
      });
      setSkills(profile?.skills || []);
      
      console.log('🔍 EditProfileModal - Form data initialized:', {
        formData: {
          full_name: userProfile.full_name || '',
          title: profile?.title || '',
          bio: profile?.bio || '',
          skills: profile?.skills || [],
          location: profile?.location || '',
          country: (userProfile as any)?.country || profile?.country || '',
          city: (userProfile as any)?.city || profile?.city || '',
          phone: userProfile.phone || profile?.phone || '',
          video_presentation_url: profile?.video_presentation_url || '',
          hourly_rate_min: profile?.hourly_rate_min || 0,
          hourly_rate_max: profile?.hourly_rate_max || 0,
          currency: profile?.currency || 'USD',
          availability: profile?.availability || ''
        }
      });
    }
  }, [isOpen, profile, userProfile]);

  // Auto-build full location when city or country changes
  useEffect(() => {
    if (formData.city && formData.country) {
      const fullLocation = `${formData.city}, ${formData.country}`;
      if (formData.location !== fullLocation) {
        setFormData(prev => ({ ...prev, location: fullLocation }));
      }
    }
  }, [formData.city, formData.country]);

  const handleInputChange = (field: keyof ProfileEditData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const MAX_SKILL_LENGTH = 30;

  const handleAddSkill = () => {
    const trimmedSkill = newSkill.trim();
    if (trimmedSkill.length > MAX_SKILL_LENGTH) {
      return;
    }
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      const updatedSkills = [...skills, trimmedSkill];
      setSkills(updatedSkills);
      setFormData(prev => ({ ...prev, skills: updatedSkills }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updatedSkills = skills.filter(skill => skill !== skillToRemove);
    setSkills(updatedSkills);
    setFormData(prev => ({ ...prev, skills: updatedSkills }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validation = validateProfile(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      const success = await updateProfile(formData as ProfileEditData);
      if (success) {
        // Disparar evento para actualizar el perfil en la página principal
        window.dispatchEvent(new CustomEvent('profileUpdated', { 
          detail: { 
            type: 'video_presentation_url',
            value: formData.video_presentation_url 
          } 
        }));
        onClose();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    setNewSkill('');
    onClose();
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, avatar: 'Solo se permiten archivos de imagen' }));
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, avatar: 'El archivo debe ser menor a 10MB' }));
      return;
    }

    setAvatarLoading(true);
    try {
      const success = await updateAvatar(file);
      if (success) {
        setErrors(prev => ({ ...prev, avatar: '' }));
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setErrors(prev => ({ ...prev, avatar: 'Error al cargar la imagen' }));
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Editar Perfil
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Foto de Perfil
            </h3>
            
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24 cursor-pointer" onClick={handleAvatarClick}>
                  <AvatarImage 
                    src={
                      userProfile?.avatar_url && !userProfile.avatar_url.startsWith('blob:') 
                        ? userProfile.avatar_url 
                        : undefined
                    } 
                  />
                  <AvatarFallback className="text-2xl bg-gray-100">
                    {formData.full_name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                {avatarLoading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1.5 cursor-pointer hover:bg-blue-700 transition-colors">
                  <Camera className="h-3 w-3 text-white" />
                </div>
              </div>
              
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">
                  Haz clic en la foto para cambiarla
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAvatarClick}
                  disabled={avatarLoading}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {avatarLoading ? 'Cargando...' : 'Cambiar Foto'}
                </Button>
                {errors.avatar && (
                  <p className="text-sm text-red-500 mt-1">{errors.avatar}</p>
                )}
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>

          {/* Información Personal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Información Personal
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Nombre Completo *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name || ''}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Tu nombre completo"
                  className={errors.full_name ? 'border-red-500' : ''}
                />
                {errors.full_name && (
                  <p className="text-sm text-red-500 mt-1">{errors.full_name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="title">Título Profesional *</Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ej: Desarrollador Frontend"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Biografía *</Label>
              <Textarea
                id="bio"
                value={formData.bio || ''}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Cuéntanos sobre ti, tu experiencia y lo que te apasiona..."
                rows={4}
                className={errors.bio ? 'border-red-500' : ''}
              />
              {errors.bio && (
                <p className="text-sm text-red-500 mt-1">{errors.bio}</p>
              )}
            </div>
          </div>

          {/* Habilidades */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Habilidades</h3>
            
            <div className="flex gap-2">
              <div className="flex-1 space-y-1">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Agregar habilidad (máx. 30 caracteres)"
                  maxLength={30}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                />
                <p className="text-xs text-muted-foreground text-right">{newSkill.length}/30</p>
              </div>
              <Button type="button" onClick={handleAddSkill} size="sm" disabled={newSkill.trim().length === 0}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            {errors.skills && (
              <p className="text-sm text-red-500">{errors.skills}</p>
            )}
          </div>

          {/* Ubicación */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Ubicación
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="country">País</Label>
                <Input
                  id="country"
                  value={formData.country || ''}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="País"
                />
              </div>

              <div>
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  value={formData.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Ciudad"
                />
              </div>

              <div>
                <Label htmlFor="location">Ubicación Completa</Label>
                <Input
                  id="location"
                  value={formData.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Ubicación completa"
                />
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contacto
            </h3>
            
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <Label htmlFor="video_presentation_url">Video de Presentación</Label>
              <Input
                id="video_presentation_url"
                value={formData.video_presentation_url || ''}
                onChange={(e) => handleInputChange('video_presentation_url', e.target.value)}
                placeholder="https://youtube.com/watch?v=... o https://drive.google.com/..."
                className={errors.video_presentation_url ? 'border-red-500' : ''}
              />
              {errors.video_presentation_url && (
                <p className="text-sm text-red-500 mt-1">{errors.video_presentation_url}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Plataformas soportadas: YouTube, Vimeo, Loom, Google Drive, Dropbox
              </p>
            </div>
          </div>

          {/* Tarifas y Disponibilidad */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Tarifas y Disponibilidad
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="hourly_rate_min">Tarifa Mínima (USD)</Label>
                <Input
                  id="hourly_rate_min"
                  type="number"
                  value={formData.hourly_rate_min || ''}
                  onChange={(e) => handleInputChange('hourly_rate_min', parseInt(e.target.value) || 0)}
                  placeholder="25"
                />
              </div>

              <div>
                <Label htmlFor="hourly_rate_max">Tarifa Máxima (USD)</Label>
                <Input
                  id="hourly_rate_max"
                  type="number"
                  value={formData.hourly_rate_max || ''}
                  onChange={(e) => handleInputChange('hourly_rate_max', parseInt(e.target.value) || 0)}
                  placeholder="50"
                />
              </div>

              <div>
                <Label htmlFor="currency">Moneda</Label>
                <Select
                  value={formData.currency || 'USD'}
                  onValueChange={(value) => handleInputChange('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="availability">Disponibilidad</Label>
              <Select
                value={formData.availability || ''}
                onValueChange={(value) => handleInputChange('availability', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu disponibilidad" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABILITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {errors.hourly_rate && (
              <p className="text-sm text-red-500">{errors.hourly_rate}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
