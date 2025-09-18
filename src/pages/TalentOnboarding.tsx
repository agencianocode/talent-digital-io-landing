import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TalentOnboardingStep1 from '../components/TalentOnboardingStep1';

interface TalentProfile {
  firstName: string;
  lastName: string;
  country: string;
  phone: string;
  profilePhoto?: File | null;
}

const TalentOnboarding = () => {
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const [currentStep] = useState(1);
  const [talentProfile, setTalentProfile] = useState<TalentProfile>({
    firstName: '',
    lastName: '',
    country: '',
    phone: '',
    profilePhoto: null
  });

  // Verificar autenticación - dar tiempo para que se procese
  useEffect(() => {
    // Dar tiempo para que Supabase procese la autenticación del email
    const timer = setTimeout(() => {
      if (!user) {
        console.log('TalentOnboarding: No authenticated user found, redirecting to register');
        navigate('/register-talent');
        return;
      }
    }, 2000); // Esperar 2 segundos

    return () => clearTimeout(timer);
  }, [user, navigate]);

  const handleStep1Complete = async (data: TalentProfile) => {
    setTalentProfile(data);
    
    if (!user) {
      toast.error('Debes estar autenticado para completar el onboarding');
      return;
    }
    
    try {
      // Guardar datos del perfil en user_metadata
      const metadataUpdates: any = {
        ...user.user_metadata,
        full_name: `${data.firstName} ${data.lastName}`.trim(),
        first_name: data.firstName,
        last_name: data.lastName,
        country: data.country,
        phone: data.phone,
        updated_at: new Date().toISOString()
      };
      
      // Subir foto de perfil si existe
      if (data.profilePhoto) {
        const fileExt = data.profilePhoto.name.split('.').pop();
        const fileName = `${user.id}-profile.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, data.profilePhoto, { upsert: true });
        
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
          
          metadataUpdates.avatar_url = publicUrl;
        }
      }
      
      const { error: metadataError } = await supabase.auth.updateUser({
        data: metadataUpdates
      });
      
      if (metadataError) {
        throw metadataError;
      }
      
      toast.success('¡Perfil creado exitosamente!');
      
      // Por ahora redirigir al dashboard de talento
      // TODO: Implementar paso 2 cuando esté listo
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error saving talent profile:', error);
      toast.error('Error al guardar el perfil. Intenta nuevamente.');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-slate-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 font-['Inter']">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold">TalentoDigital.io</h1>
            </div>
            <div className="text-sm text-slate-600">
              Configuración de perfil de talento
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            {currentStep === 1 && (
              <TalentOnboardingStep1
                onComplete={handleStep1Complete}
                initialData={talentProfile}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentOnboarding;
