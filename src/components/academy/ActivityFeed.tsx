import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Users, 
  Briefcase, 
  GraduationCap,
  Mail
} from 'lucide-react';

interface ActivityFeedProps {
  academyId: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = () => {
  // Mock data for activity feed
  const activities = [
    {
      id: '1',
      type: 'application',
      description: 'María García aplicó a Desarrollador Frontend en TechCorp',
      timestamp: 'Hace 2 horas',
      user_name: 'María García',
      opportunity_title: 'Desarrollador Frontend'
    },
    {
      id: '2',
      type: 'new_member',
      description: 'Juan Pérez se unió a la academia',
      timestamp: 'Hace 4 horas',
      user_name: 'Juan Pérez'
    },
    {
      id: '3',
      type: 'graduation',
      description: 'Ana López completó el curso de Desarrollo Web',
      timestamp: 'Hace 1 día',
      user_name: 'Ana López',
      course_name: 'Desarrollo Web'
    },
    {
      id: '4',
      type: 'invitation_sent',
      description: 'Invitación enviada a estudiante@example.com',
      timestamp: 'Hace 2 días',
      email: 'estudiante@example.com'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'application': return <Briefcase className="h-4 w-4" />;
      case 'new_member': return <Users className="h-4 w-4" />;
      case 'graduation': return <GraduationCap className="h-4 w-4" />;
      case 'invitation_sent': return <Mail className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'application': return 'text-blue-600 bg-blue-100';
      case 'new_member': return 'text-green-600 bg-green-100';
      case 'graduation': return 'text-purple-600 bg-purple-100';
      case 'invitation_sent': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'application': return 'Aplicación';
      case 'new_member': return 'Nuevo miembro';
      case 'graduation': return 'Graduación';
      case 'invitation_sent': return 'Invitación';
      default: return 'Actividad';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Feed de Actividad</h2>
          <p className="text-muted-foreground">
            Mantente al día con la actividad de tus estudiantes
          </p>
        </div>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay actividad reciente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.timestamp}
                    </p>
                  </div>
                  
                  <Badge variant="outline" className="text-xs">
                    {getActivityBadge(activity.type)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityFeed;
