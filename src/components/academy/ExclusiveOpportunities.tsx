import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Briefcase, 
  Plus, 
  MapPin, 
  DollarSign,
  Clock,
  Users
} from 'lucide-react';

interface ExclusiveOpportunitiesProps {
  academyId: string;
}

export const ExclusiveOpportunities: React.FC<ExclusiveOpportunitiesProps> = () => {
  // Mock data for exclusive opportunities
  const opportunities = [
    {
      id: '1',
      title: 'Desarrollador Frontend Senior',
      company: 'TechCorp',
      location: 'Madrid, España',
      salary: '$3,000 - $4,500',
      type: 'Tiempo Completo',
      description: 'Buscamos un desarrollador frontend con experiencia en React y TypeScript...',
      applications_count: 5,
      created_at: '2024-01-20T10:00:00Z'
    },
    {
      id: '2',
      title: 'Diseñador UX/UI',
      company: 'DesignStudio',
      location: 'Barcelona, España',
      salary: '$2,500 - $3,500',
      type: 'Medio Tiempo',
      description: 'Oportunidad para diseñador UX/UI con experiencia en Figma y diseño de productos...',
      applications_count: 3,
      created_at: '2024-01-19T14:00:00Z'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Oportunidades Exclusivas</h2>
          <p className="text-muted-foreground">
            Oportunidades de trabajo exclusivas para estudiantes de tu academia
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Oportunidad
        </Button>
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        {opportunities.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay oportunidades exclusivas</h3>
              <p className="text-muted-foreground text-center mb-4">
                Crea oportunidades exclusivas para tus estudiantes
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Oportunidad
              </Button>
            </CardContent>
          </Card>
        ) : (
          opportunities.map((opportunity) => (
            <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {opportunity.title}
                      </h3>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Exclusiva
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">
                      {opportunity.company}
                    </p>
                    
                    <p className="text-sm text-gray-700 mb-4">
                      {opportunity.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{opportunity.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{opportunity.salary}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{opportunity.type}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{opportunity.applications_count} aplicaciones</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-2">
                      Publicada: {new Date(opportunity.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm">
                      Ver Aplicaciones
                    </Button>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ExclusiveOpportunities;
