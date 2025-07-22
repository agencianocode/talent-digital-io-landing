import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Mail, Star, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FilterBar from '@/components/FilterBar';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';

// Mock talent profiles
const mockTalentProfiles = [
  {
    id: 'talent_1',
    name: 'Ana García López',
    title: 'Especialista en Ventas B2B',
    email: 'ana.garcia@email.com',
    location: 'Madrid, España',
    country: 'es',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana',
    specialty: 'ventas',
    experienceYears: 'senior',
    availability: 'immediate',
    rating: 4.8,
    skills: ['Ventas B2B', 'CRM', 'Negociación', 'HubSpot'],
    bio: 'Especialista en ventas B2B con más de 5 años de experiencia.',
    completedProjects: 15,
    successRate: 92
  },
  {
    id: 'talent_2',
    name: 'Carlos Mendoza',
    title: 'Media Buyer Senior',
    email: 'carlos.mendoza@email.com',
    location: 'Barcelona, España',
    country: 'es',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos',
    specialty: 'marketing',
    experienceYears: 'senior',
    availability: '1-week',
    rating: 4.9,
    skills: ['Meta Ads', 'Google Ads', 'PPC', 'Analytics'],
    bio: 'Media buyer con experiencia en campañas de alto presupuesto.',
    completedProjects: 28,
    successRate: 95
  }
];

const TalentSearchPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [filteredTalent, setFilteredTalent] = useState(mockTalentProfiles);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      let results = mockTalentProfiles;
      
      if (searchTerm.trim()) {
        const lowerQuery = searchTerm.toLowerCase();
        results = results.filter(talent =>
          talent.name.toLowerCase().includes(lowerQuery) ||
          talent.skills.some(skill => skill.toLowerCase().includes(lowerQuery))
        );
      }
      
      if (Object.keys(filters).length > 0) {
        results = results.filter(talent => {
          if (filters.specialty && talent.specialty !== filters.specialty) return false;
          if (filters.experienceYears && talent.experienceYears !== filters.experienceYears) return false;
          if (filters.country && talent.country !== filters.country) return false;
          return true;
        });
      }
      
      setFilteredTalent(results);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, filters]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">Buscar Talento</h1>
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          type="talent"
          resultCount={filteredTalent.length}
          isLoading={isLoading}
        />
      </div>

      {isLoading && <LoadingSkeleton type="talent" count={6} />}

      {!isLoading && filteredTalent.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTalent.map((talent) => (
            <Card key={talent.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={talent.photo} />
                    <AvatarFallback>{talent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{talent.name}</CardTitle>
                    <p className="text-muted-foreground text-sm">{talent.title}</p>
                    <div className="flex items-center space-x-3 text-xs text-muted-foreground mt-2">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {talent.location}
                      </div>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 mr-1" />
                        {talent.rating}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{talent.bio}</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {talent.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">{skill}</Badge>
                  ))}
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">{talent.successRate}% éxito</span>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/talent-profile/${talent.id}`)}>
                      Ver Perfil
                    </Button>
                    <Button size="sm">
                      <Mail className="h-3 w-3 mr-1" />
                      Contactar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredTalent.length === 0 && (
        <EmptyState type="filter" onAction={() => { setFilters({}); setSearchTerm(''); }} />
      )}
    </div>
  );
};

export default TalentSearchPage;