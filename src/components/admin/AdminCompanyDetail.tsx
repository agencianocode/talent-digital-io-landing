import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Building, 
  Users, 
  MapPin, 
  Calendar, 
  Globe, 
  Edit,
  UserPlus,
  UserMinus,
  Crown,
  Shield,
  Eye,
  Briefcase,
  ShoppingBag,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  owner_name?: string;
  owner_email?: string;
  users?: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    joined_at: string;
    status: string;
  }>;
  opportunities_count: number;
  services_count: number;
  is_active: boolean;
}

interface AdminCompanyDetailProps {
  companyId: string;
  isOpen: boolean;
  onClose: () => void;
  onCompanyUpdate: () => void;
  onNavigateToOpportunities?: (companyId: string) => void;
}

const AdminCompanyDetail: React.FC<AdminCompanyDetailProps> = ({
  companyId,
  isOpen,
  onClose,
  onCompanyUpdate,
  onNavigateToOpportunities
}) => {
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<CompanyDetail>>({});
  const [adminNotes, setAdminNotes] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('viewer');

  const loadCompanyDetail = async () => {
    if (!companyId) return;
    
    setIsLoading(true);
    try {
      // Load company data
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();

      if (companyError) {
        console.error('Error loading company:', companyError);
        toast.error('Error al cargar los detalles de la empresa');
        setIsLoading(false);
        return;
      }

      // Load company owner
      const { data: ownerData, error: ownerError } = await supabase
        .from('profiles')
        .select('full_name, user_id')
        .eq('user_id', companyData.user_id)
        .single();

      if (ownerError) {
        console.error('Error loading owner:', ownerError);
      }

      // Load company users - fetch roles first, then profiles separately
      const { data: rolesData, error: usersError } = await supabase
        .from('company_user_roles')
        .select('id, user_id, role, status, created_at')
        .eq('company_id', companyId)
        .eq('status', 'accepted');

      let usersData: any[] = [];
      if (!usersError && rolesData && rolesData.length > 0) {
        // Get all user IDs
        const userIds = rolesData.map(r => r.user_id);
        
        // Fetch profiles for these users
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', userIds);
        
        // Merge the data
        usersData = rolesData.map(role => ({
          ...role,
          profiles: profilesData?.find(p => p.user_id === role.user_id) || null
        }));
      }

      if (usersError) {
        console.error('Error loading company users:', usersError);
      }

      // Load opportunities count
      const { count: opportunitiesCount, error: oppError } = await supabase
        .from('opportunities')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId);

      if (oppError) {
        console.error('Error loading opportunities count:', oppError);
      }

      // Load services count (if talent_services table exists)
      let servicesCount = 0;
      try {
        const { count: servicesCountData, error: servicesError } = await supabase
          .from('talent_services' as any)
          .select('*', { count: 'exact', head: true });
        
        if (!servicesError) {
          servicesCount = servicesCountData || 0;
        }
      } catch (err) {
        console.log('talent_services table not found');
      }

      const companyDetail: CompanyDetail = {
        id: companyData.id,
        name: companyData.name,
        description: companyData.description || undefined,
        website: companyData.website || undefined,
        industry: companyData.industry || undefined,
        size: companyData.size || undefined,
        location: companyData.location || undefined,
        logo_url: companyData.logo_url || undefined,
        created_at: companyData.created_at,
        updated_at: companyData.updated_at,
        user_id: companyData.user_id,
        owner_name: ownerData?.full_name || undefined,
        owner_email: '', // TODO: Get from auth.users
        users: usersData?.map(u => ({
          id: (u.profiles as any)?.user_id || '',
          name: (u.profiles as any)?.full_name || 'Sin nombre',
          email: '', // TODO: Get from auth.users
          role: u.role,
          joined_at: u.created_at,
          status: u.status
        })) || [],
        opportunities_count: opportunitiesCount || 0,
        services_count: servicesCount,
        is_active: true // TODO: Determine based on company status
      };

      setCompany(companyDetail);
      setEditData(companyDetail);
    } catch (error) {
      console.error('Error loading company detail:', error);
      toast.error('Error al cargar los detalles de la empresa');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && companyId) {
      loadCompanyDetail();
    }
  }, [isOpen, companyId]);

  const handleSaveChanges = async () => {
    if (!company) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          name: editData.name,
          description: editData.description,
          website: editData.website,
          industry: editData.industry,
          size: editData.size,
          location: editData.location
        })
        .eq('id', companyId);

      if (error) throw error;

      toast.success('Empresa actualizada correctamente');
      setIsEditing(false);
      onCompanyUpdate();
      loadCompanyDetail();
    } catch (error) {
      console.error('Error updating company:', error);
      toast.error('Error al actualizar la empresa');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUserEmail || !company) return;

    setIsUpdating(true);
    try {
      // Find user by email through profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .ilike('user_id', `%${newUserEmail}%`)
        .limit(1);

      if (profileError) throw profileError;
      if (!profiles || profiles.length === 0) {
        toast.error('Usuario no encontrado');
        return;
      }

      const targetUserId = profiles?.[0]?.user_id;
      
      if (!targetUserId) {
        toast.error('Usuario no encontrado');
        return;
      }

      // Create invitation
      const { error: inviteError } = await supabase
        .from('company_user_roles')
        .insert([{
          company_id: companyId,
          user_id: targetUserId,
          role: newUserRole as any,
          status: 'accepted',
          accepted_at: new Date().toISOString()
        }]);

      if (inviteError) throw inviteError;

      toast.success('Usuario agregado correctamente');
      setShowAddUser(false);
      setNewUserEmail('');
      setNewUserRole('viewer');
      onCompanyUpdate();
      loadCompanyDetail();
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error('Error al agregar usuario');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!company) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('company_user_roles')
        .delete()
        .eq('company_id', companyId)
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Usuario removido correctamente');
      onCompanyUpdate();
      loadCompanyDetail();
    } catch (error) {
      console.error('Error removing user:', error);
      toast.error('Error al remover usuario');
    } finally {
      setIsUpdating(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-purple-600" />;
      case 'viewer':
        return <Eye className="h-4 w-4 text-blue-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-600" />;
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
      case 'rejected':
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

  if (!company) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Empresa no encontrada</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p>No se pudo cargar la información de la empresa</p>
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
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Información Básica</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={company.is_active ? "default" : "destructive"}>
                    {company.is_active ? "Activa" : "Inactiva"}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditing ? 'Cancelar' : 'Editar'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Nombre de la Empresa</Label>
                    {isEditing ? (
                      <Input
                        value={editData.name || ''}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      />
                    ) : (
                      <p className="font-medium">{company.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label>Descripción</Label>
                    {isEditing ? (
                      <Textarea
                        value={editData.description || ''}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">{company.description || 'Sin descripción'}</p>
                    )}
                  </div>

                  <div>
                    <Label>Sitio Web</Label>
                    {isEditing ? (
                      <Input
                        value={editData.website || ''}
                        onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                        placeholder="https://ejemplo.com"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        {company.website ? (
                          <a 
                            href={company.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Globe className="h-4 w-4" />
                            {company.website}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">No especificado</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Industria</Label>
                    {isEditing ? (
                      <Select
                        value={editData.industry || ''}
                        onValueChange={(value) => setEditData({ ...editData, industry: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar industria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Tecnología</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="sales">Ventas</SelectItem>
                          <SelectItem value="consulting">Consultoría</SelectItem>
                          <SelectItem value="education">Educación</SelectItem>
                          <SelectItem value="healthcare">Salud</SelectItem>
                          <SelectItem value="finance">Finanzas</SelectItem>
                          <SelectItem value="other">Otras</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="font-medium">{company.industry || 'No especificada'}</p>
                    )}
                  </div>

                  <div>
                    <Label>Tamaño</Label>
                    {isEditing ? (
                      <Select
                        value={editData.size || ''}
                        onValueChange={(value) => setEditData({ ...editData, size: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tamaño" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="startup">Startup (1-10)</SelectItem>
                          <SelectItem value="small">Pequeña (11-50)</SelectItem>
                          <SelectItem value="medium">Mediana (51-200)</SelectItem>
                          <SelectItem value="large">Grande (201-1000)</SelectItem>
                          <SelectItem value="enterprise">Enterprise (1000+)</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="font-medium">{company.size || 'No especificado'}</p>
                    )}
                  </div>

                  <div>
                    <Label>Ubicación</Label>
                    {isEditing ? (
                      <Input
                        value={editData.location || ''}
                        onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                        placeholder="Ciudad, País"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{company.location || 'No especificada'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>Fecha de Registro</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(company.created_at).toLocaleDateString('es')} 
                        ({formatDistanceToNow(new Date(company.created_at), { 
                          addSuffix: true, 
                          locale: es 
                        })})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveChanges} disabled={isUpdating}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usuarios de la Empresa */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Usuarios de la Empresa ({company.users?.length || 0})
                </CardTitle>
                <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Agregar Usuario
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Agregar Usuario a la Empresa</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="user-email">Email del Usuario</Label>
                        <Input
                          id="user-email"
                          type="email"
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                          placeholder="usuario@ejemplo.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="user-role">Rol</Label>
                        <Select value={newUserRole} onValueChange={setNewUserRole}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="viewer">Visualizador</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowAddUser(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleAddUser} disabled={isUpdating || !newUserEmail}>
                          Agregar Usuario
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {company.users && company.users.length > 0 ? (
                <div className="space-y-3">
                  {company.users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {getRoleIcon(user.role)}
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Se unió {formatDistanceToNow(new Date(user.joined_at), { 
                              addSuffix: true, 
                              locale: es 
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getRoleBadge(user.role)}
                        {getStatusBadge(user.status)}
                        {user.role !== 'owner' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveUser(user.id)}
                            disabled={isUpdating}
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay usuarios asociados a esta empresa</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Estadísticas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Estadísticas de la Empresa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => {
                    if (onNavigateToOpportunities) {
                      onNavigateToOpportunities(companyId);
                      onClose();
                    }
                  }}
                  className="text-center p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <Briefcase className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold">{company.opportunities_count}</p>
                  <p className="text-sm text-muted-foreground">Oportunidades Publicadas</p>
                </button>
                <div className="text-center p-4 border rounded-lg">
                  <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold">{company.services_count}</p>
                  <p className="text-sm text-muted-foreground">Servicios Activos</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-bold">{company.users?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Usuarios Activos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notas Administrativas */}
          <Card>
            <CardHeader>
              <CardTitle>Notas Administrativas</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Agregar notas sobre esta empresa..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminCompanyDetail;
