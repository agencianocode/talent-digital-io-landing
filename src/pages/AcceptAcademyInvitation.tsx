import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, GraduationCap, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const AcceptAcademyInvitation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useSupabaseAuth();
  
  const academyId = searchParams.get('academy');
  const status = searchParams.get('status') || 'enrolled';
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [academyInfo, setAcademyInfo] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!academyId) {
      setError('Link de invitación inválido');
      setLoading(false);
      return;
    }
    if (academyId) {
      loadAcademyInfo();
    }
  }, [academyId]);

  useEffect(() => {
    // If user is authenticated and we have academy info, process invitation
    if (isAuthenticated && user && academyInfo && !processing && !success) {
      processInvitation();
    }
  }, [isAuthenticated, user, academyInfo]);

  const loadAcademyInfo = async () => {
    if (!academyId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, logo_url, description')
        .eq('id', academyId)
        .single();

      if (error) throw error;
      
      if (!data) {
        setError('Academia no encontrada');
        return;
      }

      setAcademyInfo(data);
    } catch (err: any) {
      console.error('Error loading academy:', err);
      setError('Error al cargar información de la academia');
    } finally {
      setLoading(false);
    }
  };

  const processInvitation = async () => {
    if (!user?.email || !academyId) return;

    try {
      setProcessing(true);
      setError('');

      // Check if user already exists as a student
      const { data: existing } = await supabase
        .from('academy_students')
        .select('id, status')
        .eq('academy_id', academyId)
        .eq('student_email', user.email)
        .maybeSingle();

      if (existing) {
        toast.info('Ya estás registrado en esta academia');
        setTimeout(() => navigate('/talent-dashboard'), 1500);
        return;
      }

      // Proceed without requiring a talent profile; only authentication is needed

      // Verificar si ya tiene un nombre válido en el perfil
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .maybeSingle();

      // Obtener el nombre del usuario SOLO de fuentes reales (NO derivar del email)
      const getRealUserName = () => {
        const metadata = user.user_metadata as any;
        const emailPrefix = (user.email || '').split('@')[0]?.toLowerCase() || '';
        
        // 1. full_name directo de metadata
        if (metadata?.full_name && metadata.full_name.trim() !== '') {
          return metadata.full_name;
        }
        
        // 2. Combinar first_name y last_name (del formulario de registro o Google OAuth)
        const firstName = metadata?.first_name || '';
        const lastName = metadata?.last_name || '';
        if (firstName || lastName) {
          return `${firstName} ${lastName}`.trim();
        }
        
        // 3. name directo (Google OAuth)
        if (metadata?.name && metadata.name.trim() !== '') {
          return metadata.name;
        }
        
        // 4. Verificar perfil existente (si no es derivado del email)
        if (existingProfile?.full_name && 
            existingProfile.full_name.trim() !== '' && 
            existingProfile.full_name !== 'Sin nombre' &&
            existingProfile.full_name.toLowerCase() !== emailPrefix) {
          return existingProfile.full_name;
        }
        
        // NO derivar del email - retornar null
        return null;
      };

      const realUserName = getRealUserName();

      // Solo actualizar perfil si tenemos un nombre REAL
      if (realUserName) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            user_id: user.id,
            full_name: realUserName
          }, { onConflict: 'user_id' });

        if (profileError) {
          console.error('Error updating profile:', profileError);
        }
      }

      // Insert into academy_students (usar email como placeholder si no hay nombre real)
      const { error: insertError } = await supabase
        .from('academy_students')
        .insert({
          academy_id: academyId,
          student_email: user.email,
          student_name: realUserName || user.email, // Email como placeholder temporal
          status: status === 'graduated' ? 'graduated' : 'enrolled',
          enrollment_date: new Date().toISOString().split('T')[0],
          ...(status === 'graduated' && {
            graduation_date: new Date().toISOString().split('T')[0]
          })
        });

      if (insertError) throw insertError;

      // Check if user has freemium_talent role and upgrade to premium_talent
      const { data: currentRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (currentRole?.role === 'freemium_talent') {
        // Upgrade to premium_talent using an edge function
        const { error: upgradeError } = await supabase.functions.invoke('admin-change-user-role', {
          body: {
            userId: user.id,
            newRole: 'premium_talent',
            reason: 'Auto-upgrade: Unido a academia como estudiante'
          }
        });

        if (upgradeError) {
          console.error('Error upgrading role:', upgradeError);
          // Don't fail the whole process, just log the error
        } else {
          console.log('Successfully upgraded user to premium_talent');
        }
      }

      // Clear the pending invitation from localStorage
      localStorage.removeItem('pendingAcademyInvitation');

      setSuccess(true);
      toast.success('¡Te has unido a la academia exitosamente!');
      
      // Verificar si el usuario tiene un nombre real para decidir redirección
      const hasRealName = realUserName !== null;
      
      // Redirect after a short delay
      setTimeout(() => {
        if (!hasRealName) {
          // Forzar onboarding para capturar nombre real
          navigate('/talent-onboarding');
        } else {
          navigate('/talent-dashboard');
        }
      }, 2000);

    } catch (err: any) {
      console.error('Error processing invitation:', err);
      setError(err.message || 'Error al procesar la invitación');
    } finally {
      setProcessing(false);
    }
  };

  const handleRegisterAsTalent = () => {
    // Save invitation params to localStorage
    localStorage.setItem('pendingAcademyInvitation', JSON.stringify({
      academyId,
      status,
      timestamp: Date.now()
    }));
    navigate('/register-talent');
  };

  const handleLogin = () => {
    localStorage.setItem('pendingAcademyInvitation', JSON.stringify({
      academyId,
      status,
      timestamp: Date.now()
    }));
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Cargando invitación...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !academyInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => navigate('/')} className="w-full">
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
            <h2 className="text-2xl font-bold text-center">¡Bienvenido a {academyInfo?.name}!</h2>
            <p className="text-center text-muted-foreground">
              Te has unido exitosamente como {status === 'graduated' ? 'graduado' : 'estudiante activo'}
            </p>
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Redirigiendo a tu dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {academyInfo?.logo_url ? (
              <img 
                src={academyInfo.logo_url} 
                alt={academyInfo.name}
                className="h-20 w-auto object-contain"
              />
            ) : (
              <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center">
                <GraduationCap className="h-10 w-10 text-primary" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl">
            Invitación a {academyInfo?.name}
          </CardTitle>
          <CardDescription>
            Has sido invitado a unirte como {status === 'graduated' ? 'graduado' : 'estudiante activo'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {academyInfo?.description && (
            <p className="text-sm text-muted-foreground text-center">
              {academyInfo.description}
            </p>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isAuthenticated ? (
            <div className="space-y-3">
              <Alert>
                <AlertDescription>
                  Para aceptar esta invitación, necesitas tener una cuenta de talento
                </AlertDescription>
              </Alert>
              <Button 
                onClick={handleRegisterAsTalent}
                className="w-full"
              >
                Registrarme como Talento
              </Button>
              <Button 
                variant="outline"
                onClick={handleLogin}
                className="w-full"
              >
                Ya tengo cuenta - Iniciar Sesión
              </Button>
            </div>
          ) : processing ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Procesando invitación...</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptAcademyInvitation;
