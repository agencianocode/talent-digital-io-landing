import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  MapPin, 
  Eye,
  MessageCircle,
  Play,
  FileText,
  CheckCircle,
  Clock,
  Github,
  Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMessages } from '@/hooks/useMessages';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// Real talent interfaces based on Supabase tables
interface RealTalent {
  id: string;
  user_id: string;
  full_name: string;
  title: string;
  bio: string;
  avatar_url?: string | null;
  city?: string | null;
  country?: string | null;
  phone?: string | null;
  linkedin?: string | null;
  portfolio_url?: string | null;
  github_url?: string | null;
  video_presentation_url?: string | null;
  social_links?: any;
  profile_completeness?: number | null;
  is_complete?: boolean;
  is_featured?: boolean;
  is_verified?: boolean;
  is_premium?: boolean;
  rating?: number;
  reviews_count?: number;
  response_rate?: number;
  last_active?: string | null;
  created_at: string;
  updated_at: string;
}

interface TalentStats {
  total: number;
  featured: number;
  verified: number;
  premium: number;
  averageRating: number;
  categories: string[];
  countries: string[];
}

const TalentDiscovery = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [allTalents, setAllTalents] = useState<RealTalent[]>([]);
  const [filteredTalents, setFilteredTalents] = useState<RealTalent[]>([]);
  const { getOrCreateConversation, sendMessage } = useMessages();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [categoryFilter, setCategoryFilter] = useState<string>(searchParams.get('category') || 'all');
  const [countryFilter, setCountryFilter] = useState<string>(searchParams.get('country') || 'all');
  const [experienceFilter, setExperienceFilter] = useState<string>(searchParams.get('experience') || 'all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [remoteFilter, setRemoteFilter] = useState<string>('all');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<TalentStats>({
    total: 0,
    featured: 0,
    verified: 0,
    premium: 0,
    averageRating: 0,
    categories: [],
    countries: []
  });

  // Fetch real talent data from Supabase
  const fetchTalents = async () => {
    try {
      setIsLoading(true);
      
      // First, get all talent_profiles (this is the source of truth for talents)
      const { data: talentProfiles, error: talentProfilesError } = await supabase
        .from('talent_profiles')
        .select(`
          id,
          user_id,
          title,
          bio,
          portfolio_url
        `);

      if (talentProfilesError) {
        console.error('Error fetching talent profiles:', talentProfilesError);
        toast.error('Error al cargar los perfiles de talento');
        setIsLoading(false);
        return;
      }

      console.log('💼 Perfiles de talento encontrados:', talentProfiles?.length || 0);

      const talentUserIds = talentProfiles?.map(tp => tp.user_id) || [];

      if (talentUserIds.length === 0) {
        console.log('⚠️ No se encontraron perfiles de talento');
        setAllTalents([]);
        setFilteredTalents([]);
        setIsLoading(false);
        return;
      }

      // Get profiles data (without phone - use secure function when needed)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          full_name,
          avatar_url,
          city,
          country,
          linkedin,
          video_presentation_url,
          social_links,
          profile_completeness,
          created_at,
          updated_at
        `)
        .in('user_id', talentUserIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        toast.error('Error al cargar los perfiles');
        setIsLoading(false);
        return;
      }

      console.log('📋 Perfiles encontrados:', profiles?.length || 0);

      // Get user roles for premium status (optional, won't block if fails)
      const { data: talentRoles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('role', ['talent', 'freemium_talent', 'premium_talent'])
        .in('user_id', talentUserIds);

      console.log('👥 Roles de usuario encontrados:', talentRoles?.length || 0);

      // Combine profiles and talent_profiles data
      const meetsMinimums = (params: {
        bio?: string | null;
        city?: string | null;
        country?: string | null;
        video?: string | null;
        portfolio?: string | null;
        social?: any;
      }) => {
        const bioOk = (params.bio?.trim().length || 0) >= 50;
        const locationOk = !!(params.city && params.country);
        const mediaOk = !!(params.video || params.portfolio);
        const socialsCount = params.social ? Object.values(params.social).filter((v: any) => typeof v === 'string' && v.trim().length > 0).length : 0;
        const socialsOk = socialsCount > 0;
        // Nota: en esta vista no validamos experiencia/educación por no estar disponibles en esta consulta
        return bioOk && locationOk && mediaOk && socialsOk;
      };


      const talents: RealTalent[] = profiles?.map(profile => {
        const talentProfile = (talentProfiles as any)?.find((tp: any) => tp.user_id === profile.user_id);
        const userRole = talentRoles?.find(r => r.user_id === profile.user_id);
        
        return {
          id: profile.id,
          user_id: profile.user_id,
          full_name: profile.full_name || 'Sin nombre',
          title: talentProfile?.title || 'Talento Digital',
          bio: talentProfile?.bio || 'Sin descripción',
          avatar_url: profile.avatar_url,
          city: profile.city,
          country: profile.country,
          phone: null, // Phone protected - use get_talent_phone_if_authorized() when needed
          linkedin: profile.linkedin,
          portfolio_url: talentProfile?.portfolio_url,
          github_url: null, // Column doesn't exist in talent_profiles table
          video_presentation_url: profile.video_presentation_url,
          social_links: profile.social_links,
          profile_completeness: (profile as any)?.profile_completeness ?? null,
          is_complete: (((profile as any)?.profile_completeness ?? 0) >= 70) || meetsMinimums({
            bio: talentProfile?.bio,
            city: profile.city,
            country: profile.country,
            video: profile.video_presentation_url,
            portfolio: talentProfile?.portfolio_url,
            social: profile.social_links,
          }),
          is_featured: false, // Column doesn't exist in talent_profiles table
          is_verified: false, // Column doesn't exist in talent_profiles table
          is_premium: userRole?.role === 'premium_talent', // Usar el rol real del usuario
          rating: 0, // Column doesn't exist in talent_profiles table
          reviews_count: 0, // Column doesn't exist in talent_profiles table
          response_rate: 0, // Column doesn't exist in talent_profiles table
          last_active: profile.updated_at, // Use profile updated_at as fallback
          created_at: profile.created_at,
          updated_at: profile.updated_at
        };
      }) || [];

      // Enhance existing talents with better data
      const enhancedTalents = talents.map(talent => {
        // If this is Fabian Segura, enhance his data
        if (talent.full_name === 'Fabian Segura' || talent.user_id === '1c1c3c4f-3587-4e47-958b-9529d0620d26') {
          return {
            ...talent,
            title: talent.title || 'Especialista No Code',
            bio: talent.bio || 'Industrial Tech Translator | Transformando Plantas Industriales con No Code | Especialista en Automatización',
            city: talent.city || 'Cali',
            country: talent.country || 'Colombia',
            is_featured: true,
            is_verified: true,
            is_premium: talent.is_premium,
            video_presentation_url: talent.video_presentation_url || 'https://youtu.be/kcOrTOT7Kko',
            portfolio_url: talent.portfolio_url || 'https://fabiansegura.com/portfolio',
            profile_completeness: 100,
            is_complete: true
          };
        }
        
        // For other talents, return as-is (real data from DB)
        return talent;
      });

      setAllTalents(enhancedTalents);
      setFilteredTalents(enhancedTalents);
      
      // Calculate stats
      const newStats: TalentStats = {
        total: enhancedTalents.length,
        featured: enhancedTalents.filter(t => t.is_featured).length,
        verified: enhancedTalents.filter(t => t.is_verified).length,
        premium: enhancedTalents.filter(t => t.is_premium).length,
        averageRating: enhancedTalents.length > 0 ? enhancedTalents.reduce((sum, t) => sum + (t.rating || 0), 0) / enhancedTalents.length : 0,
        categories: [...new Set(enhancedTalents.map(t => t.title).filter(Boolean))] as string[],
        countries: [...new Set(enhancedTalents.map(t => t.country).filter(Boolean))] as string[]
      };
      setStats(newStats);
      
    } catch (error) {
      console.error('Error fetching talents:', error);
      toast.error('Error al cargar los talentos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTalents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, categoryFilter, countryFilter, experienceFilter, availabilityFilter, remoteFilter, showFeaturedOnly, allTalents]);

  useEffect(() => {
    // Update URL params
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (categoryFilter !== 'all') params.set('category', categoryFilter);
    if (countryFilter !== 'all') params.set('country', countryFilter);
    if (experienceFilter !== 'all') params.set('experience', experienceFilter);
    setSearchParams(params);
  }, [searchTerm, categoryFilter, countryFilter, experienceFilter, setSearchParams]);

  const applyFilters = () => {
    if (allTalents.length === 0) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      let filtered = [...allTalents];
      
      // Search filter
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(talent => 
          talent.full_name.toLowerCase().includes(searchLower) ||
          talent.title.toLowerCase().includes(searchLower) ||
          talent.bio.toLowerCase().includes(searchLower) ||
          (talent.city && talent.city.toLowerCase().includes(searchLower)) ||
          (talent.country && talent.country.toLowerCase().includes(searchLower))
        );
      }
      
      // Category filter (using title as category for now)
      if (categoryFilter !== 'all') {
        filtered = filtered.filter(talent => 
          talent.title.toLowerCase().includes(categoryFilter.toLowerCase())
        );
      }
      
      // Country filter
      if (countryFilter !== 'all') {
        filtered = filtered.filter(talent => talent.country === countryFilter);
      }
      
      // Experience filter (not available in real data yet, skip for now)
      // if (experienceFilter !== 'all') {
      //   filtered = filtered.filter(talent => talent.experience_level === experienceFilter);
      // }
      
      // Availability filter (not available in real data yet, skip for now)
      // if (availabilityFilter !== 'all') {
      //   filtered = filtered.filter(talent => talent.availability === availabilityFilter);
      // }
      
      // Remote preference filter (not available in real data yet, skip for now)
      // if (remoteFilter !== 'all') {
      //   filtered = filtered.filter(talent => talent.remote_preference === remoteFilter);
      // }
      
      // Featured only filter
      if (showFeaturedOnly) {
        filtered = filtered.filter(talent => talent.is_featured);
      }
      
      // Sort: Premium > Certified > Featured > Others
      filtered.sort((a, b) => {
        const getPriority = (t: RealTalent) => {
          if (t.is_premium) return 3;
          if (t.is_verified) return 2; // verified can mean certified
          if (t.is_featured) return 1;
          return 0;
        };
        
        const priorityA = getPriority(a);
        const priorityB = getPriority(b);
        
        if (priorityA !== priorityB) return priorityB - priorityA;
        
        // If same priority, sort by profile completeness
        return (b.profile_completeness || 0) - (a.profile_completeness || 0);
      });
      
      setFilteredTalents(filtered);
      setIsLoading(false);
    }, 300);
  };

  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState<RealTalent | null>(null);
  const [messageText, setMessageText] = useState('');

  const handleContactTalent = (talent: RealTalent) => {
    setSelectedTalent(talent);
    setMessageText(`Hola ${talent.full_name}, me interesa tu perfil.`);
    setContactDialogOpen(true);
  };

  const handleSendMessage = async () => {
    if (!selectedTalent || !messageText.trim()) return;
    
    try {
      // Create conversation with type 'profile_contact'
      const conversationId = await getOrCreateConversation(selectedTalent.user_id, 'profile_contact');
      await sendMessage(conversationId, messageText.trim());
      setContactDialogOpen(false);
      setMessageText('');
      setSelectedTalent(null);
      navigate(`/business-dashboard/messages/${conversationId}`);
      toast.success('Mensaje enviado correctamente');
    } catch (e) {
      console.error(e);
      toast.error('No se pudo enviar el mensaje');
    }
  };

  const handleViewProfile = (talentId: string) => {
    navigate(`/business-dashboard/talent-profile/${talentId}`);
  };


  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              Descubrir Talento
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Encuentra y conecta con los mejores profesionales para tu equipo
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={() => navigate('/business-dashboard/opportunities/new')}
              size="default"
            >
              <Plus className="h-4 w-4 mr-2" />
              Publicar Oportunidad
            </Button>
          </div>
        </div>

      {/* Search and Compact Filters in one row */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar por nombre, título, skills o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Horizontal Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {stats.categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Country Filter */}
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="País" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los países</SelectItem>
              {stats.countries.map(country => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Experience Filter */}
          <Select value={experienceFilter} onValueChange={setExperienceFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Experiencia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los niveles</SelectItem>
              <SelectItem value="Principiante">Principiante</SelectItem>
              <SelectItem value="Intermedio">Intermedio</SelectItem>
              <SelectItem value="Avanzado">Avanzado</SelectItem>
              <SelectItem value="Experto">Experto</SelectItem>
            </SelectContent>
          </Select>

          {/* Availability Filter */}
          <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Disponibilidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Cualquier disponibilidad</SelectItem>
              <SelectItem value="Inmediata">Inmediata</SelectItem>
              <SelectItem value="2 semanas">2 semanas</SelectItem>
              <SelectItem value="1 mes">1 mes</SelectItem>
              <SelectItem value="2-3 meses">2-3 meses</SelectItem>
            </SelectContent>
          </Select>

          {/* Remote Preference Filter */}
          <Select value={remoteFilter} onValueChange={setRemoteFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Modalidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Cualquier modalidad</SelectItem>
              <SelectItem value="Solo remoto">Solo remoto</SelectItem>
              <SelectItem value="Solo presencial">Solo presencial</SelectItem>
              <SelectItem value="Híbrido">Híbrido</SelectItem>
              <SelectItem value="Indiferente">Indiferente</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
              setCountryFilter('all');
              setExperienceFilter('all');
              setAvailabilityFilter('all');
              setRemoteFilter('all');
              setShowFeaturedOnly(false);
            }}
          >
            Limpiar Filtros
          </Button>
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          {filteredTalents.length} talentos encontrados
          {searchTerm && ` para "${searchTerm}"`}
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Empty State */}
          {filteredTalents.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <Search className="h-8 w-8 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">No se encontraron talentos</h3>
                            <p className="text-gray-500">
                              Intenta ajustar los filtros de búsqueda o usa términos más amplios.
                            </p>
                          </div>
                          <Button 
                            variant="outline"
                            onClick={() => {
                              setSearchTerm('');
                              setCategoryFilter('all');
                              setCountryFilter('all');
                              setExperienceFilter('all');
                              setAvailabilityFilter('all');
                              setRemoteFilter('all');
                            }}
                          >
                            Limpiar Filtros
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    /* Talent Cards */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredTalents.map((talent) => (
                        <Card key={talent.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                          <CardContent className="p-6">
                            {/* Header */}
                            <div className="flex items-start gap-4 mb-4">
                              <div className="relative">
                                <Avatar className="h-16 w-16">
                                  <AvatarImage src={talent.avatar_url || undefined} />
                                  <AvatarFallback>
                                    {talent.full_name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                {talent.is_verified && (
                                  <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                                    <CheckCircle className="h-3 w-3 text-white" />
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                                      {talent.full_name}
                                    </h3>
                                    <p className="text-gray-600 text-sm">{talent.title}</p>
                                  </div>
                                  
                                  <div className="flex items-center gap-1">
                                    {talent.is_premium && (
                                      <Badge className="bg-primary text-primary-foreground text-xs flex items-center gap-1">
                                        <Plus className="h-3 w-3" />
                                        Premium
                                      </Badge>
                                    )}
                                    {talent.is_verified && !talent.is_premium && (
                                      <Badge className="bg-green-100 text-green-800 text-xs flex items-center gap-1">
                                        <CheckCircle className="h-3 w-3" />
                                        Certificado
                                      </Badge>
                                    )}
                                    {!talent.is_complete && !talent.is_premium && !talent.is_verified && (
                                      <Badge className="bg-yellow-100 text-yellow-800 text-xs" title={`Completitud: ${talent.profile_completeness ?? 0}%`}>
                                        Perfil incompleto
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{talent.city && talent.country ? `${talent.city}, ${talent.country}` : 'Ubicación no especificada'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Bio */}
                            <p className="text-gray-700 text-sm line-clamp-2 mb-4">
                              {talent.bio}
                            </p>

                            {/* Indicators */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                {talent.video_presentation_url && (
                                  <div className="flex items-center gap-1 text-blue-600">
                                    <Play className="h-3 w-3" />
                                    <span className="text-xs">Video</span>
                                  </div>
                                )}
                                {talent.portfolio_url && (
                                  <div className="flex items-center gap-1 text-purple-600">
                                    <FileText className="h-3 w-3" />
                                    <span className="text-xs">Portfolio</span>
                                  </div>
                                )}
                                {talent.github_url && (
                                  <div className="flex items-center gap-1 text-gray-600">
                                    <Github className="h-3 w-3" />
                                    <span className="text-xs">GitHub</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                className="flex-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewProfile(talent.user_id);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Perfil
                              </Button>
                              
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleContactTalent(talent);
                                }}
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Contactar
                              </Button>
                            </div>

                            {/* Last Active */}
                            <div className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                Activo {formatDistanceToNow(new Date(talent.last_active || talent.updated_at), { 
                                  addSuffix: true, 
                                  locale: es 
                                })}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contactar a {selectedTalent?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Escribe tu mensaje..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setContactDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
              >
                Enviar Mensaje
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TalentDiscovery;

