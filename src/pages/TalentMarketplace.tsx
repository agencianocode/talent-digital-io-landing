import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building, Calendar } from 'lucide-react';
import { useOpportunities } from '@/contexts/OpportunitiesContext';
import { useApplications } from '@/hooks/useCustomHooks';
import ApplicationModal from '@/components/ApplicationModal';
import ApplicationStatusBadge from '@/components/ApplicationStatusBadge';
import FilterBar from '@/components/FilterBar';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';

const TalentMarketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [filteredOpportunities, setFilteredOpportunities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { opportunities, searchOpportunities, filterOpportunities } = useOpportunities();
  const { hasApplied, getApplicationStatus } = useApplications();

  // Apply filters and search in real-time
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate loading delay for better UX
    const timer = setTimeout(() => {
      let results = opportunities.filter(opp => opp.status === 'active');
      
      // Apply search
      if (searchTerm.trim()) {
        results = searchOpportunities(searchTerm).filter(opp => opp.status === 'active');
      }
      
      // Apply filters
      if (Object.keys(filters).length > 0) {
        results = filterOpportunities(filters).filter(opp => 
          opp.status === 'active' && 
          (!searchTerm.trim() || searchOpportunities(searchTerm).includes(opp))
        );
      }
      
      setFilteredOpportunities(results);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, filters, opportunities, searchOpportunities, filterOpportunities]);

  const handleApply = (opportunity: any) => {
    setSelectedOpportunity(opportunity);
    setIsApplicationModalOpen(true);
  };

  const closeApplicationModal = () => {
    setIsApplicationModalOpen(false);
    setSelectedOpportunity(null);
  };

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">
          Explorar Oportunidades
        </h1>
        
        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          type="opportunities"
          resultCount={filteredOpportunities.length}
          isLoading={isLoading}
        />
      </div>

      {/* Loading State */}
      {isLoading && <LoadingSkeleton type="opportunities" count={6} />}

      {/* Opportunities Grid */}
      {!isLoading && filteredOpportunities.length > 0 && (
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
                    <div className="flex flex-col items-end space-y-2">
                      <Badge variant="secondary">
                        {opportunity.type === 'remote' ? 'Remoto' : 
                         opportunity.type === 'hybrid' ? 'Híbrido' : 'Presencial'}
                      </Badge>
                      {opportunity.experienceLevel && (
                        <Badge variant="outline" className="text-xs">
                          {opportunity.experienceLevel === 'junior' ? 'Junior' :
                           opportunity.experienceLevel === 'semi-senior' ? 'Semi-senior' : 'Senior'}
                        </Badge>
                      )}
                    </div>
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
                        €{opportunity.salary.min}K - €{opportunity.salary.max}K {opportunity.salary.currency}
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
      )}

      {/* Empty State */}
      {!isLoading && filteredOpportunities.length === 0 && (
        <EmptyState
          type={searchTerm || Object.keys(filters).length > 0 ? 'filter' : 'opportunities'}
          onAction={clearFilters}
        />
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