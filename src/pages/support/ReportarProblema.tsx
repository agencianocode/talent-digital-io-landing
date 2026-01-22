import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SupportPageLayout from '@/components/support/SupportPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from 'sonner';
import { 
  Plus, 
  MessageSquare, 
  ArrowLeft, 
  Clock,
  Send,
  Bell,
  BellOff,
  Loader2
} from 'lucide-react';

interface BugReport {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  status: string;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  comments_count?: number;
}

interface Comment {
  id: string;
  content: string;
  is_admin_reply: boolean;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

const statusLabels: Record<string, { label: string; color: string }> = {
  open: { label: 'Abierto', color: 'bg-blue-100 text-blue-700' },
  reviewing: { label: 'En revisión', color: 'bg-yellow-100 text-yellow-700' },
  in_progress: { label: 'En progreso', color: 'bg-purple-100 text-purple-700' },
  resolved: { label: 'Resuelto', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Cerrado', color: 'bg-gray-100 text-gray-700' },
};

const ReportarProblema = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile } = useSupabaseAuth();
  
  const [reports, setReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<BugReport | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loadingSubscription, setLoadingSubscription] = useState(false);

  // Create report dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    image_url: ''
  });
  const [creating, setCreating] = useState(false);

  const reportId = searchParams.get('id');

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    if (reportId) {
      loadReportDetail(reportId);
    } else {
      setSelectedReport(null);
      setComments([]);
    }
  }, [reportId]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bug_reports')
        .select(`
          *,
          profiles:user_id (full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get comment counts
      const reportsWithCounts = await Promise.all(
        (data || []).map(async (report) => {
          const { count } = await supabase
            .from('bug_report_comments')
            .select('*', { count: 'exact', head: true })
            .eq('bug_report_id', report.id);
          return { ...report, comments_count: count || 0 };
        })
      );

      setReports(reportsWithCounts as BugReport[]);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Error cargando los reportes');
    } finally {
      setLoading(false);
    }
  };

  const loadReportDetail = async (id: string) => {
    try {
      // Load report
      const { data: reportData, error: reportError } = await supabase
        .from('bug_reports')
        .select(`
          *,
          profiles:user_id (full_name, avatar_url)
        `)
        .eq('id', id)
        .single();

      if (reportError) throw reportError;
      setSelectedReport(reportData as BugReport);

      // Load comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('bug_report_comments')
        .select(`
          *,
          profiles:user_id (full_name, avatar_url)
        `)
        .eq('bug_report_id', id)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;
      setComments((commentsData || []) as Comment[]);

      // Check subscription
      if (user) {
        const { data: subData } = await supabase
          .from('bug_report_subscriptions')
          .select('id')
          .eq('bug_report_id', id)
          .eq('user_id', user.id)
          .maybeSingle();
        
        setIsSubscribed(!!subData);
      }
    } catch (error) {
      console.error('Error loading report:', error);
      toast.error('Reporte no encontrado');
      setSearchParams({});
    }
  };

  const handleCreateReport = async () => {
    if (!user || !createForm.title.trim() || !createForm.description.trim()) {
      toast.error('Por favor completa el título y la descripción');
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('bug_reports')
        .insert({
          title: createForm.title.trim(),
          description: createForm.description.trim(),
          image_url: createForm.image_url || null,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-subscribe
      await supabase
        .from('bug_report_subscriptions')
        .insert({
          bug_report_id: data.id,
          user_id: user.id
        });

      toast.success('Problema reportado exitosamente');
      setIsCreateOpen(false);
      setCreateForm({ title: '', description: '', image_url: '' });
      setSearchParams({ id: data.id });
      loadReports();
    } catch (error) {
      console.error('Error creating report:', error);
      toast.error('Error al crear el reporte');
    } finally {
      setCreating(false);
    }
  };

  const handleComment = async () => {
    if (!user || !selectedReport || !newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const { error } = await supabase
        .from('bug_report_comments')
        .insert({
          bug_report_id: selectedReport.id,
          user_id: user.id,
          content: newComment.trim(),
          is_admin_reply: false
        });

      if (error) throw error;

      // Auto-subscribe on comment
      if (!isSubscribed) {
        await supabase
          .from('bug_report_subscriptions')
          .upsert({
            bug_report_id: selectedReport.id,
            user_id: user.id
          }, { onConflict: 'bug_report_id,user_id' });
        setIsSubscribed(true);
      }

      setNewComment('');
      loadReportDetail(selectedReport.id);
      toast.success('Comentario agregado');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Error al agregar comentario');
    } finally {
      setSubmittingComment(false);
    }
  };

  const toggleSubscription = async () => {
    if (!user || !selectedReport) return;

    setLoadingSubscription(true);
    try {
      if (isSubscribed) {
        await supabase
          .from('bug_report_subscriptions')
          .delete()
          .eq('bug_report_id', selectedReport.id)
          .eq('user_id', user.id);
        setIsSubscribed(false);
        toast.success('Ya no recibirás actualizaciones de este reporte');
      } else {
        await supabase
          .from('bug_report_subscriptions')
          .insert({
            bug_report_id: selectedReport.id,
            user_id: user.id
          });
        setIsSubscribed(true);
        toast.success('Recibirás actualizaciones de este reporte');
      }
    } catch (error) {
      console.error('Error toggling subscription:', error);
      toast.error('Error al cambiar la suscripción');
    } finally {
      setLoadingSubscription(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Render report detail
  if (selectedReport) {
    const status = statusLabels[selectedReport.status] || statusLabels.open;

    return (
      <SupportPageLayout title="TalentoDigital.io Reportes de Problemas">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => setSearchParams({})}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a reportes
          </Button>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={status.color}>{status.label}</Badge>
                  </div>
                  <CardTitle className="text-xl">{selectedReport.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={selectedReport.profiles?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(selectedReport.profiles?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{selectedReport.profiles?.full_name || 'Usuario'}</span>
                    <span>•</span>
                    <Clock className="h-3 w-3" />
                    <span>{new Date(selectedReport.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSubscription}
                  disabled={loadingSubscription}
                  className="flex-shrink-0"
                >
                  {loadingSubscription ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isSubscribed ? (
                    <>
                      <Bell className="h-4 w-4 mr-2" />
                      Suscrito
                    </>
                  ) : (
                    <>
                      <BellOff className="h-4 w-4 mr-2" />
                      Suscribirse
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{selectedReport.description}</p>
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

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comentarios ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No hay comentarios aún
                </p>
              ) : (
                <div className="space-y-4">
                  {comments.map(comment => (
                    <div 
                      key={comment.id}
                      className={`flex gap-3 ${comment.is_admin_reply ? 'bg-primary/5 -mx-4 px-4 py-3 rounded-lg' : ''}`}
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {getInitials(comment.profiles?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {comment.profiles?.full_name || 'Usuario'}
                          </span>
                          {comment.is_admin_reply && (
                            <Badge variant="default" className="text-xs">Admin</Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add comment */}
              <div className="border-t pt-4 mt-4">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
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
                    />
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleComment}
                        disabled={submittingComment || !newComment.trim()}
                        size="sm"
                      >
                        {submittingComment ? (
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
        </div>
      </SupportPageLayout>
    );
  }

  // Render reports list
  return (
    <SupportPageLayout title="TalentoDigital.io Reportes de Problemas">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Reportar un Problema</h2>
            <p className="text-muted-foreground">
              Informanos sobre errores o fallos técnicos
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Reportar problema
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Reportar un problema</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    placeholder="Describe brevemente el problema"
                    value={createForm.title}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe en detalle qué pasó, qué esperabas que pasara y los pasos para reproducir el problema"
                    value={createForm.description}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">URL de imagen (opcional)</Label>
                  <Input
                    id="image"
                    placeholder="https://..."
                    value={createForm.image_url}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, image_url: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Puedes subir una captura a un servicio como imgur.com y pegar el link aquí
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateReport} disabled={creating}>
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reportar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : reports.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No hay reportes de problemas aún. ¡Sé el primero en reportar uno!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {reports.map(report => {
              const status = statusLabels[report.status] || statusLabels.open;
              
              return (
                <Card 
                  key={report.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSearchParams({ id: report.id })}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={status.color}>{status.label}</Badge>
                        </div>
                        <h3 className="font-medium truncate">{report.title}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            <span>{report.comments_count || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(report.created_at).toLocaleDateString()}</span>
                          </div>
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
    </SupportPageLayout>
  );
};

export default ReportarProblema;
