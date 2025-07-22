import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApplications } from '@/hooks/useCustomHooks';
import { useOpportunities } from '@/contexts/OpportunitiesContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Building, MapPin, Calendar, Bookmark } from 'lucide-react';
import ApplicationStatusBadge from '@/components/ApplicationStatusBadge';

const TalentOpportunities = () => {
  const navigate = useNavigate();
  const { getMyApplications } = useApplications();
  const { opportunities, savedOpportunities } = useOpportunities();
  
  const myApplications = getMyApplications();
  const mySavedOpportunities = opportunities.filter(opp => 
    savedOpportunities.includes(opp.id)
  );

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">
        Mis Oportunidades
      </h1>
      
      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="applications">
            Mis Aplicaciones ({myApplications.length})
          </TabsTrigger>
          <TabsTrigger value="saved">
            Guardadas ({mySavedOpportunities.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="applications" className="space-y-4">
          {myApplications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Aún no has aplicado a ninguna oportunidad
                </p>
                <Button onClick={() => navigate('/talent/marketplace')}>
                  Explorar Oportunidades
                </Button>
              </CardContent>
            </Card>
          ) : (
            myApplications.map((application) => {
              const opportunity = opportunities.find(opp => opp.id === application.opportunityId);
              if (!opportunity) return null;

              return (
                <Card key={application.id}>
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
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Aplicado el {format(new Date(application.appliedAt), 'dd MMM yyyy', { locale: es })}
                          </div>
                        </div>
                      </div>
                      <ApplicationStatusBadge status={application.status} />
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="bg-secondary p-3 rounded-lg mb-4">
                      <p className="text-sm font-medium mb-1">Tu mensaje de aplicación:</p>
                      <p className="text-sm text-foreground">{application.message}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {opportunity.tags.slice(0, 4).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/opportunities/${opportunity.id}`)}
                      >
                        Ver Oportunidad
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
        
        <TabsContent value="saved" className="space-y-4">
          {mySavedOpportunities.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  No tienes oportunidades guardadas
                </p>
                <Button onClick={() => navigate('/talent/marketplace')}>
                  Explorar Oportunidades
                </Button>
              </CardContent>
            </Card>
          ) : (
            mySavedOpportunities.map((opportunity) => (
              <Card key={opportunity.id}>
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
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {opportunity.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {opportunity.tags.slice(0, 4).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      {opportunity.applicantsCount} postulante{opportunity.applicantsCount !== 1 ? 's' : ''}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/opportunities/${opportunity.id}`)}
                    >
                      Ver Detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TalentOpportunities;