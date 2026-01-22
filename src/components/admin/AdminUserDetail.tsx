import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Building, 
  Shield, 
  Crown, 
  Star,
  Edit,
  Ban,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserDetail {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role: string;
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
  companies?: Array<{
    id: string;
    name: string;
    role: string;
    joined_at: string;
  }>;
  profile_completion?: number;
  is_active: boolean;
  country?: string;
}

interface AdminUserDetailProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdate: () => void;
  onNavigateToCompany?: (companyId: string) => void;
}

const AdminUserDetail: React.FC<AdminUserDetailProps> = ({
  userId,
  isOpen,
  onClose,
  onUserUpdate,
  onNavigateToCompany
}) => {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [newSubscription, setNewSubscription] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  const loadUserDetail = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      // Get session for authorization
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      console.log('Loading user details for:', userId);

      // Call edge function to get complete user details with real email
      const { data: userDetails, error } = await supabase.functions.invoke('get-user-details', {
        body: { userId },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      console.log('User details response:', { userDetails, error });

      if (error) {
        console.error('Error from get-user-details:', error);
        throw new Error(error.message || 'Error al cargar usuario');
      }

      if (!userDetails) {
        throw new Error('Usuario no encontrado');
      }

      const userDetail: UserDetail = {
        id: userDetails.id,
        full_name: userDetails.full_name,
        email: userDetails.email,
        phone: userDetails.phone || undefined,
        avatar_url: userDetails.avatar_url || undefined,
        role: userDetails.role,
        created_at: userDetails.created_at,
        updated_at: userDetails.updated_at,
        last_sign_in_at: userDetails.last_sign_in_at || undefined,
        email_confirmed_at: userDetails.email_confirmed_at || undefined,
        companies: userDetails.companies,
        profile_completion: userDetails.profile_completion,
        is_active: userDetails.is_active,
        country: userDetails.country || undefined
      };

      setUser(userDetail);
      setNewRole(userDetails.role);
      // Determine subscription based on role
      const isPremium = ['admin', 'premium_talent', 'premium_business', 'academy_premium'].includes(userDetails.role);
      setNewSubscription(isPremium ? 'premium' : 'freemium');
    } catch (error) {
      console.error('Error loading user detail:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al cargar los detalles del usuario: ${errorMessage}`);
      // Mantener el modal abierto pero mostrar el error
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      loadUserDetail();
    }
  }, [isOpen, userId]);

  // Realtime listener to reflect role changes instantly for this user in the modal
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`admin-user-role-changes-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_roles', filter: `user_id=eq.${userId}` },
        (payload) => {
          const newRoleValue = (payload.new as any)?.role;
          if (newRoleValue) {
            setUser((prev) => (prev ? { ...prev, role: newRoleValue as string } : prev));
            setNewRole(newRoleValue as string);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Get the contextual role value for the dropdown (matches what user sees in list)
  const getContextualRoleValue = () => {
    if (!user) return 'talento';
    if (user.role === 'admin') return 'admin';
    
    // Check if user has companies to determine their contextual role
    if (user.companies && user.companies.length > 0) {
      // Get highest company role
      const hasOwner = user.companies.some((c: any) => c.role === 'owner');
      const hasAdmin = user.companies.some((c: any) => c.role === 'admin');
      
      if (hasOwner) return 'owner_empresa';
      if (hasAdmin) return 'admin_empresa';
      return 'miembro_empresa';
    }
    
    return 'talento';
  };

  // Handle contextual role change - this may need to update both user_roles AND company_user_roles
  const handleContextualRoleChange = (contextualRole: string) => {
    // Map contextual role to database role
    switch (contextualRole) {
      case 'admin':
        setNewRole('admin');
        break;
      case 'owner_empresa':
      case 'admin_empresa':
      case 'miembro_empresa':
        // For company roles, we use the current subscription level
        const isPremium = ['admin', 'premium_talent', 'premium_business', 'academy_premium'].includes(user?.role || '');
        setNewRole(isPremium ? 'premium_business' : 'freemium_business');
        break;
      case 'talento':
      default:
        const isPremiumTalent = ['admin', 'premium_talent', 'premium_business', 'academy_premium'].includes(user?.role || '');
        setNewRole(isPremiumTalent ? 'premium_talent' : 'freemium_talent');
        break;
    }
  };

  const handleRoleChange = async () => {
    if (!user || newRole === user.role) return;

    setIsUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const { data, error } = await supabase.functions.invoke('admin-change-user-role', {
        body: { userId, newRole },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setUser((prev) => prev ? { ...prev, role: newRole } : prev);
      toast.success('Rol actualizado correctamente.');
      onUserUpdate();
      loadUserDetail();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(error instanceof Error ? error.message : 'Error al actualizar el rol');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubscriptionChange = async () => {
    if (!user) return;

    // Determine the new role based on subscription and current context
    let newRoleForSubscription: string;
    
    if (newSubscription === 'premium') {
      // If user has companies, make them premium_business
      if (user.companies && user.companies.length > 0) {
        newRoleForSubscription = 'premium_business';
      } else {
        newRoleForSubscription = 'premium_talent';
      }
    } else {
      // Freemium
      if (user.companies && user.companies.length > 0) {
        newRoleForSubscription = 'freemium_business';
      } else {
        newRoleForSubscription = 'freemium_talent';
      }
    }

    if (newRoleForSubscription === user.role) {
      toast.info('La suscripción ya está configurada correctamente');
      return;
    }

    setIsUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const { data, error } = await supabase.functions.invoke('admin-change-user-role', {
        body: { userId, newRole: newRoleForSubscription },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setUser((prev) => prev ? { ...prev, role: newRoleForSubscription } : prev);
      toast.success(`Suscripción actualizada a ${newSubscription === 'premium' ? 'Premium' : 'Freemium'}`);
      onUserUpdate();
      loadUserDetail();
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error(error instanceof Error ? error.message : 'Error al actualizar la suscripción');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSuspendUser = async () => {
    if (!user) return;

    setIsUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const { error } = await supabase.functions.invoke('admin-suspend-user', {
        body: { 
          userId: user.id,
          suspend: user.is_active
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      toast.success(user.is_active ? 'Usuario suspendido correctamente' : 'Usuario reactivado correctamente');
      onUserUpdate();
      loadUserDetail();
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error('Error al cambiar el estado del usuario');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user) return;

    setIsUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const { error } = await supabase.functions.invoke('admin-reset-password', {
        body: { userEmail: user.email },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      toast.success('Enlace de recuperación generado. El usuario debe revisar su email.');
      setShowPasswordReset(false);
    } catch (error) {
      console.error('Error generating password reset:', error);
      toast.error('Error al generar enlace de recuperación');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;
    
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente al usuario ${user.full_name}? Esta acción no se puede deshacer.`)) {
      return;
    }

    setIsUpdating(true);
    try {
      console.log('🗑️ Intentando eliminar usuario:', { userId: user.id, email: user.email });
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('❌ No hay sesión activa');
        throw new Error('No active session');
      }

      console.log('✅ Sesión obtenida, invocando Edge Function admin-delete-user...');

      const { data, error } = await supabase.functions.invoke('admin-delete-user', {
        body: { userId: user.id },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      console.log('📡 Respuesta de Edge Function:', { data, error });

      if (error) {
        console.error('❌ Error en invocación:', error);
        throw error;
      }
      
      if (data?.error) {
        console.error('❌ Error en respuesta:', data.error);
        throw new Error(data.error);
      }

      console.log('✅ Usuario eliminado exitosamente');
      toast.success('Usuario eliminado correctamente');
      onUserUpdate();
      onClose();
    } catch (error) {
      console.error('💥 Error completo al eliminar usuario:', error);
      toast.error(error instanceof Error ? error.message : 'Error al eliminar usuario');
    } finally {
      setIsUpdating(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-purple-600" />;
      case 'premium_business':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'freemium_business':
        return <Building className="h-4 w-4 text-blue-600" />;
      case 'premium_talent':
        return <Star className="h-4 w-4 text-orange-600" />;
      case 'freemium_talent':
        return <User className="h-4 w-4 text-green-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Admin</Badge>;
      case 'premium_business':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Empresa Premium</Badge>;
      case 'freemium_business':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Empresa Freemium</Badge>;
      case 'premium_talent':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Talento Premium</Badge>;
      case 'freemium_talent':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Talento Freemium</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cargando usuario...</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!user) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Usuario no encontrado</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8 space-y-4">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <div>
              <p className="font-semibold mb-2">No se pudo cargar la información del usuario</p>
              <p className="text-sm text-muted-foreground">
                Verifica la consola del navegador (F12) para más detalles del error.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Posibles causas: función edge no desplegada, problemas de permisos, o usuario no existe.
              </p>
            </div>
            <Button onClick={loadUserDetail} variant="outline" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Cargando...' : 'Reintentar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full mx-2 sm:mx-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            {getRoleIcon(user.role)}
            <span className="truncate">Detalles del Usuario</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Información Básica */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span>Información Básica</span>
                <div className="flex flex-wrap items-center gap-2">
                  {getRoleBadge(user.role)}
                  <Badge variant={user.is_active ? "default" : "destructive"}>
                    {user.is_active ? "Activo" : "Suspendido"}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base truncate">{user.full_name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Nombre completo</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base truncate">{user.email}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Email</p>
                    </div>
                  </div>

                  {user.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base truncate">{user.phone}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Teléfono</p>
                      </div>
                    </div>
                  )}

                  {user.country && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base truncate">{user.country}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">País</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base">
                        {new Date(user.created_at).toLocaleDateString('es')}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Registrado {formatDistanceToNow(new Date(user.created_at), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </p>
                    </div>
                  </div>

                  {user.last_sign_in_at && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base">
                          {new Date(user.last_sign_in_at).toLocaleDateString('es')}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Último acceso {formatDistanceToNow(new Date(user.last_sign_in_at), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {user.email_confirmed_at && (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-green-600 text-sm sm:text-base">Email verificado</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {new Date(user.email_confirmed_at).toLocaleDateString('es')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Empresas Asociadas */}
          {user.companies && user.companies.length > 0 && (
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Empresas Asociadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user.companies.map((company) => (
                    <div 
                      key={company.id} 
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div 
                        className="min-w-0 flex-1 cursor-pointer"
                        onClick={() => {
                          if (onNavigateToCompany) {
                            onNavigateToCompany(company.id);
                          }
                        }}
                      >
                        <p className="font-medium text-sm sm:text-base truncate hover:text-primary">{company.name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Se unió {formatDistanceToNow(new Date(company.joined_at), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select 
                          value={company.role} 
                          onValueChange={async (newRole) => {
                            // Update company role for this user
                            try {
                              const { data: { session } } = await supabase.auth.getSession();
                              if (!session) throw new Error('No session');
                              
                              const { error } = await supabase
                                .from('company_user_roles')
                                .update({ role: newRole as 'owner' | 'admin' | 'viewer' })
                                .eq('company_id', company.id)
                                .eq('user_id', user.id);
                              
                              if (error) throw error;
                              toast.success(`Rol actualizado a ${newRole === 'owner' ? 'Propietario' : newRole === 'admin' ? 'Admin' : 'Miembro'}`);
                              loadUserDetail();
                              onUserUpdate();
                            } catch (err) {
                              console.error('Error updating company role:', err);
                              toast.error('Error al actualizar el rol');
                            }
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="owner">👑 Propietario</SelectItem>
                            <SelectItem value="admin">⚙️ Admin</SelectItem>
                            <SelectItem value="viewer">👤 Miembro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Acciones Administrativas */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle>Acciones Administrativas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Cambiar Suscripción */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <Label className="w-full sm:w-32 text-sm font-medium">Suscripción:</Label>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 flex-1">
                    <Select value={newSubscription} onValueChange={setNewSubscription}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="freemium">Free</SelectItem>
                        <SelectItem value="premium">⭐ Premium</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={handleSubscriptionChange}
                      disabled={isUpdating}
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Actualizar
                    </Button>
                  </div>
                </div>

                {/* Cambiar Rol - Contextual role display, NOT database role */}
                {/* This shows user's role type. Company-specific roles are managed in the "Empresas Asociadas" section */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <Label htmlFor="role-select" className="w-full sm:w-32 text-sm font-medium">Cambiar Rol:</Label>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 flex-1">
                    <Select value={getContextualRoleValue()} onValueChange={handleContextualRoleChange}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">🛡️ Superadmin</SelectItem>
                        <SelectItem value="owner_empresa">👑 Owner Empresa</SelectItem>
                        <SelectItem value="admin_empresa">⚙️ Admin Empresa</SelectItem>
                        <SelectItem value="miembro_empresa">👤 Miembro Empresa</SelectItem>
                        <SelectItem value="talento">💼 Talento</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={handleRoleChange}
                      disabled={isUpdating || newRole === user.role}
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Actualizar
                    </Button>
                  </div>
                </div>

                {/* Suspender/Reactivar */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <Label className="w-full sm:w-32 text-sm font-medium">Estado:</Label>
                  <Button 
                    onClick={handleSuspendUser}
                    disabled={isUpdating}
                    variant={user.is_active ? "destructive" : "default"}
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    {user.is_active ? (
                      <>
                        <Ban className="h-4 w-4 mr-2" />
                        Suspender
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Reactivar
                      </>
                    )}
                  </Button>
                </div>

                {/* Ver Perfil Público */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <Label className="w-full sm:w-32 text-sm font-medium">Perfil Público:</Label>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`/talent/${user.id}`, '_blank')}
                    className="w-full sm:w-auto"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Perfil
                  </Button>
                </div>

                {/* Resetear Contraseña */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <Label className="w-full sm:w-32 text-sm font-medium">Contraseña:</Label>
                  <Dialog open={showPasswordReset} onOpenChange={setShowPasswordReset}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        <Eye className="h-4 w-4 mr-2" />
                        Resetear
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] sm:w-full mx-2 sm:mx-0">
                      <DialogHeader>
                        <DialogTitle className="text-lg sm:text-xl">Resetear Contraseña</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm sm:text-base">¿Estás seguro de que quieres enviar un enlace de recuperación de contraseña a <strong className="break-all">{user.email}</strong>?</p>
                        <div className="flex flex-col sm:flex-row justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowPasswordReset(false)} className="w-full sm:w-auto">
                            Cancelar
                          </Button>
                          <Button onClick={handlePasswordReset} disabled={isUpdating} className="w-full sm:w-auto">
                            Enviar Enlace
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Eliminar Usuario */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pt-4 border-t">
                  <Label className="w-full sm:w-32 text-destructive text-sm font-medium">Zona Peligrosa:</Label>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 flex-1">
                    <Button 
                      onClick={handleDeleteUser}
                      disabled={isUpdating}
                      variant="destructive"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar Usuario
                    </Button>
                    <p className="text-xs text-muted-foreground flex-1">
                      Esta acción es permanente y no se puede deshacer
                    </p>
                  </div>
                </div>

                {/* Notas Administrativas */}
                <div className="space-y-2">
                  <Label htmlFor="admin-notes" className="text-sm font-medium">Notas Administrativas:</Label>
                  <Textarea
                    id="admin-notes"
                    placeholder="Agregar notas sobre este usuario..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminUserDetail;
