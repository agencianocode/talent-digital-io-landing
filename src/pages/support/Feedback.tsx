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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip } from '@/components/ui/tooltip';
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
  ChevronUp
} from 'lucide-react';

interface FeedbackCategory {
  id: string;
  name: string;
}

interface Suggestion {
  id: string;
  title: string;
  description: string;
  status: string;
  votes_count: number;
  created_at: string;
  user_id: string;
  category_id: string | null;
  category?: FeedbackCategory | null;
  profile_name?: string | null;
  profile_avatar?: string | null;
  comments_count?: number;
  has_voted?: boolean;
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
  new: { label: 'Nueva', color: 'bg-blue-100 text-blue-700', helperText: 'El equipo aún no la revisó' },
  reviewing: { label: 'En revisión', color: 'bg-yellow-100 text-yellow-700', helperText: 'Estamos evaluando esta sugerencia' },
  planned: { label: 'Planeada', color: 'bg-purple-100 text-purple-700', helperText: 'Esta mejora entra en nuestro roadmap' },
  in_development: { label: 'En desarrollo', color: 'bg-orange-100 text-orange-700' },
  implemented: { label: 'Implementada', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rechazada', color: 'bg-gray-100 text-gray-700' },
};

const Feedback = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile } = useSupabaseAuth();
  
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loadingSubscription, setLoadingSubscription] = useState(false);

  // Create suggestion dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    category_id: ''
  });
  const [creating, setCreating] = useState(false);

  const suggestionId = searchParams.get('id');

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    if (suggestionId) {
      loadSuggestionDetail(suggestionId);
    } else {
      setSelectedSuggestion(null);
      setComments([]);
    }
  }, [suggestionId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: suggestionsData, error: suggestionsError } = await supabase
        .from('feedback_suggestions')
        .select(`
          *,
          feedback_categories:category_id (id, name)
        `)
        .order('votes_count', { ascending: false });

      if (suggestionsError) throw suggestionsError;

      // Get user ids to fetch profiles
      const userIds = [...new Set((suggestionsData || []).map((s: any) => s.user_id))];
      
      // Fetch profiles separately
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);
      
      const profilesMap = new Map(
        (profilesData || []).map(p => [p.user_id, p])
      );

      // Get comment counts and user votes
      const suggestionsWithData = await Promise.all(
        (suggestionsData || []).map(async (suggestion: any) => {
          const [commentsRes, voteRes] = await Promise.all([
            supabase
              .from('feedback_comments')
              .select('*', { count: 'exact', head: true })
              .eq('suggestion_id', suggestion.id),
            user ? supabase
              .from('feedback_votes')
              .select('id')
              .eq('suggestion_id', suggestion.id)
              .eq('user_id', user.id)
              .maybeSingle() : Promise.resolve({ data: null })
          ]);
          
          const userProfile = profilesMap.get(suggestion.user_id);
          
          return { 
            ...suggestion, 
            category: suggestion.feedback_categories,
            comments_count: commentsRes.count || 0,
            has_voted: !!voteRes.data,
            profile_name: userProfile?.full_name || null,
            profile_avatar: userProfile?.avatar_url || null
          };
        })
      );

      setSuggestions(suggestionsWithData as Suggestion[]);
    } catch (error) {
      console.error('Error loading feedback data:', error);
      toast.error('Error cargando las sugerencias');
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestionDetail = async (id: string) => {
    try {
      // Load suggestion
      const { data: suggestionData, error: suggestionError } = await supabase
        .from('feedback_suggestions')
        .select(`
          *,
          feedback_categories:category_id (id, name)
        `)
        .eq('id', id)
        .single();

      if (suggestionError) throw suggestionError;

      // Fetch profile for the suggestion owner
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('user_id', suggestionData.user_id)
        .single();

      // Check user vote
      let hasVoted = false;
      if (user) {
        const { data: voteData } = await supabase
          .from('feedback_votes')
          .select('id')
          .eq('suggestion_id', id)
          .eq('user_id', user.id)
          .maybeSingle();
        hasVoted = !!voteData;
      }

      setSelectedSuggestion({
        ...suggestionData,
        category: suggestionData.feedback_categories,
        has_voted: hasVoted,
        profile_name: profileData?.full_name || null,
        profile_avatar: profileData?.avatar_url || null
      } as Suggestion);

      // Load comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('feedback_comments')
        .select('*')
        .eq('suggestion_id', id)
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
          .from('feedback_subscriptions')
          .select('id')
          .eq('suggestion_id', id)
          .eq('user_id', user.id)
          .maybeSingle();
        
        setIsSubscribed(!!subData);
      }
    } catch (error) {
      console.error('Error loading suggestion:', error);
      toast.error('Sugerencia no encontrada');
      setSearchParams({});
    }
  };

  const handleCreateSuggestion = async () => {
    if (!user || !createForm.title.trim() || !createForm.description.trim()) {
      toast.error('Por favor completa el título y la descripción');
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('feedback_suggestions')
        .insert({
          title: createForm.title.trim(),
          description: createForm.description.trim(),
          category_id: createForm.category_id || null,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-vote own suggestion
      await supabase
        .from('feedback_votes')
        .insert({
          suggestion_id: data.id,
          user_id: user.id
        });

      // Auto-subscribe
      await supabase
        .from('feedback_subscriptions')
        .insert({
          suggestion_id: data.id,
          user_id: user.id
        });

      toast.success('Sugerencia creada exitosamente');
      setIsCreateOpen(false);
      setCreateForm({ title: '', description: '', category_id: '' });
      setSearchParams({ id: data.id });
      loadData();
    } catch (error) {
      console.error('Error creating suggestion:', error);
      toast.error('Error al crear la sugerencia');
    } finally {
      setCreating(false);
    }
  };

  const handleVote = async (suggestion: Suggestion, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!user) {
      toast.error('Debes iniciar sesión para votar');
      return;
    }

    try {
      if (suggestion.has_voted) {
        // Remove vote
        await supabase
          .from('feedback_votes')
          .delete()
          .eq('suggestion_id', suggestion.id)
          .eq('user_id', user.id);
        
        toast.success('Voto eliminado');
        
        // Update local state immediately
        setSuggestions(prev => prev.map(s => 
          s.id === suggestion.id 
            ? { ...s, has_voted: false, votes_count: Math.max(0, (s.votes_count || 0) - 1) }
            : s
        ));
        if (selectedSuggestion?.id === suggestion.id) {
          setSelectedSuggestion(prev => prev ? { 
            ...prev, 
            has_voted: false, 
            votes_count: Math.max(0, (prev.votes_count || 0) - 1) 
          } : null);
        }
      } else {
        // Add vote
        await supabase
          .from('feedback_votes')
          .insert({
            suggestion_id: suggestion.id,
            user_id: user.id
          });

        // Auto-subscribe on vote
        await supabase
          .from('feedback_subscriptions')
          .upsert({
            suggestion_id: suggestion.id,
            user_id: user.id
          }, { onConflict: 'suggestion_id,user_id' });
        
        toast.success(`Votaste por "${suggestion.title}"`);
        
        // Update local state immediately
        setSuggestions(prev => prev.map(s => 
          s.id === suggestion.id 
            ? { ...s, has_voted: true, votes_count: (s.votes_count || 0) + 1 }
            : s
        ));
        if (selectedSuggestion?.id === suggestion.id) {
          setSelectedSuggestion(prev => prev ? { 
            ...prev, 
            has_voted: true, 
            votes_count: (prev.votes_count || 0) + 1 
          } : null);
        }
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Error al votar');
    }
  };

  const handleComment = async () => {
    if (!user || !selectedSuggestion || !newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const { error } = await supabase
        .from('feedback_comments')
        .insert({
          suggestion_id: selectedSuggestion.id,
          user_id: user.id,
          content: newComment.trim(),
          is_admin_reply: false
        });

      if (error) throw error;

      // Auto-subscribe on comment
      if (!isSubscribed) {
        await supabase
          .from('feedback_subscriptions')
          .upsert({
            suggestion_id: selectedSuggestion.id,
            user_id: user.id
          }, { onConflict: 'suggestion_id,user_id' });
        setIsSubscribed(true);
      }

      setNewComment('');
      loadSuggestionDetail(selectedSuggestion.id);
      toast.success('Comentario agregado');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Error al agregar comentario');
    } finally {
      setSubmittingComment(false);
    }
  };

  const toggleSubscription = async () => {
    if (!user || !selectedSuggestion) return;

    setLoadingSubscription(true);
    try {
      if (isSubscribed) {
        await supabase
          .from('feedback_subscriptions')
          .delete()
          .eq('suggestion_id', selectedSuggestion.id)
          .eq('user_id', user.id);
        setIsSubscribed(false);
        toast.success('Ya no recibirás actualizaciones');
      } else {
        await supabase
          .from('feedback_subscriptions')
          .insert({
            suggestion_id: selectedSuggestion.id,
            user_id: user.id
          });
        setIsSubscribed(true);
        toast.success('Recibirás actualizaciones');
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

  // Render suggestion detail
  if (selectedSuggestion) {
    const statusInfo = statusLabels[selectedSuggestion.status] || statusLabels.new;

    return (
      <SupportPageLayout title="TalentoDigital.io Feedback">
        <div className="max-w-4xl mx-auto px-4 sm:px-0">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => setSearchParams({})}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a sugerencias
          </Button>

          <Card className="mb-6">
            <CardHeader className="p-4 sm:p-6">
              {/* Mobile layout */}
              <div className="flex flex-col gap-4 sm:hidden">
                <div className="flex items-start gap-3">
                  {/* Vote button with tooltip */}
                  <Tooltip content="Votar">
                    <Button
                      variant={selectedSuggestion.has_voted ? "default" : "outline"}
                      size="sm"
                      className="flex flex-col h-auto py-2 px-4 min-w-[60px]"
                      onClick={() => handleVote(selectedSuggestion)}
                    >
                      <ChevronUp className="h-4 w-4" />
                      <span className="text-sm font-bold">{selectedSuggestion.votes_count}</span>
                      <span className="text-[10px] opacity-70">votos</span>
                    </Button>
                  </Tooltip>

                  <div className="flex-1">
                    <CardTitle className="text-lg">{selectedSuggestion.title}</CardTitle>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={statusInfo?.color ?? 'bg-gray-100 text-gray-700'}>{statusInfo?.label ?? 'Nueva'}</Badge>
                  {selectedSuggestion.category && (
                    <Badge variant="outline">{selectedSuggestion.category.name}</Badge>
                  )}
                </div>
                
                {statusInfo?.helperText && (
                  <p className="text-sm text-muted-foreground">{statusInfo.helperText}</p>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={selectedSuggestion.profile_avatar || undefined} />
                    <AvatarFallback className="text-xs">
                      {getInitials(selectedSuggestion.profile_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{selectedSuggestion.profile_name || 'Usuario'}</span>
                  <span>•</span>
                  <Clock className="h-3 w-3" />
                  <span>{new Date(selectedSuggestion.created_at).toLocaleDateString()}</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSubscription}
                  disabled={loadingSubscription}
                  className="w-full"
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

              {/* Desktop layout */}
              <div className="hidden sm:flex items-start justify-between gap-4">
                <div className="flex gap-4 flex-1">
                  {/* Vote button with tooltip */}
                  <Tooltip content="Votar">
                    <Button
                      variant={selectedSuggestion.has_voted ? "default" : "outline"}
                      size="sm"
                      className="flex flex-col h-auto py-2 px-4 min-w-[60px]"
                      onClick={() => handleVote(selectedSuggestion)}
                    >
                      <ChevronUp className="h-4 w-4" />
                      <span className="text-sm font-bold">{selectedSuggestion.votes_count}</span>
                      <span className="text-[10px] opacity-70">votos</span>
                    </Button>
                  </Tooltip>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge className={statusInfo?.color ?? 'bg-gray-100 text-gray-700'}>{statusInfo?.label ?? 'Nueva'}</Badge>
                      {selectedSuggestion.category && (
                        <Badge variant="outline">{selectedSuggestion.category.name}</Badge>
                      )}
                    </div>
                    {statusInfo?.helperText && (
                      <p className="text-sm text-muted-foreground mb-2">{statusInfo.helperText}</p>
                    )}
                    <CardTitle className="text-xl">{selectedSuggestion.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={selectedSuggestion.profile_avatar || undefined} />
                        <AvatarFallback className="text-xs">
                          {getInitials(selectedSuggestion.profile_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{selectedSuggestion.profile_name || 'Usuario'}</span>
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      <span>{new Date(selectedSuggestion.created_at).toLocaleDateString()}</span>
                    </div>
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
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <p className="whitespace-pre-wrap">{selectedSuggestion.description}</p>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comentarios ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
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
                        <AvatarImage src={comment.profile_avatar || undefined} />
                        <AvatarFallback className="text-xs">
                          {getInitials(comment.profile_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">
                            {comment.profile_name || 'Usuario'}
                          </span>
                          {comment.is_admin_reply && (
                            <Badge variant="default" className="text-xs">Admin</Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm mt-1 whitespace-pre-wrap break-words">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add comment */}
              <div className="border-t pt-4 mt-4">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0 hidden sm:flex">
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

  // Fixed category options for the modal
  const categoryOptions = [
    { id: 'nuevas-funcionalidades', name: 'Nuevas funcionalidades' },
    { id: 'mejora-experiencia', name: 'Mejora de experiencia' },
    { id: 'notificaciones-comunicacion', name: 'Notificaciones y comunicación' },
    { id: 'otros', name: 'Otros' },
  ];

  // Render suggestions list
  return (
    <SupportPageLayout title="TalentoDigital.io Feedback">
      <div className="max-w-4xl mx-auto px-4 sm:px-0">
        {/* Header - responsive */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold">Sugerencias de Mejora</h2>
            <p className="text-muted-foreground mt-1">
              Este espacio define el futuro de TalentoDigital. Votá ideas, comentá y proponé mejoras.
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              Leemos todas las sugerencias, aunque no todas puedan implementarse de inmediato.
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto flex-shrink-0">
                <Plus className="h-4 w-4 mr-2" />
                Sugerir mejora
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Sugerir una mejora</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    placeholder="Describe brevemente tu sugerencia"
                    value={createForm.title}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción *</Label>
                  <Textarea
                    id="description"
                    placeholder="Contanos qué te gustaría ver y por qué sería útil para vos"
                    value={createForm.description}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select
                    value={createForm.category_id}
                    onValueChange={(value) => setCreateForm(prev => ({ ...prev, category_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Elegí la categoría que mejor encaje" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="w-full sm:w-auto">
                  Cancelar
                </Button>
                <Button onClick={handleCreateSuggestion} disabled={creating} className="w-full sm:w-auto">
                  {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Crear sugerencia
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : suggestions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">No hay sugerencias aún</p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Sé el primero en sugerir
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {suggestions.map(suggestion => {
              const statusInfo = statusLabels[suggestion.status] ?? statusLabels.new;
              const showStatusBadge = suggestion.status !== 'new';
              return (
                <Card 
                  key={suggestion.id}
                  className="hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => setSearchParams({ id: suggestion.id })}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Vote button with tooltip */}
                      <Tooltip content="Votar">
                        <Button
                          variant={suggestion.has_voted ? "default" : "outline"}
                          size="sm"
                          className="flex flex-col h-auto py-2 px-4 min-w-[60px]"
                          onClick={(e) => handleVote(suggestion, e)}
                        >
                          <ChevronUp className="h-4 w-4" />
                          <span className="text-sm font-bold">{suggestion.votes_count ?? 0}</span>
                          <span className="text-[10px] opacity-70">votos</span>
                        </Button>
                      </Tooltip>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {showStatusBadge && (
                            <Badge className={statusInfo?.color ?? 'bg-gray-100 text-gray-700'}>{statusInfo?.label ?? 'Nueva'}</Badge>
                          )}
                          {suggestion.category && (
                            <Badge variant="outline">{suggestion.category.name}</Badge>
                          )}
                        </div>
                        <h3 className="font-medium truncate">{suggestion.title}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={suggestion.profile_avatar || undefined} />
                              <AvatarFallback className="text-xs">
                                {getInitials(suggestion.profile_name)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{suggestion.profile_name || 'Usuario'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{suggestion.comments_count || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(suggestion.created_at).toLocaleDateString()}</span>
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

export default Feedback;
