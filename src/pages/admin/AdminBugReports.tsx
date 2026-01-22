import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  Search, 
  Bug,
  MessageSquare,
  Send,
  ArrowLeft,
  Clock,
  MoreVertical,
  Trash2,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface BugReport {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string | null;
  category_id: string | null;
  image_url: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  profile_name: string | null;
  profile_avatar: string | null;
  comments_count: number;
}

interface Comment {
  id: string;
  content: string;
  user_id: string;
  is_admin_reply: boolean | null;
  created_at: string;
  profile_name: string | null;
  profile_avatar: string | null;
}

const statusLabels: Record<string, { label: string; color: string; helperText?: string }> = {
  open: { 
    label: 'Abierto', 
    color: 'bg-blue-100 text-blue-700',
    helperText: 'Estamos al tanto del problema y lo vamos a revisar.'
  },
  reviewing: { 
    label: 'En revisión', 
    color: 'bg-yellow-100 text-yellow-700',
    helperText: 'El equipo está analizando este problema.'
  },
  in_review: { 
    label: 'En revisión', 
    color: 'bg-yellow-100 text-yellow-700',
    helperText: 'El equipo está analizando este problema.'
  },
  in_progress: { 
    label: 'En progreso', 
    color: 'bg-purple-100 text-purple-700',
    helperText: 'Estamos trabajando activamente en resolver este problema.'
  },
  resolved: { 
    label: 'Resuelto', 
    color: 'bg-green-100 text-green-700',
    helperText: 'Este problema ha sido resuelto.'
  },
  closed: { 
    label: 'Cerrado', 
    color: 'bg-gray-100 text-gray-700',
    helperText: 'Este reporte ha sido cerrado.'
  },
};

const priorityOptions = [
  { value: 'low', label: 'Baja', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Media', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Crítica', color: 'bg-red-100 text-red-800' },
];

const AdminBugReports: React.FC = () => {
  const { user, profile } = useSupabaseAuth();
  const [reports, setReports] = useState<BugReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  
  // Detail view state
  const [selectedReport, setSelectedReport] = useState<BugReport | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation
  const [deleteReportId, setDeleteReportId] = useState<string | null>(null);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      
      const { data: reportsData, error } = await supabase
        .from('bug_reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const userIds = [...new Set((reportsData || []).map(r => r.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);
      
      const profilesMap = new Map((profilesData || []).map(p => [p.user_id, p]));
      
      const reportsWithData = await Promise.all((reportsData || []).map(async (report) => {
        const { count } = await supabase
          .from('bug_report_comments')
          .select('*', { count: 'exact', head: true })
          .eq('bug_report_id', report.id);
        
        const userProfile = profilesMap.get(report.user_id);
        
        return {
          ...report,
          profile_name: userProfile?.full_name || null,
          profile_avatar: userProfile?.avatar_url || null,
          comments_count: count || 0,
        };
      }));
      
      setReports(reportsWithData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los reportes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadComments = useCallback(async (reportId: string) => {
    try {
      const { data, error } = await supabase
        .from('bug_report_comments')
        .select('*')
        .eq('bug_report_id', reportId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      const userIds = [...new Set((data || []).map(c => c.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);
      
      const profilesMap = new Map((profilesData || []).map(p => [p.user_id, p]));
      
      const commentsWithProfiles = (data || []).map(comment => {
        const userProfile = profilesMap.get(comment.user_id);
        return {
          ...comment,
          profile_name: userProfile?.full_name || null,
          profile_avatar: userProfile?.avatar_url || null,
        };
      });
      
      setComments(commentsWithProfiles);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (selectedReport) {
      loadComments(selectedReport.id);
    }
  }, [selectedReport, loadComments]);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          report.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || report.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bug_reports')
        .update({ status: newStatus })
        .eq('id', reportId);
      
      if (error) throw error;
      
      toast.success('Estado actualizado');
      loadData();
      
      if (selectedReport?.id === reportId) {
        setSelectedReport(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const handlePriorityChange = async (reportId: string, newPriority: string) => {
    try {
      const { error } = await supabase
        .from('bug_reports')
        .update({ priority: newPriority })
        .eq('id', reportId);
      
      if (error) throw error;
      
      toast.success('Prioridad actualizada');
      loadData();
      
      if (selectedReport?.id === reportId) {
        setSelectedReport(prev => prev ? { ...prev, priority: newPriority } : null);
      }
    } catch (error) {
      console.error('Error updating priority:', error);
      toast.error('Error al actualizar la prioridad');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedReport || !user) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('bug_report_comments')
        .insert({
          bug_report_id: selectedReport.id,
          user_id: user.id,
          content: newComment.trim(),
          is_admin_reply: true,
        });
      
      if (error) throw error;
      
      setNewComment('');
      toast.success('Comentario agregado');
      loadComments(selectedReport.id);
      loadData();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Error al agregar el comentario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!deleteReportId) return;
    
    try {
      // Delete comments first
      await supabase
        .from('bug_report_comments')
        .delete()
        .eq('bug_report_id', deleteReportId);
      
      // Delete subscriptions
      await supabase
        .from('bug_report_subscriptions')
        .delete()
        .eq('bug_report_id', deleteReportId);
      
      // Delete the report
      const { error } = await supabase
        .from('bug_reports')
        .delete()
        .eq('id', deleteReportId);
      
      if (error) throw error;
      
      toast.success('Reporte eliminado');
      setDeleteReportId(null);
      setSelectedReport(null);
      loadData();
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Error al eliminar el reporte');
    }
  };

  const handleDeleteComment = async () => {
    if (!deleteCommentId || !selectedReport) return;
    
    try {
      const { error } = await supabase
        .from('bug_report_comments')
        .delete()
        .eq('id', deleteCommentId);
      
      if (error) throw error;
      
      toast.success('Comentario eliminado');
      setDeleteCommentId(null);
      loadComments(selectedReport.id);
      loadData();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Error al eliminar el comentario');
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getStatusInfo = (status: string) => {
    return statusLabels[status] || statusLabels.open;
  };

  const getPriorityInfo = (priority: string | null) => {
    return priorityOptions.find(p => p.value === priority) || null;
  };

  // Detail view - matching user view style
  if (selectedReport) {
    const statusInfo = getStatusInfo(selectedReport.status);
    const priorityInfo = getPriorityInfo(selectedReport.priority);

    return (
      <div className="space-y-6 max-w-4xl">
        <Button variant="ghost" onClick={() => setSelectedReport(null)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a la lista
        </Button>

        {/* Report Card - matching user view */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge className={statusInfo?.color ?? 'bg-gray-100 text-gray-700'}>
                    {statusInfo?.label ?? 'Abierto'}
                  </Badge>
                  {priorityInfo && (
                    <Badge className={priorityInfo.color}>{priorityInfo.label}</Badge>
                  )}
                </div>
                {statusInfo?.helperText && (
                  <p className="text-sm text-muted-foreground mb-2">{statusInfo.helperText}</p>
                )}
                <CardTitle className="text-lg sm:text-xl">{selectedReport.title}</CardTitle>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                      <AvatarImage src={selectedReport.profile_avatar || undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(selectedReport.profile_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs sm:text-sm">{selectedReport.profile_name || 'Usuario'}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs sm:text-sm">{new Date(selectedReport.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              {/* Admin controls */}
              <div className="flex items-center gap-2">
                <Select value={selectedReport.status} onValueChange={(v) => handleStatusChange(selectedReport.id, v)}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([value, info]) => (
                      <SelectItem key={value} value={value}>{info.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedReport.priority || ''} onValueChange={(v) => handlePriorityChange(selectedReport.id, v)}>
                  <SelectTrigger className="w-[110px]">
                    <SelectValue placeholder="Prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => setDeleteReportId(selectedReport.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar reporte
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm sm:text-base">{selectedReport.description}</p>
            {selectedReport.image_url && (
              <div className="mt-4">
                <img 
                  src={selectedReport.image_url} 
                  alt="Imagen del reporte"
                  className="max-w-full rounded-lg border"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comments Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
              Comentarios ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-4 text-sm">
                No hay comentarios aún
              </p>
            ) : (
              <div className="space-y-4">
                {comments.map(comment => (
                  <div 
                    key={comment.id}
                    className={`flex gap-2 sm:gap-3 ${comment.is_admin_reply ? 'bg-primary/5 -mx-4 px-4 py-3 rounded-lg' : ''}`}
                  >
                    <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
                      <AvatarImage src={comment.profile_avatar || undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(comment.profile_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                        <span className="font-medium text-xs sm:text-sm">
                          {comment.profile_name || 'Usuario'}
                        </span>
                        {comment.is_admin_reply && (
                          <Badge variant="default" className="text-[10px] sm:text-xs">Equipo de Talento Digital</Badge>
                        )}
                        <span className="text-[10px] sm:text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => setDeleteCommentId(comment.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}

            {/* Add comment */}
            <div className="border-t pt-4 mt-4">
              <div className="flex gap-2 sm:gap-3">
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(profile?.full_name || null)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Escribe un comentario..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className="text-sm"
                  />
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleAddComment}
                      disabled={isSubmitting || !newComment.trim()}
                      size="sm"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Comentar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delete Report Confirmation */}
        <AlertDialog open={!!deleteReportId} onOpenChange={() => setDeleteReportId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar reporte?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminarán también todos los comentarios asociados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteReport} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Comment Confirmation */}
        <AlertDialog open={!!deleteCommentId} onOpenChange={() => setDeleteCommentId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar comentario?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteComment} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reportes de Problemas</h1>
        <p className="text-muted-foreground">Gestiona los reportes de problemas de los usuarios</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar reportes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Object.entries(statusLabels).map(([value, info]) => (
                  <SelectItem key={value} value={value}>{info.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {priorityOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports List - matching user view card style */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredReports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bug className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay reportes que mostrar</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredReports.map(report => {
            const statusInfo = getStatusInfo(report.status);
            const priorityInfo = getPriorityInfo(report.priority);
            
            return (
              <Card 
                key={report.id}
                className="hover:border-primary/50 transition-colors"
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex gap-3 sm:gap-4">
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => setSelectedReport(report)}
                    >
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge className={`text-xs ${statusInfo?.color ?? 'bg-gray-100 text-gray-700'}`}>
                          {statusInfo?.label ?? 'Abierto'}
                        </Badge>
                        {priorityInfo && (
                          <Badge className={`text-xs ${priorityInfo.color}`}>{priorityInfo.label}</Badge>
                        )}
                      </div>
                      <h3 className="font-medium text-sm sm:text-base truncate">{report.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Avatar className="h-4 w-4 sm:h-5 sm:w-5">
                            <AvatarImage src={report.profile_avatar || undefined} />
                            <AvatarFallback className="text-[10px] sm:text-xs">
                              {getInitials(report.profile_name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="hidden sm:inline">{report.profile_name || 'Usuario'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{report.comments_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{new Date(report.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="flex-shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => setDeleteReportId(report.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Report Confirmation */}
      <AlertDialog open={!!deleteReportId} onOpenChange={() => setDeleteReportId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar reporte?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán también todos los comentarios asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReport} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminBugReports;
