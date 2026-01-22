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
  Lightbulb,
  MessageSquare,
  Send,
  ArrowLeft,
  ThumbsUp,
  Sparkles,
  Clock,
  CheckCircle,
  XCircle,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

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

const statusOptions = [
  { value: 'new', label: 'Nueva', icon: Sparkles, color: 'bg-blue-100 text-blue-800' },
  { value: 'in_review', label: 'En revisión', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'planned', label: 'Planeada', icon: Clock, color: 'bg-purple-100 text-purple-800' },
  { value: 'in_development', label: 'En desarrollo', icon: Zap, color: 'bg-orange-100 text-orange-800' },
  { value: 'implemented', label: 'Implementada', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  { value: 'rejected', label: 'Rechazada', icon: XCircle, color: 'bg-red-100 text-red-800' },
];

const AdminFeedback: React.FC = () => {
  const { user } = useSupabaseAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Detail view state
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Use hardcoded categories
      setCategories(FEEDBACK_CATEGORIES);
      
      // Load suggestions
      const { data: suggestionsData, error } = await supabase
        .from('feedback_suggestions')
        .select('*')
        .order('votes_count', { ascending: false });
      
      if (error) throw error;
      
      // Get unique user IDs and fetch profiles
      const userIds = [...new Set((suggestionsData || []).map(s => s.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);
      
      const profilesMap = new Map((profilesData || []).map(p => [p.user_id, p]));
      
      // Get comments count for each suggestion
      const suggestionsWithData = await Promise.all((suggestionsData || []).map(async (suggestion) => {
        const { count } = await supabase
          .from('feedback_comments')
          .select('*', { count: 'exact', head: true })
          .eq('suggestion_id', suggestion.id);
        
        const profile = profilesMap.get(suggestion.user_id);
        
        return {
          ...suggestion,
          profile_name: profile?.full_name || null,
          profile_avatar: profile?.avatar_url || null,
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

  const getStatusInfo = (status: string) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return null;
    return categories.find(c => c.id === categoryId)?.name || null;
  };

  // Detail view
  if (selectedSuggestion) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setSelectedSuggestion(null)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a la lista
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl">{selectedSuggestion.title}</CardTitle>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={selectedSuggestion.profile_avatar || undefined} />
                    <AvatarFallback>{selectedSuggestion.profile_name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <span>{selectedSuggestion.profile_name || 'Usuario'}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(selectedSuggestion.created_at), { addSuffix: true, locale: es })}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    {selectedSuggestion.votes_count || 0} votos
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedSuggestion.status} onValueChange={(v) => handleStatusChange(selectedSuggestion.id, v)}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
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
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-2">Descripción</h4>
              <p className="text-muted-foreground whitespace-pre-wrap">{selectedSuggestion.description}</p>
            </div>

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
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {statusOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[150px]">
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

      {/* Suggestions List */}
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
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
          {filteredSuggestions.map(suggestion => {
            const suggestionStatusInfo = getStatusInfo(suggestion.status);
            const suggestionCategoryName = getCategoryName(suggestion.category_id);
            const StatusIcon = suggestionStatusInfo?.icon || Sparkles;
            
            return (
              <Card 
                key={suggestion.id} 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedSuggestion(suggestion)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center gap-1 pt-1">
                        <ThumbsUp className="h-5 w-5 text-muted-foreground" />
                        <span className="text-lg font-bold">{suggestion.votes_count || 0}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <h3 className="font-medium">{suggestion.title}</h3>
                          <Badge className={suggestionStatusInfo?.color || 'bg-gray-100 text-gray-800'}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {suggestionStatusInfo?.label || suggestion.status}
                          </Badge>
                          {suggestionCategoryName && (
                            <Badge variant="outline">{suggestionCategoryName}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {suggestion.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={suggestion.profile_avatar || undefined} />
                              <AvatarFallback className="text-xs">{suggestion.profile_name?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                            <span>{suggestion.profile_name || 'Usuario'}</span>
                          </div>
                          <span>• {formatDistanceToNow(new Date(suggestion.created_at), { addSuffix: true, locale: es })}</span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {suggestion.comments_count}
                          </span>
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
  );
};

export default AdminFeedback;
