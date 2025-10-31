import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, MessageSquare, User, Send, Users, CheckSquare, Square, Briefcase, UserCircle, GraduationCap, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserData {
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  company_roles?: string[];
  is_company_admin?: boolean;
  has_companies?: boolean;
}

interface StartNewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChat: (userId: string, userName: string) => void;
  onBulkMessage?: (userIds: string[], message: string) => void;
}

const StartNewChatModal: React.FC<StartNewChatModalProps> = ({
  isOpen,
  onClose,
  onStartChat,
  onBulkMessage
}) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkMessage, setBulkMessage] = useState('');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [isSendingBulk, setIsSendingBulk] = useState(false);
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'talent' | 'business' | 'academy'>('all');
  const [companyRoleFilter, setCompanyRoleFilter] = useState<'all' | 'admin_owner' | 'viewer'>('all');

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      setSearchQuery('');
      setSelectedUsers(new Set());
      setBulkMessage('');
      setIsBulkMode(false);
      setUserTypeFilter('all');
      setCompanyRoleFilter('all');
    }
  }, [isOpen]);

  useEffect(() => {
    let filtered = users;
    
    // Apply user type filter
    if (userTypeFilter === 'talent') {
      filtered = filtered.filter(user => 
        user.role === 'talent' || user.role === 'premium_talent'
      );
    } else if (userTypeFilter === 'business') {
      filtered = filtered.filter(user => 
        user.role === 'business' || 
        user.role === 'freemium_business' || 
        user.role === 'premium_business'
      );
      
      // Apply company role filter if business is selected
      if (companyRoleFilter === 'admin_owner') {
        filtered = filtered.filter(user => user.is_company_admin === true);
      } else if (companyRoleFilter === 'viewer') {
        filtered = filtered.filter(user => 
          user.company_roles?.includes('viewer')
        );
      }
    } else if (userTypeFilter === 'academy') {
      filtered = filtered.filter(user => user.role === 'academy_premium');
    }
    
    // Apply search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.full_name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }
    
    setFilteredUsers(filtered);
  }, [searchQuery, users, userTypeFilter, companyRoleFilter]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-all-users', {
        body: {}
      });
      
      if (error) throw error;

      const rawUsers: any[] = (data as any)?.users || [];
      // Normalize keys from edge function (id -> user_id) and filter out admins
      const nonAdminUsers: UserData[] = rawUsers
        .filter((u) => u.role !== 'admin')
        .map((u) => ({
          user_id: u.id,
          full_name: u.full_name || 'Usuario',
          email: u.email || '',
          role: u.role || 'talent',
          company_roles: u.company_roles || [],
          is_company_admin: u.is_company_admin || false,
          has_companies: u.has_companies || false,
        }));
      setUsers(nonAdminUsers);
      setFilteredUsers(nonAdminUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar los usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = (user: UserData) => {
    onStartChat(user.user_id, user.full_name);
    onClose();
  };

  const handleUserSelect = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(user => user.user_id)));
    }
  };

  const handleBulkSend = async () => {
    if (!onBulkMessage || selectedUsers.size === 0 || !bulkMessage.trim()) {
      toast.error('Selecciona usuarios y escribe un mensaje');
      return;
    }

    setIsSendingBulk(true);
    try {
      await onBulkMessage(Array.from(selectedUsers), bulkMessage);
      toast.success(`Mensaje enviado a ${selectedUsers.size} usuarios`);
      setBulkMessage('');
      setSelectedUsers(new Set());
      setIsBulkMode(false);
    } catch (error) {
      console.error('Error sending bulk message:', error);
      toast.error('Error al enviar el mensaje masivo');
    } finally {
      setIsSendingBulk(false);
    }
  };

  const getUserTypeBadge = (role: string) => {
    switch (role) {
      case 'talent':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Talento</Badge>;
      case 'premium_talent':
        return <Badge variant="outline" className="bg-cyan-100 text-cyan-800">Talento Premium</Badge>;
      case 'business':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Empresa</Badge>;
      case 'freemium_business':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Empresa Freemium</Badge>;
      case 'premium_business':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Empresa Premium</Badge>;
      case 'academy_premium':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            <GraduationCap className="h-3 w-3 mr-1" />
            Academia Premium
          </Badge>
        );
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Iniciar Nuevo Chat
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={isBulkMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsBulkMode(!isBulkMode)}
              >
                <Users className="h-4 w-4 mr-2" />
                Mensaje Masivo
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* User Type Filter */}
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant={userTypeFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setUserTypeFilter('all');
                setCompanyRoleFilter('all');
              }}
            >
              <Users className="h-4 w-4 mr-2" />
              Todos
            </Button>
            <Button
              variant={userTypeFilter === 'talent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setUserTypeFilter('talent');
                setCompanyRoleFilter('all');
              }}
            >
              <UserCircle className="h-4 w-4 mr-2" />
              Solo Talento
            </Button>
            <Button
              variant={userTypeFilter === 'business' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setUserTypeFilter('business');
              }}
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Solo Empresas
            </Button>
            <Button
              variant={userTypeFilter === 'academy' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setUserTypeFilter('academy');
                setCompanyRoleFilter('all');
              }}
            >
              <GraduationCap className="h-4 w-4 mr-2" />
              Solo Academias
            </Button>
          </div>

          {/* Conditional Company Role Filter */}
          {userTypeFilter === 'business' && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
              <label className="text-sm font-medium">Filtrar por rol en empresa:</label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={companyRoleFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCompanyRoleFilter('all')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Todos los miembros
                </Button>
                <Button
                  variant={companyRoleFilter === 'admin_owner' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCompanyRoleFilter('admin_owner')}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Solo Admins
                </Button>
                <Button
                  variant={companyRoleFilter === 'viewer' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCompanyRoleFilter('viewer')}
                >
                  <User className="h-4 w-4 mr-2" />
                  Solo Miembros
                </Button>
              </div>
            </div>
          )}

          {/* Bulk Mode Controls */}
          {isBulkMode && (
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {selectedUsers.size === filteredUsers.length ? (
                      <CheckSquare className="h-4 w-4 mr-2" />
                    ) : (
                      <Square className="h-4 w-4 mr-2" />
                    )}
                    {selectedUsers.size === filteredUsers.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {selectedUsers.size} de {filteredUsers.length} usuarios seleccionados
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Mensaje para todos los usuarios seleccionados:</label>
                <textarea
                  placeholder="Escribe tu mensaje aquí..."
                  value={bulkMessage}
                  onChange={(e) => setBulkMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleBulkSend}
                    disabled={selectedUsers.size === 0 || !bulkMessage.trim() || isSendingBulk}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSendingBulk ? 'Enviando...' : `Enviar a ${selectedUsers.size} usuarios`}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Users List */}
          <div className="flex-1 overflow-y-auto border rounded-lg">
            {isLoading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border rounded-lg animate-pulse">
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                      <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No se encontraron usuarios</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Intenta con otro término de búsqueda' : 'No hay usuarios disponibles'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user.user_id}
                    className={`flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors ${
                      isBulkMode ? 'justify-start' : 'justify-between'
                    }`}
                  >
                    {isBulkMode && (
                      <Checkbox
                        checked={selectedUsers.has(user.user_id)}
                        onCheckedChange={() => handleUserSelect(user.user_id)}
                      />
                    )}
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate">{user.full_name}</h3>
                          {getUserTypeBadge(user.role)}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    {!isBulkMode && (
                      <Button
                        onClick={() => handleStartChat(user)}
                        size="sm"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Iniciar Chat
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StartNewChatModal;
