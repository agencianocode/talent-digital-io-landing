import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProfileCompleteness } from '@/hooks/useProfileCompleteness';
import { Lightbulb, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProfileCompletenessCard: React.FC = () => {
  const { 
    completeness, 
    breakdown, 
    loading, 
    refreshCompleteness, 
    getCompletenessColor, 
    getCompletenessLabel 
  } = useProfileCompleteness();
  
  const navigate = useNavigate();

  const handleImproveProfile = () => {
    navigate('/settings/profile');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Calculando completitud...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Completitud del Perfil</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshCompleteness}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Progreso General</span>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-bold ${getCompletenessColor(completeness)}`}>
                {completeness}%
              </span>
              <Badge variant={completeness >= 80 ? 'default' : 'secondary'}>
                {getCompletenessLabel(completeness)}
              </Badge>
            </div>
          </div>
          <Progress value={completeness} className="h-2" />
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Desglose por Sección</h4>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs">Información Básica</span>
              <span className="text-xs font-medium">{breakdown.basic_info}%</span>
            </div>
            <Progress value={breakdown.basic_info} className="h-1" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs">Información Profesional</span>
              <span className="text-xs font-medium">{breakdown.professional_info}%</span>
            </div>
            <Progress value={breakdown.professional_info} className="h-1" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs">Habilidades y Bio</span>
              <span className="text-xs font-medium">{breakdown.skills_and_bio}%</span>
            </div>
            <Progress value={breakdown.skills_and_bio} className="h-1" />
          </div>
        </div>

        {/* Missing Fields */}
        {breakdown.missing_fields.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center">
              <AlertCircle className="h-4 w-4 mr-1 text-orange-500" />
              Campos Pendientes
            </h4>
            <div className="flex flex-wrap gap-1">
              {breakdown.missing_fields.slice(0, 3).map((field, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {field}
                </Badge>
              ))}
              {breakdown.missing_fields.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{breakdown.missing_fields.length - 3} más
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {breakdown.suggestions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center">
              <Lightbulb className="h-4 w-4 mr-1 text-yellow-500" />
              Sugerencias
            </h4>
            <div className="space-y-1">
              {breakdown.suggestions.slice(0, 2).map((suggestion, index) => (
                <p key={index} className="text-xs text-muted-foreground">
                  • {suggestion}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        {completeness < 100 && (
          <Button 
            onClick={handleImproveProfile}
            className="w-full"
            variant={completeness < 50 ? 'default' : 'outline'}
          >
            {completeness < 50 ? 'Completar Perfil' : 'Mejorar Perfil'}
          </Button>
        )}

        {completeness >= 100 && (
          <div className="flex items-center justify-center text-green-600 text-sm font-medium">
            <CheckCircle className="h-4 w-4 mr-2" />
            ¡Perfil Completo!
          </div>
        )}
      </CardContent>
    </Card>
  );
};