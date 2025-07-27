import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Search, Filter, Eye, MessageSquare, MapPin, Star, Briefcase, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface TalentProfile {
  id: string;
  user_id: string;
  title: string;
  specialty: string;
  bio: string;
  skills: string[];
  years_experience: number;
  availability: string;
  linkedin_url: string;
  portfolio_url: string;
  hourly_rate_min: number;
  hourly_rate_max: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string;
  phone: string;
  position?: string;
  linkedin?: string;
  created_at: string;
  updated_at: string;
}

interface TalentWithProfile {
  talent: TalentProfile;
  profile: UserProfile;
}

const TalentSearchPage = () => {
  const navigate = useNavigate();
  const { userRole } = useSupabaseAuth();
  const [talents, setTalents] = useState<TalentWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");
  const [experienceFilter, setExperienceFilter] = useState<string>("all");

  useEffect(() => {
    if (userRole === 'business') {
      fetchTalents();
    }
  }, [userRole]);

  const fetchTalents = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all talent profiles with their user profiles
      const { data: talentData, error: talentError } = await supabase
        .from('talent_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (talentError) throw talentError;

      console.log('Talent profiles found:', talentData?.length || 0);

      // Fetch user profiles for all talents
      const talentWithProfiles = await Promise.all(
        (talentData || []).map(async (talent) => {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', talent.user_id)
            .single();

          return {
            talent,
            profile: profileData || {
              id: '',
              user_id: talent.user_id,
              full_name: 'Usuario',
              avatar_url: '',
              phone: '',
              position: '',
              linkedin: '',
              created_at: talent.created_at,
              updated_at: talent.updated_at
            }
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

  const getExperienceLevel = (years: number) => {
    if (years < 1) return 'Junior';
    if (years < 3) return 'Mid-level';
    if (years < 5) return 'Senior';
    return 'Expert';
  };

  const getExperienceBadgeClass = (years: number) => {
    if (years < 1) return "bg-blue-100 text-blue-800";
    if (years < 3) return "bg-yellow-100 text-yellow-800";
    if (years < 5) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  const filteredTalents = talents.filter(talent => {
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = !searchTerm || 
      talent.profile.full_name?.toLowerCase().includes(searchLower) ||
      talent.talent.title?.toLowerCase().includes(searchLower) ||
      talent.talent.specialty?.toLowerCase().includes(searchLower) ||
      talent.talent.bio?.toLowerCase().includes(searchLower) ||
      talent.talent.skills?.some(skill => skill.toLowerCase().includes(searchLower)) ||
      // Búsqueda más flexible para "No Code"
      (searchLower.includes('no code') && (
        talent.talent.title?.toLowerCase().includes('no code') ||
        talent.talent.specialty?.toLowerCase().includes('no code') ||
        talent.talent.bio?.toLowerCase().includes('no code') ||
        talent.talent.skills?.some(skill => 
          skill.toLowerCase().includes('bubble') ||
          skill.toLowerCase().includes('webflow') ||
          skill.toLowerCase().includes('zapier') ||
          skill.toLowerCase().includes('airtable') ||
          skill.toLowerCase().includes('notion') ||
          skill.toLowerCase().includes('make.com') ||
          skill.toLowerCase().includes('softr') ||
          skill.toLowerCase().includes('glide')
        )
      ));
    
    const matchesSpecialty = !specialtyFilter || specialtyFilter === "all" || talent.talent.specialty === specialtyFilter;
    
    const matchesExperience = !experienceFilter || experienceFilter === "all" || 
      (experienceFilter === "junior" && talent.talent.years_experience < 1) ||
      (experienceFilter === "mid" && talent.talent.years_experience >= 1 && talent.talent.years_experience < 3) ||
      (experienceFilter === "senior" && talent.talent.years_experience >= 3 && talent.talent.years_experience < 5) ||
      (experienceFilter === "expert" && talent.talent.years_experience >= 5);
    
    return matchesSearch && matchesSpecialty && matchesExperience;
  });

  const specialties = Array.from(new Set(talents.map(t => t.talent.specialty).filter(Boolean)));

  // Debug: Log filtered results
  useEffect(() => {
    console.log('Search term:', searchTerm);
    console.log('Filtered talents:', filteredTalents.length);
    console.log('All talents:', talents.length);
  }, [searchTerm, filteredTalents, talents]);

  if (userRole !== 'business') {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
        <p>Solo los usuarios de empresa pueden acceder a esta página.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Buscar Talento
          </h1>
          <p className="text-muted-foreground mt-2">
            Encuentra el mejor talento digital para tu empresa
          </p>
        </div>
        <Button 
          onClick={() => navigate('/business-dashboard/opportunities/new')}
          variant="outline"
        >
          Publicar Oportunidad
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar por nombre, especialidad, habilidades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Especialidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las especialidades</SelectItem>
            {specialties.map(specialty => (
              <SelectItem key={specialty} value={specialty}>
                {specialty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={experienceFilter} onValueChange={setExperienceFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Experiencia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los niveles</SelectItem>
            <SelectItem value="junior">Junior (0-1 años)</SelectItem>
            <SelectItem value="mid">Mid-level (1-3 años)</SelectItem>
            <SelectItem value="senior">Senior (3-5 años)</SelectItem>
            <SelectItem value="expert">Expert (5+ años)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      {filteredTalents.length === 0 ? (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTalents.map((talentWithProfile) => (
            <Card key={talentWithProfile.talent.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={talentWithProfile.profile.avatar_url} />
                    <AvatarFallback className="text-lg">
                      {talentWithProfile.profile.full_name?.charAt(0) || 'T'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{talentWithProfile.profile.full_name}</CardTitle>
                    <p className="text-muted-foreground text-sm">{talentWithProfile.talent.title}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={getExperienceBadgeClass(talentWithProfile.talent.years_experience)}>
                        {getExperienceLevel(talentWithProfile.talent.years_experience)}
                      </Badge>
                      {talentWithProfile.talent.specialty && (
                        <Badge variant="outline">{talentWithProfile.talent.specialty}</Badge>
                      )}
                    </div>
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
                    <span>{talentWithProfile.talent.years_experience} años</span>
                  </div>
                  {talentWithProfile.talent.hourly_rate_min && talentWithProfile.talent.hourly_rate_max && (
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4" />
                      <span>${talentWithProfile.talent.hourly_rate_min}-${talentWithProfile.talent.hourly_rate_max}/h</span>
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
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TalentSearchPage;