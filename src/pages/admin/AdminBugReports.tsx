import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Bug,
  MessageSquare,
  Send,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

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

interface Category {
  id: string;
  name: string;
}

const statusOptions = [
  { value: 'open', label: 'Abierto', icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'in_review', label: 'En revisión', icon: Clock, color: 'bg-blue-100 text-blue-800' },
  { value: 'in_progress', label: 'En progreso', icon: Clock, color: 'bg-purple-100 text-purple-800' },
  { value: 'resolved', label: 'Resuelto', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  { value: 'closed', label: 'Cerrado', icon: XCircle, color: 'bg-gray-100 text-gray-800' },
];

const priorityOptions = [
  { value: 'low', label: 'Baja', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Media', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Crítica', color: 'bg-red-100 text-red-800' },
];

const AdminBugReports: React.FC = () => {
  const { user } = useSupabaseAuth();
  const [reports, setReports] = useState<BugReport[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  
  // Detail view state
  const [selectedReport, setSelectedReport] = useState<BugReport | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load categories
      const { data: categoriesData } = await supabase
        .from('bug_report_categories')
        .select('id, name')
        .eq('is_active', true);
      
      setCategories(categoriesData || []);
      
      // Load reports with comments count
      const { data: reportsData, error } = await supabase
        .from('bug_reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Get unique user IDs and fetch profiles
      const userIds = [...new Set((reportsData || []).map(r => r.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);
      
      const profilesMap = new Map((profilesData || []).map(p => [p.user_id, p]));
      
      // Get comments count for each report
      const reportsWithData = await Promise.all((reportsData || []).map(async (report) => {
        const { count } = await supabase
          .from('bug_report_comments')
          .select('*', { count: 'exact', head: true })
          .eq('bug_report_id', report.id);
        
        const profile = profilesMap.get(report.user_id);
        
        return {
          ...report,
          profile_name: profile?.full_name || null,
          profile_avatar: profile?.avatar_url || null,
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
      
      // Get profiles for commenters
      const userIds = [...new Set((data || []).map(c => c.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);
      
      const profilesMap = new Map((profilesData || []).map(p => [p.user_id, p]));
      
      const commentsWithProfiles = (data || []).map(comment => {
        const profile = profilesMap.get(comment.user_id);
        return {
          ...comment,
          profile_name: profile?.full_name || null,
          profile_avatar: profile?.avatar_url || null,
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

  const getStatusInfo = (status: string) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };

  const getPriorityInfo = (priority: string | null) => {
    return priorityOptions.find(p => p.value === priority) || null;
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return null;
    return categories.find(c => c.id === categoryId)?.name || null;
  };

  // Detail view
  if (selectedReport) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setSelectedReport(null)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a la lista
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl">{selectedReport.title}</CardTitle>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={selectedReport.profile_avatar || undefined} />
                    <AvatarFallback>{selectedReport.profile_name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <span>{selectedReport.profile_name || 'Usuario'}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(selectedReport.created_at), { addSuffix: true, locale: es })}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedReport.status} onValueChange={(v) => handleStatusChange(selectedReport.id, v)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedReport.priority || ''} onValueChange={(v) => handlePriorityChange(selectedReport.id, v)}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-2">Descripción</h4>
              <p className="text-muted-foreground whitespace-pre-wrap">{selectedReport.description}</p>
            </div>
            
            {selectedReport.image_url && (
              <div>
                <h4 className="font-medium mb-2">Imagen adjunta</h4>
                <img 
                  src={selectedReport.image_url} 
                  alt="Captura del problema" 
                  className="max-w-md rounded-lg border"
                />
              </div>
            )}

            <div className="border-t pt-6">
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Comentarios ({comments.length})
              </h4>
              
              <div className="space-y-4 mb-4">
                {comments.map(comment => (
                  <div key={comment.id} className={`flex gap-3 ${comment.is_admin_reply ? 'ml-8' : ''}`}>
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={comment.profile_avatar || undefined} />
                      <AvatarFallback>{comment.profile_name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{comment.profile_name || 'Usuario'}</span>
                        {comment.is_admin_reply && (
                          <Badge variant="secondary" className="text-xs">Admin</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: es })}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escribe un comentario..."
                  className="flex-1"
                />
                <Button onClick={handleAddComment} disabled={!newComment.trim() || isSubmitting}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                {statusOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
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

      {/* Reports List */}
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
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
            const reportStatusInfo = getStatusInfo(report.status);
            const priorityInfo = getPriorityInfo(report.priority);
            const categoryName = getCategoryName(report.category_id);
            const StatusIcon = reportStatusInfo?.icon || AlertTriangle;
            
            return (
              <Card 
                key={report.id} 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedReport(report)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="font-medium">{report.title}</h3>
                        <Badge className={reportStatusInfo?.color || 'bg-gray-100 text-gray-800'}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {reportStatusInfo?.label || report.status}
                        </Badge>
                        {priorityInfo && (
                          <Badge className={priorityInfo.color}>
                            {priorityInfo.label}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {report.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={report.profile_avatar || undefined} />
                            <AvatarFallback className="text-xs">{report.profile_name?.[0] || 'U'}</AvatarFallback>
                          </Avatar>
                          <span>{report.profile_name || 'Usuario'}</span>
                        </div>
                        {categoryName && <span>• {categoryName}</span>}
                        <span>• {formatDistanceToNow(new Date(report.created_at), { addSuffix: true, locale: es })}</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {report.comments_count}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminBugReports;
