import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, MapPin, Mail, Phone, Linkedin, Globe, Calendar, Briefcase, Star, GraduationCap, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface TalentProfile {
  id: string;
  user_id: string;
  title: string;
  specialty: string;
  bio: string;
  skills: string[];
  years_experience: number;
  availability: string;
  linkedin_url: string;
  portfolio_url: string;
  hourly_rate_min: number;
  hourly_rate_max: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string;
  phone: string;
  position?: string;
  linkedin?: string;
  created_at: string;
  updated_at: string;
}

const TalentProfilePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { userRole } = useSupabaseAuth();
  const [talentProfile, setTalentProfile] = useState<TalentProfile | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [education, setEducation] = useState<any[]>([]);
  const [workExperience, setWorkExperience] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      console.log('Fetching talent profile for user ID:', id);
      fetchTalentProfile();
    }
  }, [id]);

  const fetchTalentProfile = async () => {
    try {
      setIsLoading(true);
      
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', id)
        .single();

      if (profileError) throw profileError;
      setUserProfile(profileData);

      // Fetch talent profile
      const { data: talentData, error: talentError } = await supabase
        .from('talent_profiles')
        .select('*')
        .eq('user_id', id)
        .single();

      if (talentError && talentError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is okay if user doesn't have a talent profile
        console.warn('No talent profile found for user:', talentError);
      } else if (talentData) {
        setTalentProfile(talentData);

        // Fetch education data
        const { data: educationData, error: educationError } = await supabase
          .from('education')
          .select('*')
          .eq('talent_profile_id', talentData.id)
          .order('graduation_year', { ascending: false });

        if (educationError) {
          console.warn('Error fetching education:', educationError);
        } else if (educationData) {
          console.log('Education data found:', educationData);
          setEducation(educationData);
        } else {
          console.log('No education data found for talent profile:', talentData.id);
        }

        // Fetch work experience data
        const { data: workData } = await supabase
          .from('work_experience')
          .select('*')
          .eq('talent_profile_id', talentData.id)
          .order('start_date', { ascending: false });

        if (workData) {
          setWorkExperience(workData);
        }
      }

    } catch (error) {
      console.error('Error fetching talent profile:', error);
      toast.error('Error al cargar el perfil del talento');
    } finally {
      console.log('Final state - Education:', education.length, 'items');
      console.log('Final state - Work Experience:', workExperience.length, 'items');
      setIsLoading(false);
    }
  };

  const handleContact = () => {
    // TODO: Implement contact functionality
    toast.info('Funcionalidad de contacto próximamente');
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Perfil no encontrado</h1>
        <p className="text-muted-foreground mb-4">
          El perfil del talento que buscas no existe o no está disponible.
        </p>
        <Button onClick={handleBack}>
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Button 
          onClick={handleBack}
          variant="ghost"
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Volver</span>
          <span className="sm:hidden">←</span>
        </Button>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Perfil de Talento
          </h1>
          {isBusinessRole(userRole) && (
            <Button onClick={handleContact} className="w-full sm:w-auto">
              Contactar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                  <AvatarImage src={userProfile.avatar_url} />
                  <AvatarFallback className="text-lg">
                    {userProfile.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl sm:text-2xl">{userProfile.full_name}</CardTitle>
                  <p className="text-muted-foreground">
                    {userProfile.position || 'Talento Digital'}
                  </p>
                  {talentProfile?.specialty && (
                    <Badge variant="secondary" className="mt-2">
                      {talentProfile.specialty}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {talentProfile?.bio && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Biografía</h3>
                  <p className="text-muted-foreground">{talentProfile.bio}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {userProfile.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{userProfile.phone}</span>
                  </div>
                )}
                {talentProfile?.linkedin_url && (
                  <div className="flex items-center space-x-2">
                    <Linkedin className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={talentProfile.linkedin_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      LinkedIn
                    </a>
                  </div>
                )}
                {talentProfile?.portfolio_url && (
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={talentProfile.portfolio_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Portfolio
                    </a>
                  </div>
                )}
                {talentProfile?.years_experience && (
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{talentProfile.years_experience} años de experiencia</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          {talentProfile?.skills && talentProfile.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Habilidades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {talentProfile.skills.map((skill, index) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Work Experience */}
          {workExperience.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Experiencia Laboral
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workExperience.map((work, index) => (
                    <div key={work.id} className="border-l-2 border-primary pl-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-foreground">{work.position}</h4>
                          <p className="text-sm text-muted-foreground">{work.company}</p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          {work.start_date && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(work.start_date), 'MMM yyyy', { locale: es })}
                              {work.is_current ? ' - Presente' : work.end_date ? ` - ${format(new Date(work.end_date), 'MMM yyyy', { locale: es })}` : ''}
                            </div>
                          )}
                        </div>
                      </div>
                      {work.description && (
                        <p className="text-sm text-muted-foreground mt-2">{work.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Educación
              </CardTitle>
            </CardHeader>
            <CardContent>
              {education.length > 0 ? (
                <div className="space-y-4">
                  {education.map((edu, index) => (
                    <div key={edu.id} className="border-l-2 border-primary pl-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-foreground">{edu.degree}</h4>
                          <p className="text-sm text-muted-foreground">{edu.institution}</p>
                          {edu.field_of_study && (
                            <p className="text-xs text-muted-foreground">{edu.field_of_study}</p>
                          )}
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          {edu.graduation_year && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Graduado en {edu.graduation_year}
                            </div>
                          )}
                        </div>
                      </div>
                      {edu.description && (
                        <p className="text-sm text-muted-foreground mt-2">{edu.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No se ha agregado información de educación</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* General Experience */}
          {talentProfile?.years_experience && (
            <Card>
              <CardHeader>
                <CardTitle>Experiencia General</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">{talentProfile.years_experience} años de experiencia</span>
                </div>
                {talentProfile.availability && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Disponibilidad: {talentProfile.availability}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Rate Card */}
          {talentProfile?.hourly_rate_min && talentProfile?.hourly_rate_max && (
            <Card>
              <CardHeader>
                <CardTitle>Tarifa por Hora</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  ${talentProfile.hourly_rate_min} - ${talentProfile.hourly_rate_max}
                </div>
                <div className="text-sm text-muted-foreground">
                  {talentProfile.currency || 'USD'}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Member Since */}
          <Card>
            <CardHeader>
              <CardTitle>Miembro desde</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {format(new Date(userProfile.created_at), 'MMMM yyyy', { locale: es })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Contact Actions */}
          {isBusinessRole(userRole) && (
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" onClick={handleContact}>
                  Contactar
                </Button>
                <Button variant="outline" className="w-full">
                  Ver CV
                </Button>
                <Button variant="outline" className="w-full">
                  Programar Entrevista
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TalentProfilePage;