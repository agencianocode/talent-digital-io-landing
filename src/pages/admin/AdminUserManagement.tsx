import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, 
  User, 
  Building, 
  Shield, 
  Crown, 
  Star,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  AlertTriangle,
  GraduationCap,
  UserCog
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import AdminUserFilters from '@/components/admin/AdminUserFilters';
import AdminUserDetail from '@/components/admin/AdminUserDetail';
import AdminCompanyDetail from '@/components/admin/AdminCompanyDetail';
import BulkRoleChangeModal from '@/components/admin/BulkRoleChangeModal';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { TalentCardAcademyBadge } from '@/components/talent/TalentCardAcademyBadge';

const AdminUserManagement: React.FC = () => {
  const {
    users,
    allUsers,
    filteredUsers,
    isLoading,
    error,
    filters,
    updateFilters,
    currentPage,
    totalPages,
    setCurrentPage,
    refetch
  } = useAdminUsers();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isCompanyDetailOpen, setIsCompanyDetailOpen] = useState(false);
  
  // Bulk selection state
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isBulkRoleModalOpen, setIsBulkRoleModalOpen] = useState(false);

  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedUserId(null);
  };

  const handleUserUpdate = () => {
    refetch();
  };

  const handleNavigateToCompany = (companyId: string) => {
    // Cerrar el modal de usuario
    setIsDetailOpen(false);
    // Abrir el modal de empresa
    setSelectedCompanyId(companyId);
    setIsCompanyDetailOpen(true);
  };

  const handleCloseCompanyDetail = () => {
    setIsCompanyDetailOpen(false);
    setSelectedCompanyId(null);
  };

  const handleCompanyUpdate = () => {
    refetch();
  };

  const handleRefresh = async () => {
    toast.loading('Actualizando usuarios...', { id: 'refresh-users' });
    await refetch();
    toast.success('Usuarios actualizados correctamente', { id: 'refresh-users' });
  };

  // Bulk selection handlers
  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUserIds(prev => [...prev, userId]);
    } else {
      setSelectedUserIds(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(users.map(u => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleBulkRoleSuccess = () => {
    setSelectedUserIds([]);
    refetch();
  };

  const isAllSelected = users.length > 0 && selectedUserIds.length === users.length;
  const isSomeSelected = selectedUserIds.length > 0 && selectedUserIds.length < users.length;

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
      case 'academy_premium':
        return <GraduationCap className="h-4 w-4 text-indigo-600" />;
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
      case 'academy_premium':
        return <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">Academia Premium</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (user: any) => {
    // Solo mostrar badge cuando hay un problema o estado especial
    if (!user.is_active) {
      return <Badge variant="destructive">Suspendido</Badge>;
    }
    if (!user.email_confirmed_at) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
    }
    // Si está activo y confirmado, no mostrar badge (es el estado normal)
    return null;
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">Error al cargar usuarios</h3>
                <p className="text-sm">{error}</p>
              </div>
            </div>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Gestión de Usuarios</h2>
          <p className="text-sm text-muted-foreground">
            Administra todos los usuarios de la plataforma
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Filters */}
      <AdminUserFilters
        filters={filters}
        onFiltersChange={updateFilters}
        totalUsers={allUsers.length}
        filteredCount={filteredUsers.length}
        isLoading={isLoading}
      />

      {/* Bulk Action Bar */}
      {selectedUserIds.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg flex items-center gap-4">
          <span className="font-medium">
            {selectedUserIds.length} usuario{selectedUserIds.length > 1 ? 's' : ''} seleccionado{selectedUserIds.length > 1 ? 's' : ''}
          </span>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => setIsBulkRoleModalOpen(true)}
          >
            <UserCog className="h-4 w-4 mr-2" />
            Cambiar rol
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSelectedUserIds([])}
            className="text-primary-foreground hover:text-primary-foreground/80"
          >
            Cancelar
          </Button>
        </div>
      )}

      {/* Users List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Usuarios
          </CardTitle>
          {users.length > 0 && (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={isAllSelected}
                ref={(ref) => {
                  if (ref) {
                    (ref as any).indeterminate = isSomeSelected;
                  }
                }}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">Seleccionar todos</span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg animate-pulse">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                    <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-6 w-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron usuarios</h3>
              <p className="text-muted-foreground">
                {filteredUsers.length === 0 && allUsers.length > 0 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'No hay usuarios registrados en la plataforma'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors ${selectedUserIds.includes(user.id) ? 'bg-primary/5 border-primary/30' : ''}`}>
                  {/* Checkbox */}
                  <div className="flex-shrink-0">
                    <Checkbox
                      checked={selectedUserIds.includes(user.id)}
                      onCheckedChange={(checked) => handleSelectUser(user.id, !!checked)}
                    />
                  </div>
                  {/* Avatar and Basic Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                        <AvatarImage 
                          src={user.avatar_url || undefined} 
                          alt={user.full_name}
                          referrerPolicy="no-referrer"
                        />
                        <AvatarFallback className="bg-primary/10 text-xs sm:text-sm">
                          {user.full_name?.charAt(0)?.toUpperCase() || getRoleIcon(user.role)}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                        <h3 className="font-medium text-sm sm:text-base truncate">{user.full_name}</h3>
                        <div className="flex flex-wrap gap-1">
                          {getRoleBadge(user.role)}
                          {getStatusBadge(user)}
                          {/* Badge de onboarding incompleto */}
                          {user.has_completed_onboarding === false && (
                            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                              ⚠️ Sin completar
                            </Badge>
                          )}
                          {/* Badge de Google Auth */}
                          {user.is_google_auth && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              🔵 Google Auth
                            </Badge>
                          )}
                          {/* Badge de Academia - junto a otros badges */}
                          {user.email && (
                            <TalentCardAcademyBadge 
                              userId={user.id} 
                              userEmail={user.email}
                              size="sm"
                              compact={true}
                            />
                          )}
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate mb-1">{user.email}</p>
                      
                      {/* Mobile: Stack info vertically, Desktop: horizontal */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted-foreground">
                        <span className="truncate">
                          Registrado {formatDistanceToNow(new Date(user.created_at), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </span>
                        {user.last_sign_in_at && (
                          <span className="truncate">
                            acceso {formatDistanceToNow(new Date(user.last_sign_in_at), { 
                              addSuffix: true, 
                              locale: es 
                            })}
                          </span>
                        )}
                        {user.companies_count > 0 && (
                          <span className="flex items-center gap-1">
                            <Building className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{user.companies_count} empresa{user.companies_count > 1 ? 's' : ''}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 sm:flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewUser(user.id)}
                      className="w-full sm:w-auto text-xs sm:text-sm"
                    >
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Ver Detalles</span>
                      <span className="sm:hidden">Ver</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
              <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                Mostrando {((currentPage - 1) * 20) + 1} a {Math.min(currentPage * 20, filteredUsers.length)} de {filteredUsers.length} usuarios
              </div>
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="text-xs sm:text-sm"
                >
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline ml-1">Anterior</span>
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    const isActive = page === currentPage;
                    return (
                      <Button
                        key={page}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-7 h-7 sm:w-8 sm:h-8 p-0 text-xs sm:text-sm"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline mr-1">Siguiente</span>
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      {selectedUserId && (
        <AdminUserDetail
          userId={selectedUserId}
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          onUserUpdate={handleUserUpdate}
          onNavigateToCompany={handleNavigateToCompany}
        />
      )}

      {/* Company Detail Modal */}
      {selectedCompanyId && (
        <AdminCompanyDetail
          companyId={selectedCompanyId}
          isOpen={isCompanyDetailOpen}
          onClose={handleCloseCompanyDetail}
          onCompanyUpdate={handleCompanyUpdate}
        />
      )}

      {/* Bulk Role Change Modal */}
      <BulkRoleChangeModal
        isOpen={isBulkRoleModalOpen}
        onClose={() => setIsBulkRoleModalOpen(false)}
        selectedUserIds={selectedUserIds}
        onSuccess={handleBulkRoleSuccess}
      />
    </div>
  );
};

export default AdminUserManagement;
