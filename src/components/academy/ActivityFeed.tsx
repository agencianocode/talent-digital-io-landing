import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Users, 
  Briefcase, 
  GraduationCap,
  Mail,
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
  type: 'application' | 'new_member' | 'graduation' | 'invitation_sent';
  description: string;
  timestamp: string;
  created_at: string;
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
