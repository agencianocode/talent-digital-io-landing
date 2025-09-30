import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useOpportunitySharing } from '@/hooks/useOpportunitySharing';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { 
  Building2, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
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
import { toast } from 'sonner';

const PublicOpportunity = () => {
  const { opportunityId } = useParams<{ opportunityId: string }>();
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const [opportunity, setOpportunity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getPublicOpportunity, shareOpportunity } = useOpportunitySharing();

  useEffect(() => {
    if (opportunityId) {
      loadOpportunity();
    }
  }, [opportunityId]);

  const loadOpportunity = async () => {
    if (!opportunityId) return;

    setIsLoading(true);
    try {
      // For now, we'll use a direct URL since the table isn't created yet
      const publicUrl = `${window.location.origin}/opportunity/${opportunityId}`;
      const data = await getPublicOpportunity(publicUrl);
      
      if (data) {
        setOpportunity(data);
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

  const handleApply = () => {
    if (!user) {
      // Redirect to login with return URL
      navigate(`/login?redirect=/opportunity/${opportunityId}`);
      return;
    }
    
    // Navigate to apply page
    navigate(`/talent-dashboard/opportunities/${opportunityId}`);
  };

  const handleShare = async (type: 'whatsapp' | 'linkedin' | 'twitter' | 'email') => {
    if (!opportunityId) return;
    
    await shareOpportunity(opportunityId, type);
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
        <div className="animate-pulse space-y-4 w-full max-w-4xl p-8">
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
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={opportunity.company?.logo_url} />
                  <AvatarFallback>
                    <Building2 className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{opportunity.title}</h1>
                  <p className="text-gray-600">{opportunity.company?.name}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('whatsapp')}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartir
              </Button>
              <Button onClick={handleApply}>
                Aplicar Ahora
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
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
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {opportunity.description}
                  </p>
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
                    <div 
                      className="text-gray-700 whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: opportunity.requirements
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/(Habilidades:)/g, '<strong>$1</strong>')
                          .replace(/(Herramientas:)/g, '<strong>$1</strong>')
                          .replace(/(Contratistas requeridos:)/g, '<strong>$1</strong>')
                          .replace(/(Zona horaria preferida:)/g, '<strong>$1</strong>')
                          .replace(/(Idiomas preferidos:)/g, '<strong>$1</strong>')
                          .replace(/\n/g, '<br/>')
                      }}
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
                
                {opportunity.salary_min && (
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
                    <AvatarImage src={opportunity.company?.logo_url} />
                    <AvatarFallback>
                      <Briefcase className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-lg">{opportunity.company?.name}</h4>
                    <p className="text-sm text-gray-600">{opportunity.company?.industry}</p>
                  </div>
                </div>

                {opportunity.company?.description && (
                  <p className="text-sm text-gray-600">{opportunity.company.description}</p>
                )}

                {/* Social Media Links */}
                {opportunity.company?.social_links && (
                  <div className="flex items-center gap-3">
                    {opportunity.company.social_links.linkedin && (
                      <a 
                        href={opportunity.company.social_links.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                        title="LinkedIn"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                    {opportunity.company.social_links.instagram && (
                      <a 
                        href={opportunity.company.social_links.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:text-pink-700 transition-colors"
                        title="Instagram"
                      >
                        <Instagram className="h-5 w-5" />
                      </a>
                    )}
                    {opportunity.company.social_links.youtube && (
                      <a 
                        href={opportunity.company.social_links.youtube} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-red-600 hover:text-red-700 transition-colors"
                        title="YouTube"
                      >
                        <Youtube className="h-5 w-5" />
                      </a>
                    )}
                    {opportunity.company.social_links.twitter && (
                      <a 
                        href={opportunity.company.social_links.twitter} 
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
                
                {opportunity.company?.website && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.open(opportunity.company.website, '_blank')}
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
                  Aplicar a esta Oportunidad
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Aplicación gratuita • Respuesta rápida
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