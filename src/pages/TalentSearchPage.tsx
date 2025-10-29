import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSupabaseAuth, isBusinessRole } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Eye, MessageSquare, MapPin, Star, Briefcase, DollarSign, Grid3X3, List, Clock } from "lucide-react";
import { toast } from "sonner";
import FilterBar from "@/components/FilterBar";
import { useProfessionalData } from "@/hooks/useProfessionalData";
import LoadingSkeleton from "@/components/LoadingSkeleton";

interface TalentProfile {
  id: string;
  user_id: string;
  title: string | null;
  specialty: string | null;
  bio: string | null;
  skills: string[] | null;
  years_experience: number | null;
  availability: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  hourly_rate_min: number | null;
  hourly_rate_max: number | null;
  currency: string | null;
  primary_category_id: string | null;
  experience_level: string | null;
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  position?: string | null;
  linkedin?: string | null;
  country?: string | null;
  city?: string | null;
  profile_completeness?: number | null;
  created_at: string;
  updated_at: string;
}

interface TalentWithProfile {
  talent: TalentProfile;
  profile: UserProfile;
  categoryName?: string;
  isFeatured?: boolean;
  isPremium?: boolean;
  isCertified?: boolean;
}

const TalentSearchPage = () => {
  const navigate = useNavigate();
  const { userRole, user } = useSupabaseAuth();
  const { categories, loading: categoriesLoading } = useProfessionalData();
  const [talents, setTalents] = useState<TalentWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<string, any>>({});

  // Función para corregir el rol del usuario
  const handleFixUserRole = async () => {
    try {
      // Use direct SQL instead of RPC to avoid function ambiguity
      if (!user?.id) {
        toast.error('Usuario no autenticado');
        return;
      }
      
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role: 'freemium_business'
        });

      if (error) {
        toast.error('Error al cambiar el rol: ' + error.message);
      } else {
        toast.success('Rol actualizado correctamente. Recargando página...');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error('Error fixing user role:', error);
      toast.error('Error inesperado al cambiar el rol');
    }
  };
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    if (isBusinessRole(userRole) && !categoriesLoading) {
      fetchTalents();
    }
  }, [userRole, categoriesLoading]);

  const fetchTalents = async () => {
    try {
      setIsLoading(true);
      
      // Fetch talent profiles first
      const { data: talentData, error: talentError } = await supabase
        .from('talent_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Talent query result:', { data: talentData, error: talentError });
      console.log('Raw talent data length:', talentData?.length || 0);

      console.log('fetchTalents: Starting talent fetch...');
      console.log('fetchTalents: User role is:', userRole);
      console.log('fetchTalents: Categories loaded:', categories.length);
      const talentWithProfiles: TalentWithProfile[] = await Promise.all(
        (talentData || []).map(async (talent) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', talent.user_id)
            .single();

          // Check if user is premium
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', talent.user_id)
            .single();

          const isPremium = roleData?.role === 'premium_talent';

          // Note: Academy certification check would require user email which is not available in profiles table
          // For now, we'll set isCertified to false. To enable this, add email field to profiles table
          // or create a direct relationship between user_id and academy_students
          const isCertified = false;

          const categoryName = categories.find(cat => cat.id === talent.primary_category_id)?.name || 'Sin categoría';
          const profileCompleteness = profileData?.profile_completeness || 0;
          const isFeatured = isPremium || isCertified || profileCompleteness >= 80;
          
          return {
            talent,
            profile: profileData || {
              id: '',
              user_id: talent.user_id,
              full_name: 'Usuario',
              avatar_url: '',
              phone: '',
              country: '',
              city: '',
              profile_completeness: 0,
              created_at: talent.created_at,
              updated_at: talent.updated_at
            },
            categoryName,
            isFeatured,
            isPremium,
            isCertified
          };
        })
      );

      console.log('Talents with profiles:', talentWithProfiles);
      setTalents(talentWithProfiles);
    } catch (error) {
      console.error('Error fetching talents:', error);
      toast.error('Error al cargar el talento');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProfile = (userId: string) => {
    navigate(`/business-dashboard/talent-profile/${userId}`);
  };

  const handleContact = (talent: TalentWithProfile) => {
    // TODO: Implement contact functionality
    toast.info(`Funcionalidad de contacto próximamente para ${talent.profile.full_name}`);
  };

  const getExperienceLevel = (experienceLevel: string, years?: number) => {
    if (experienceLevel) {
      switch (experienceLevel) {
        case '0-1': return 'Junior';
        case '1-3': return 'Mid-level';
        case '3-6': return 'Senior';
        case '6+': return 'Expert';
        default: return experienceLevel;
      }
    }
    if (years !== undefined) {
      if (years < 1) return 'Junior';
      if (years < 3) return 'Mid-level';
      if (years < 6) return 'Senior';
      return 'Expert';
    }
    return 'Sin especificar';
  };

  const getExperienceBadgeClass = (experienceLevel: string, years?: number) => {
    const level = getExperienceLevel(experienceLevel, years);
    switch (level) {
      case 'Junior': return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case 'Mid-level': return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case 'Senior': return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case 'Expert': return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const filteredTalents = talents.filter(talent => {
    const searchLower = searchTerm.toLowerCase();
    
    // Enhanced search that includes categories
    const matchesSearch = !searchTerm || 
      talent.profile.full_name?.toLowerCase().includes(searchLower) ||
      talent.talent.title?.toLowerCase().includes(searchLower) ||
      talent.talent.specialty?.toLowerCase().includes(searchLower) ||
      talent.talent.bio?.toLowerCase().includes(searchLower) ||
      talent.categoryName?.toLowerCase().includes(searchLower) ||
      talent.talent.skills?.some(skill => skill.toLowerCase().includes(searchLower)) ||
      talent.profile.country?.toLowerCase().includes(searchLower) ||
      talent.profile.city?.toLowerCase().includes(searchLower);
    
    // Filter by specialty/category
    const matchesSpecialty = !filters.specialty || talent.categoryName?.toLowerCase() === filters.specialty;
    
    // Filter by experience years
    const matchesExperience = !filters.experienceYears || 
      (filters.experienceYears === "junior" && talent.talent.experience_level === '0-1') ||
      (filters.experienceYears === "semi-senior" && (talent.talent.experience_level === '1-3' || talent.talent.experience_level === '3-6')) ||
      (filters.experienceYears === "senior" && talent.talent.experience_level === '6+');
    
    // Filter by country
    const matchesCountry = !filters.country || talent.profile.country?.toLowerCase().includes(filters.country);
    
    // Filter by availability
    const matchesAvailability = !filters.availability || talent.talent.availability === filters.availability;
    
    return matchesSearch && matchesSpecialty && matchesExperience && matchesCountry && matchesAvailability;
  });

  // Sort talents with premium and certified first, then by featured status
  const sortedTalents = [...filteredTalents].sort((a, b) => {
    if (sortBy === 'featured') {
      // Priority order: Premium > Certified > High completeness > Others
      const getPriority = (t: TalentWithProfile) => {
        if (t.isPremium) return 3;
        if (t.isCertified) return 2;
        if (t.isFeatured) return 1;
        return 0;
      };
      
      const priorityA = getPriority(a);
      const priorityB = getPriority(b);
      
      if (priorityA !== priorityB) return priorityB - priorityA;
      
      // If same priority, sort by profile completeness
      return (b.profile.profile_completeness || 0) - (a.profile.profile_completeness || 0);
    }
    if (sortBy === 'experience') {
      return (b.talent.years_experience || 0) - (a.talent.years_experience || 0);
    }
    if (sortBy === 'name') {
      return (a.profile.full_name || '').localeCompare(b.profile.full_name || '');
    }
    return 0;
  });

  // Debug: Log filtered results
  useEffect(() => {
    console.log('Search term:', searchTerm);
    console.log('Filtered talents:', filteredTalents.length);
    console.log('All talents:', talents.length);
  }, [searchTerm, filteredTalents, talents]);

  if (!isBusinessRole(userRole)) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
        <p className="mb-4">Solo los usuarios de empresa pueden acceder a esta página.</p>
        <div className="bg-gray-100 p-4 rounded-lg text-left max-w-md mx-auto">
          <h3 className="font-semibold mb-2">Información de diagnóstico:</h3>
          <p><strong>Usuario ID:</strong> {user?.id || 'No disponible'}</p>
          <p><strong>Rol actual:</strong> {userRole || 'No asignado'}</p>
          <p><strong>Roles válidos para empresa:</strong> business, freemium_business, premium_business</p>
        </div>
        <div className="flex gap-4 justify-center mt-4">
          <Button 
            onClick={handleFixUserRole}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Corregir Rol de Usuario
          </Button>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
          >
            Recargar página
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || categoriesLoading) {
    return (
      <div className="p-8">
        <LoadingSkeleton type="talent" count={6} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Descubrir Talento</h1>
          <p className="text-muted-foreground mt-1">
            Encuentra y conecta con los mejores profesionales para tu equipo
          </p>
        </div>
        <Button 
          onClick={() => navigate('/business-dashboard/opportunities/new')}
          className="w-full md:w-auto"
        >
          Publicar Oportunidad
        </Button>
      </div>

      {/* Search and Compact Filters in one row */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="flex-1 w-full">
          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            type="talent"
            resultCount={sortedTalents.length}
            isLoading={isLoading}
          />
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          
          <select 
            value={sortBy} 
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value)}
            className="text-sm border rounded px-3 py-1.5 bg-background"
          >
            <option value="featured">Destacados</option>
            <option value="experience">Experiencia</option>
            <option value="name">Nombre</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {sortedTalents.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            {talents.length === 0 
              ? 'No hay talento disponible en este momento'
              : 'No se encontraron talentos con los filtros aplicados'
            }
          </div>
          {talents.length === 0 && (
            <Button onClick={() => navigate('/business-dashboard/opportunities/new')}>
              Publicar Oportunidad para Atraer Talento
            </Button>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : 
          "space-y-4"
        }>
          {sortedTalents.map((talentWithProfile) => (
            <Card 
              key={talentWithProfile.talent.id} 
              className={`hover:shadow-md transition-shadow relative ${
                talentWithProfile.isFeatured ? 'ring-2 ring-primary/20' : ''
              }`}
            >
              {(talentWithProfile.isPremium || talentWithProfile.isCertified) && (
                <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  {talentWithProfile.isPremium ? 'Premium' : 'Certificado'}
                </div>
              )}
              
              {viewMode === 'grid' ? (
                <>
                  <CardHeader>
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={talentWithProfile.profile.avatar_url || undefined} />
                        <AvatarFallback className="text-lg">
                          {talentWithProfile.profile.full_name?.charAt(0) || 'T'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{talentWithProfile.profile.full_name}</CardTitle>
                        <p className="text-muted-foreground text-sm">{talentWithProfile.talent.title}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge className={getExperienceBadgeClass(talentWithProfile.talent.experience_level || '', talentWithProfile.talent.years_experience || 0)}>
                            {getExperienceLevel(talentWithProfile.talent.experience_level || '', talentWithProfile.talent.years_experience || 0)}
                          </Badge>
                          {talentWithProfile.categoryName && (
                            <Badge variant="outline">{talentWithProfile.categoryName}</Badge>
                          )}
                        </div>
                        {(talentWithProfile.profile.country || talentWithProfile.profile.city) && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{[talentWithProfile.profile.city, talentWithProfile.profile.country].filter(Boolean).join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {talentWithProfile.talent.bio && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {talentWithProfile.talent.bio}
                      </p>
                    )}
                    
                    {talentWithProfile.talent.skills && talentWithProfile.talent.skills.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">Habilidades principales:</h4>
                        <div className="flex flex-wrap gap-1">
                          {talentWithProfile.talent.skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {talentWithProfile.talent.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{talentWithProfile.talent.skills.length - 3} más
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center space-x-1">
                        <Briefcase className="h-4 w-4" />
                        <span>{talentWithProfile.talent.years_experience || 0} años</span>
                      </div>
                      {talentWithProfile.talent.hourly_rate_min && talentWithProfile.talent.hourly_rate_max && (
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>${talentWithProfile.talent.hourly_rate_min}-${talentWithProfile.talent.hourly_rate_max}/h</span>
                        </div>
                      )}
                      {talentWithProfile.talent.availability && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span className="capitalize">{talentWithProfile.talent.availability}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewProfile(talentWithProfile.profile.user_id)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Perfil
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleContact(talentWithProfile)}
                        className="flex-1"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Contactar
                      </Button>
                    </div>
                  </CardContent>
                </>
              ) : (
                // List view
                <CardContent className="p-6">
                  <div className="flex items-center space-x-6">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={talentWithProfile.profile.avatar_url || undefined} />
                      <AvatarFallback className="text-lg">
                        {talentWithProfile.profile.full_name?.charAt(0) || 'T'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{talentWithProfile.profile.full_name}</h3>
                          <p className="text-muted-foreground">{talentWithProfile.talent.title}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={getExperienceBadgeClass(talentWithProfile.talent.experience_level || '', talentWithProfile.talent.years_experience || 0)}>
                              {getExperienceLevel(talentWithProfile.talent.experience_level || '', talentWithProfile.talent.years_experience || 0)}
                            </Badge>
                            {talentWithProfile.categoryName && (
                              <Badge variant="outline">{talentWithProfile.categoryName}</Badge>
                            )}
                            {(talentWithProfile.profile.country || talentWithProfile.profile.city) && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>{[talentWithProfile.profile.city, talentWithProfile.profile.country].filter(Boolean).join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewProfile(talentWithProfile.profile.user_id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Perfil
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleContact(talentWithProfile)}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Contactar
                          </Button>
                        </div>
                      </div>
                      
                      {talentWithProfile.talent.bio && (
                        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                          {talentWithProfile.talent.bio}
                        </p>
                      )}
                      
                      {talentWithProfile.talent.skills && talentWithProfile.talent.skills.length > 0 && (
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-1">
                            {talentWithProfile.talent.skills.slice(0, 5).map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {talentWithProfile.talent.skills.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{talentWithProfile.talent.skills.length - 5} más
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TalentSearchPage;