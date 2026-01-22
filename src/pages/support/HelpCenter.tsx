import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SupportPageLayout from '@/components/support/SupportPageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from 'sonner';
import { 
  Search, 
  Building2, 
  GraduationCap, 
  Users, 
  ChevronRight, 
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Video,
  Loader2
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

type MainCategory = 'empresas' | 'academias' | 'talento' | 'todas';

interface Category {
  id: string;
  name: string;
  description: string | null;
  main_category: MainCategory;
  display_order: number;
}

interface Article {
  id: string;
  title: string;
  content: string;
  video_url: string | null;
  main_category: MainCategory;
  category_id: string | null;
  updated_at: string;
  category?: Category;
}

interface Vote {
  is_helpful: boolean;
  feedback: string | null;
}

const mainCategories = [
  { id: 'empresas', name: 'Para Empresas', icon: Building2, color: 'bg-blue-100 text-blue-600' },
  { id: 'academias', name: 'Para Academias', icon: GraduationCap, color: 'bg-purple-100 text-purple-600' },
  { id: 'talento', name: 'Para Talento', icon: Users, color: 'bg-green-100 text-green-600' },
];

const HelpCenter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useSupabaseAuth();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [userVote, setUserVote] = useState<Vote | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [submittingVote, setSubmittingVote] = useState(false);

  const currentMainCategory = searchParams.get('category') as MainCategory | null;
  const articleId = searchParams.get('article');

  // Load categories and articles
  useEffect(() => {
    loadData();
  }, []);

  // Load specific article if articleId is present
  useEffect(() => {
    if (articleId) {
      loadArticle(articleId);
    } else {
      setSelectedArticle(null);
    }
  }, [articleId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, articlesRes] = await Promise.all([
        supabase.from('help_center_categories').select('*').eq('is_active', true).order('display_order'),
        supabase.from('help_center_articles').select('*').eq('status', 'published')
      ]);

      if (categoriesRes.error) throw categoriesRes.error;
      if (articlesRes.error) throw articlesRes.error;

      setCategories((categoriesRes.data || []) as Category[]);
      setArticles((articlesRes.data || []) as Article[]);
    } catch (error) {
      console.error('Error loading help center data:', error);
      toast.error('Error cargando el centro de ayuda');
    } finally {
      setLoading(false);
    }
  };

  const loadArticle = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('help_center_articles')
        .select('*')
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      setSelectedArticle(data as Article);

      // Load user's vote if exists
      if (user) {
        const { data: voteData } = await supabase
          .from('help_center_votes')
          .select('is_helpful, feedback')
          .eq('article_id', id)
          .eq('user_id', user.id)
          .maybeSingle();
        
        setUserVote(voteData as Vote | null);
      }
    } catch (error) {
      console.error('Error loading article:', error);
      toast.error('Artículo no encontrado');
      setSearchParams({});
    }
  };

  const handleVote = async (isHelpful: boolean) => {
    if (!user || !selectedArticle || submittingVote) return;
    
    if (!isHelpful) {
      setShowFeedbackInput(true);
      return;
    }

    await submitVote(isHelpful, null);
  };

  const submitVote = async (isHelpful: boolean, feedback: string | null) => {
    if (!user || !selectedArticle) return;
    
    setSubmittingVote(true);
    try {
      const { error } = await supabase
        .from('help_center_votes')
        .upsert({
          article_id: selectedArticle.id,
          user_id: user.id,
          is_helpful: isHelpful,
          feedback: feedback
        }, { onConflict: 'article_id,user_id' });

      if (error) throw error;

      setUserVote({ is_helpful: isHelpful, feedback });
      setShowFeedbackInput(false);
      setFeedbackText('');
      toast.success('¡Gracias por tu feedback!');
    } catch (error) {
      console.error('Error submitting vote:', error);
      toast.error('Error al enviar tu voto');
    } finally {
      setSubmittingVote(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = !searchQuery || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Los artículos con main_category 'todas' aparecen en todas las categorías
    const matchesCategory = !currentMainCategory || 
      article.main_category === currentMainCategory ||
      article.main_category === 'todas';
    
    return matchesSearch && matchesCategory;
  });

  const groupedArticles = filteredArticles.reduce((acc, article) => {
    const categoryId = article.category_id || 'uncategorized';
    if (!acc[categoryId]) {
      acc[categoryId] = [];
    }
    acc[categoryId].push(article);
    return acc;
  }, {} as Record<string, Article[]>);

  const getCategoryName = (categoryId: string) => {
    if (categoryId === 'uncategorized') return 'General';
    return categories.find(c => c.id === categoryId)?.name || 'General';
  };

  // Render article detail
  if (selectedArticle) {
    const category = categories.find(c => c.id === selectedArticle.category_id);
    
    return (
      <SupportPageLayout title="TalentoDigital.io Help Center">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => setSearchParams(currentMainCategory ? { category: currentMainCategory } : {})}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                {category && <Badge variant="secondary">{category.name}</Badge>}
                <Badge variant="outline">
                  {mainCategories.find(c => c.id === selectedArticle.main_category)?.name}
                </Badge>
              </div>
              <CardTitle className="text-2xl">{selectedArticle.title}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Actualizado: {new Date(selectedArticle.updated_at).toLocaleDateString()}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedArticle.video_url && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Video className="h-5 w-5 text-primary" />
                  <a 
                    href={selectedArticle.video_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Ver video tutorial
                  </a>
                </div>
              )}

              <div 
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
              />

              {/* Vote section */}
              <div className="border-t pt-6 mt-6">
                <p className="text-center text-muted-foreground mb-4">
                  ¿Te resultó útil este artículo?
                </p>
                
                {userVote ? (
                  <div className="text-center">
                    <Badge variant={userVote.is_helpful ? 'default' : 'secondary'} className="text-sm">
                      {userVote.is_helpful ? '👍 Sí, fue útil' : '👎 No fue útil'}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">¡Gracias por tu feedback!</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => handleVote(true)}
                        disabled={submittingVote}
                        className="gap-2"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        Sí
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleVote(false)}
                        disabled={submittingVote}
                        className="gap-2"
                      >
                        <ThumbsDown className="h-4 w-4" />
                        No
                      </Button>
                    </div>

                    {showFeedbackInput && (
                      <div className="w-full max-w-md space-y-3">
                        <Textarea
                          placeholder="¿Qué podemos mejorar? (opcional)"
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          rows={3}
                        />
                        <div className="flex gap-2 justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setShowFeedbackInput(false);
                              setFeedbackText('');
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => submitVote(false, feedbackText || null)}
                            disabled={submittingVote}
                          >
                            {submittingVote ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </SupportPageLayout>
    );
  }

  // Render category view
  if (currentMainCategory) {
    const mainCat = mainCategories.find(c => c.id === currentMainCategory);

    return (
      <SupportPageLayout title="TalentoDigital.io Help Center">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => setSearchParams({})}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Button>

          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">{mainCat?.name}</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar artículos..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : Object.keys(groupedArticles).length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No se encontraron artículos en esta categoría.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedArticles).map(([categoryId, categoryArticles]) => (
                <Card key={categoryId}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{getCategoryName(categoryId)}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="divide-y">
                      {categoryArticles.map(article => (
                        <button
                          key={article.id}
                          className="w-full flex items-center justify-between py-3 text-left hover:bg-muted/50 -mx-4 px-4 transition-colors"
                          onClick={() => setSearchParams({ 
                            category: currentMainCategory, 
                            article: article.id 
                          })}
                        >
                          <div className="flex items-center gap-3">
                            {article.video_url && (
                              <Video className="h-4 w-4 text-primary flex-shrink-0" />
                            )}
                            <span>{article.title}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </SupportPageLayout>
    );
  }

  // Render main categories view
  return (
    <SupportPageLayout title="TalentoDigital.io Help Center">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">¿Cómo podemos ayudarte?</h2>
          <p className="text-muted-foreground">
            Encontrá respuestas rápidas, guías y recursos para usar TalentoDigital.io
          </p>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar en el centro de ayuda..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>

        {/* Show search results if searching */}
        {searchQuery ? (
          <div className="space-y-4">
            <h3 className="font-semibold">Resultados de búsqueda</h3>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredArticles.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No se encontraron artículos que coincidan con tu búsqueda.
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-4">
                  <div className="divide-y">
                    {filteredArticles.map(article => (
                      <button
                        key={article.id}
                        className="w-full flex items-center justify-between py-3 text-left hover:bg-muted/50 -mx-4 px-4 transition-colors"
                        onClick={() => setSearchParams({ 
                          category: article.main_category, 
                          article: article.id 
                        })}
                      >
                        <div>
                          <span className="block">{article.title}</span>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {mainCategories.find(c => c.id === article.main_category)?.name}
                          </Badge>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          /* Main Categories Grid */
          <div className="grid md:grid-cols-3 gap-6">
            {mainCategories.map(category => {
              const Icon = category.icon;
              const articleCount = articles.filter(a => a.main_category === category.id).length;
              
              return (
                <Card 
                  key={category.id}
                  className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
                  onClick={() => setSearchParams({ category: category.id })}
                >
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 mx-auto rounded-full ${category.color} flex items-center justify-center mb-4`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription>
                      {articleCount} {articleCount === 1 ? 'artículo' : 'artículos'}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </SupportPageLayout>
  );
};

export default HelpCenter;
