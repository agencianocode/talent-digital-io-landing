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
  Trash2
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
}

const AdminUserDetail: React.FC<AdminUserDetailProps> = ({
  userId,
  isOpen,
  onClose,
  onUserUpdate
}) => {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newRole, setNewRole] = useState('');
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

      // Call edge function to get complete user details with real email
      const { data: userDetails, error } = await supabase.functions.invoke('get-user-details', {
        body: { userId },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Error from get-user-details:', error);
        throw error;
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
    } catch (error) {
      console.error('Error loading user detail:', error);
      toast.error('Error al cargar los detalles del usuario');
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const { data, error } = await supabase.functions.invoke('admin-delete-user', {
        body: { userId: user.id },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success('Usuario eliminado correctamente');
      onUserUpdate();
      onClose();
    } catch (error) {
      console.error('Error deleting user:', error);
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
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p>No se pudo cargar la información del usuario</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getRoleIcon(user.role)}
            Detalles del Usuario
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Información Básica</span>
                <div className="flex items-center gap-2">
                  {getRoleBadge(user.role)}
                  <Badge variant={user.is_active ? "default" : "destructive"}>
                    {user.is_active ? "Activo" : "Suspendido"}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{user.full_name}</p>
                      <p className="text-sm text-muted-foreground">Nombre completo</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{user.email}</p>
                      <p className="text-sm text-muted-foreground">Email</p>
                    </div>
                  </div>

                  {user.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{user.phone}</p>
                        <p className="text-sm text-muted-foreground">Teléfono</p>
                      </div>
                    </div>
                  )}

                  {user.country && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{user.country}</p>
                        <p className="text-sm text-muted-foreground">País</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {new Date(user.created_at).toLocaleDateString('es')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Registrado {formatDistanceToNow(new Date(user.created_at), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </p>
                    </div>
                  </div>

                  {user.last_sign_in_at && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {new Date(user.last_sign_in_at).toLocaleDateString('es')}
                        </p>
                        <p className="text-sm text-muted-foreground">
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
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-600">Email verificado</p>
                        <p className="text-sm text-muted-foreground">
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
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Empresas Asociadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user.companies.map((company) => (
                    <div key={company.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{company.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Se unió {formatDistanceToNow(new Date(company.joined_at), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </p>
                      </div>
                      <Badge variant="outline">{company.role}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Acciones Administrativas */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Administrativas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Cambiar Rol */}
                <div className="flex items-center gap-4">
                  <Label htmlFor="role-select" className="w-32">Cambiar Rol:</Label>
                  <Select value={newRole} onValueChange={setNewRole}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="premium_business">Empresa Premium</SelectItem>
                      <SelectItem value="freemium_business">Empresa Freemium</SelectItem>
                      <SelectItem value="premium_talent">Talento Premium</SelectItem>
                      <SelectItem value="freemium_talent">Talento Freemium</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleRoleChange}
                    disabled={isUpdating || newRole === user.role}
                    size="sm"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Actualizar
                  </Button>
                </div>

                {/* Suspender/Reactivar */}
                <div className="flex items-center gap-4">
                  <Label className="w-32">Estado:</Label>
                  <Button 
                    onClick={handleSuspendUser}
                    disabled={isUpdating}
                    variant={user.is_active ? "destructive" : "default"}
                    size="sm"
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

                {/* Resetear Contraseña */}
                <div className="flex items-center gap-4">
                  <Label className="w-32">Contraseña:</Label>
                  <Dialog open={showPasswordReset} onOpenChange={setShowPasswordReset}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Resetear
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Resetear Contraseña</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p>¿Estás seguro de que quieres enviar un enlace de recuperación de contraseña a <strong>{user.email}</strong>?</p>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowPasswordReset(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={handlePasswordReset} disabled={isUpdating}>
                            Enviar Enlace
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Eliminar Usuario */}
                <div className="flex items-center gap-4 pt-4 border-t">
                  <Label className="w-32 text-destructive">Zona Peligrosa:</Label>
                  <Button 
                    onClick={handleDeleteUser}
                    disabled={isUpdating}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar Usuario
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Esta acción es permanente y no se puede deshacer
                  </p>
                </div>

                {/* Notas Administrativas */}
                <div className="space-y-2">
                  <Label htmlFor="admin-notes">Notas Administrativas:</Label>
                  <Textarea
                    id="admin-notes"
                    placeholder="Agregar notas sobre este usuario..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
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
