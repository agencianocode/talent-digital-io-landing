import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useOpportunitySharing } from '@/hooks/useOpportunitySharing';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { isUUID } from '@/lib/slug-utils';
import { 
  Building2, 
  MapPin, 
  Clock, 
  DollarSign, 
  Calendar,
  ArrowLeft,
  ExternalLink,
  Share2,
  Linkedin,
  Instagram,
  Youtube,
  Twitter,
  Briefcase
} from 'lucide-react';
import { FormattedOpportunityText } from '@/lib/markdown-formatter';

const PublicOpportunity = () => {
  const { opportunityId } = useParams<{ opportunityId: string }>();
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const [opportunity, setOpportunity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { shareOpportunity } = useOpportunitySharing();

  useEffect(() => {
    if (opportunityId) {
      loadOpportunity();
    }
  }, [opportunityId]);

  const loadOpportunity = async () => {
    if (!opportunityId) return;

    setIsLoading(true);
    try {
      // Determine if the identifier is a UUID or a slug
      const isUUIDFormat = isUUID(opportunityId);
      
      // Build query based on identifier type
      let query = supabase
        .from('opportunities')
        .select(`
          *,
          companies (
            id,
            name,
            logo_url,
            description,
            industry,
            size,
            website,
            social_links
          )
        `)
        .eq('status', 'active');

      if (isUUIDFormat) {
        query = query.eq('id', opportunityId);
      } else {
        query = query.eq('slug', opportunityId);
      }

      const { data, error } = await query.maybeSingle();
      
      if (error) throw error;

      if (data) {
        // If accessed by UUID but has a slug, redirect to canonical URL
        if (isUUIDFormat && data.slug) {
          navigate(`/opportunity/${data.slug}`, { replace: true });
          return;
        }
        
        setOpportunity(data);
        
        // Update page meta tags
        updateMetaTags(data);
        
        // Registrar vista (solo si hay un usuario autenticado)
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          try {
            await supabase
              .from('opportunity_views')
              .insert({ 
                opportunity_id: data.id,
                viewer_id: currentUser.id 
              });
          } catch (viewErr) {
            console.warn('No se pudo registrar vista:', viewErr);
          }
        }
      } else {
        setError('Oportunidad no encontrada');
      }
    } catch (error) {
      console.error('Error loading opportunity:', error);
      setError('Error al cargar la oportunidad');
    } finally {
      setIsLoading(false);
    }
  };

  const updateMetaTags = (opportunity: any) => {
    const companyName = opportunity.companies?.name || 'Empresa';
    const title = `${opportunity.title} - ${companyName}`;
    const description = opportunity.description?.substring(0, 160) || 'Oportunidad laboral disponible';
    // Use slug for canonical URL if available
    const identifier = opportunity.slug || opportunity.id;
    const url = `${window.location.origin}/opportunity/${identifier}`;
    const logoUrl = opportunity.companies?.logo_url || `${window.location.origin}/og-image.png`;
    
    // Update document title
    document.title = title;
    
    // Update or create meta tags
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

  const handleApply = () => {
    if (!user) {
      // Guardar la intención de aplicación para redirección post-onboarding
      // Use slug for URL if available, but store ID for internal use
      const urlIdentifier = opportunity?.slug || opportunityId;
      if (opportunityId) {
        localStorage.setItem('pending_opportunity', opportunity?.id || opportunityId);
        navigate(`/register-talent?redirect=/opportunity/${urlIdentifier}`);
      } else {
        navigate('/register-talent');
      }
      return;
    }
    // Use ID for internal dashboard navigation
    navigate(`/talent-dashboard/opportunities/${opportunity?.id || opportunityId}`);
  };

  const handleShare = async (type: 'whatsapp' | 'linkedin' | 'twitter' | 'email') => {
    if (!opportunity) return;
    
    // Pass slug and title for sharing URLs and personalized messages
    await shareOpportunity(opportunity.id, type, undefined, opportunity.slug, opportunity.title);
  };

  const getJobTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'full-time': 'Tiempo Completo',
      'part-time': 'Medio Tiempo',
      'contract': 'Por Contrato',
      'freelance': 'Freelance'
    };
    return types[type] || type;
  };

  const formatSalary = (min: number, max?: number, currency = 'USD') => {
    const minFormatted = min.toLocaleString();
    const maxFormatted = max ? max.toLocaleString() : null;
    const currencySymbol = currency === 'USD' ? '$' : currency;
    
    if (maxFormatted) {
      return `${currencySymbol}${minFormatted} - ${currencySymbol}${maxFormatted}`;
    }
    return `${currencySymbol}${minFormatted}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-24 p-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Oportunidad no encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {error || 'La oportunidad que buscas no existe o ha sido removida.'}
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-24 py-4 sm:py-6">
          {/* Mobile: Back button on top */}
          {user && (
            <div className="mb-3 sm:hidden">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/talent-dashboard/opportunities')}
                className="px-0"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Dashboard
              </Button>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Desktop: Back button inline */}
              {user && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/talent-dashboard/opportunities')}
                  className="hidden sm:flex"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Dashboard
                </Button>
              )}
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                <AvatarImage src={opportunity.companies?.logo_url} />
                <AvatarFallback>
                  <Building2 className="h-5 w-5 sm:h-6 sm:w-6" />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{opportunity.title}</h1>
                <p className="text-sm sm:text-base text-gray-600">{opportunity.companies?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('whatsapp')}
                className="flex-1 sm:flex-none"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartir
              </Button>
              <Button onClick={handleApply} className="flex-1 sm:flex-none text-sm sm:text-base">
                {user ? 'Aplicar' : 'Regístrate'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-24 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Details */}
            <Card>
              <CardHeader>
                <CardTitle>Descripción del Puesto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <FormattedOpportunityText 
                    text={opportunity.description} 
                    className="text-gray-700"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {opportunity.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle>Requisitos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <FormattedOpportunityText 
                      text={opportunity.requirements} 
                      className="text-gray-700"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {opportunity.benefits && (
              <Card>
                <CardHeader>
                  <CardTitle>Beneficios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {opportunity.benefits}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Puesto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {opportunity.location || 'Remoto'}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {getJobTypeLabel(opportunity.type)}
                  </span>
                </div>
                
                {/* Solo mostrar salario si es público */}
                {opportunity.salary_min && opportunity.salary_is_public !== false && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {formatSalary(opportunity.salary_min, opportunity.salary_max, opportunity.currency)}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    Publicado {new Date(opportunity.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle>Sobre la Empresa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={opportunity.companies?.logo_url} />
                    <AvatarFallback>
                      <Briefcase className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-lg">{opportunity.companies?.name}</h4>
                    <p className="text-sm text-gray-600">{opportunity.companies?.industry}</p>
                  </div>
                </div>

                {opportunity.companies?.description && (
                  <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: opportunity.companies.description }} />
                )}

                {/* Social Media Links */}
                {opportunity.companies?.social_links && (
                  <div className="flex items-center gap-3">
                    {opportunity.companies.social_links.linkedin && (
                      <a 
                        href={opportunity.companies.social_links.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                        title="LinkedIn"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                    {opportunity.companies.social_links.instagram && (
                      <a 
                        href={opportunity.companies.social_links.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:text-pink-700 transition-colors"
                        title="Instagram"
                      >
                        <Instagram className="h-5 w-5" />
                      </a>
                    )}
                    {opportunity.companies.social_links.youtube && (
                      <a 
                        href={opportunity.companies.social_links.youtube} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-red-600 hover:text-red-700 transition-colors"
                        title="YouTube"
                      >
                        <Youtube className="h-5 w-5" />
                      </a>
                    )}
                    {opportunity.companies.social_links.twitter && (
                      <a 
                        href={opportunity.companies.social_links.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-500 transition-colors"
                        title="Twitter"
                      >
                        <Twitter className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                )}
                
                {opportunity.companies?.website && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.open(opportunity.companies.website, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visitar Sitio Web
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Apply Button */}
            <Card>
              <CardContent className="pt-6">
                <Button 
                  onClick={handleApply}
                  className="w-full"
                  size="lg"
                >
                  {user ? 'Aplicar a esta Oportunidad' : 'Regístrate para Aplicar'}
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  {user ? 'Aplicación gratuita • Respuesta rápida' : 'Crea tu cuenta gratis y aplica en segundos'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicOpportunity; 