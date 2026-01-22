import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  FileText,
  ThumbsUp,
  ThumbsDown,
  Video,
  FolderOpen,
  Save
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RichTextEditor } from '@/components/ui/rich-text-editor';


interface Category {
  id: string;
  name: string;
  description: string | null;
  main_category: string;
  display_order: number | null;
  is_active: boolean | null;
}

interface Article {
  id: string;
  title: string;
  content: string;
  video_url: string | null;
  main_category: string;
  category_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  positive_votes?: number;
  negative_votes?: number;
  category?: Category;
}

interface Vote {
  article_id: string;
  is_helpful: boolean;
  feedback: string | null;
}

const mainCategories = [
  { value: 'empresas', label: 'Empresas' },
  { value: 'academias', label: 'Academias' },
  { value: 'talento', label: 'Talento' },
];

const AdminHelpCenter: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMainCategory, setFilterMainCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Article dialog state
  const [isArticleDialogOpen, setIsArticleDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [articleForm, setArticleForm] = useState({
    title: '',
    content: '',
    video_url: '',
    main_category: 'empresas',
    category_id: '',
    status: 'draft',
  });
  
  // Category dialog state
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    main_category: 'empresas',
    display_order: 0,
  });
  
  // Votes dialog state
  const [isVotesDialogOpen, setIsVotesDialogOpen] = useState(false);
  const [selectedArticleVotes, setSelectedArticleVotes] = useState<Vote[]>([]);
  const [selectedArticleTitle, setSelectedArticleTitle] = useState('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('help_center_categories')
        .select('*')
        .order('display_order');
      
      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);
      
      // Load articles with vote counts
      const { data: articlesData, error: articlesError } = await supabase
        .from('help_center_articles')
        .select(`
          *,
          category:help_center_categories(*)
        `)
        .order('updated_at', { ascending: false });
      
      if (articlesError) throw articlesError;
      
      // Get vote counts for each article
      const articlesWithVotes = await Promise.all((articlesData || []).map(async (article) => {
        const { count: positiveCount } = await supabase
          .from('help_center_votes')
          .select('*', { count: 'exact', head: true })
          .eq('article_id', article.id)
          .eq('is_helpful', true);
        
        const { count: negativeCount } = await supabase
          .from('help_center_votes')
          .select('*', { count: 'exact', head: true })
          .eq('article_id', article.id)
          .eq('is_helpful', false);
        
        return {
          ...article,
          positive_votes: positiveCount || 0,
          negative_votes: negativeCount || 0,
        };
      }));
      
      setArticles(articlesWithVotes as Article[]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMainCategory = filterMainCategory === 'all' || article.main_category === filterMainCategory;
    const matchesStatus = filterStatus === 'all' || article.status === filterStatus;
    return matchesSearch && matchesMainCategory && matchesStatus;
  });

  const handleSaveArticle = async () => {
    try {
      const articleData = {
        title: articleForm.title,
        content: articleForm.content,
        video_url: articleForm.video_url || null,
        main_category: articleForm.main_category,
        category_id: articleForm.category_id || null,
        status: articleForm.status,
      };
      
      if (editingArticle) {
        const { error } = await supabase
          .from('help_center_articles')
          .update(articleData)
          .eq('id', editingArticle.id);
        
        if (error) throw error;
        toast.success('Artículo actualizado');
      } else {
        const { error } = await supabase
          .from('help_center_articles')
          .insert(articleData);
        
        if (error) throw error;
        toast.success('Artículo creado');
      }
      
      setIsArticleDialogOpen(false);
      resetArticleForm();
      loadData();
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error('Error al guardar el artículo');
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este artículo?')) return;
    
    try {
      const { error } = await supabase
        .from('help_center_articles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Artículo eliminado');
      loadData();
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('Error al eliminar el artículo');
    }
  };

  const handleSaveCategory = async () => {
    try {
      const categoryData = {
        name: categoryForm.name,
        description: categoryForm.description || null,
        main_category: categoryForm.main_category,
        display_order: categoryForm.display_order,
      };
      
      if (editingCategory) {
        const { error } = await supabase
          .from('help_center_categories')
          .update(categoryData)
          .eq('id', editingCategory.id);
        
        if (error) throw error;
        toast.success('Categoría actualizada');
      } else {
        const { error } = await supabase
          .from('help_center_categories')
          .insert(categoryData);
        
        if (error) throw error;
        toast.success('Categoría creada');
      }
      
      setIsCategoryDialogOpen(false);
      resetCategoryForm();
      loadData();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Error al guardar la categoría');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;
    
    try {
      const { error } = await supabase
        .from('help_center_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Categoría eliminada');
      loadData();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Error al eliminar la categoría');
    }
  };

  const handleViewVotes = async (article: Article) => {
    try {
      const { data, error } = await supabase
        .from('help_center_votes')
        .select('article_id, is_helpful, feedback')
        .eq('article_id', article.id);
      
      if (error) throw error;
      
      setSelectedArticleVotes(data || []);
      setSelectedArticleTitle(article.title);
      setIsVotesDialogOpen(true);
    } catch (error) {
      console.error('Error loading votes:', error);
      toast.error('Error al cargar los votos');
    }
  };

  const resetArticleForm = () => {
    setEditingArticle(null);
    setArticleForm({
      title: '',
      content: '',
      video_url: '',
      main_category: 'empresas',
      category_id: '',
      status: 'draft',
    });
  };

  const resetCategoryForm = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      description: '',
      main_category: 'empresas',
      display_order: 0,
    });
  };

  const openEditArticle = (article: Article) => {
    setEditingArticle(article);
    setArticleForm({
      title: article.title,
      content: article.content,
      video_url: article.video_url || '',
      main_category: article.main_category,
      category_id: article.category_id || '',
      status: article.status,
    });
    setIsArticleDialogOpen(true);
  };

  const openEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      main_category: category.main_category,
      display_order: category.display_order || 0,
    });
    setIsCategoryDialogOpen(true);
  };

  const getUtilityPercentage = (positive: number, negative: number) => {
    const total = positive + negative;
    if (total === 0) return 0;
    return Math.round((positive / total) * 100);
  };

  const filteredCategories = categories.filter(c => 
    filterMainCategory === 'all' || c.main_category === filterMainCategory
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Help Center</h1>
          <p className="text-muted-foreground">Gestiona artículos y categorías del centro de ayuda</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsCategoryDialogOpen(true)}>
            <FolderOpen className="h-4 w-4 mr-2" />
            Nueva Categoría
          </Button>
          <Button onClick={() => setIsArticleDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Artículo
          </Button>
        </div>
      </div>

      <Tabs defaultValue="articles">
        <TabsList>
          <TabsTrigger value="articles">Artículos ({articles.length})</TabsTrigger>
          <TabsTrigger value="categories">Categorías ({categories.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar artículos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterMainCategory} onValueChange={setFilterMainCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Categoría principal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {mainCategories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Articles List */}
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredArticles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay artículos que mostrar</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredArticles.map(article => {
                const utilityPct = getUtilityPercentage(article.positive_votes || 0, article.negative_votes || 0);
                return (
                  <Card key={article.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <h3 className="font-medium truncate">{article.title}</h3>
                            <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                              {article.status === 'published' ? 'Publicado' : 'Borrador'}
                            </Badge>
                            {article.video_url && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Video className="h-3 w-3" />
                                Video
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="capitalize">{article.main_category}</span>
                            {article.category && <span>• {article.category.name}</span>}
                            <span>• Actualizado: {new Date(article.updated_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <button 
                              onClick={() => handleViewVotes(article)}
                              className="flex items-center gap-1 text-sm hover:underline"
                            >
                              <ThumbsUp className="h-4 w-4 text-green-600" />
                              <span>{article.positive_votes || 0}</span>
                            </button>
                            <button
                              onClick={() => handleViewVotes(article)}
                              className="flex items-center gap-1 text-sm hover:underline"
                            >
                              <ThumbsDown className="h-4 w-4 text-red-600" />
                              <span>{article.negative_votes || 0}</span>
                            </button>
                            {(article.positive_votes || 0) + (article.negative_votes || 0) > 0 && (
                              <span className="text-sm text-muted-foreground">
                                ({utilityPct}% útil)
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditArticle(article)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive"
                            onClick={() => handleDeleteArticle(article.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          {filteredCategories.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay categorías que mostrar</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredCategories.map(category => (
                <Card key={category.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{category.main_category}</p>
                        {category.description && (
                          <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditCategory(category)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Article Dialog */}
      <Dialog open={isArticleDialogOpen} onOpenChange={setIsArticleDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingArticle ? 'Editar Artículo' : 'Nuevo Artículo'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="article-title">Título</Label>
              <Input
                id="article-title"
                value={articleForm.title}
                onChange={(e) => setArticleForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Título del artículo"
              />
            </div>
            
            <div>
              <Label htmlFor="article-video">Link de Video (opcional)</Label>
              <Input
                id="article-video"
                value={articleForm.video_url}
                onChange={(e) => setArticleForm(prev => ({ ...prev, video_url: e.target.value }))}
                placeholder="https://youtube.com/... o https://loom.com/..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Categoría Principal</Label>
                <Select 
                  value={articleForm.main_category} 
                  onValueChange={(value) => setArticleForm(prev => ({ ...prev, main_category: value, category_id: '' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mainCategories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Subcategoría</Label>
                <Select 
                  value={articleForm.category_id} 
                  onValueChange={(value) => setArticleForm(prev => ({ ...prev, category_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin subcategoría</SelectItem>
                    {categories
                      .filter(c => c.main_category === articleForm.main_category)
                      .map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Estado</Label>
              <Select 
                value={articleForm.status} 
                onValueChange={(value: 'draft' | 'published') => setArticleForm(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Contenido</Label>
              <RichTextEditor
                value={articleForm.content}
                onChange={(value) => setArticleForm(prev => ({ ...prev, content: value }))}
                placeholder="Escribe el contenido del artículo..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsArticleDialogOpen(false); resetArticleForm(); }}>
              Cancelar
            </Button>
            <Button onClick={handleSaveArticle} disabled={!articleForm.title || !articleForm.content}>
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category-name">Nombre</Label>
              <Input
                id="category-name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre de la categoría"
              />
            </div>
            <div>
              <Label htmlFor="category-description">Descripción (opcional)</Label>
              <Textarea
                id="category-description"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción de la categoría"
              />
            </div>
            <div>
              <Label>Categoría Principal</Label>
              <Select 
                value={categoryForm.main_category} 
                onValueChange={(value) => setCategoryForm(prev => ({ ...prev, main_category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mainCategories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category-order">Orden de visualización</Label>
              <Input
                id="category-order"
                type="number"
                value={categoryForm.display_order}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsCategoryDialogOpen(false); resetCategoryForm(); }}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCategory} disabled={!categoryForm.name}>
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Votes Dialog */}
      <Dialog open={isVotesDialogOpen} onOpenChange={setIsVotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Votos: {selectedArticleTitle}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            {selectedArticleVotes.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No hay votos para este artículo</p>
            ) : (
              <div className="space-y-3">
                {selectedArticleVotes.map((vote, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                    {vote.is_helpful ? (
                      <ThumbsUp className="h-5 w-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <ThumbsDown className="h-5 w-5 text-red-600 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {vote.is_helpful ? 'Útil' : 'No útil'}
                      </p>
                      {vote.feedback && (
                        <p className="text-sm text-muted-foreground mt-1">{vote.feedback}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVotesDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHelpCenter;
