import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Share2, 
  ExternalLink, 
  GraduationCap,
  MapPin,
  Calendar
} from 'lucide-react';

interface PublicDirectoryProps {
  academyId: string;
}

export const PublicDirectory: React.FC<PublicDirectoryProps> = ({ academyId }) => {
  // Mock data for public directory
  const graduates = [
    {
      id: '1',
      full_name: 'María García',
      avatar_url: null,
      graduation_date: '2024-01-15T10:00:00Z',
      certificate_url: 'https://example.com/certificate1.pdf',
      skills: ['React', 'TypeScript', 'Node.js'],
      location: 'Madrid, España'
    },
    {
      id: '2',
      full_name: 'Juan Pérez',
      avatar_url: null,
      graduation_date: '2024-01-10T10:00:00Z',
      certificate_url: 'https://example.com/certificate2.pdf',
      skills: ['Python', 'Django', 'PostgreSQL'],
      location: 'Barcelona, España'
    },
    {
      id: '3',
      full_name: 'Ana López',
      avatar_url: null,
      graduation_date: '2023-12-20T10:00:00Z',
      certificate_url: 'https://example.com/certificate3.pdf',
      skills: ['Vue.js', 'JavaScript', 'CSS'],
      location: 'Valencia, España'
    }
  ];

  const publicUrl = `https://talent-digital.io/academy/${academyId}/directory`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    // TODO: Show toast notification
  };

  const handleViewPublic = () => {
    window.open(publicUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Directorio Público</h2>
          <p className="text-muted-foreground">
            Comparte el directorio de graduados de tu academia
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCopyLink}>
            <Share2 className="h-4 w-4 mr-2" />
            Copiar Link
          </Button>
          <Button variant="outline" onClick={handleViewPublic}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver Público
          </Button>
        </div>
      </div>

      {/* Public URL Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Link del Directorio Público
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <code className="flex-1 text-sm">{publicUrl}</code>
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              Copiar
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Comparte este link para mostrar el directorio de graduados de tu academia
          </p>
        </CardContent>
      </Card>

      {/* Graduates List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Graduados ({graduates.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {graduates.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay graduados en el directorio público</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {graduates.map((graduate) => (
                <Card key={graduate.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={graduate.avatar_url || undefined} />
                        <AvatarFallback>
                          {graduate.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {graduate.full_name}
                        </h3>
                        {graduate.location && (
                          <p className="text-sm text-gray-600 flex items-center justify-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {graduate.location}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-3 h-3" />
                        <span>
                          Graduado: {new Date(graduate.graduation_date).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {graduate.skills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      
                      {graduate.certificate_url && (
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Ver Certificado
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicDirectory;
