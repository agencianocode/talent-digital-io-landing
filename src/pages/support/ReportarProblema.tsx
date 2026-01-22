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
  Loader2,
  Sparkles
} from 'lucide-react';

interface BugReport {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  status: string;
  created_at: string;
  user_id: string;
  profile_name?: string | null;
  profile_avatar?: string | null;
  comments_count?: number;
}

interface Comment {
  id: string;
  content: string;
  is_admin_reply: boolean | null;
  created_at: string;
  user_id: string;
  profile_name?: string | null;
  profile_avatar?: string | null;
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

const ReportarProblema = () => {
  const [searchParams, setSearchParams] = useSearchParams();
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
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
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
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user ids to fetch profiles
      const userIds = [...new Set((data || []).map(r => r.user_id))];
      
      // Fetch profiles separately
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);
      
      const profilesMap = new Map(
        (profilesData || []).map(p => [p.user_id, p])
      );

      // Get comment counts
      const reportsWithCounts = await Promise.all(
        (data || []).map(async (report) => {
          const { count } = await supabase
            .from('bug_report_comments')
            .select('*', { count: 'exact', head: true })
            .eq('bug_report_id', report.id);
          
          const userProfile = profilesMap.get(report.user_id);
          
          return { 
            ...report, 
            comments_count: count || 0,
            profile_name: userProfile?.full_name || null,
            profile_avatar: userProfile?.avatar_url || null
          };
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
        .select('*')
        .eq('id', id)
        .single();

      if (reportError) throw reportError;

      // Fetch profile for the report owner
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('user_id', reportData.user_id)
        .single();

      setSelectedReport({
        ...reportData,
        profile_name: profileData?.full_name || null,
        profile_avatar: profileData?.avatar_url || null
      } as BugReport);

      // Load comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('bug_report_comments')
        .select('*')
        .eq('bug_report_id', id)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      // Fetch profiles for comments
      const commentUserIds = [...new Set((commentsData || []).map(c => c.user_id))];
      const { data: commentProfilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', commentUserIds);
      
      const commentProfilesMap = new Map(
        (commentProfilesData || []).map(p => [p.user_id, p])
      );

      const commentsWithProfiles = (commentsData || []).map(comment => {
        const commentProfile = commentProfilesMap.get(comment.user_id);
        return {
          ...comment,
          profile_name: commentProfile?.full_name || null,
          profile_avatar: commentProfile?.avatar_url || null
        };
      });

      setComments(commentsWithProfiles as Comment[]);

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

      // Trigger automated admin comment after 1 minute
      try {
        await supabase.functions.invoke('auto-bug-report-comment', {
          body: { bug_report_id: data.id }
        });
      } catch (fnError) {
        console.error('Error triggering auto-comment:', fnError);
        // Don't fail the report creation if the auto-comment fails
      }

      setIsCreateOpen(false);
      setCreateForm({ title: '', description: '', image_url: '' });
      setIsSuccessOpen(true);
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

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Render report detail
  if (selectedReport) {
    const statusInfo = statusLabels[selectedReport.status] || statusLabels.open;

    return (
      <SupportPageLayout title="TalentoDigital.io Reportes de Problemas">
        <div className="max-w-4xl mx-auto px-2 sm:px-0">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => setSearchParams({})}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a reportes
          </Button>

          <Card className="mb-6">
            <CardHeader className="pb-3">
              {/* Mobile: Stack vertically */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex flex-col gap-1 mb-2">
                    <Badge className={`w-fit ${statusInfo?.color ?? 'bg-gray-100 text-gray-700'}`}>
                      {statusInfo?.label ?? 'Abierto'}
                    </Badge>
                    {statusInfo?.helperText && (
                      <p className="text-xs text-muted-foreground">
                        {statusInfo.helperText}
                      </p>
                    )}
                  </div>
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
                    <span className="hidden sm:inline">•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs sm:text-sm">{new Date(selectedReport.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant={isSubscribed ? "default" : "outline"}
                  size="sm"
                  onClick={toggleSubscription}
                  disabled={loadingSubscription}
                  className="w-full sm:w-auto flex-shrink-0"
                >
                  {loadingSubscription ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isSubscribed ? (
                    <>
                      <Bell className="h-4 w-4 mr-2" />
                      Recibir actualizaciones
                    </>
                  ) : (
                    <>
                      <BellOff className="h-4 w-4 mr-2" />
                      Recibir actualizaciones
                    </>
                  )}
                </Button>
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

          {/* Comments */}
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
      <div className="max-w-4xl mx-auto px-2 sm:px-0">
        {/* Header with title and button */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Reportar un Problema</h2>
            <p className="text-sm text-muted-foreground">
              TalentoDigital está en crecimiento y tu ayuda es clave. Si algo no funciona como esperabas, reportalo acá.
            </p>
          </div>
          
          {/* Desktop button */}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="hidden sm:flex">
                <Plus className="h-4 w-4 mr-2" />
                Reportar problema
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Reportar un problema</DialogTitle>
                <p className="text-sm text-muted-foreground pt-1">
                  Tu reporte nos ayuda a mejorar la plataforma.
                </p>
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
                  <Label htmlFor="image_url">URL de imagen (opcional)</Label>
                  <Input
                    id="image_url"
                    placeholder="https://..."
                    value={createForm.image_url}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, image_url: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Una captura de pantalla nos ayuda a resolverlo más rápido
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateReport} disabled={creating}>
                  {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Reportar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Mobile button - below subtitle */}
        <Button 
          className="w-full mb-4 sm:hidden"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Reportar problema
        </Button>

        {/* Success Modal */}
        <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>¡Problema reportado!</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-muted-foreground">
                Tu problema fue reportado y recibirás correos de actualización una vez el equipo de soporte lo revise.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsSuccessOpen(false)}>
                Entendido
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : reports.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Sparkles className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">No hay reportes todavía.</p>
              <p className="text-sm text-muted-foreground mb-4">Si encontrás algo raro, ayudanos a mejorarlo 🙌</p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Reportar un problema
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {/* Show encouraging message when few reports */}
            {reports.length <= 3 && (
              <Card className="bg-muted/30 border-dashed">
                <CardContent className="py-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    No hay muchos reportes todavía. Si encontrás algo raro, ayudanos a mejorarlo 🙌
                  </p>
                </CardContent>
              </Card>
            )}
            
            {reports.map(report => {
              const statusInfo = statusLabels[report.status] ?? statusLabels.open;
              return (
                <Card 
                  key={report.id}
                  className="hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => setSearchParams({ id: report.id })}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`text-xs ${statusInfo?.color ?? 'bg-gray-100 text-gray-700'}`}>
                            {statusInfo?.label ?? 'Abierto'}
                          </Badge>
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
