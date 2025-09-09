import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, MessageSquare, Users, Briefcase, Settings } from 'lucide-react';

interface NotificationCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  subcategories?: NotificationSubcategory[];
}

interface NotificationSubcategory {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

const NotificationSettingsForm = () => {
  const [categories, setCategories] = useState<NotificationCategory[]>([
    {
      id: 'applications',
      title: 'Aplicaciones',
      description: 'Notificaciones sobre nuevas aplicaciones y cambios de estado',
      icon: <Briefcase className="h-4 w-4" />,
      enabled: true,
      subcategories: [
        {
          id: 'new_applications',
          title: 'Nuevas aplicaciones',
          description: 'Cuando alguien aplica a tus oportunidades',
          enabled: true
        },
        {
          id: 'application_status',
          title: 'Cambios de estado',
          description: 'Cuando cambia el estado de una aplicación',
          enabled: true
        }
      ]
    },
    {
      id: 'opportunities',
      title: 'Oportunidades',
      description: 'Notificaciones sobre oportunidades y marketplace',
      icon: <Briefcase className="h-4 w-4" />,
      enabled: true,
      subcategories: [
        {
          id: 'new_opportunities',
          title: 'Nuevas oportunidades',
          description: 'Oportunidades que coincidan con tu perfil',
          enabled: false
        },
        {
          id: 'opportunity_updates',
          title: 'Actualizaciones',
          description: 'Cambios en oportunidades que sigues',
          enabled: true
        }
      ]
    },
    {
      id: 'team',
      title: 'Equipo',
      description: 'Notificaciones sobre gestión de equipo',
      icon: <Users className="h-4 w-4" />,
      enabled: true,
      subcategories: [
        {
          id: 'team_invitations',
          title: 'Invitaciones',
          description: 'Invitaciones para unirse al equipo',
          enabled: true
        },
        {
          id: 'team_updates',
          title: 'Actualizaciones del equipo',
          description: 'Cambios en miembros del equipo',
          enabled: true
        }
      ]
    },
    {
      id: 'messages',
      title: 'Mensajes',
      description: 'Notificaciones de mensajería y comunicación',
      icon: <MessageSquare className="h-4 w-4" />,
      enabled: true,
      subcategories: [
        {
          id: 'direct_messages',
          title: 'Mensajes directos',
          description: 'Mensajes privados de otros usuarios',
          enabled: true
        },
        {
          id: 'mentions',
          title: 'Menciones',
          description: 'Cuando te mencionan en conversaciones',
          enabled: true
        }
      ]
    },
    {
      id: 'system',
      title: 'Sistema',
      description: 'Notificaciones del sistema y actualizaciones',
      icon: <Settings className="h-4 w-4" />,
      enabled: false,
      subcategories: [
        {
          id: 'system_updates',
          title: 'Actualizaciones del sistema',
          description: 'Nuevas funcionalidades y mantenimiento',
          enabled: false
        },
        {
          id: 'security_alerts',
          title: 'Alertas de seguridad',
          description: 'Alertas importantes de seguridad',
          enabled: true
        }
      ]
    }
  ]);

  const toggleCategory = (categoryId: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { 
            ...cat, 
            enabled: !cat.enabled,
            subcategories: cat.subcategories?.map(sub => ({ ...sub, enabled: !cat.enabled }))
          }
        : cat
    ));
  };

  const toggleSubcategory = (categoryId: string, subcategoryId: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? {
            ...cat,
            subcategories: cat.subcategories?.map(sub =>
              sub.id === subcategoryId ? { ...sub, enabled: !sub.enabled } : sub
            )
          }
        : cat
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Configuración de Notificaciones
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Personaliza qué notificaciones quieres recibir por email y en la aplicación
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {categories.map((category, index) => (
          <div key={category.id}>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-start gap-3">
                <div className="text-muted-foreground mt-1">
                  {category.icon}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{category.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </div>
              </div>
              <Switch
                checked={category.enabled}
                onCheckedChange={() => toggleCategory(category.id)}
              />
            </div>

            {/* Subcategories */}
            {category.subcategories && category.enabled && (
              <div className="ml-7 space-y-3 mt-3">
                {category.subcategories.map((subcategory) => (
                  <div key={subcategory.id} className="flex items-center justify-between py-2">
                    <div className="space-y-1">
                      <Label htmlFor={subcategory.id} className="text-sm font-medium cursor-pointer">
                        {subcategory.title}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {subcategory.description}
                      </p>
                    </div>
                    <Switch
                      id={subcategory.id}
                      checked={subcategory.enabled}
                      onCheckedChange={() => toggleSubcategory(category.id, subcategory.id)}
                    />
                  </div>
                ))}
              </div>
            )}

            {index < categories.length - 1 && <Separator className="mt-6" />}
          </div>
        ))}

        <Separator />

        {/* Email preferences */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Preferencias de Email
          </h4>
          <div className="space-y-3 ml-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-digest" className="text-sm font-medium cursor-pointer">
                  Resumen diario
                </Label>
                <p className="text-xs text-muted-foreground">
                  Recibe un resumen diario de todas las actividades
                </p>
              </div>
              <Switch id="email-digest" defaultChecked={false} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-immediate" className="text-sm font-medium cursor-pointer">
                  Notificaciones inmediatas
                </Label>
                <p className="text-xs text-muted-foreground">
                  Recibe emails inmediatamente cuando ocurran eventos importantes
                </p>
              </div>
              <Switch id="email-immediate" defaultChecked={true} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettingsForm;