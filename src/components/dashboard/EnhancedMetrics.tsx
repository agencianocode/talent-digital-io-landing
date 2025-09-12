import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, TrendingUp, DollarSign, Award, Briefcase } from 'lucide-react';

interface EnhancedMetricsProps {
  contractTypeMetrics: Record<string, { opportunities: number; applications: number }>;
  skillsDemand: Array<{ skill: string; applications: number }>;
  experienceLevelDemand: Array<{ level: string; applications: number }>;
  salaryRanges: Array<{ min: number; max: number; currency: string; applications: number }>;
  averageSalary: number;
}

const EnhancedMetrics: React.FC<EnhancedMetricsProps> = ({
  contractTypeMetrics,
  skillsDemand,
  experienceLevelDemand,
  salaryRanges,
  averageSalary
}) => {
  const getContractTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'full-time': 'Tiempo Completo',
      'part-time': 'Medio Tiempo',
      'contract': 'Por Contrato',
      'freelance': 'Freelance',
      'internship': 'Prácticas',
      'other': 'Otro'
    };
    return labels[type] || type;
  };

  const getExperienceLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      '0-1': 'Junior (0-1 años)',
      '1-3': 'Intermedio (1-3 años)',
      '3-6': 'Senior (3-6 años)',
      '6+': 'Expert (6+ años)'
    };
    return labels[level] || level;
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getTopSkills = () => skillsDemand.slice(0, 5);
  const getTopContractTypes = () => 
    Object.entries(contractTypeMetrics)
      .sort(([,a], [,b]) => b.applications - a.applications)
      .slice(0, 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Contract Type Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Briefcase className="h-4 w-4" />
            Análisis por Tipo de Contrato
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getTopContractTypes().map(([type, metrics]) => (
              <div key={type} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{getContractTypeLabel(type)}</span>
                  <Badge variant="secondary" className="text-xs">
                    {metrics.applications} aplicaciones
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((metrics.applications / Math.max(...Object.values(contractTypeMetrics).map(m => m.applications))) * 100, 100)}%` 
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{metrics.opportunities} oportunidades</span>
                  <span>
                    {metrics.opportunities > 0 
                      ? (metrics.applications / metrics.opportunities).toFixed(1) 
                      : 0} aplic./oport.
                  </span>
                </div>
              </div>
            ))}
            
            {Object.keys(contractTypeMetrics).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay datos de tipos de contrato disponibles
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Skills Demand */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="h-4 w-4" />
            Skills Más Demandados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getTopSkills().map((skill, index) => (
              <div key={skill.skill} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded-full">
                    <span className="text-xs font-medium text-primary">
                      {index + 1}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{skill.skill}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {skill.applications}
                  </Badge>
                  <div className="w-12 bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-green-500 h-1 rounded-full"
                      style={{ 
                        width: `${(skill.applications / (skillsDemand[0]?.applications || 1)) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {skillsDemand.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay datos de demanda de skills disponibles
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Experience Level Demand */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" />
            Demanda por Experiencia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {experienceLevelDemand.map((exp, index) => (
              <div key={exp.level} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    {getExperienceLevelLabel(exp.level)}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {exp.applications}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((exp.applications / Math.max(...experienceLevelDemand.map(e => e.applications))) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>
            ))}
            
            {experienceLevelDemand.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay datos de experiencia disponibles
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Salary Analytics */}
      {salaryRanges.length > 0 && (
        <Card className="lg:col-span-2 xl:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-4 w-4" />
              Análisis Salarial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Salario Promedio</h4>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(averageSalary, salaryRanges[0]?.currency)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Basado en {salaryRanges.length} oportunidades
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Rango Más Común</h4>
                {(() => {
                  const mostCommonRange = salaryRanges.reduce((prev, current) => 
                    prev.applications > current.applications ? prev : current
                  );
                  return (
                    <div className="text-sm">
                      <div className="font-semibold">
                        {formatCurrency(mostCommonRange.min, mostCommonRange.currency)} - {formatCurrency(mostCommonRange.max, mostCommonRange.currency)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {mostCommonRange.applications} aplicaciones
                      </p>
                    </div>
                  );
                })()}
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Distribución</h4>
                <div className="space-y-1">
                  {salaryRanges.slice(0, 3).map((range, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span>
                        {formatCurrency(range.min, range.currency)}-{formatCurrency(range.max, range.currency)}
                      </span>
                      <span className="font-medium">{range.applications}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedMetrics;