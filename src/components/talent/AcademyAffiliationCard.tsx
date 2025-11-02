import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GraduationCap, CheckCircle, Calendar } from 'lucide-react';
import { useStudentAcademy } from '@/hooks/useStudentAcademy';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const AcademyAffiliationCard = () => {
  const { academy, isLoading } = useStudentAcademy();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Cargando...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!academy) {
    return null; // Don't show card if user is not part of any academy
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'enrolled':
        return <Badge className="bg-blue-100 text-blue-800">Estudiante Activo</Badge>;
      case 'graduated':
        return <Badge className="bg-green-100 text-green-800">Graduado</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800">Pausado</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspendido</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          Mi Academia
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={academy.academyLogoUrl || undefined} />
            <AvatarFallback className="bg-primary/10">
              <GraduationCap className="h-8 w-8 text-primary" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                {academy.academyName}
                <CheckCircle className="h-4 w-4 text-green-600" />
              </h3>
              <div className="mt-1">
                {getStatusBadge(academy.status)}
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>
                  Desde {academy.enrollmentDate ? format(new Date(academy.enrollmentDate), "MMM yyyy", { locale: es }) : 'fecha no disponible'}
                </span>
              </div>
              
              {academy.status === 'graduated' && academy.graduationDate && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>
                    Graduado en {format(new Date(academy.graduationDate), "MMM yyyy", { locale: es })}
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              {academy.status === 'graduated' 
                ? 'Tu perfil está verificado como graduado de esta academia'
                : 'Tu perfil está verificado por esta academia'
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

