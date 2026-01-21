import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Send, User, Building2, GraduationCap, Eye, Loader2 } from 'lucide-react';
import { substituteVariables } from '@/utils/messageVariables';

interface TestUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  company_name?: string;
}

interface AutomatedMessage {
  id: string;
  trigger_type: string;
  sender_id: string;
  message_content: string;
  is_active: boolean;
}

interface TestAutomatedMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: AutomatedMessage;
}

export const TestAutomatedMessageModal = ({ isOpen, onClose, message }: TestAutomatedMessageModalProps) => {
  const [users, setUsers] = useState<TestUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [previewUserId, setPreviewUserId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      setSelectedUsers([]);
      setSearchQuery('');
      setPreviewUserId(null);
    }
  }, [isOpen]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await supabase.functions.invoke('get-all-users', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (response.error) throw response.error;

      const userData: TestUser[] = (response.data?.users || []).map((u: any) => ({
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        avatar_url: u.avatar_url,
        role: u.role || 'talent',
        company_name: u.company_name,
      }));

      setUsers(userData);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(u => 
      u.email.toLowerCase().includes(query) ||
      (u.full_name && u.full_name.toLowerCase().includes(query)) ||
      (u.company_name && u.company_name.toLowerCase().includes(query))
    );
  }, [users, searchQuery]);

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const getPreviewForUser = (userId: string): string => {
    const user = users.find(u => u.id === userId);
    if (!user) return message.message_content;

    const firstName = user.full_name?.split(' ')[0] || '';
    return substituteVariables(message.message_content, {
      firstName,
      fullName: user.full_name || '',
      companyName: user.company_name || '',
      opportunityTitle: '[Título de oportunidad de ejemplo]',
    });
  };

  const handleSendTest = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Selecciona al menos un usuario');
      return;
    }

    setIsSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      let successCount = 0;
      let errorCount = 0;

      for (const userId of selectedUsers) {
        const user = users.find(u => u.id === userId);
        
        const response = await supabase.functions.invoke('trigger-automated-message', {
          body: {
            trigger_type: message.trigger_type,
            recipient_id: userId,
            message_id: message.id,
            is_test: true,
          },
          headers: { Authorization: `Bearer ${session.access_token}` }
        });

        if (response.error) {
          console.error(`Error sending to ${user?.email}:`, response.error);
          errorCount++;
        } else if (response.data?.success) {
          successCount++;
        } else {
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} mensaje(s) de prueba enviado(s) correctamente`);
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} mensaje(s) fallaron al enviar`);
      }

      if (successCount > 0) {
        onClose();
      }
    } catch (error) {
      console.error('Error sending test messages:', error);
      toast.error('Error al enviar mensajes de prueba');
    } finally {
      setIsSending(false);
    }
  };

  const getRoleIcon = (role: string) => {
    if (role.includes('business') || role.includes('freemium_business') || role.includes('premium_business')) {
      return <Building2 className="h-3 w-3" />;
    }
    if (role.includes('academy')) {
      return <GraduationCap className="h-3 w-3" />;
    }
    return <User className="h-3 w-3" />;
  };

  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "outline" => {
    if (role === 'admin') return 'default';
    if (role.includes('premium')) return 'default';
    return 'secondary';
  };

  const previewUser = previewUserId ? users.find(u => u.id === previewUserId) : null;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Probar mensaje automatizado</DialogTitle>
          <DialogDescription>
            Selecciona usuarios para enviarles el mensaje de prueba
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email o empresa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 min-h-0">
            {/* Users List */}
            <div className="border rounded-lg overflow-hidden flex flex-col">
              <div className="bg-muted/50 px-3 py-2 border-b">
                <Label className="text-xs font-medium">
                  Usuarios ({filteredUsers.length})
                  {selectedUsers.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedUsers.length} seleccionados
                    </Badge>
                  )}
                </Label>
              </div>
              <ScrollArea className="flex-1 max-h-[300px]">
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No se encontraron usuarios
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className={`flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer ${
                          selectedUsers.includes(user.id) ? 'bg-primary/5' : ''
                        }`}
                        onClick={() => toggleUserSelection(user.id)}
                      >
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => toggleUserSelection(user.id)}
                        />
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback>
                            {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {user.full_name || user.email}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs flex items-center gap-1">
                            {getRoleIcon(user.role)}
                            <span className="truncate max-w-[60px]">{user.role}</span>
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewUserId(user.id);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Preview Panel */}
            <div className="border rounded-lg overflow-hidden flex flex-col">
              <div className="bg-muted/50 px-3 py-2 border-b">
                <Label className="text-xs font-medium">
                  Vista previa del mensaje
                </Label>
              </div>
              <div className="flex-1 p-4 overflow-auto">
                {previewUser ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-3 border-b">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={previewUser.avatar_url || undefined} />
                        <AvatarFallback>
                          {previewUser.full_name?.charAt(0) || previewUser.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{previewUser.full_name || previewUser.email}</p>
                        <p className="text-xs text-muted-foreground">{previewUser.company_name || 'Sin empresa'}</p>
                      </div>
                    </div>
                    <div className="bg-primary/10 rounded-lg p-3">
                      <p className="text-sm whitespace-pre-wrap">
                        {getPreviewForUser(previewUser.id)}
                      </p>
                    </div>
                  </div>
                ) : selectedUsers.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Haz clic en el ícono de ojo para ver la vista previa de un usuario
                    </p>
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                        {message.message_content}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <Eye className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">Selecciona usuarios para ver la vista previa</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSendTest} 
            disabled={selectedUsers.length === 0 || isSending}
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar prueba ({selectedUsers.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
