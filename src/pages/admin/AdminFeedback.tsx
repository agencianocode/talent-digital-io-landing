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
  Lightbulb,
  MessageSquare,
  Send,
  ArrowLeft,
  Clock,
  MoreVertical,
  Trash2,
  Loader2,
  ChevronUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface Suggestion {
  id: string;
  title: string;
  description: string;
  status: string;
  category_id: string | null;
  user_id: string;
  votes_count: number | null;
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

// Hardcoded feedback categories (no database dependency)
const FEEDBACK_CATEGORIES: Category[] = [
  { id: 'nuevas-funcionalidades', name: 'Nuevas funcionalidades' },
  { id: 'mejora-experiencia', name: 'Mejora de experiencia' },
  { id: 'notificaciones-comunicacion', name: 'Notificaciones y comunicación' },
  { id: 'otros', name: 'Otros' },
];

const statusLabels: Record<string, { label: string; color: string; helperText?: string }> = {
  new: { label: 'Nueva', color: 'bg-blue-100 text-blue-700', helperText: 'El equipo aún no la revisó' },
  reviewing: { label: 'En revisión', color: 'bg-yellow-100 text-yellow-700', helperText: 'Estamos evaluando esta sugerencia' },
  in_review: { label: 'En revisión', color: 'bg-yellow-100 text-yellow-700', helperText: 'Estamos evaluando esta sugerencia' },
  planned: { label: 'Planeada', color: 'bg-purple-100 text-purple-700', helperText: 'Esta mejora entra en nuestro roadmap' },
  in_development: { label: 'En desarrollo', color: 'bg-orange-100 text-orange-700', helperText: 'Estamos trabajando en esta mejora' },
  implemented: { label: 'Implementada', color: 'bg-green-100 text-green-700', helperText: 'Esta mejora ya está disponible' },
  rejected: { label: 'Rechazada', color: 'bg-gray-100 text-gray-700', helperText: 'No vamos a implementar esta sugerencia por el momento' },
};

const AdminFeedback: React.FC = () => {
  const { user, profile } = useSupabaseAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [categories, setCategories] = useState<Category[]>(FEEDBACK_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Detail view state
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation
  const [deleteSuggestionId, setDeleteSuggestionId] = useState<string | null>(null);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Use hardcoded categories
      setCategories(FEEDBACK_CATEGORIES);
      
      const { data: suggestionsData, error } = await supabase
        .from('feedback_suggestions')
        .select('*')
        .order('votes_count', { ascending: false });
      
      if (error) throw error;
      
      const userIds = [...new Set((suggestionsData || []).map(s => s.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);
      
      const profilesMap = new Map((profilesData || []).map(p => [p.user_id, p]));
      
      const suggestionsWithData = await Promise.all((suggestionsData || []).map(async (suggestion) => {
        const { count } = await supabase
          .from('feedback_comments')
          .select('*', { count: 'exact', head: true })
          .eq('suggestion_id', suggestion.id);
        
        const userProfile = profilesMap.get(suggestion.user_id);
        
        return {
          ...suggestion,
          profile_name: userProfile?.full_name || null,
          profile_avatar: userProfile?.avatar_url || null,
          comments_count: count || 0,
        };
      }));
      
      setSuggestions(suggestionsWithData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar las sugerencias');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadComments = useCallback(async (suggestionId: string) => {
    try {
      const { data, error } = await supabase
        .from('feedback_comments')
        .select('*')
        .eq('suggestion_id', suggestionId)
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
    if (selectedSuggestion) {
      loadComments(selectedSuggestion.id);
    }
  }, [selectedSuggestion, loadComments]);

  const filteredSuggestions = suggestions.filter(suggestion => {
    const matchesSearch = suggestion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          suggestion.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || suggestion.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || suggestion.category_id === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleStatusChange = async (suggestionId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('feedback_suggestions')
        .update({ status: newStatus })
        .eq('id', suggestionId);
      
      if (error) throw error;
      
      toast.success('Estado actualizado');
      loadData();
      
      if (selectedSuggestion?.id === suggestionId) {
        setSelectedSuggestion(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const handleCategoryChange = async (suggestionId: string, newCategoryId: string) => {
    try {
      const { error } = await supabase
        .from('feedback_suggestions')
        .update({ category_id: newCategoryId || null })
        .eq('id', suggestionId);
      
      if (error) throw error;
      
      toast.success('Categoría actualizada');
      loadData();
      
      if (selectedSuggestion?.id === suggestionId) {
        setSelectedSuggestion(prev => prev ? { ...prev, category_id: newCategoryId || null } : null);
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Error al actualizar la categoría');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedSuggestion || !user) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('feedback_comments')
        .insert({
          suggestion_id: selectedSuggestion.id,
          user_id: user.id,
          content: newComment.trim(),
          is_admin_reply: true,
        });
      
      if (error) throw error;
      
      setNewComment('');
      toast.success('Comentario agregado');
      loadComments(selectedSuggestion.id);
      loadData();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Error al agregar el comentario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSuggestion = async () => {
    if (!deleteSuggestionId) return;
    
    try {
      // Delete comments first
      await supabase
        .from('feedback_comments')
        .delete()
        .eq('suggestion_id', deleteSuggestionId);
      
      // Delete subscriptions
      await supabase
        .from('feedback_subscriptions')
        .delete()
        .eq('suggestion_id', deleteSuggestionId);
      
      // Delete votes
      await supabase
        .from('feedback_votes')
        .delete()
        .eq('suggestion_id', deleteSuggestionId);
      
      // Delete the suggestion
      const { error } = await supabase
        .from('feedback_suggestions')
        .delete()
        .eq('id', deleteSuggestionId);
      
      if (error) throw error;
      
      toast.success('Sugerencia eliminada');
      setDeleteSuggestionId(null);
      setSelectedSuggestion(null);
      loadData();
    } catch (error) {
      console.error('Error deleting suggestion:', error);
      toast.error('Error al eliminar la sugerencia');
    }
  };

  const handleDeleteComment = async () => {
    if (!deleteCommentId || !selectedSuggestion) return;
    
    try {
      const { error } = await supabase
        .from('feedback_comments')
        .delete()
        .eq('id', deleteCommentId);
      
      if (error) throw error;
      
      toast.success('Comentario eliminado');
      setDeleteCommentId(null);
      loadComments(selectedSuggestion.id);
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
    return statusLabels[status] || statusLabels.new;
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return null;
    return categories.find(c => c.id === categoryId)?.name || null;
  };

  // Detail view - matching user view style (without vote button)
  if (selectedSuggestion) {
    const statusInfo = getStatusInfo(selectedSuggestion.status);
    const categoryName = getCategoryName(selectedSuggestion.category_id);

    return (
      <div className="space-y-6 max-w-4xl">
        <Button variant="ghost" onClick={() => setSelectedSuggestion(null)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a la lista
        </Button>

        {/* Suggestion Card - matching user view but without vote button */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4 flex-1">
                {/* Vote count display (read-only) */}
                <div className="flex flex-col items-center gap-1 min-w-[60px] py-2 px-4 border rounded-md bg-muted/50">
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-bold">{selectedSuggestion.votes_count || 0}</span>
                  <span className="text-[10px] text-muted-foreground">votos</span>
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge className={statusInfo?.color ?? 'bg-gray-100 text-gray-700'}>
                      {statusInfo?.label ?? 'Nueva'}
                    </Badge>
                    {categoryName && (
                      <Badge variant="outline">{categoryName}</Badge>
                    )}
                  </div>
                  {statusInfo?.helperText && (
                    <p className="text-sm text-muted-foreground mb-2">{statusInfo.helperText}</p>
                  )}
                  <CardTitle className="text-lg sm:text-xl">{selectedSuggestion.title}</CardTitle>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                        <AvatarImage src={selectedSuggestion.profile_avatar || undefined} />
                        <AvatarFallback className="text-xs">
                          {getInitials(selectedSuggestion.profile_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs sm:text-sm">{selectedSuggestion.profile_name || 'Usuario'}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs sm:text-sm">{new Date(selectedSuggestion.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Admin controls */}
              <div className="flex items-center gap-2">
                <Select value={selectedSuggestion.status} onValueChange={(v) => handleStatusChange(selectedSuggestion.id, v)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([value, info]) => (
                      <SelectItem key={value} value={value}>{info.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select 
                  value={selectedSuggestion.category_id || ''} 
                  onValueChange={(v) => handleCategoryChange(selectedSuggestion.id, v)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin categoría</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
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
                      onClick={() => setDeleteSuggestionId(selectedSuggestion.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar sugerencia
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm sm:text-base">{selectedSuggestion.description}</p>
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

        {/* Delete Suggestion Confirmation */}
        <AlertDialog open={!!deleteSuggestionId} onOpenChange={() => setDeleteSuggestionId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar sugerencia?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminarán también todos los comentarios y votos asociados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteSuggestion} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
        <h1 className="text-2xl font-bold">Sugerencias de Mejora</h1>
        <p className="text-muted-foreground">Gestiona las sugerencias de los usuarios</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar sugerencias..."
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
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions List - matching user view card style (without vote button) */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredSuggestions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay sugerencias que mostrar</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {suggestions.map(suggestion => {
            const statusInfo = getStatusInfo(suggestion.status);
            const categoryName = getCategoryName(suggestion.category_id);
            const showStatusBadge = suggestion.status !== 'new';
            
            return (
              <Card 
                key={suggestion.id}
                className="hover:border-primary/50 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Vote count display (read-only) */}
                    <div className="flex flex-col items-center gap-1 min-w-[60px] py-2 px-4 border rounded-md bg-muted/50">
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-bold">{suggestion.votes_count || 0}</span>
                      <span className="text-[10px] text-muted-foreground">votos</span>
                    </div>

                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => setSelectedSuggestion(suggestion)}
                    >
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {showStatusBadge && (
                          <Badge className={statusInfo?.color ?? 'bg-gray-100 text-gray-700'}>{statusInfo?.label ?? 'Nueva'}</Badge>
                        )}
                        {categoryName && (
                          <Badge variant="outline">{categoryName}</Badge>
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

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="flex-shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => setDeleteSuggestionId(suggestion.id)}
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

      {/* Delete Suggestion Confirmation */}
      <AlertDialog open={!!deleteSuggestionId} onOpenChange={() => setDeleteSuggestionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar sugerencia?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán también todos los comentarios y votos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSuggestion} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminFeedback;
