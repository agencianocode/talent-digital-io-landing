import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AcademyCertificationBadge } from '@/components/academy/AcademyCertificationBadge';
import { GraduationCap } from 'lucide-react';

interface AcademyAffiliation {
  academy_id: string;
  academy_name: string;
  status: 'enrolled' | 'graduated';
  graduation_date?: string;
  program_name?: string;
  brand_color?: string;
}

interface TalentCardAcademyBadgeProps {
  userId: string;
  userEmail?: string; // Email opcional para buscar afiliaciones
  size?: 'sm' | 'md' | 'lg';
  compact?: boolean; // Si es true, muestra solo un icono pequeño
}

/**
 * Componente que muestra el badge de Academia para un talento
 * Carga las afiliaciones basándose en el user_id
 */
export const TalentCardAcademyBadge = ({ 
  userId: _userId, // Mantener por compatibilidad, usar userEmail en su lugar
  userEmail,
  size = 'sm',
  compact = false 
}: TalentCardAcademyBadgeProps) => {
  const [affiliations, setAffiliations] = useState<AcademyAffiliation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Si no hay email, no podemos buscar afiliaciones
    if (!userEmail) {
      console.log('🔴 TalentCardAcademyBadge: No userEmail provided');
      setAffiliations([]);
      return;
    }

    console.log('🔍 TalentCardAcademyBadge: Buscando afiliaciones para email:', userEmail);

    const fetchAffiliations = async () => {
      try {
        setIsLoading(true);

        // Buscar en academy_students por email
        const { data, error } = await supabase
          .from('academy_students')
          .select(`
            academy_id,
            status,
            graduation_date,
            program_name,
            companies!academy_students_academy_id_fkey (
              name,
              brand_color
            )
          `)
          .eq('student_email', userEmail);

        if (error) {
          console.error('❌ Error fetching academy affiliations:', error);
          return;
        }

        console.log('✅ Academy affiliations data:', data);

        if (data && data.length > 0) {
          const formatted: AcademyAffiliation[] = data.map(item => ({
            academy_id: item.academy_id,
            academy_name: (item.companies as any)?.name || 'Academia',
            status: (item.status as 'enrolled' | 'graduated') || 'enrolled',
            graduation_date: item.graduation_date || undefined,
            program_name: item.program_name || undefined,
            brand_color: (item.companies as any)?.brand_color || undefined,
          }));

          console.log('🎓 Formatted affiliations:', formatted);
          setAffiliations(formatted);
        } else {
          console.log('⚠️ No academy affiliations found for:', userEmail);
          setAffiliations([]);
        }
      } catch (error) {
        console.error('❌ Error in TalentCardAcademyBadge:', error);
        setAffiliations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAffiliations();
  }, [userEmail]);

  if (isLoading || affiliations.length === 0) {
    return null;
  }

  // Modo compacto: mostrar chips separados para cada academia
  if (compact && affiliations.length > 0) {
    const maxVisible = affiliations.length <= 2 ? affiliations.length : 1;
    const remaining = affiliations.length - maxVisible;
    
    return (
      <div className="flex items-center gap-1 flex-wrap">
        {affiliations.slice(0, maxVisible).map((affiliation) => (
          <div 
            key={affiliation.academy_id}
            className="flex items-center gap-1 text-xs whitespace-nowrap px-2 py-1 rounded-md font-medium flex-shrink-0" 
            style={{ 
              backgroundColor: '#f6efff',
              color: affiliation?.brand_color || '#7c3aed'
            }}
          >
            <GraduationCap className="h-3 w-3 flex-shrink-0" />
            <span>{affiliation?.academy_name}</span>
          </div>
        ))}
        {remaining > 0 && (
          <div className="text-xs whitespace-nowrap px-2 py-1 rounded-md font-medium text-purple-600 bg-purple-50 flex-shrink-0">
            +{remaining}
          </div>
        )}
      </div>
    );
  }

  // Modo completo: muestra badges
  return (
    <div className="flex flex-wrap gap-1">
      {affiliations.map((affiliation, index) => (
        <AcademyCertificationBadge
          key={`${affiliation.academy_id}-${index}`}
          certification={{
            academy_id: affiliation.academy_id,
            academy_name: affiliation.academy_name,
            certification_date: affiliation.graduation_date || '',
            program: affiliation.program_name || '',
            badge_color: affiliation.brand_color || '#7c3aed',
          }}
          size={size}
          showProgram={false}
        />
      ))}
    </div>
  );
};

