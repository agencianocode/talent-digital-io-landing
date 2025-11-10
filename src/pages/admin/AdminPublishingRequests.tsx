import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Eye, CheckCircle, XCircle, FileText } from 'lucide-react';
import { usePublishingRequests, PublishingRequest } from '@/hooks/usePublishingRequests';
import { AdminPublishingRequestDetail } from '@/components/admin/AdminPublishingRequestDetail';
import LoadingSkeleton from '@/components/LoadingSkeleton';

export const AdminPublishingRequests = () => {
  const { requests, loading, updateRequestStatus } = usePublishingRequests();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedRequest, setSelectedRequest] = useState<PublishingRequest | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.contact_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.service_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-600/20">Pendiente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-600/20">Aprobada</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-600/20">Rechazada</Badge>;
      default:
        return null;
    }
  };

  const handleViewDetails = (request: PublishingRequest) => {
    setSelectedRequest(request);
    setDetailOpen(true);
  };

  const handleApprove = async (requestId: string, notes?: string) => {
    await updateRequestStatus(requestId, 'approved', notes);
  };

  const handleReject = async (requestId: string, notes?: string) => {
    await updateRequestStatus(requestId, 'rejected', notes);
  };

  if (loading) {
    return <LoadingSkeleton type="table" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Solicitudes de Publicación</h2>
          <p className="text-muted-foreground">
            Gestiona las solicitudes de publicación de servicios en el marketplace
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          <div className="text-right">
            <p className="text-2xl font-bold">{requests.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, email, empresa o servicio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <TabsList>
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="pending">Pendientes</TabsTrigger>
                <TabsTrigger value="approved">Aprobadas</TabsTrigger>
                <TabsTrigger value="rejected">Rechazadas</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Tabla */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa / Talento</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No se encontraron solicitudes
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        {/* Mostrar nombre de persona si es talento, empresa si es empresa */}
                        <div>
                          <p className="font-medium">
                            {request.requester_role === 'freemium_talent' || request.requester_role === 'premium_talent'
                              ? request.contact_name
                              : request.company_name
                            }
                          </p>
                          {request.requester_role === 'freemium_talent' || request.requester_role === 'premium_talent' ? (
                            <p className="text-xs text-muted-foreground">Talento</p>
                          ) : (
                            <p className="text-xs text-muted-foreground">Empresa</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground">{request.contact_email}</p>
                      </TableCell>
                      <TableCell>{request.service_type}</TableCell>
                      <TableCell>
                        {new Date(request.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(request)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {request.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(request.id)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReject(request.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

      <AdminPublishingRequestDetail
        request={selectedRequest}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};
