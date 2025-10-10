import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, MessageSquare, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserData {
  user_id: string;
  full_name: string;
  email: string;
  role: string;
}

interface StartNewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChat: (userId: string, userName: string) => void;
}

const StartNewChatModal: React.FC<StartNewChatModalProps> = ({
  isOpen,
  onClose,
  onStartChat
}) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      setSearchQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(user => 
        user.full_name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-all-users', {
        body: {}
      });
      
      if (error) throw error;

      const allUsers: UserData[] = data?.users || [];
      // Filter out admin users
      const nonAdminUsers = allUsers.filter(u => u.role !== 'admin');
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

  const getUserTypeBadge = (role: string) => {
    switch (role) {
      case 'talent':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Talento</Badge>;
      case 'business':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Empresa</Badge>;
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
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Iniciar Nuevo Chat
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
                    className="flex items-center justify-between gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
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
                    <Button
                      onClick={() => handleStartChat(user)}
                      size="sm"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Iniciar Chat
                    </Button>
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
