import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Activity, 
  Users, 
  Loader2
} from 'lucide-react';
import { academyService } from '@/services/academyService';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ActivityFeedProps {
  academyId: string;
}

interface ActivityItem {
  id: string;
  type: 'application' | 'new_member' | 'graduation' | 'invitation_sent' | 'profile_update';
  description: string;
  timestamp: string;
  created_at: string;
  metadata?: {
    status?: string;
    avatar_url?: string;
  };
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ academyId }) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivity();
  }, [academyId]);

  const loadActivity = async () => {
    try {
      setLoading(true);
      const activityData = await academyService.getActivity(academyId, 20);
      
      // Transform to match expected format
      const formattedActivities = activityData.map(activity => ({
        id: activity.id,
        type: activity.type,
        description: activity.description,
        timestamp: formatDistanceToNow(new Date(activity.created_at), { 
          addSuffix: true,
          locale: es 
        }),
        created_at: activity.created_at
      }));
      
      setActivities(formattedActivities);
    } catch (error) {
      console.error('Error loading activity:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const getActivityBadge = (status?: string) => {
    // El badge se basa en el status del estudiante, no en el tipo de actividad
    if (status === 'graduated') return 'Graduado';
    if (status === 'enrolled' || status === 'active') return 'Estudiante';
    return 'Estudiante'; // Por defecto
  };

  const getBadgeColor = (status?: string) => {
    if (status === 'graduated') return 'bg-blue-100 text-blue-800';
    if (status === 'enrolled' || status === 'active') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Feed de Actividad</h2>
            <p className="text-muted-foreground">
              Mantente al día con la actividad de tus estudiantes
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <p className="text-sm text-muted-foreground mt-2">
                La actividad aparecerá cuando los estudiantes se unan o se gradúen
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => {
                const avatarUrl = activity.metadata?.avatar_url;
                const status = activity.metadata?.status;
                const studentName = activity.description.replace(' se unió a la academia', '');
                
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={avatarUrl} alt={studentName} />
                      <AvatarFallback className="bg-green-100 text-green-700">
                        <Users className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.timestamp}
                      </p>
                    </div>
                    
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getBadgeColor(status)}`}
                    >
                      {getActivityBadge(status)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityFeed;
