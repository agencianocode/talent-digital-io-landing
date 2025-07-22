
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, MoreHorizontal, Mail, Trash2, Edit } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const mockUsers = [
  {
    id: '1',
    name: 'Ana García',
    email: 'ana.garcia@empresa.com',
    role: 'Owner',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana',
    lastActive: '2024-01-15T10:30:00Z',
    status: 'active'
  },
  {
    id: '2',
    name: 'Carlos López',
    email: 'carlos.lopez@empresa.com',
    role: 'Admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos',
    lastActive: '2024-01-14T15:20:00Z',
    status: 'active'
  },
  {
    id: '3',
    name: 'María González',
    email: 'maria.gonzalez@empresa.com',
    role: 'Viewer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
    lastActive: '2024-01-13T09:45:00Z',
    status: 'inactive'
  }
];

const UserManagement = () => {
  const [users, setUsers] = useState(mockUsers);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Viewer');
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const handleInviteUser = () => {
    if (!inviteEmail) {
      toast.error('Ingresa un email válido');
      return;
    }

    const newUser = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${inviteEmail}`,
      lastActive: new Date().toISOString(),
      status: 'pending'
    };

    setUsers([...users, newUser]);
    setInviteEmail('');
    setInviteRole('Viewer');
    setIsInviteOpen(false);
    toast.success(`Invitación enviada a ${inviteEmail}`);
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
    toast.success('Rol actualizado');
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    toast.success('Usuario eliminado');
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      'Owner': 'destructive',
      'Admin': 'secondary',
      'Viewer': 'outline'
    };
    return <Badge variant={variants[role as keyof typeof variants] || 'outline'}>{role}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'active': 'default',
      'inactive': 'secondary',
      'pending': 'outline'
    };
    const labels = {
      'active': 'Activo',
      'inactive': 'Inactivo',
      'pending': 'Pendiente'
    };
    return <Badge variant={variants[status as keyof typeof variants]}>{labels[status as keyof typeof labels]}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestión de Usuarios</h2>
          <p className="text-muted-foreground">Administra los usuarios de tu empresa</p>
        </div>

        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Invitar Usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invitar Nuevo Usuario</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Rol</label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleInviteUser}>
                  Enviar Invitación
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios de la Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Última Actividad</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(user.lastActive).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {user.role !== 'Owner' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toast.info('Función de edición próximamente')}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.info('Función de reenvío próximamente')}>
                            <Mail className="h-4 w-4 mr-2" />
                            Reenviar Invitación
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. El usuario perderá acceso a la empresa.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
