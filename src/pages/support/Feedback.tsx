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
  category?: FeedbackCategory;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  comments_count?: number;
  has_voted?: boolean;
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
  new: { label: 'Nueva', color: 'bg-blue-100 text-blue-700' },
  reviewing: { label: 'En revisión', color: 'bg-yellow-100 text-yellow-700' },
  planned: { label: 'Planeada', color: 'bg-purple-100 text-purple-700' },
  in_development: { label: 'En desarrollo', color: 'bg-orange-100 text-orange-700' },
  implemented: { label: 'Implementada', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rechazada', color: 'bg-gray-100 text-gray-700' },
};

const Feedback = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile } = useSupabaseAuth();
  
  const [categories, setCategories] = useState<FeedbackCategory[]>([]);
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
      const [categoriesRes, suggestionsRes] = await Promise.all([
        supabase.from('feedback_categories').select('*').eq('is_active', true),
        supabase
          .from('feedback_suggestions')
          .select(`
            *,
            profiles:user_id (full_name, avatar_url),
            feedback_categories:category_id (id, name)
          `)
          .order('votes_count', { ascending: false })
      ]);

      if (categoriesRes.error) throw categoriesRes.error;
      if (suggestionsRes.error) throw suggestionsRes.error;

      setCategories((categoriesRes.data || []) as FeedbackCategory[]);

      // Get comment counts and user votes
      const suggestionsWithData = await Promise.all(
        (suggestionsRes.data || []).map(async (suggestion) => {
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
          
          return { 
            ...suggestion, 
            category: suggestion.feedback_categories,
            comments_count: commentsRes.count || 0,
            has_voted: !!voteRes.data
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
          profiles:user_id (full_name, avatar_url),
          feedback_categories:category_id (id, name)
        `)
        .eq('id', id)
        .single();

      if (suggestionError) throw suggestionError;

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
        has_voted: hasVoted
      } as Suggestion);

      // Load comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('feedback_comments')
        .select(`
          *,
          profiles:user_id (full_name, avatar_url)
        `)
        .eq('suggestion_id', id)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;
      setComments((commentsData || []) as Comment[]);

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
        
        toast.success('¡Voto registrado!');
      }

      // Refresh data
      if (selectedSuggestion?.id === suggestion.id) {
        loadSuggestionDetail(suggestion.id);
      }
      loadData();
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

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Render suggestion detail
  if (selectedSuggestion) {
    const status = statusLabels[selectedSuggestion.status] || statusLabels.new;

    return (
      <SupportPageLayout title="TalentoDigital.io Feedback">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => setSearchParams({})}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a sugerencias
          </Button>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4 flex-1">
                  {/* Vote button */}
                  <Button
                    variant={selectedSuggestion.has_voted ? "default" : "outline"}
                    size="sm"
                    className="flex flex-col h-auto py-2 px-3"
                    onClick={() => handleVote(selectedSuggestion)}
                  >
                    <ChevronUp className="h-4 w-4" />
                    <span className="text-sm font-bold">{selectedSuggestion.votes_count}</span>
                  </Button>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={status.color}>{status.label}</Badge>
                      {selectedSuggestion.category && (
                        <Badge variant="outline">{selectedSuggestion.category.name}</Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">{selectedSuggestion.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={selectedSuggestion.profiles?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {getInitials(selectedSuggestion.profiles?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{selectedSuggestion.profiles?.full_name || 'Usuario'}</span>
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
              <p className="whitespace-pre-wrap">{selectedSuggestion.description}</p>
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

  // Render suggestions list
  return (
    <SupportPageLayout title="TalentoDigital.io Feedback">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Sugerencias y Mejoras</h2>
            <p className="text-muted-foreground">
              Vota por las funcionalidades que te gustaría ver
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
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
                    placeholder="Explica en detalle qué te gustaría que agregáramos o mejoráramos"
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
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateSuggestion} disabled={creating}>
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Crear sugerencia'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : suggestions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No hay sugerencias aún. ¡Sé el primero en sugerir una mejora!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {suggestions.map(suggestion => {
              const status = statusLabels[suggestion.status] || statusLabels.new;
              
              return (
                <Card 
                  key={suggestion.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSearchParams({ id: suggestion.id })}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      {/* Vote button */}
                      <Button
                        variant={suggestion.has_voted ? "default" : "outline"}
                        size="sm"
                        className="flex flex-col h-auto py-2 px-3 flex-shrink-0"
                        onClick={(e) => handleVote(suggestion, e)}
                      >
                        <ChevronUp className="h-4 w-4" />
                        <span className="text-sm font-bold">{suggestion.votes_count}</span>
                      </Button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge className={status.color}>{status.label}</Badge>
                          {suggestion.category && (
                            <Badge variant="outline">{suggestion.category.name}</Badge>
                          )}
                        </div>
                        <h3 className="font-medium">{suggestion.title}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            <span>{suggestion.comments_count || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
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
