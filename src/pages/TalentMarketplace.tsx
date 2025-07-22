import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, MapPin, Building, Calendar } from 'lucide-react';
import { useOpportunities } from '@/contexts/OpportunitiesContext';
import { useApplications } from '@/hooks/useCustomHooks';
import ApplicationModal from '@/components/ApplicationModal';
import ApplicationStatusBadge from '@/components/ApplicationStatusBadge';

const TalentMarketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  
  const { opportunities } = useOpportunities();
  const { hasApplied, getApplicationStatus } = useApplications();

  // Filter active opportunities and apply search
  const filteredOpportunities = opportunities
    .filter(opp => opp.status === 'active')
    .filter(opp => 
      searchTerm === '' || 
      opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const handleApply = (opportunity: any) => {
    setSelectedOpportunity(opportunity);
    setIsApplicationModalOpen(true);
  };

  const closeApplicationModal = () => {
    setIsApplicationModalOpen(false);
    setSelectedOpportunity(null);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Explorar Oportunidades
        </h1>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar oportunidades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredOpportunities.map((opportunity) => {
          const applied = hasApplied(opportunity.id);
          const applicationStatus = getApplicationStatus(opportunity.id);

          return (
            <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{opportunity.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-1" />
                        {opportunity.company}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {opportunity.location}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {opportunity.type === 'remote' ? 'Remoto' : 
                     opportunity.type === 'hybrid' ? 'Híbrido' : 'Presencial'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {opportunity.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {opportunity.tags.slice(0, 4).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {opportunity.tags.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{opportunity.tags.length - 4}
                    </Badge>
                  )}
                </div>

                {opportunity.salary && (
                  <div className="mb-4 text-sm">
                    <span className="font-medium text-primary">
                      {opportunity.salary.min.toLocaleString()} - {opportunity.salary.max.toLocaleString()} {opportunity.salary.currency}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {opportunity.applicantsCount} postulante{opportunity.applicantsCount !== 1 ? 's' : ''}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {applied ? (
                      <ApplicationStatusBadge status={applicationStatus || 'pending'} />
                    ) : (
                      <Button 
                        onClick={() => handleApply(opportunity)}
                        size="sm"
                      >
                        Aplicar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredOpportunities.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm ? 'No se encontraron oportunidades que coincidan con tu búsqueda' : 'No hay oportunidades disponibles en este momento'}
          </p>
        </div>
      )}

      {/* Application Modal */}
      {selectedOpportunity && (
        <ApplicationModal
          isOpen={isApplicationModalOpen}
          onClose={closeApplicationModal}
          opportunity={selectedOpportunity}
        />
      )}
    </div>
  );
};

export default TalentMarketplace;