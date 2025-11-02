import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Share2, 
  ExternalLink, 
  GraduationCap,
  MapPin,
  Calendar,
  Settings2,
  Image as ImageIcon,
  FileText
} from 'lucide-react';

interface PublicDirectoryProps {
  academyId: string;
}

export const PublicDirectory: React.FC<PublicDirectoryProps> = ({ academyId }) => {
  const [showLogo, setShowLogo] = useState(true);
  const [showDescription, setShowDescription] = useState(true);
  const [studentsFilter, setStudentsFilter] = useState<'all' | 'graduated' | 'enrolled'>('all');
  const [loading, setLoading] = useState(false);
  const [academyData, setAcademyData] = useState<any>(null);

  // Load academy settings
  useEffect(() => {
    loadAcademySettings();
  }, [academyId]);

  const loadAcademySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('name, logo_url, description, directory_settings, academy_slug')
        .eq('id', academyId)
        .single();

      if (error) throw error;

      setAcademyData(data as any);
      if ((data as any)?.directory_settings) {
        setShowLogo((data as any).directory_settings.show_logo ?? true);
        setShowDescription((data as any).directory_settings.show_description ?? true);
        setStudentsFilter((data as any).directory_settings.students_filter ?? 'all');
      }
    } catch (error) {
      console.error('Error loading academy settings:', error);
    }
  };

  const updateDirectorySettings = async (
    show_logo: boolean, 
    show_description: boolean, 
    students_filter: 'all' | 'graduated' | 'enrolled'
  ) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('companies')
        .update({
          directory_settings: {
            show_logo,
            show_description,
            students_filter
          }
        } as any)
        .eq('id', academyId);

      if (error) throw error;
      toast.success('Configuración actualizada');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Error al actualizar configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLogo = async (checked: boolean) => {
    setShowLogo(checked);
    await updateDirectorySettings(checked, showDescription, studentsFilter);
  };

  const handleToggleDescription = async (checked: boolean) => {
    setShowDescription(checked);
    await updateDirectorySettings(showLogo, checked, studentsFilter);
  };

  const handleStudentsFilterChange = async (filter: 'all' | 'graduated' | 'enrolled') => {
    setStudentsFilter(filter);
    await updateDirectorySettings(showLogo, showDescription, filter);
  };

  const [graduates, setGraduates] = useState<any[]>([]);

  // Load graduates data
  useEffect(() => {
    loadGraduates();
  }, [academyId]);

  const loadGraduates = async () => {
    try {
      const { data, error } = await supabase.rpc('get_public_academy_directory', {
        p_academy_id: academyId
      });

      if (error) throw error;
      setGraduates(data || []);
    } catch (error) {
      console.error('Error loading graduates:', error);
    }
  };

  const publicUrl = academyData?.academy_slug 
    ? `${window.location.origin}/academy/${academyData.academy_slug}`
    : `${window.location.origin}/academy/${academyId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success('Link copiado al portapapeles');
  };

  const handleViewPublic = () => {
    if (!academyData?.academy_slug) {
      toast.error('Configura el slug de la academia en la sección de Branding primero');
      return;
    }
    window.open(publicUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Directorio Público</h2>
          <p className="text-muted-foreground">
            Comparte el directorio de graduados de tu academia
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCopyLink}>
            <Share2 className="h-4 w-4 mr-2" />
            Copiar Link
          </Button>
          <Button variant="outline" onClick={handleViewPublic}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver Público
          </Button>
        </div>
      </div>

      {/* Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Configuración del Directorio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="show-logo" className="text-sm font-medium">
                  Mostrar logo de la academia
                </Label>
                <p className="text-xs text-muted-foreground">
                  El logo aparecerá en la cabecera del directorio público
                </p>
              </div>
            </div>
            <Switch
              id="show-logo"
              checked={showLogo}
              onCheckedChange={handleToggleLogo}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="show-description" className="text-sm font-medium">
                  Mostrar descripción de la academia
                </Label>
                <p className="text-xs text-muted-foreground">
                  La descripción aparecerá debajo del logo en el directorio público
                </p>
              </div>
            </div>
            <Switch
              id="show-description"
              checked={showDescription}
              onCheckedChange={handleToggleDescription}
              disabled={loading}
            />
          </div>

          {/* Students Filter Setting */}
          <div className="flex items-center justify-between py-3 border-b">
            <div className="flex items-start gap-3 flex-1">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <Label className="text-sm font-medium">
                  Estudiantes a mostrar
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Selecciona qué estudiantes mostrar en el directorio público
                </p>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant={studentsFilter === 'all' ? 'default' : 'outline'}
                    onClick={() => handleStudentsFilterChange('all')}
                    disabled={loading}
                  >
                    Todos
                  </Button>
                  <Button
                    size="sm"
                    variant={studentsFilter === 'graduated' ? 'default' : 'outline'}
                    onClick={() => handleStudentsFilterChange('graduated')}
                    disabled={loading}
                  >
                    Solo Graduados
                  </Button>
                  <Button
                    size="sm"
                    variant={studentsFilter === 'enrolled' ? 'default' : 'outline'}
                    onClick={() => handleStudentsFilterChange('enrolled')}
                    disabled={loading}
                  >
                    Solo Activos
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Public URL Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Link del Directorio Público
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <code className="flex-1 text-sm">{publicUrl}</code>
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              Copiar
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Comparte este link para mostrar el directorio de graduados de tu academia
          </p>
        </CardContent>
      </Card>

      {/* Preview Card */}
      {academyData && (showLogo || showDescription) && (
        <Card>
          <CardHeader>
            <CardTitle>Vista Previa del Directorio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 p-6 border rounded-lg bg-card">
              {showLogo && academyData.logo_url && (
                <div className="flex justify-center">
                  <img 
                    src={academyData.logo_url} 
                    alt={academyData.name}
                    className="h-20 w-auto object-contain"
                  />
                </div>
              )}
              
              <div className="text-center">
                <h3 className="text-2xl font-bold">{academyData.name}</h3>
                {showDescription && academyData.description && (
                  <p className="text-muted-foreground mt-2">
                    {academyData.description}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Graduates List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Graduados ({graduates.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {graduates.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay graduados en el directorio público</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {graduates.map((graduate) => (
                <Card key={graduate.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={graduate.avatar_url || undefined} />
                        <AvatarFallback>
                          {(graduate.full_name || graduate.student_name || 'E')?.charAt(0) || 'E'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {graduate.full_name || graduate.student_name || 'Estudiante'}
                        </h3>
                        {graduate.location && (
                          <p className="text-sm text-gray-600 flex items-center justify-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {graduate.location}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-3 h-3" />
                        <span>
                          Graduado: {new Date(graduate.graduation_date).toLocaleDateString()}
                        </span>
                      </div>
                      
                       <div className="flex flex-wrap gap-1">
                        {graduate.skills?.map((skill: string) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      
                      {graduate.certificate_url && (
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Ver Certificado
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicDirectory;
