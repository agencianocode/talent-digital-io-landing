import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Building, 
  Users, 
  MapPin, 
  Calendar, 
  Globe, 
  Edit,
  UserPlus,
  Trash2,
  Briefcase,
  ShoppingBag,
  AlertTriangle,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CompanyUser {
  roleRowId: string;
  id: string | null;
  user_id: string | null;
  email: string;
  full_name: string;
  avatar_url: string | null | undefined;
  role: string;
  status: string;
  created_at: string;
  accepted_at: string | null;
  isPending: boolean;
}

interface CompanyDetail {
  id: string;
  name: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: string;
  location?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  owner: {
    id: string;
    full_name: string;
    avatar_url?: string;
    phone?: string;
  };
  users: CompanyUser[];
  opportunitiesCount: number;
  servicesCount: number;
}

interface AdminCompanyDetailProps {
  companyId: string;
  isOpen: boolean;
  onClose: () => void;
  onCompanyUpdate?: () => void;
  onNavigateToOpportunities?: (companyId: string) => void;
}

const AdminCompanyDetail: React.FC<AdminCompanyDetailProps> = ({
  companyId,
  isOpen,
  onClose,
  onCompanyUpdate
}) => {
  const [companyData, setCompanyData] = useState<CompanyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<CompanyDetail>>({});
  const [adminNotes, setAdminNotes] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('viewer');
  const [isAddingUser, setIsAddingUser] = useState(false);

  const loadCompanyDetail = async () => {
    if (!companyId) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select(`
          *,
          industries (
            id,
            name
          )
        `)
        .eq('id', companyId)
        .single();

      if (companyError) throw companyError;

      const { data: ownerProfile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, phone')
        .eq('user_id', company.user_id)
        .single();

      // Fetch ALL roles (including pending)
      const { data: rolesData, error: rolesError } = await supabase
        .from('company_user_roles')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (rolesError) throw rolesError;

      // Enrich with user profiles
      const enrichedUsers = await Promise.all(
        (rolesData || []).map(async (roleRow) => {
          if (!roleRow.user_id) {
            // Pending invitation
            return {
              roleRowId: roleRow.id,
              id: null,
              user_id: null,
              email: roleRow.invited_email || 'Email no disponible',
              full_name: roleRow.invited_email || 'Usuario invitado',
              avatar_url: null,
              role: roleRow.role,
              status: roleRow.status,
              created_at: roleRow.created_at,
              accepted_at: roleRow.accepted_at,
              isPending: true
            };
          }

          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('user_id', roleRow.user_id)
            .single();

          const { data: { user } } = await supabase.auth.admin.getUserById(roleRow.user_id);

          return {
            roleRowId: roleRow.id,
            id: roleRow.user_id,
            user_id: roleRow.user_id,
            email: user?.email || 'Email no disponible',
            full_name: profile?.full_name || user?.email || 'Usuario',
            avatar_url: profile?.avatar_url || undefined,
            role: roleRow.role,
            status: roleRow.status,
            created_at: roleRow.created_at,
            accepted_at: roleRow.accepted_at,
            isPending: false
          };
        })
      );

      const { count: opportunitiesCount } = await supabase
        .from('opportunities')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId);

      const { count: servicesCount } = await supabase
        .from('marketplace_services')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', company.user_id);

      setCompanyData({
        id: company.id,
        name: company.name,
        description: company.description || undefined,
        website: company.website || undefined,
        industry: company.industry || undefined,
        size: company.size || undefined,
        location: company.location || undefined,
        logo_url: company.logo_url || undefined,
        created_at: company.created_at,
        updated_at: company.updated_at,
        user_id: company.user_id,
        owner: {
          id: company.user_id,
          full_name: ownerProfile?.full_name || 'Propietario',
          avatar_url: ownerProfile?.avatar_url || undefined,
          phone: ownerProfile?.phone || undefined
        },
        users: enrichedUsers,
        opportunitiesCount: opportunitiesCount || 0,
        servicesCount: servicesCount || 0
      });
    } catch (err) {
      console.error('Error loading company details:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar la empresa');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && companyId) {
      loadCompanyDetail();
    }
  }, [isOpen, companyId]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing && companyData) {
      setEditData({
        name: companyData.name,
        description: companyData.description || '',
        website: companyData.website || '',
        industry: companyData.industry || '',
        size: companyData.size || '',
        location: companyData.location || ''
      });
    }
  };

  const handleSaveChanges = async () => {
    if (!companyData || !editData) return;

    try {
      const { error } = await supabase
        .from('companies')
        .update({
          name: editData.name || companyData.name,
          description: editData.description || null,
          website: editData.website || null,
          industry: editData.industry || null,
          size: editData.size || null,
          location: editData.location || null
        })
        .eq('id', companyId);

      if (error) throw error;

      toast.success('Empresa actualizada correctamente');
      setIsEditing(false);
      onCompanyUpdate?.();
      await loadCompanyDetail();
    } catch (err) {
      console.error('Error updating company:', err);
      toast.error('Error al actualizar la empresa');
    }
  };

  const handleAddUser = async () => {
    if (!newUserEmail.trim() || !companyData) {
      toast.error('Por favor ingresa un email válido');
      return;
    }

    setIsAddingUser(true);

    try {
      // Check if user already exists in this company
      const isDuplicate = companyData.users.some(
        u => u.email?.toLowerCase() === newUserEmail.toLowerCase()
      );

      if (isDuplicate) {
        toast.error('Este usuario ya pertenece a la empresa');
        setIsAddingUser(false);
        return;
      }

      // Try to find the user
      const { data: userData, error: userError } = await supabase.functions.invoke(
        'get-user-details',
        {
          body: { email: newUserEmail }
        }
      );

      if (userError || !userData) {
        console.log('User not found, creating pending invitation');
        
        // User doesn't exist - create pending invitation
        const invitationToken = crypto.randomUUID();
        
        const currentUser = await supabase.auth.getUser();
        const { error: insertError } = await supabase
          .from('company_user_roles')
          .insert([{
            company_id: companyData.id,
            user_id: null,
            invited_email: newUserEmail,
            role: newUserRole as any,
            status: 'pending',
            invited_by: currentUser.data.user?.id || null,
            invitation_token: invitationToken
          }]);

        if (insertError) throw insertError;

        // Send invitation email
        await supabase.functions.invoke('send-invitation', {
          body: {
            email: newUserEmail,
            role: newUserRole,
            company_id: companyData.id,
            invited_by: (await supabase.auth.getUser()).data.user?.email || 'Administrador',
            invitation_id: invitationToken
          }
        });

        toast.success(`Se envió una invitación a ${newUserEmail}`);
      } else {
        // User exists - add directly as accepted
        const { error: insertError } = await supabase
          .from('company_user_roles')
          .insert([{
            company_id: companyData.id,
            user_id: userData.user_id,
            role: newUserRole as any,
            status: 'accepted',
            accepted_at: new Date().toISOString()
          }]);

        if (insertError) throw insertError;

        toast.success(`${userData.full_name} fue agregado a la empresa`);
      }

      setNewUserEmail('');
      setShowAddUser(false);
      await loadCompanyDetail();
    } catch (err) {
      console.error('Error adding user:', err);
      toast.error(err instanceof Error ? err.message : 'Error al agregar usuario');
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleRemoveUser = async (roleRowId: string) => {
    if (!companyData) return;

    try {
      const { error } = await supabase
        .from('company_user_roles')
        .delete()
        .eq('id', roleRowId);

      if (error) throw error;

      toast.success('Usuario eliminado correctamente');
      await loadCompanyDetail();
    } catch (err) {
      console.error('Error removing user:', err);
      toast.error('No se pudo eliminar el usuario');
    }
  };


  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Propietario</Badge>;
      case 'admin':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Admin</Badge>;
      case 'viewer':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Visualizador</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge variant="default" className="bg-green-100 text-green-800">Activo</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case 'declined':
        return <Badge variant="destructive">Rechazado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cargando empresa...</DialogTitle>
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

  if (error || !companyData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p>{error || 'No se pudo cargar la información de la empresa'}</p>
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
            <Building className="h-5 w-5" />
            Detalles de la Empresa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Información Básica</CardTitle>
                <Button variant="outline" size="sm" onClick={handleEditToggle}>
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? 'Cancelar' : 'Editar'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label>Nombre</Label>
                    <Input
                      value={editData.name || ''}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Descripción</Label>
                    <Textarea
                      value={editData.description || ''}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Sitio web</Label>
                    <Input
                      value={editData.website || ''}
                      onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Industria</Label>
                    <Input
                      value={editData.industry || ''}
                      onChange={(e) => setEditData({ ...editData, industry: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Tamaño</Label>
                    <Input
                      value={editData.size || ''}
                      onChange={(e) => setEditData({ ...editData, size: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Ubicación</Label>
                    <Input
                      value={editData.location || ''}
                      onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleSaveChanges}>Guardar Cambios</Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{companyData.name}</span>
                  </div>
                  {companyData.description && (
                    <p className="text-sm text-muted-foreground">{companyData.description}</p>
                  )}
                  {companyData.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a href={companyData.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        {companyData.website}
                      </a>
                    </div>
                  )}
                  {companyData.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{companyData.location}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Company Users */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Usuarios ({companyData.users.length})
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => setShowAddUser(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Agregar Usuario
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {showAddUser && (
                  <div className="border rounded-lg p-4 space-y-3 bg-muted/50">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Agregar Nuevo Usuario</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowAddUser(false);
                          setNewUserEmail('');
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label>Email del Usuario</Label>
                      <Input
                        type="email"
                        placeholder="usuario@ejemplo.com"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Rol</Label>
                      <Select value={newUserRole} onValueChange={setNewUserRole}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="viewer">Visualizador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={handleAddUser}
                      disabled={isAddingUser}
                      className="w-full"
                    >
                      {isAddingUser ? 'Agregando...' : 'Agregar Usuario'}
                    </Button>
                  </div>
                )}

                {companyData.users.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay usuarios en esta empresa
                  </p>
                ) : (
                  <div className="space-y-2">
                    {companyData.users.map((user) => (
                      <div key={user.roleRowId} className="flex items-center justify-between py-3 border-b last:border-0">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback>{user.full_name?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {user.full_name}
                              {user.isPending && (
                                <span className="ml-2 text-xs text-muted-foreground">(Pendiente)</span>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getRoleBadge(user.role)}
                          {getStatusBadge(user.status)}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveUser(user.roleRowId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Company Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Oportunidades</span>
                </div>
                <Badge variant="secondary">{companyData.opportunitiesCount}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Servicios</span>
                </div>
                <Badge variant="secondary">{companyData.servicesCount}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Creada</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(companyData.created_at), { addSuffix: true, locale: es })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Admin Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notas de Admin</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Agregar notas internas sobre esta empresa..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminCompanyDetail;
