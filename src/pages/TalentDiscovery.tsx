import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Star, 
  MapPin, 
  Briefcase,
  Eye,
  MessageCircle,
  Play,
  FileText,
  Filter,
  Users,
  Award,
  CheckCircle,
  Clock,
  TrendingUp,
  Github
} from 'lucide-react';
import { 
  mockTalentData,
  searchTalents,
  getTalentStats,
  type MockTalent 
} from '@/components/talent/MockTalentData';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const TalentDiscovery = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [filteredTalents, setFilteredTalents] = useState<MockTalent[]>(mockTalentData);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [categoryFilter, setCategoryFilter] = useState<string>(searchParams.get('category') || 'all');
  const [countryFilter, setCountryFilter] = useState<string>(searchParams.get('country') || 'all');
  const [experienceFilter, setExperienceFilter] = useState<string>(searchParams.get('experience') || 'all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [remoteFilter, setRemoteFilter] = useState<string>('all');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const stats = getTalentStats();

  useEffect(() => {
    applyFilters();
  }, [searchTerm, categoryFilter, countryFilter, experienceFilter, availabilityFilter, remoteFilter, showFeaturedOnly, activeTab]);

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
    setIsLoading(true);
    
    setTimeout(() => {
      let filtered = [...mockTalentData];
      
      // Search filter
      if (searchTerm.trim()) {
        filtered = searchTalents(searchTerm);
      }
      
      // Tab filter
      if (activeTab === 'featured') {
        filtered = filtered.filter(talent => talent.is_featured);
      } else if (activeTab === 'verified') {
        filtered = filtered.filter(talent => talent.is_verified);
      } else if (activeTab === 'premium') {
        filtered = filtered.filter(talent => talent.is_premium);
      }
      
      // Category filter
      if (categoryFilter !== 'all') {
        filtered = filtered.filter(talent => 
          talent.category === categoryFilter || talent.secondary_category === categoryFilter
        );
      }
      
      // Country filter
      if (countryFilter !== 'all') {
        filtered = filtered.filter(talent => talent.country === countryFilter);
      }
      
      // Experience filter
      if (experienceFilter !== 'all') {
        filtered = filtered.filter(talent => talent.experience_level === experienceFilter);
      }
      
      // Availability filter
      if (availabilityFilter !== 'all') {
        filtered = filtered.filter(talent => talent.availability === availabilityFilter);
      }
      
      // Remote preference filter
      if (remoteFilter !== 'all') {
        filtered = filtered.filter(talent => talent.remote_preference === remoteFilter);
      }
      
      // Featured only filter
      if (showFeaturedOnly) {
        filtered = filtered.filter(talent => talent.is_featured);
      }
      
      // Sort by rating and featured status
      filtered.sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return b.rating - a.rating;
      });
      
      setFilteredTalents(filtered);
      setIsLoading(false);
    }, 300);
  };

  const handleContactTalent = (talent: MockTalent) => {
    toast.success(`Solicitud de contacto enviada a ${talent.full_name}`);
  };

  const handleViewProfile = (talentId: string) => {
    navigate(`/business-dashboard/talent-profile/${talentId}`);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Inmediata': return 'bg-green-100 text-green-800 border-green-200';
      case '2 semanas': return 'bg-blue-100 text-blue-800 border-blue-200';
      case '1 mes': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case '2-3 meses': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Descubrir Talento
          </h1>
          <p className="text-gray-600 mt-1">
            Encuentra y conecta con los mejores profesionales para tu equipo
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
              <div className="text-sm text-blue-600">Talentos Totales</div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-900">{stats.featured}</div>
              <div className="text-sm text-purple-600">Destacados</div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-900">{stats.verified}</div>
              <div className="text-sm text-green-600">Verificados</div>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-900">{stats.averageRating.toFixed(1)}</div>
              <div className="text-sm text-orange-600">Rating Promedio</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Buscar por nombre, título, skills o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 text-lg h-14"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Todos ({mockTalentData.length})
          </TabsTrigger>
          <TabsTrigger value="featured" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Destacados ({stats.featured})
          </TabsTrigger>
          <TabsTrigger value="verified" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Verificados ({stats.verified})
          </TabsTrigger>
          <TabsTrigger value="premium" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Premium ({stats.premium})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Categoría</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las categorías" />
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
                </div>

                {/* Country Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">País</label>
                  <Select value={countryFilter} onValueChange={setCountryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los países" />
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
                </div>

                {/* Experience Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Nivel de Experiencia</label>
                  <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los niveles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los niveles</SelectItem>
                      <SelectItem value="Principiante">Principiante</SelectItem>
                      <SelectItem value="Intermedio">Intermedio</SelectItem>
                      <SelectItem value="Avanzado">Avanzado</SelectItem>
                      <SelectItem value="Experto">Experto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Availability Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Disponibilidad</label>
                  <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Cualquier disponibilidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Cualquier disponibilidad</SelectItem>
                      <SelectItem value="Inmediata">Inmediata</SelectItem>
                      <SelectItem value="2 semanas">2 semanas</SelectItem>
                      <SelectItem value="1 mes">1 mes</SelectItem>
                      <SelectItem value="2-3 meses">2-3 meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Remote Preference Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Modalidad</label>
                  <Select value={remoteFilter} onValueChange={setRemoteFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Cualquier modalidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Cualquier modalidad</SelectItem>
                      <SelectItem value="Solo remoto">Solo remoto</SelectItem>
                      <SelectItem value="Solo presencial">Solo presencial</SelectItem>
                      <SelectItem value="Híbrido">Híbrido</SelectItem>
                      <SelectItem value="Indiferente">Indiferente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                  className="w-full"
                >
                  Limpiar Filtros
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="lg:col-span-3">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {filteredTalents.length} talentos encontrados
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {searchTerm && `Resultados para "${searchTerm}"`}
                  </p>
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
                                  <AvatarImage src={talent.profile_image} />
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
                                    {talent.is_featured && (
                                      <Badge className="bg-purple-100 text-purple-800 text-xs">
                                        Destacado
                                      </Badge>
                                    )}
                                    {talent.is_premium && (
                                      <Badge className="bg-orange-100 text-orange-800 text-xs">
                                        Premium
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{talent.location}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Briefcase className="h-3 w-3" />
                                    <span>{talent.experience_level}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Bio */}
                            <p className="text-gray-700 text-sm line-clamp-2 mb-4">
                              {talent.bio}
                            </p>

                            {/* Skills */}
                            <div className="flex flex-wrap gap-1 mb-4">
                              {talent.skills.slice(0, 4).map((skill, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {talent.skills.length > 4 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{talent.skills.length - 4} más
                                </Badge>
                              )}
                            </div>

                            {/* Indicators & Availability */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                {talent.has_video && (
                                  <div className="flex items-center gap-1 text-blue-600">
                                    <Play className="h-3 w-3" />
                                    <span className="text-xs">Video</span>
                                  </div>
                                )}
                                {talent.has_portfolio && (
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
                              
                              <Badge className={`text-xs ${getAvailabilityColor(talent.availability)}`}>
                                {talent.availability}
                              </Badge>
                            </div>

                            {/* Rating & Response Rate */}
                            <div className="flex items-center justify-between mb-4 text-sm">
                              <div className="flex items-center gap-2">
                                {renderStars(talent.rating)}
                                <span className="text-gray-600">
                                  {talent.rating} ({talent.reviews_count} reviews)
                                </span>
                              </div>
                              
                              <div className="text-gray-600">
                                {talent.response_rate}% respuesta
                              </div>
                            </div>

                            {/* Salary Expectation */}
                            {talent.salary_expectation_min && talent.salary_expectation_max && (
                              <div className="text-sm text-gray-600 mb-4">
                                <strong>Expectativa:</strong> {talent.salary_currency} ${talent.salary_expectation_min.toLocaleString()} - ${talent.salary_expectation_max.toLocaleString()}/mes
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                className="flex-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewProfile(talent.id);
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
                                Activo {formatDistanceToNow(new Date(talent.last_active), { 
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TalentDiscovery;
