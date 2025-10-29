import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Plus, MapPin, Phone, User, Camera, Upload, ArrowLeft, Link as LinkIcon } from 'lucide-react';
import { useProfileData } from '@/hooks/useProfileData';
import { useSocialLinks } from '@/hooks/useSocialLinks';
import { ProfileEditData } from '@/types/profile';
import { toast } from 'sonner';

const EXPERIENCE_LEVELS = [
  { value: 'junior', label: 'Junior (0-2 años)' },
  { value: 'mid', label: 'Mid-level (3-5 años)' },
  { value: 'senior', label: 'Senior (6-10 años)' },
  { value: 'lead', label: 'Lead (10+ años)' },
  { value: 'expert', label: 'Experto (15+ años)' }
];

const PROFESSIONAL_CATEGORIES = [
  { value: 'development', label: 'Desarrollo de Software' },
  { value: 'design', label: 'Diseño' },
  { value: 'marketing', label: 'Marketing Digital' },
  { value: 'data', label: 'Ciencia de Datos' },
  { value: 'management', label: 'Gestión de Proyectos' },
  { value: 'sales', label: 'Ventas' },
  { value: 'support', label: 'Soporte' },
  { value: 'other', label: 'Otro' }
];

const SOCIAL_PLATFORMS = [
  { value: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/tu-perfil' },
  { value: 'github', label: 'GitHub', placeholder: 'https://github.com/tu-usuario' },
  { value: 'twitter', label: 'Twitter', placeholder: 'https://twitter.com/tu-usuario' },
  { value: 'behance', label: 'Behance', placeholder: 'https://behance.net/tu-perfil' },
  { value: 'dribbble', label: 'Dribbble', placeholder: 'https://dribbble.com/tu-perfil' }
];

const AVAILABILITY_OPTIONS = [
  { value: 'full-time', label: 'Tiempo Completo' },
  { value: 'part-time', label: 'Medio Tiempo' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'project-based', label: 'Por Proyecto' },
  { value: 'consulting', label: 'Consultoría' }
];

const TalentEditProfile = () => {
  const navigate = useNavigate();
  const { profile, userProfile, updateProfile, updateAvatar, validateProfile } = useProfileData();
  const { socialLinks, addSocialLink, deleteSocialLink } = useSocialLinks();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<ProfileEditData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [socialUrls, setSocialUrls] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form data
  useEffect(() => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || '',
        title: profile?.title || '',
        bio: profile?.bio || '',
        skills: profile?.skills || [],
        location: profile?.location || '',
        country: profile?.country || '',
        city: profile?.city || '',
        phone: userProfile.phone || profile?.phone || '',
        video_presentation_url: profile?.video_presentation_url || '',
        availability: profile?.availability || ''
      });
      setSkills(profile?.skills || []);
    }
  }, [profile, userProfile]);

  // Initialize social links
  useEffect(() => {
    const urls: Record<string, string> = {};
    socialLinks.forEach(link => {
      urls[link.platform] = link.url;
    });
    setSocialUrls(urls);
  }, [socialLinks]);

  const handleInputChange = (field: keyof ProfileEditData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updatedSkills = [...skills, newSkill.trim()];
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

  const handleSocialLinkChange = (platform: string, url: string) => {
    setSocialUrls(prev => ({ ...prev, [platform]: url }));
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
      // Update profile
      const success = await updateProfile(formData as ProfileEditData);
      
      // Update social links
      if (success) {
        // Delete old links and add new ones
        for (const platform in socialUrls) {
          const url = socialUrls[platform];
          const existingLink = socialLinks.find(l => l.platform === platform);
          
          if (url && url.trim()) {
            if (existingLink) {
              // Update is not available, so delete and re-add
              await deleteSocialLink(existingLink.id);
            }
            await addSocialLink({
              platform: platform as any,
              url: url.trim()
            });
          } else if (existingLink) {
            // Remove if now empty
            await deleteSocialLink(existingLink.id);
          }
        }
        
        toast.success('Perfil actualizado correctamente');
        navigate('/talent-dashboard/profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo debe ser menor a 5MB');
      return;
    }

    setAvatarLoading(true);
    try {
      await updateAvatar(file);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Error al cargar la imagen');
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/talent-dashboard/profile')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Editar Perfil</h1>
            <p className="text-muted-foreground">Actualiza tu información profesional</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Foto de Perfil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar 
                    className="h-24 w-24 cursor-pointer" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <AvatarImage 
                      src={
                        userProfile?.avatar_url && !userProfile.avatar_url.startsWith('blob:') 
                          ? userProfile.avatar_url 
                          : undefined
                      } 
                    />
                    <AvatarFallback className="text-2xl bg-muted">
                      {formData.full_name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {avatarLoading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1.5 cursor-pointer hover:bg-primary/90 transition-colors">
                    <Camera className="h-3 w-3 text-primary-foreground" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">
                    Haz clic en la foto para cambiarla
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarLoading}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {avatarLoading ? 'Cargando...' : 'Cambiar Foto'}
                  </Button>
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Nombre Completo *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name || ''}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Tu nombre completo"
                    className={errors.full_name ? 'border-destructive' : ''}
                  />
                  {errors.full_name && (
                    <p className="text-sm text-destructive mt-1">{errors.full_name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="title">Título Profesional *</Label>
                  <Input
                    id="title"
                    value={formData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Ej: Desarrollador Frontend"
                    className={errors.title ? 'border-destructive' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive mt-1">{errors.title}</p>
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
                  className={errors.bio ? 'border-destructive' : ''}
                />
                {errors.bio && (
                  <p className="text-sm text-destructive mt-1">{errors.bio}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Professional Info */}
          <Card>
            <CardHeader>
              <CardTitle>Información Profesional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="experience_level">Nivel de Experiencia</Label>
                  <Select
                    value={(formData as any).experience_level || ''}
                    onValueChange={(value) => handleInputChange('experience_level' as any, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERIENCE_LEVELS.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Categoría Principal</Label>
                  <Select
                    value={(formData as any).primary_category || ''}
                    onValueChange={(value) => handleInputChange('primary_category' as any, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROFESSIONAL_CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
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
                    {AVAILABILITY_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Habilidades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Agregar habilidad"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                />
                <Button type="button" onClick={handleAddSkill} size="sm">
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
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              {errors.skills && (
                <p className="text-sm text-destructive">{errors.skills}</p>
              )}
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Ubicación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Solo visible para empresas a las que postules.
                </p>
              </div>

              <div>
                <Label htmlFor="video_presentation_url">Video de Presentación</Label>
                <Input
                  id="video_presentation_url"
                  value={formData.video_presentation_url || ''}
                  onChange={(e) => handleInputChange('video_presentation_url', e.target.value)}
                  placeholder="https://loom.com/share/..."
                  className={errors.video_presentation_url ? 'border-destructive' : ''}
                />
                {errors.video_presentation_url && (
                  <p className="text-sm text-destructive mt-1">{errors.video_presentation_url}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Un video de presentación corto puede aumentar tus oportunidades hasta 3 veces 🎥
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Redes Sociales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {SOCIAL_PLATFORMS.map(platform => (
                <div key={platform.value}>
                  <Label htmlFor={platform.value}>{platform.label}</Label>
                  <Input
                    id={platform.value}
                    value={socialUrls[platform.value] || ''}
                    onChange={(e) => handleSocialLinkChange(platform.value, e.target.value)}
                    placeholder={platform.placeholder}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/talent-dashboard/profile')}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default TalentEditProfile;
