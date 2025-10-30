import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, GraduationCap, MapPin, Award, ExternalLink } from 'lucide-react';

interface Graduate {
  student_id: string;
  student_name: string | null;
  student_email: string;
  graduation_date: string | null;
  program_name: string | null;
  certificate_url?: string | null;
  user_id?: string | null;
  avatar_url?: string | null;
  city?: string | null;
  country?: string | null;
  title?: string | null;
}

interface AcademyInfo {
  id: string;
  name: string;
  logo_url?: string;
  description?: string;
  brand_color: string;
  secondary_color: string;
  academy_tagline?: string;
  website?: string;
}

export default function PublicAcademyDirectory() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [academy, setAcademy] = useState<AcademyInfo | null>(null);
  const [graduates, setGraduates] = useState<Graduate[]>([]);
  const [showLogo, setShowLogo] = useState(true);
  const [showDescription, setShowDescription] = useState(true);

  useEffect(() => {
    loadAcademyData();
  }, [slug]);

  const loadAcademyData = async () => {
    if (!slug) return;

    try {
      setLoading(true);

      // Load academy info
      const { data: academyData, error: academyError } = await supabase
        .from('companies')
        .select('id, name, logo_url, description, brand_color, secondary_color, academy_tagline, website, directory_settings, public_directory_enabled')
        .eq('academy_slug', slug)
        .eq('business_type', 'academy')
        .single();

      if (academyError) throw academyError;

      if (!academyData) {
        navigate('/404');
        return;
      }

      if (!academyData.public_directory_enabled) {
        navigate('/404');
        return;
      }

      setAcademy(academyData as AcademyInfo);
      const settings = typeof academyData.directory_settings === 'object' && academyData.directory_settings !== null
        ? academyData.directory_settings as { show_logo?: boolean; show_description?: boolean }
        : {};
      setShowLogo(settings.show_logo ?? true);
      setShowDescription(settings.show_description ?? true);

      // Load graduates with their profiles
      const { data: graduatesData, error: graduatesError } = await supabase
        .rpc('get_public_academy_directory', {
          p_academy_id: academyData.id
        });

      if (graduatesError) throw graduatesError;

      setGraduates(graduatesData || []);
    } catch (error) {
      console.error('Error loading academy data:', error);
      navigate('/404');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!academy) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div 
        className="py-16 px-4"
        style={{
          background: `linear-gradient(135deg, ${academy.brand_color} 0%, ${academy.secondary_color} 100%)`,
        }}
      >
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center text-white gap-4">
            {showLogo && academy.logo_url && (
              <img 
                src={academy.logo_url} 
                alt={academy.name}
                className="h-24 w-24 object-contain rounded-lg bg-white/10 p-2"
              />
            )}
            <h1 className="text-4xl font-bold">{academy.name}</h1>
            {academy.academy_tagline && (
              <p className="text-xl text-white/90">{academy.academy_tagline}</p>
            )}
            {showDescription && academy.description && (
              <p className="text-white/80 max-w-2xl">{academy.description}</p>
            )}
            {academy.website && (
              <Button 
                variant="secondary" 
                asChild
                className="mt-4"
              >
                <a href={academy.website} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visitar Sitio Web
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Graduates Section */}
      <div className="container mx-auto max-w-6xl py-12 px-4">
        <div className="flex items-center gap-3 mb-8">
          <GraduationCap className="h-8 w-8" style={{ color: academy.brand_color }} />
          <h2 className="text-3xl font-bold">
            Nuestros Graduados ({graduates.length})
          </h2>
        </div>

        {graduates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Aún no hay graduados registrados en el directorio público.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {graduates.map((graduate) => (
              <Card key={graduate.student_id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={graduate.avatar_url || undefined} />
                      <AvatarFallback>
                        {graduate.student_name?.charAt(0) || 'G'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">
                        {graduate.student_name || 'Graduado'}
                      </h3>
                      {graduate.title && (
                        <p className="text-sm text-muted-foreground truncate">
                          {graduate.title}
                        </p>
                      )}
                      {(graduate.city || graduate.country) && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          {[graduate.city, graduate.country]
                            .filter(Boolean)
                            .join(', ')}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {graduate.program_name && (
                      <Badge variant="secondary" className="w-full justify-center">
                        {graduate.program_name}
                      </Badge>
                    )}
                    {graduate.graduation_date && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Award className="h-4 w-4" />
                        Graduado: {new Date(graduate.graduation_date).toLocaleDateString('es')}
                      </div>
                    )}
                    {graduate.certificate_url && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        asChild
                      >
                        <a 
                          href={graduate.certificate_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <Award className="mr-2 h-4 w-4" />
                          Ver Certificado
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t py-8 mt-12">
        <div className="container mx-auto max-w-6xl px-4 text-center text-muted-foreground">
          <p>
            Potenciado por{' '}
            <a href="/" className="text-primary hover:underline">
              TalentoDigital
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
