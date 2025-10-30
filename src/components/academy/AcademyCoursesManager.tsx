import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, BookOpen, Users, DollarSign, Calendar, Loader2, Edit, Trash2, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  currency: string;
  category: string;
  level: string;
  start_date: string | null;
  enrollment_link: string | null;
  image_url: string | null;
  is_featured: boolean | null;
  is_active: boolean | null;
  enrolled_count: number | null;
  tags: string[] | null;
}

interface AcademyCoursesManagerProps {
  academyId: string;
}

export const AcademyCoursesManager = ({ academyId }: AcademyCoursesManagerProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    price: 0,
    currency: 'USD',
    category: '',
    level: 'beginner',
    start_date: '',
    enrollment_link: '',
    is_featured: false,
    is_active: true,
  });

  useEffect(() => {
    loadCourses();
  }, [academyId]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('academy_courses')
        .select('*')
        .eq('academy_id', academyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los cursos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCourse) {
        const { error } = await supabase
          .from('academy_courses')
          .update(formData)
          .eq('id', editingCourse.id);

        if (error) throw error;

        toast({
          title: 'Curso actualizado',
          description: 'El curso se ha actualizado correctamente',
        });
      } else {
        const { error } = await supabase
          .from('academy_courses')
          .insert({
            ...formData,
            academy_id: academyId,
          });

        if (error) throw error;

        toast({
          title: 'Curso creado',
          description: 'El curso se ha publicado en el marketplace',
        });
      }

      setDialogOpen(false);
      resetForm();
      loadCourses();
    } catch (error) {
      console.error('Error saving course:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el curso',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('¿Estás seguro de eliminar este curso?')) return;

    try {
      const { error } = await supabase
        .from('academy_courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;

      toast({
        title: 'Curso eliminado',
        description: 'El curso ha sido eliminado',
      });
      loadCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el curso',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      duration: '',
      price: 0,
      currency: 'USD',
      category: '',
      level: 'beginner',
      start_date: '',
      enrollment_link: '',
      is_featured: false,
      is_active: true,
    });
    setEditingCourse(null);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      duration: course.duration,
      price: course.price,
      currency: course.currency,
      category: course.category,
      level: course.level,
      start_date: course.start_date || '',
      enrollment_link: course.enrollment_link || '',
      is_featured: course.is_featured ?? false,
      is_active: course.is_active ?? true,
    });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Cursos en Marketplace
              </CardTitle>
              <CardDescription>
                Publica y gestiona los cursos de tu academia en el marketplace
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Curso
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingCourse ? 'Editar Curso' : 'Publicar Nuevo Curso'}
                  </DialogTitle>
                  <DialogDescription>
                    Los cursos destacados aparecerán en la página principal del marketplace
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título del Curso *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duración *</Label>
                      <Input
                        id="duration"
                        placeholder="Ej: 12 semanas"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="level">Nivel *</Label>
                      <Select
                        value={formData.level}
                        onValueChange={(value) => setFormData({ ...formData, level: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Principiante</SelectItem>
                          <SelectItem value="intermediate">Intermedio</SelectItem>
                          <SelectItem value="advanced">Avanzado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Precio *</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Moneda</Label>
                      <Select
                        value={formData.currency}
                        onValueChange={(value) => setFormData({ ...formData, currency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="MXN">MXN</SelectItem>
                          <SelectItem value="COP">COP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría *</Label>
                    <Input
                      id="category"
                      placeholder="Ej: Desarrollo Web, Diseño, Marketing"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start_date">Fecha de Inicio</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="enrollment_link">Link de Inscripción</Label>
                    <Input
                      id="enrollment_link"
                      type="url"
                      placeholder="https://..."
                      value={formData.enrollment_link}
                      onChange={(e) => setFormData({ ...formData, enrollment_link: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="featured">Curso Destacado</Label>
                      <p className="text-sm text-muted-foreground">
                        Aparecerá en la sección principal
                      </p>
                    </div>
                    <Switch
                      id="featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="active">Curso Activo</Label>
                      <p className="text-sm text-muted-foreground">
                        Visible en el marketplace
                      </p>
                    </div>
                    <Switch
                      id="active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingCourse ? 'Actualizar' : 'Publicar'} Curso
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Aún no has publicado cursos en el marketplace
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Publicar Primer Curso
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <Card key={course.id} className={!(course.is_active ?? true) ? 'opacity-60' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{course.title}</h3>
                          {course.is_featured && (
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                              <Star className="h-3 w-3 mr-1" />
                              Destacado
                            </Badge>
                          )}
                          {!(course.is_active ?? true) && (
                            <Badge variant="secondary">Inactivo</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {course.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {course.currency} {course.price.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {course.duration}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {course.enrolled_count ?? 0} inscritos
                          </div>
                          <Badge variant="outline">{course.level}</Badge>
                          <Badge variant="outline">{course.category}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(course)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(course.id)}
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
        </CardContent>
      </Card>
    </div>
  );
};
