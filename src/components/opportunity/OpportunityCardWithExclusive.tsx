import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExclusiveOpportunityBadge } from './ExclusiveOpportunityBadge';
import { MapPin, Briefcase, DollarSign, Clock, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { stripHtml } from '@/lib/utils';

interface OpportunityCardWithExclusiveProps {
  opportunity: {
    id: string;
    title: string;
    description: string;
    location?: string;
    type: string;
    category: string;
    salary_min?: number;
    salary_max?: number;
    currency?: string;
    created_at: string;
    is_academy_exclusive?: boolean;
    company?: {
      name: string;
      logo_url?: string;
    };
  };
  showExclusiveBadge?: boolean;
}

export const OpportunityCardWithExclusive = ({ 
  opportunity, 
  showExclusiveBadge = true 
}: OpportunityCardWithExclusiveProps) => {
  const navigate = useNavigate();

  const formatSalary = () => {
    if (!opportunity.salary_min && !opportunity.salary_max) return null;
    const currency = opportunity.currency || 'USD';
    if (opportunity.salary_min && opportunity.salary_max) {
      return `${currency} ${opportunity.salary_min.toLocaleString()} - ${opportunity.salary_max.toLocaleString()}`;
    }
    if (opportunity.salary_min) {
      return `${currency} ${opportunity.salary_min.toLocaleString()}`;
    }
    return `${currency} ${opportunity.salary_max?.toLocaleString()}`;
  };

  const isExclusive = opportunity.is_academy_exclusive && showExclusiveBadge;

  return (
    <Card 
      className={`hover:shadow-lg transition-all cursor-pointer ${
        isExclusive ? 'border-2 border-purple-200 bg-gradient-to-br from-purple-50/30 to-blue-50/30' : ''
      }`}
      onClick={() => navigate(`/talent-dashboard/opportunities/${opportunity.id}`)}
    >
      {isExclusive && (
        <div className="absolute -top-3 left-4 z-10">
          <ExclusiveOpportunityBadge size="sm" />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2 flex items-center gap-2">
              {opportunity.title}
              {isExclusive && (
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                  🎓 Exclusiva
                </Badge>
              )}
            </CardTitle>
            {opportunity.company && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Building className="h-4 w-4" />
                {opportunity.company.name}
              </div>
            )}
            <CardDescription className="line-clamp-2">
              {stripHtml(opportunity.description)}
            </CardDescription>
          </div>
          {opportunity.company?.logo_url && (
            <img 
              src={opportunity.company.logo_url} 
              alt={opportunity.company.name}
              className="h-12 w-12 object-contain rounded"
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Briefcase className="h-3 w-3" />
            {opportunity.type}
          </Badge>
          <Badge variant="outline">{opportunity.category}</Badge>
          {opportunity.location && (
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {opportunity.location}
            </Badge>
          )}
          {formatSalary() && (
            <Badge variant="outline" className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {formatSalary()}
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Publicado hace {Math.floor((Date.now() - new Date(opportunity.created_at).getTime()) / (1000 * 60 * 60 * 24))} días
          </span>
          <Button size="sm" variant={isExclusive ? "default" : "outline"}>
            Ver Detalles
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
