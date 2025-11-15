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
  const { requests, loading, updateRequestStatus, createServiceForApprovedRequest } = usePublishingRequests();
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

  const handleCreateService = async (requestId: string) => {
    await createServiceForApprovedRequest(requestId);
  };

  if (loading) {
    return <LoadingSkeleton type="table" />;
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Solicitudes de Publicación</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gestiona las solicitudes de publicación de servicios en el marketplace
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <div className="text-right">
            <p className="text-xl sm:text-2xl font-bold">{requests.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>
      </div>

      <Card className="p-3 sm:p-6">
        <div className="space-y-4">
          {/* Filtros - Responsive */}
          <div className="flex flex-col gap-3">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="all" className="flex-1 sm:flex-none">Todas</TabsTrigger>
                  <TabsTrigger value="pending" className="flex-1 sm:flex-none whitespace-nowrap">Pendientes</TabsTrigger>
                  <TabsTrigger value="approved" className="flex-1 sm:flex-none whitespace-nowrap">Aprobadas</TabsTrigger>
                  <TabsTrigger value="rejected" className="flex-1 sm:flex-none whitespace-nowrap">Rechazadas</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Vista Mobile: Cards */}
          <div className="block lg:hidden space-y-3">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron solicitudes
              </div>
            ) : (
              filteredRequests.map((request) => (
                <Card key={request.id} className="p-4">
                  <div className="space-y-3">
                    {/* Nombre y Tipo */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">
                          {request.requester_role === 'freemium_talent' || request.requester_role === 'premium_talent'
                            ? request.contact_name
                            : request.company_name
                          }
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {request.requester_role === 'freemium_talent' || request.requester_role === 'premium_talent' ? 'Talento' : 'Empresa'}
                        </p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground break-all">{request.contact_email}</p>
                    </div>

                    {/* Servicio y Fecha */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <Badge variant="outline">{request.service_type}</Badge>
                      <span className="text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(request)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                      {request.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(request.id)}
                            className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Aprobar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(request.id)}
                            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Rechazar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Vista Desktop: Tabla */}
          <div className="hidden lg:block rounded-md border">
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
        onCreateService={handleCreateService}
      />
    </div>
  );
};
