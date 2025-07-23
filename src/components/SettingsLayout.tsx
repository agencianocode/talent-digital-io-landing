
import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Building2, User, Users, Shield, Bell, CreditCard, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

const SettingsLayout = () => {
  const location = useLocation();
  const { user } = useSupabaseAuth();

  const companySettings = [
    { href: '/settings/company', icon: Building2, label: 'Información de la Empresa' },
    { href: '/settings/users', icon: Users, label: 'Gestión de Usuarios' },
    { href: '/settings/notifications', icon: Bell, label: 'Notificaciones' },
    { href: '/settings/billing', icon: CreditCard, label: 'Facturación' },
  ];

  const personalSettings = [
    { href: '/settings/profile', icon: User, label: 'Perfil Personal' },
    { href: '/settings/privacy', icon: Shield, label: 'Privacidad' },
  ];

  const talentSettings = [
    { href: '/settings/talent-profile', icon: Briefcase, label: 'Perfil Profesional' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
          <p className="text-muted-foreground">Gestiona tu cuenta y preferencias</p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 space-y-6">
            {user && (
              <div>
                <h3 className="font-semibold text-foreground mb-3">Empresa</h3>
                <nav className="space-y-1">
                  {companySettings.map((item) => (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        )
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-foreground mb-3">Personal</h3>
              <nav className="space-y-1">
                {personalSettings.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      )
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>

            {user && (
              <div>
                <h3 className="font-semibold text-foreground mb-3">Talento</h3>
                <nav className="space-y-1">
                  {talentSettings.map((item) => (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        )
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
