import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Mail, 
  Building2, 
  Calendar,
  Trash2,
  CheckCircle2,
  Clock,
  Briefcase
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ContactRequest {
  id: string;
  requester_name: string;
  requester_email: string;
  requester_company: string | null;
  requester_role: string | null;
  message: string;
  contact_type: string;
  status: string;
  created_at: string;
}

export default function PublicContactRequests() {
  const { user } = useSupabaseAuth();
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    if (user) {
      fetchContactRequests();
    }
  }, [user]);

  const fetchContactRequests = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('public_contact_requests')
        .select('*')
        .eq('talent_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching contact requests:', error);
      toast.error('Error al cargar solicitudes');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsContacted = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('public_contact_requests')
        .update({ status: 'contacted' })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Marcado como contactado');
      fetchContactRequests();
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Error al actualizar');
    }
  };

  const archiveRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('public_contact_requests')
        .update({ status: 'archived' })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Solicitud archivada');
      fetchContactRequests();
    } catch (error) {
      console.error('Error archiving request:', error);
      toast.error('Error al archivar');
    }
  };

  const filteredRequests = requests.filter(req => {
    if (activeTab === 'pending') return req.status === 'pending';
    if (activeTab === 'contacted') return req.status === 'contacted';
    if (activeTab === 'archived') return req.status === 'archived';
    return true;
  });

  const getContactTypeLabel = (type: string) => {
    switch (type) {
      case 'proposal': return 'Propuesta';
      case 'message': return 'Mensaje';
      default: return 'Contacto';
    }
  };

  const getContactTypeColor = (type: string) => {
    switch (type) {
      case 'proposal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'message': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Solicitudes de Contacto</h1>
          <p className="text-muted-foreground mt-1">
            Personas que te contactaron desde tu perfil público
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {requests.filter(r => r.status === 'pending').length} pendientes
        </Badge>
      </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">
              <Clock className="h-4 w-4 mr-2" />
              Pendientes
            </TabsTrigger>
            <TabsTrigger value="contacted">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Contactados
            </TabsTrigger>
            <TabsTrigger value="archived">
              <Trash2 className="h-4 w-4 mr-2" />
              Archivados
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 mt-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-4">Cargando solicitudes...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No hay solicitudes {activeTab === 'pending' ? 'pendientes' : activeTab === 'contacted' ? 'contactadas' : 'archivadas'}
                  </h3>
                  <p className="text-muted-foreground">
                    {activeTab === 'pending' 
                      ? 'Cuando alguien te contacte desde tu perfil público, aparecerá aquí.' 
                      : 'No tienes solicitudes en esta categoría.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-xl">{request.requester_name}</CardTitle>
                          <Badge className={getContactTypeColor(request.contact_type)}>
                            {getContactTypeLabel(request.contact_type)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDistanceToNow(new Date(request.created_at), { 
                              addSuffix: true, 
                              locale: es 
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <a 
                            href={`mailto:${request.requester_email}`}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            {request.requester_email}
                          </a>
                        </div>
                      </div>

                      {request.requester_company && (
                        <div className="flex items-start gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground mt-1" />
                          <div>
                            <p className="text-sm text-muted-foreground">Empresa</p>
                            <p className="text-sm font-medium">{request.requester_company}</p>
                          </div>
                        </div>
                      )}

                      {request.requester_role && (
                        <div className="flex items-start gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground mt-1" />
                          <div>
                            <p className="text-sm text-muted-foreground">Cargo</p>
                            <p className="text-sm font-medium">{request.requester_role}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Message */}
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm font-medium mb-2">Mensaje:</p>
                      <p className="text-sm whitespace-pre-wrap">{request.message}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={() => window.location.href = `mailto:${request.requester_email}`}
                        className="flex-1"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Responder por Email
                      </Button>
                      
                      {request.status === 'pending' && (
                        <Button
                          variant="outline"
                          onClick={() => markAsContacted(request.id)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Marcar como Contactado
                        </Button>
                      )}

                      {request.status !== 'archived' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => archiveRequest(request.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
    </div>
  );
}