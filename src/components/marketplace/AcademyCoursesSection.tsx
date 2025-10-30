import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, DollarSign, Calendar, Users, Star, ExternalLink, Loader2 } from 'lucide-react';

interface FeaturedCourse {
  id: string;
  academy_id: string;
  academy_name: string;
  academy_logo: string | null;
  title: string;
  description: string;
  duration: string;
  price: number;
  currency: string;
  category: string;
  level: string;
  start_date: string | null;
  enrollment_link: string | null;
  enrolled_count: number;
}

export const AcademyCoursesSection = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<FeaturedCourse[]>([]);

  useEffect(() => {
    loadFeaturedCourses();
  }, []);

  const loadFeaturedCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_featured_academy_courses', {
        p_limit: 6
      });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
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

  if (courses.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <BookOpen className="h-6 w-6" />
          Cursos de Academias
        </h2>
        <p className="text-muted-foreground">
          Mejora tus habilidades con cursos certificados de academias reconocidas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-all group">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={course.academy_logo || undefined} />
                    <AvatarFallback>
                      <BookOpen className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-muted-foreground">
                    {course.academy_name}
                  </span>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  <Star className="h-3 w-3 mr-1" />
                  Destacado
                </Badge>
              </div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {course.title}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {course.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{course.category}</Badge>
                <Badge variant="outline">{course.level}</Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Duración: {course.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{course.enrolled_count} estudiantes inscritos</span>
                </div>
                {course.start_date && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Inicia: {new Date(course.start_date).toLocaleDateString('es')}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold text-primary">
                    {course.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground">{course.currency}</span>
                </div>
                {course.enrollment_link ? (
                  <Button size="sm" asChild>
                    <a 
                      href={course.enrollment_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Inscribirse
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                ) : (
                  <Button size="sm" disabled>
                    Próximamente
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
