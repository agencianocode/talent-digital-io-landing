import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { useCompanyUserRoles, CompanyUserRole } from '@/hooks/useCompanyUserRoles';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Plus, 
  MoreHorizontal, 
  Crown, 
  Shield, 
  Eye, 
  UserPlus, 
  Trash2, 
  Edit,
  Mail,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

const inviteUserSchema = z.object({
  email: z.string().email('Email inválido'),
  role: z.enum(['admin', 'viewer']),
});

type InviteUserFormData = z.infer<typeof inviteUserSchema>;

const UserManagement = () => {
  const { user } = useSupabaseAuth();
  const { activeCompany, hasPermission } = useCompany();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<CompanyUserRole | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  const {
    userRoles,
    currentUserRole,
    isLoading,
    inviteUser,
    updateUserRole,
    removeUser,
    transferOwnership,
  } = useCompanyUserRoles(activeCompany?.id);

  const form = useForm<InviteUserFormData>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      email: '',
      role: 'viewer',
    },
  });

  const onSubmitInvite = async (data: InviteUserFormData) => {
    if (!activeCompany) {
      toast.error('No hay empresa activa seleccionada');
      return;
    }
    
    await inviteUser({
      email: data.email,
      role: data.role,
      company_id: activeCompany.id,
    });
    setIsInviteDialogOpen(false);
    form.reset();
  };

  const handleUpdateRole = async (newRole: 'owner' | 'admin' | 'viewer') => {
    if (!selectedUser) return;
    
    if (newRole === 'owner') {
      await transferOwnership(selectedUser.id);
    } else {
      await updateUserRole(selectedUser.id, newRole);
    }
    setIsUpdateDialogOpen(false);
    setSelectedUser(null);
  };

  const handleRemoveUser = async (userRole: CompanyUserRole) => {
    if (confirm(`¿Estás seguro de que quieres remover a ${userRole.user_id} de la empresa?`)) {
      await removeUser(userRole.id);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'viewer':
        return <Eye className="h-4 w-4 text-gray-500" />;
      default:
        return <UserPlus className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      case 'viewer':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'declined':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Mail className="h-4 w-4 text-gray-500" />;
    }
  };

  // Show message if no company is selected
  if (!activeCompany) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay empresa seleccionada</h3>
              <p className="text-muted-foreground">
                Selecciona una empresa desde el selector en la barra lateral para gestionar usuarios.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestión de Usuarios</h2>
          <p className="text-muted-foreground">
            Administra los usuarios y permisos de <span className="font-medium">{activeCompany.name}</span>
          </p>
        </div>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Invitar Usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invitar Usuario</DialogTitle>
              <DialogDescription>
                Invita a un nuevo usuario a tu empresa con un rol específico.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitInvite)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email del Usuario</FormLabel>
                      <FormControl>
                        <Input placeholder="usuario@ejemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rol</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un rol" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              Admin - Puede crear oportunidades y gestionar aplicaciones
                            </div>
                          </SelectItem>
                          <SelectItem value="viewer">
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              Viewer - Solo puede ver aplicaciones y reportes
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Enviar Invitación</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios de la Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Cargando usuarios...</p>
            </div>
          ) : userRoles.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay usuarios</h3>
              <p className="text-muted-foreground mb-4">
                Invita a usuarios para comenzar a colaborar en tu empresa.
              </p>
              <Button onClick={() => setIsInviteDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invitar Primer Usuario
              </Button>
              
              {/* Temporary: Show example data */}
              <div className="mt-8 p-4 border border-dashed border-gray-300 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Ejemplo de usuarios (después de ejecutar SQL):</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-yellow-500" />
                    <span>👑 Owner - Propietario de la empresa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span>⚙️ Admin - Puede crear oportunidades y gestionar aplicaciones</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-gray-500" />
                    <span>👁️ Viewer - Solo puede ver aplicaciones y reportes</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {userRoles.map((userRole) => (
                <div
                  key={userRole.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={userRole.user_id} />
                      <AvatarFallback>
                        {userRole.user_id.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{userRole.user_id}</h4>
                        <Badge variant={getRoleBadgeVariant(userRole.role)}>
                          <div className="flex items-center gap-1">
                            {getRoleIcon(userRole.role)}
                            {userRole.role}
                          </div>
                        </Badge>
                        {getStatusIcon(userRole.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Invitado el {new Date(userRole.invited_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {hasPermission('admin') && userRole.user_id !== user?.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(userRole);
                              setIsUpdateDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Cambiar Rol
                          </DropdownMenuItem>
                          {hasPermission('owner') && userRole.role !== 'owner' && (
                            <DropdownMenuItem
                              onClick={() => transferOwnership(userRole.id)}
                            >
                              <Crown className="h-4 w-4 mr-2" />
                              Transferir Propiedad
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleRemoveUser(userRole)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remover Usuario
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Update Role Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Rol de Usuario</DialogTitle>
            <DialogDescription>
              Selecciona el nuevo rol para {selectedUser?.user_id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleUpdateRole('admin')}
            >
              <Shield className="h-4 w-4 mr-2" />
              Admin - Puede crear oportunidades y gestionar aplicaciones
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleUpdateRole('viewer')}
            >
              <Eye className="h-4 w-4 mr-2" />
              Viewer - Solo puede ver aplicaciones y reportes
            </Button>
            {hasPermission('owner') && selectedUser?.role !== 'owner' && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleUpdateRole('owner')}
              >
                <Crown className="h-4 w-4 mr-2" />
                Owner - Propietario de la empresa
              </Button>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
