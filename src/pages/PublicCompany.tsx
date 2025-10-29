import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { 
  Building2, 
  MapPin, 
  Globe,
  Users,
  DollarSign,
  ArrowLeft,
  Linkedin,
  Instagram,
  Youtube,
  Twitter,
  Facebook
} from 'lucide-react';

const PublicCompany = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (companyId) {
      loadCompany();
    }
  }, [companyId]);

  const loadCompany = async () => {
    if (!companyId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('companies')
        .select(`
          id,
          name,
          logo_url,
          description,
          website,
          social_links,
          location,
          employee_count_range,
          annual_revenue_range,
          benefits,
          work_culture,
          business_impact,
          team_values
        `)
        .eq('id', companyId)
        .maybeSingle();
      
      if (error) throw error;

      if (data) {
        setCompany(data);
        updateMetaTags(data);
      } else {
        setError('Empresa no encontrada');
      }
    } catch (error: any) {
      console.error('❌ Error loading company:', {
        error,
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
        companyId
      });
      setError('Error al cargar la empresa');
    } finally {
      setIsLoading(false);
    }
  };

  const updateMetaTags = (company: any) => {
    const title = `${company.name} - TalentoDigital`;
    const description = company.description?.substring(0, 160) || 'Conoce más sobre esta empresa';
    const url = `${window.location.origin}/company/${company.id}`;
    const logoUrl = company.logo_url || `${window.location.origin}/og-image.png`;
    
    document.title = title;
    
    const metaTags = {
      'description': description,
      'og:title': title,
      'og:description': description,
      'og:url': url,
      'og:type': 'website',
      'og:image': logoUrl,
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': logoUrl
    };

    Object.entries(metaTags).forEach(([name, content]) => {
      const property = name.startsWith('og:') || name.startsWith('twitter:') ? 'property' : 'name';
      let meta = document.querySelector(`meta[${property}="${name}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(property, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-4xl p-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Empresa no encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {error || 'La empresa que buscas no existe o ha sido removida.'}
              </p>
              <Button onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const socialLinks = company.social_links || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          
          <div className="flex items-start gap-6">
            {/* Square Logo */}
            <div className="flex-shrink-0">
              {company.logo_url ? (
                <img 
                  src={company.logo_url} 
                  alt={`${company.name} logo`}
                  className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                  <Building2 className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Company Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{company.name}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                {company.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{company.location}</span>
                  </div>
                )}
                {company.employee_count_range && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{company.employee_count_range}</span>
                  </div>
                )}
                {company.annual_revenue_range && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>{company.annual_revenue_range}</span>
                  </div>
                )}
              </div>

              {company.description && (
                <p className="text-gray-700 mb-4">{company.description}</p>
              )}

              {/* Links */}
              <div className="flex flex-wrap items-center gap-3">
                {company.website && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(company.website, '_blank')}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Sitio Web
                  </Button>
                )}

                {/* Social Links */}
                {socialLinks.linkedin && (
                  <a 
                    href={socialLinks.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {socialLinks.instagram && (
                  <a 
                    href={socialLinks.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-pink-600 hover:text-pink-700"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {socialLinks.youtube && (
                  <a 
                    href={socialLinks.youtube} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Youtube className="h-5 w-5" />
                  </a>
                )}
                {socialLinks.twitter && (
                  <a 
                    href={socialLinks.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-500"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {socialLinks.facebook && (
                  <a 
                    href={socialLinks.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:text-blue-800"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Benefits */}
          {company.benefits && (
            <Card>
              <CardHeader>
                <CardTitle>Beneficios que ofrece la empresa</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{company.benefits}</p>
              </CardContent>
            </Card>
          )}

          {/* Work Culture */}
          {company.work_culture && (
            <Card>
              <CardHeader>
                <CardTitle>Cultura de trabajo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{company.work_culture}</p>
              </CardContent>
            </Card>
          )}

          {/* Business Impact */}
          {company.business_impact && (
            <Card>
              <CardHeader>
                <CardTitle>Impacto del negocio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{company.business_impact}</p>
              </CardContent>
            </Card>
          )}

          {/* Team Values */}
          {company.team_values && (
            <Card>
              <CardHeader>
                <CardTitle>Valores del equipo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{company.team_values}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicCompany;
