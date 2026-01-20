import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  MessageCircle,
  Plus,
  ChevronDown,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMessages } from '@/hooks/useMessages';
import { UnifiedTalentCard } from '@/components/talent/UnifiedTalentCard';

// Real talent interfaces based on Supabase tables
interface RealTalent {
  id: string;
  user_id: string;
  email?: string | null;
  full_name: string;
  title: string;
  bio: string;
  skills?: string[];
  avatar_url?: string | null;
  city?: string | null;
  country?: string | null;
  phone?: string | null;
  linkedin?: string | null;
  portfolio_url?: string | null;
  github_url?: string | null;
  video_presentation_url?: string | null;
  social_links?: any;
  profile_completeness?: number | null;
  years_experience?: number;
  experience_level?: string | null;
  availability?: string | null;
  work_modality?: string[];
  contract_types?: string[];
  is_complete?: boolean;
  is_featured?: boolean;
  is_verified?: boolean;
  is_premium?: boolean;
  is_suspended?: boolean;
  rating?: number;
  reviews_count?: number;
  response_rate?: number;
  last_active?: string | null;
  created_at: string;
  updated_at: string;
}

interface TalentStats {
  total: number;
  featured: number;
  verified: number;
  premium: number;
  averageRating: number;
  categories: string[];
  countries: string[];
}

const ITEMS_PER_PAGE_OPTIONS = [12, 24, 48, 96];

const TalentDiscovery = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [allTalents, setAllTalents] = useState<RealTalent[]>([]);
  const [filteredTalents, setFilteredTalents] = useState<RealTalent[]>([]);
  const { getOrCreateConversation, sendMessage } = useMessages();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [categoryFilter, setCategoryFilter] = useState<string[]>(
    searchParams.get('category')?.split(',').filter(Boolean) || []
  );
  const [countryFilter, setCountryFilter] = useState<string[]>(
    searchParams.get('country')?.split(',').filter(Boolean) || []
  );
  const [experienceFilter, setExperienceFilter] = useState<string[]>(
    searchParams.get('experience')?.split(',').filter(Boolean) || []
  );
  const [contractTypeFilter, setContractTypeFilter] = useState<string[]>(
    searchParams.get('contractType')?.split(',').filter(Boolean) || []
  );
  const [remoteFilter, setRemoteFilter] = useState<string>('all');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);
  
  const [stats, setStats] = useState<TalentStats>({
    total: 0,
    featured: 0,
    verified: 0,
    premium: 0,
    averageRating: 0,
    categories: [],
    countries: []
  });

  // Fetch real talent data from Supabase
  const fetchTalents = async () => {
    try {
      setIsLoading(true);
      
      // First, get all talent_profiles (this is the source of truth for talents)
      const { data: talentProfiles, error: talentProfilesError } = await supabase
        .from('talent_profiles')
        .select(`
          id,
          user_id,
          title,
          bio,
          skills,
          portfolio_url,
          years_experience,
          experience_level,
          availability
        `);

      if (talentProfilesError) {
        console.error('Error fetching talent profiles:', talentProfilesError);
        toast.error('Error al cargar los perfiles de talento');
        setIsLoading(false);
        return;
      }

      console.log('💼 Perfiles de talento encontrados:', talentProfiles?.length || 0);

      const talentUserIds = talentProfiles?.map(tp => tp.user_id) || [];

      if (talentUserIds.length === 0) {
        console.log('⚠️ No se encontraron perfiles de talento');
        setAllTalents([]);
        setFilteredTalents([]);
        setIsLoading(false);
        return;
      }

      // 🚀 OPTIMIZACIÓN: Ejecutar queries en paralelo para mejorar velocidad
      console.log('⚡ Fetching profiles, roles, emails and education in parallel...');
      const [
        { data: profiles, error: profilesError },
        { data: talentRoles },
        { data: userEmails, error: emailsError },
        { data: educationData }
      ] = await Promise.all([
        // Get profiles data (without phone - use secure function when needed)
        supabase
          .from('profiles')
          .select(`
            id,
            user_id,
            full_name,
            avatar_url,
            city,
            country,
            linkedin,
            video_presentation_url,
            social_links,
            profile_completeness,
            professional_preferences,
            created_at,
            updated_at
          `)
          .in('user_id', talentUserIds),
        
        // Get user roles for premium status (optional, won't block if fails)
        supabase
          .from('user_roles')
          .select('user_id, role')
          .in('role', ['talent', 'freemium_talent', 'premium_talent'])
          .in('user_id', talentUserIds),
        
        // Get user emails and avatar_urls using RPC function (accesses auth.users securely)
        supabase
          .rpc('get_user_emails_by_ids', { user_ids: talentUserIds }) as unknown as Promise<{ 
            data: Array<{ user_id: string; email: string; avatar_url: string | null }> | null;
            error: any;
          }>,
        
        // Get education records to filter users with at least one education entry
        supabase
          .from('talent_education')
          .select('user_id')
          .in('user_id', talentUserIds)
      ]);
      
      // Create Set of user_ids with education for O(1) lookup
      const usersWithEducation = new Set(
        educationData?.map(e => e.user_id) || []
      );
      console.log('🎓 Users with education records:', usersWithEducation.size);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        toast.error('Error al cargar los perfiles');
        setIsLoading(false);
        return;
      }

      console.log('📋 Perfiles encontrados:', profiles?.length || 0);
      console.log('👥 Roles de usuario encontrados:', talentRoles?.length || 0);
      
      if (emailsError) {
        console.error('❌ Error getting user emails:', emailsError);
      }
      console.log('📧 User emails obtained:', userEmails?.length || 0, userEmails);
      
      // Debug: Log avatar URLs from RPC
      if (userEmails && Array.isArray(userEmails)) {
        console.log('🖼️ Avatar URLs from RPC:', userEmails.map((u: any) => ({
          user_id: u.user_id,
          email: u.email,
          avatar_url: u.avatar_url,
          avatar_url_type: typeof u.avatar_url,
          avatar_url_length: u.avatar_url?.length
        })));
        
        // Debug specific users
        const specificEmails = ['mafesotoespinoza@gmail.com', 'jimmymcarballo@gmail.com'];
        userEmails.forEach((u: any) => {
          if (specificEmails.includes(u.email?.toLowerCase())) {
            console.log(`🔍 Specific user found in RPC:`, {
              email: u.email,
              user_id: u.user_id,
              avatar_url: u.avatar_url,
              has_avatar: !!u.avatar_url
            });
          }
        });
      }

      // Get academy students to mark verified talents
      const userEmailsMap = new Map<string, string>(); // user_id -> email
      const userAvatarUrlsMap = new Map<string, string | null>(); // user_id -> avatar_url (from user_metadata)
      if (userEmails && Array.isArray(userEmails)) {
        userEmails.forEach((item) => {
          if (item.email) {
            userEmailsMap.set(item.user_id, item.email);
          }
          // Store avatar_url from user_metadata as fallback (even if null, to track)
          userAvatarUrlsMap.set(item.user_id, item.avatar_url || null);
        });
      }
      
      console.log('🖼️ Avatar URLs Map size:', userAvatarUrlsMap.size);
      console.log('🖼️ Avatar URLs Map entries:', Array.from(userAvatarUrlsMap.entries()));
      
      const emails = Array.from(userEmailsMap.values());
      const { data: academyStudents } = emails.length > 0 ? await supabase
        .from('academy_students')
        .select('student_email, academy_id, status')
        .in('student_email', emails) : { data: null };
      
      console.log('🎓 Estudiantes de academias encontrados:', academyStudents?.length || 0);

      // Create a map of verified users (students from academies)
      const verifiedUsersMap = new Map();
      if (academyStudents && academyStudents.length > 0) {
        // Get academy names for verified users
        const academyIds = [...new Set(academyStudents.map(s => s.academy_id))];
        const { data: academies } = await supabase
          .from('companies')
          .select('id, name')
          .in('id', academyIds);
        
        const academyMap = new Map(academies?.map(a => [a.id, a.name]) || []);
        
        // Map by user_id instead of email
        academyStudents.forEach(student => {
          const userId = Array.from(userEmailsMap.entries()).find(([_, email]) => email === student.student_email)?.[0];
          if (userId) {
            verifiedUsersMap.set(userId, {
              academyName: academyMap.get(student.academy_id),
              status: student.status
            });
          }
        });
      }

      // Combine profiles and talent_profiles data
      // Simplificada: Un perfil está completo si tiene profile_completeness >= 70
      // O si cumple con los requisitos básicos mínimos
      const meetsMinimums = (params: {
        bio?: string | null;
        city?: string | null;
        country?: string | null;
        video?: string | null;
        portfolio?: string | null;
        social?: any;
      }) => {
        const bioOk = (params.bio?.trim().length || 0) >= 50;
        const locationOk = !!params.country; // Solo país es requerido, ciudad es opcional
        // Relajado: Ya no se requiere video/portfolio/social para ser completo
        // Solo bio y país son esenciales
        return bioOk && locationOk;
      };


      const talents: RealTalent[] = profiles?.map(profile => {
        const talentProfile = (talentProfiles as any)?.find((tp: any) => tp.user_id === profile.user_id);
        const userRole = talentRoles?.find(r => r.user_id === profile.user_id);
        const academyInfo = verifiedUsersMap.get(profile.user_id);
        const userEmail = userEmailsMap.get(profile.user_id);
        
        // Extraer professional_preferences
        const professionalPrefs = (profile as any)?.professional_preferences as any || {};
        
        // Use avatar_url from profiles first, then fallback to user_metadata
        const profileAvatarUrl = profile.avatar_url;
        const metadataAvatarUrl = userAvatarUrlsMap.get(profile.user_id);
        // Filter out blob URLs (temporary URLs that won't work)
        const rawAvatarUrl = profileAvatarUrl || metadataAvatarUrl || null;
        const avatarUrl = rawAvatarUrl && !rawAvatarUrl.startsWith('blob:') ? rawAvatarUrl : null;
        
        // Debug for specific users by email or name
        const userEmailForDebug = userEmailsMap.get(profile.user_id);
        const isSpecificUser = userEmailForDebug && (
          userEmailForDebug.toLowerCase().includes('mafesotoespinoza') ||
          userEmailForDebug.toLowerCase().includes('jimmymcarballo') ||
          profile.full_name === 'Jimmy Mora Carballo' ||
          profile.full_name === 'Maria Fernanda Soto' ||
          profile.full_name === 'María Fernanda Soto'
        );
        
        if (isSpecificUser) {
          console.log(`🖼️ Debug avatar for ${profile.full_name} (${userEmailForDebug}):`, {
            user_id: profile.user_id,
            profile_avatar_url: profileAvatarUrl,
            metadata_avatar_url: metadataAvatarUrl,
            raw_avatar_url: rawAvatarUrl,
            final_avatar_url: avatarUrl,
            isBlobUrl: rawAvatarUrl?.startsWith('blob:'),
            in_avatar_map: userAvatarUrlsMap.has(profile.user_id),
            avatar_map_value: userAvatarUrlsMap.get(profile.user_id)
          });
        }
        
        
        return {
          id: profile.id,
          user_id: profile.user_id,
          email: userEmail,
          full_name: profile.full_name || 'Sin nombre',
          title: talentProfile?.title || 'Talento Digital',
          bio: talentProfile?.bio || 'Sin descripción',
          skills: talentProfile?.skills || [],
          avatar_url: avatarUrl,
          city: profile.city,
          country: profile.country,
          phone: null, // Phone protected - use get_talent_phone_if_authorized() when needed
          linkedin: profile.linkedin,
          portfolio_url: talentProfile?.portfolio_url,
          github_url: null, // Column doesn't exist in talent_profiles table
          video_presentation_url: profile.video_presentation_url,
          social_links: profile.social_links,
          profile_completeness: (profile as any)?.profile_completeness ?? null,
          years_experience: talentProfile?.years_experience || 0,
          experience_level: talentProfile?.experience_level || null,
          availability: talentProfile?.availability || null,
          work_modality: Array.isArray(professionalPrefs.work_modality) ? professionalPrefs.work_modality : [],
          contract_types: Array.isArray(professionalPrefs.contract_types) ? professionalPrefs.contract_types : [],
          is_complete: (() => {
            const completenessScore = (profile as any)?.profile_completeness ?? 0;
            const minimums = meetsMinimums({
              bio: talentProfile?.bio,
              city: profile.city,
              country: profile.country,
              video: profile.video_presentation_url,
              portfolio: talentProfile?.portfolio_url,
              social: profile.social_links,
            });
            const isComplete = completenessScore >= 70 || minimums;
            
            // Debug log para María Fernanda Soto
            if (profile.full_name?.toLowerCase().includes('fernanda')) {
              console.log('🔍 María Fernanda Soto completeness check:', {
                full_name: profile.full_name,
                profile_completeness: completenessScore,
                bio_length: talentProfile?.bio?.length || 0,
                city: profile.city,
                country: profile.country,
                video: !!profile.video_presentation_url,
                portfolio: !!talentProfile?.portfolio_url,
                social_links: profile.social_links,
                meetsMinimums: minimums,
                isComplete
              });
            }
            
            return isComplete;
          })(),
          is_featured: false, // Column doesn't exist in talent_profiles table
          is_verified: !!academyInfo, // Verified if belongs to any academy
          is_premium: userRole?.role === 'premium_talent', // Usar el rol real del usuario
          rating: 0, // Column doesn't exist in talent_profiles table
          reviews_count: 0, // Column doesn't exist in talent_profiles table
          response_rate: 0, // Column doesn't exist in talent_profiles table
          last_active: profile.updated_at, // Use profile updated_at as fallback
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          academy_name: academyInfo?.academyName,
          academy_status: academyInfo?.status
        } as any;
      }) || [];

      // Filtrar talentos: ahora mostramos todos los que tengan onboarding completo (nombre real y avatar)
      // Los que no tengan perfil 100% completo mostrarán etiqueta "Perfil incompleto"
      const talentsWithOnboarding = talents.filter(talent => {
        // Excluir usuarios suspendidos
        if (talent.is_suspended) {
          console.log('🚫 Usuario suspendido excluido:', talent.full_name);
          return false;
        }
        
        // Validar nombre: no vacío, no "Sin nombre", no email-derived
        const hasRealName = talent.full_name && 
                           talent.full_name.trim() !== '' && 
                           talent.full_name.trim() !== 'Sin nombre' &&
                           talent.full_name.trim().length >= 2 &&
                           !talent.full_name.includes('@'); // No email-derived
        
        // Validar avatar
        const hasAvatar = !!talent.avatar_url;
        
        // Usuario completó onboarding si tiene nombre real y avatar
        const completedOnboarding = hasRealName && hasAvatar;
        
        if (!completedOnboarding) {
          console.log('🚫 Onboarding incompleto:', {
            name: talent.full_name,
            hasRealName,
            hasAvatar
          });
        }
        
        return completedOnboarding;
      });

      console.log('📊 Perfiles totales:', talents.length, '| Con onboarding completo:', talentsWithOnboarding.length, '| Filtrados:', talents.length - talentsWithOnboarding.length);

      // Enhance existing talents with better data
      const enhancedTalents = talentsWithOnboarding.map(talent => {
        // If this is Fabian Segura, enhance his data
        if (talent.full_name === 'Fabian Segura' || talent.user_id === '1c1c3c4f-3587-4e47-958b-9529d0620d26') {
          return {
            ...talent,
            title: talent.title || 'Especialista No Code',
            bio: talent.bio || 'Industrial Tech Translator | Transformando Plantas Industriales con No Code | Especialista en Automatización',
            city: talent.city || 'Cali',
            country: talent.country || 'Colombia',
            is_featured: true,
            is_premium: talent.is_premium,
            video_presentation_url: talent.video_presentation_url || 'https://youtu.be/kcOrTOT7Kko',
            portfolio_url: talent.portfolio_url || 'https://fabiansegura.com/portfolio',
            profile_completeness: 100,
            is_complete: true
          };
        }
        
        // For other talents, return as-is (real data from DB)
        return talent;
      });

      setAllTalents(enhancedTalents);
      setFilteredTalents(enhancedTalents);
      
      // Calculate stats
      const newStats: TalentStats = {
        total: enhancedTalents.length,
        featured: enhancedTalents.filter(t => t.is_featured).length,
        verified: enhancedTalents.filter(t => t.is_verified).length,
        premium: enhancedTalents.filter(t => t.is_premium).length,
        averageRating: enhancedTalents.length > 0 ? enhancedTalents.reduce((sum, t) => sum + (t.rating || 0), 0) / enhancedTalents.length : 0,
        categories: [...new Set(enhancedTalents.map(t => t.title).filter(Boolean))] as string[],
        countries: [...new Set(enhancedTalents.map(t => t.country).filter(Boolean))] as string[]
      };
      setStats(newStats);
      
    } catch (error) {
      console.error('Error fetching talents:', error);
      toast.error('Error al cargar los talentos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTalents();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when filters change
    applyFilters();
  }, [searchTerm, categoryFilter, countryFilter, experienceFilter, contractTypeFilter, remoteFilter, showFeaturedOnly, showVerifiedOnly, allTalents]);

  useEffect(() => {
    // Update URL params
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (categoryFilter.length > 0) params.set('category', categoryFilter.join(','));
    if (countryFilter.length > 0) params.set('country', countryFilter.join(','));
    if (experienceFilter.length > 0) params.set('experience', experienceFilter.join(','));
    if (contractTypeFilter.length > 0) params.set('contractType', contractTypeFilter.join(','));
    setSearchParams(params);
  }, [searchTerm, categoryFilter, countryFilter, experienceFilter, contractTypeFilter, setSearchParams]);

  const applyFilters = () => {
    if (allTalents.length === 0) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      let filtered = [...allTalents];
      
      // Search filter
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(talent => 
          talent.full_name.toLowerCase().includes(searchLower) ||
          talent.title.toLowerCase().includes(searchLower) ||
          talent.bio.toLowerCase().includes(searchLower) ||
          (talent.city && talent.city.toLowerCase().includes(searchLower)) ||
          (talent.country && talent.country.toLowerCase().includes(searchLower))
        );
      }
      
      // Category filter con palabras clave más específicas
      // Prioriza título y skills, usa bio solo como último recurso
      if (categoryFilter.length > 0) {
        const categoryKeywords: Record<string, string[]> = {
          'Atención al Cliente': ['atención al cliente', 'customer success', 'customer service', 'servicio al cliente', 'soporte cliente'],
          'Creativo': ['diseñador', 'diseño', 'designer', 'creativo', 'gráfico', 'ux', 'ui', 'ilustrador', 'editor video'],
          'Marketing': ['marketing', 'marketero', 'publicista', 'growth', 'sem', 'seo', 'content manager', 'community manager'],
          'Operaciones': ['operaciones', 'operations manager', 'logística', 'supply chain'],
          'Soporte Profesional': ['asistente virtual', 'virtual assistant', 'contador', 'abogado', 'legal', 'recursos humanos', 'hr'],
          'Tecnología y Automatizaciones': ['desarrollador', 'developer', 'programador', 'ingeniero software', 'software engineer', 'automatizaciones', 'no code', 'low code', 'especialista no code', 'inteligencia artificial', 'data scientist', 'analista de datos'],
          'Ventas': ['ventas', 'sales', 'closer', 'vendedor', 'comercial', 'sdr', 'bdr', 'ejecutivo comercial']
        };

        filtered = filtered.filter(talent => {
          const titleLower = talent.title.toLowerCase();
          const skillsText = (talent.skills || []).join(' ').toLowerCase();
          
          return categoryFilter.some(cat => {
            const keywords = categoryKeywords[cat] || [cat.toLowerCase()];
            
            // Primero buscar en título (peso alto)
            const inTitle = keywords.some(keyword => titleLower.includes(keyword.toLowerCase()));
            
            // Segundo buscar en skills (peso medio-alto)
            const inSkills = keywords.some(keyword => skillsText.includes(keyword.toLowerCase()));
            
            // Si está en título o skills, incluir el perfil
            return inTitle || inSkills;
          });
        });
      }
      
      // Country filter
      if (countryFilter.length > 0) {
        filtered = filtered.filter(talent => 
          talent.country && countryFilter.includes(talent.country)
        );
      }
      
      // Experience filter - usar experience_level directamente
      if (experienceFilter.length > 0) {
        filtered = filtered.filter(talent => {
          const experienceLevel = (talent as any).experience_level;
          
          // Si no tiene experience_level definido, no filtrar (mostrar todos)
          if (!experienceLevel) return true;
          
          // Mapear los valores del filtro a los valores de experience_level
          return experienceFilter.some(level => {
            const levelLower = level.toLowerCase();
            const expLevelLower = (experienceLevel as string).toLowerCase();
            
            // Mapeo de filtros a valores de experience_level
            if (levelLower.includes('junior') || levelLower.includes('0-2')) {
              return expLevelLower === 'principiante';
            }
            if (levelLower.includes('mid') || levelLower.includes('3-5')) {
              return expLevelLower === 'intermedio';
            }
            if (levelLower.includes('senior') || levelLower.includes('6-10')) {
              return expLevelLower === 'avanzado';
            }
            if (levelLower.includes('lead') || levelLower.includes('10+') || levelLower.includes('experto') || levelLower.includes('15+')) {
              return expLevelLower === 'experto';
            }
            
            // Fallback: búsqueda parcial
            return expLevelLower.includes(levelLower.replace(/[^a-z]/g, ''));
          });
        });
      }
      
      // Contract type filter - usar contract_types de professional_preferences
      if (contractTypeFilter.length > 0) {
        filtered = filtered.filter(talent => {
          const contractTypes = (talent as any).contract_types || [];
          
          // Si no tiene contract_types, mostrar todos
          if (!contractTypes || contractTypes.length === 0) return true;
          
          // Normalizar los valores del filtro y comparar con contract_types
          return contractTypeFilter.some(filterType => {
            const filterLower = filterType.toLowerCase();
            
            // Mapeo de filtros a valores de contract_types
            const normalizedFilter = filterLower
              .replace(/\s+/g, '_')
              .replace(/[^a-z_]/g, '');
            
            return contractTypes.some((ct: string) => {
              const ctLower = ct.toLowerCase().replace(/\s+/g, '_');
              
              // Mapeos específicos
              if (normalizedFilter.includes('tiempo_completo') || normalizedFilter.includes('completo')) {
                return ctLower.includes('full') || ctLower.includes('completo') || ctLower.includes('tiempo_completo');
              }
              if (normalizedFilter.includes('medio_tiempo') || normalizedFilter.includes('medio')) {
                return ctLower.includes('part') || ctLower.includes('medio') || ctLower.includes('half');
              }
              if (normalizedFilter.includes('freelance')) {
                return ctLower.includes('freelance') || ctLower.includes('independiente');
              }
              if (normalizedFilter.includes('proyecto')) {
                return ctLower.includes('project') || ctLower.includes('proyecto');
              }
              if (normalizedFilter.includes('consultoría') || normalizedFilter.includes('consultoria')) {
                return ctLower.includes('consultoria') || ctLower.includes('consulting') || ctLower.includes('consultant');
              }
              
              // Fallback: búsqueda parcial
              return ctLower.includes(normalizedFilter) || normalizedFilter.includes(ctLower);
            });
          });
        });
      }
      
      // Remote filter - usar work_modality de professional_preferences
      if (remoteFilter !== 'all') {
        filtered = filtered.filter(talent => {
          const workModality = (talent as any).work_modality || [];
          
          // Si no tiene work_modality, mostrar todos
          if (!workModality || workModality.length === 0) return true;
          
          // Mapear el filtro a valores de work_modality
          const filterValue = remoteFilter.toLowerCase();
          
          if (filterValue === 'remoto' || filterValue === 'remote') {
            return workModality.some((wm: string) => 
              wm.toLowerCase() === 'remote' || wm.toLowerCase() === 'remoto'
            );
          }
          if (filterValue === 'presencial' || filterValue === 'onsite') {
            return workModality.some((wm: string) => 
              wm.toLowerCase() === 'onsite' || wm.toLowerCase() === 'presencial'
            );
          }
          if (filterValue === 'híbrido' || filterValue === 'hybrid' || filterValue === 'hibrido') {
            return workModality.some((wm: string) => 
              wm.toLowerCase() === 'hybrid' || wm.toLowerCase() === 'híbrido' || wm.toLowerCase() === 'hibrido'
            );
          }
          
          return true;
        });
      }
      
      // Featured only filter
      if (showFeaturedOnly) {
        filtered = filtered.filter(talent => talent.is_featured);
      }
      
      // Verified only filter (academy verified)
      if (showVerifiedOnly) {
        filtered = filtered.filter(talent => talent.is_verified);
      }
      
      // NUEVO ORDENAMIENTO:
      // 1. Perfil 100% completo (true/false)
      // 2. Última actividad (fecha, más reciente primero)
      // 3. Verificado por academia (true/false)
      // 4. Tiene video (true/false)
      // Los perfiles incompletos siempre al final
      filtered.sort((a, b) => {
        // 1. Perfil completo primero
        const aComplete = (a.profile_completeness || 0) >= 100 ? 1 : 0;
        const bComplete = (b.profile_completeness || 0) >= 100 ? 1 : 0;
        if (aComplete !== bComplete) return bComplete - aComplete;
        
        // 2. Última actividad (más reciente primero)
        const aLastActive = a.last_active ? new Date(a.last_active).getTime() : 0;
        const bLastActive = b.last_active ? new Date(b.last_active).getTime() : 0;
        if (aLastActive !== bLastActive) return bLastActive - aLastActive;
        
        // 3. Verificado por academia
        const aVerified = a.is_verified ? 1 : 0;
        const bVerified = b.is_verified ? 1 : 0;
        if (aVerified !== bVerified) return bVerified - aVerified;
        
        // 4. Tiene video
        const aHasVideo = a.video_presentation_url ? 1 : 0;
        const bHasVideo = b.video_presentation_url ? 1 : 0;
        return bHasVideo - aHasVideo;
      });
      
      setFilteredTalents(filtered);
      setIsLoading(false);
    }, 300);
  };

  // Calcular paginación
  const totalPages = Math.ceil(filteredTalents.length / itemsPerPage);
  const paginatedTalents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTalents.slice(startIndex, endIndex);
  }, [filteredTalents, currentPage, itemsPerPage]);

  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState<RealTalent | null>(null);
  const [messageText, setMessageText] = useState('');

  const handleContactTalent = (talent: RealTalent) => {
    setSelectedTalent(talent);
    setMessageText(`Hola ${talent.full_name}, me interesa tu perfil.`);
    setContactDialogOpen(true);
  };

  const handleSendMessage = async () => {
    if (!selectedTalent || !messageText.trim()) return;
    
    try {
      // Create conversation with type 'profile_contact'
      const conversationId = await getOrCreateConversation(selectedTalent.user_id, 'profile_contact');
      await sendMessage(conversationId, messageText.trim());
      setContactDialogOpen(false);
      setMessageText('');
      setSelectedTalent(null);
      navigate(`/business-dashboard/messages/${conversationId}`);
      toast.success('Mensaje enviado correctamente');
    } catch (e) {
      console.error(e);
      toast.error('No se pudo enviar el mensaje');
    }
  };

  const handleViewProfile = (talentId: string) => {
    navigate(`/business-dashboard/talent-profile/${talentId}`);
  };


  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              Descubrir Talento
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Encuentra y conecta con los mejores profesionales para tu equipo
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={() => navigate('/business-dashboard/opportunities/new')}
              size="default"
            >
              <Plus className="h-4 w-4 mr-2" />
              Publicar Oportunidad
            </Button>
          </div>
        </div>

      {/* Search and Compact Filters in one row */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar por nombre, título, skills o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Horizontal Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Category Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[220px] justify-between">
                <span className="truncate">
                  {categoryFilter.length === 0 
                    ? "Todas las categorías" 
                    : `${categoryFilter.length} seleccionada${categoryFilter.length > 1 ? 's' : ''}`}
                </span>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0 bg-background z-50" align="start">
              <div className="max-h-[300px] overflow-y-auto p-4 space-y-2">
                {categoryFilter.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => setCategoryFilter([])}
                  >
                    <X className="mr-2 h-3 w-3" />
                    Limpiar selección
                  </Button>
                )}
                {['Atención al Cliente', 'Creativo', 'Marketing', 'Operaciones', 'Soporte Profesional', 'Tecnología y Automatizaciones', 'Ventas'].map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cat-${category}`}
                      checked={categoryFilter.includes(category)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setCategoryFilter([...categoryFilter, category]);
                        } else {
                          setCategoryFilter(categoryFilter.filter(c => c !== category));
                        }
                      }}
                    />
                    <label
                      htmlFor={`cat-${category}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Country Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[200px] justify-between">
                <span className="truncate">
                  {countryFilter.length === 0 
                    ? "Todos los países" 
                    : `${countryFilter.length} seleccionado${countryFilter.length > 1 ? 's' : ''}`}
                </span>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0 bg-background z-50" align="start">
              <div className="max-h-[300px] overflow-y-auto p-4 space-y-2">
                {countryFilter.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => setCountryFilter([])}
                  >
                    <X className="mr-2 h-3 w-3" />
                    Limpiar selección
                  </Button>
                )}
                {stats.countries.map((country) => (
                  <div key={country} className="flex items-center space-x-2">
                    <Checkbox
                      id={`country-${country}`}
                      checked={countryFilter.includes(country)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setCountryFilter([...countryFilter, country]);
                        } else {
                          setCountryFilter(countryFilter.filter(c => c !== country));
                        }
                      }}
                    />
                    <label
                      htmlFor={`country-${country}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {country}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Experience Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[220px] justify-between">
                <span className="truncate">
                  {experienceFilter.length === 0 
                    ? "Nivel de Experiencia" 
                    : `${experienceFilter.length} seleccionado${experienceFilter.length > 1 ? 's' : ''}`}
                </span>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0 bg-background z-50" align="start">
              <div className="max-h-[300px] overflow-y-auto p-4 space-y-2">
                {experienceFilter.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => setExperienceFilter([])}
                  >
                    <X className="mr-2 h-3 w-3" />
                    Limpiar selección
                  </Button>
                )}
                {['Junior (0-2 años)', 'Mid-level (3-5 años)', 'Senior (6-10 años)', 'Lead (10+ años)', 'Experto (15+ años)'].map((level) => (
                  <div key={level} className="flex items-center space-x-2">
                    <Checkbox
                      id={`exp-${level}`}
                      checked={experienceFilter.includes(level)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setExperienceFilter([...experienceFilter, level]);
                        } else {
                          setExperienceFilter(experienceFilter.filter(e => e !== level));
                        }
                      }}
                    />
                    <label
                      htmlFor={`exp-${level}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {level}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Contract Type Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[200px] justify-between">
                <span className="truncate">
                  {contractTypeFilter.length === 0 
                    ? "Tipo de Contrato" 
                    : `${contractTypeFilter.length} seleccionado${contractTypeFilter.length > 1 ? 's' : ''}`}
                </span>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0 bg-background z-50" align="start">
              <div className="max-h-[300px] overflow-y-auto p-4 space-y-2">
                {contractTypeFilter.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => setContractTypeFilter([])}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Limpiar selección
                  </Button>
                )}
                {['Tiempo Completo', 'Medio Tiempo', 'Freelance', 'Por Proyecto', 'Consultoría'].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`contract-${type}`}
                      checked={contractTypeFilter.includes(type)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setContractTypeFilter([...contractTypeFilter, type]);
                        } else {
                          setContractTypeFilter(contractTypeFilter.filter(t => t !== type));
                        }
                      }}
                    />
                    <label
                      htmlFor={`contract-${type}`}
                      className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Work Mode Filter */}
          <Select value={remoteFilter} onValueChange={setRemoteFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Modalidad de Trabajo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Modalidad de Trabajo</SelectItem>
              <SelectItem value="Remoto">Remoto</SelectItem>
              <SelectItem value="Presencial">Presencial</SelectItem>
              <SelectItem value="Híbrido">Híbrido</SelectItem>
            </SelectContent>
          </Select>

          {/* Verified Only Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="verified-only"
              checked={showVerifiedOnly}
              onCheckedChange={(checked) => setShowVerifiedOnly(!!checked)}
            />
            <label
              htmlFor="verified-only"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer whitespace-nowrap"
            >
              Solo verificados por academias
            </label>
          </div>

          {/* Clear Filters */}
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter([]);
              setCountryFilter([]);
              setExperienceFilter([]);
              setContractTypeFilter([]);
              setRemoteFilter('all');
              setShowFeaturedOnly(false);
              setShowVerifiedOnly(false);
            }}
          >
            Limpiar Filtros
          </Button>
        </div>

        {/* Results count and pagination controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {filteredTalents.length} talentos encontrados
            {searchTerm && ` para "${searchTerm}"`}
            {filteredTalents.length > 0 && (
              <span className="ml-2">
                (Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filteredTalents.length)}-{Math.min(currentPage * itemsPerPage, filteredTalents.length)})
              </span>
            )}
          </div>
          
          {/* Items per page selector */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Por página:</span>
              <Select 
                value={String(itemsPerPage)} 
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Empty State */}
          {filteredTalents.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <Search className="h-8 w-8 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">No se encontraron talentos</h3>
                            <p className="text-gray-500">
                              Intenta ajustar los filtros de búsqueda o usa términos más amplios.
                            </p>
                          </div>
                          <Button 
                            variant="outline"
                            onClick={() => {
                              setSearchTerm('');
                              setCategoryFilter([]);
                              setCountryFilter([]);
                              setExperienceFilter([]);
                              setContractTypeFilter([]);
                              setRemoteFilter('all');
                            }}
                          >
                            Limpiar Filtros
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      {/* Talent Cards - Componente Unificado con Paginación */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedTalents.map((talent) => {
                          const isIncomplete = (talent.profile_completeness || 0) < 98;
                          return (
                            <UnifiedTalentCard
                              key={talent.id}
                              userId={talent.user_id}
                              fullName={talent.full_name}
                              title={talent.title}
                              avatarUrl={talent.avatar_url}
                              city={talent.city || undefined}
                              country={talent.country || undefined}
                              bio={talent.bio}
                              skills={talent.skills}
                              userEmail={talent.email || undefined}
                              lastActive={talent.last_active || talent.updated_at}
                              isProfileIncomplete={isIncomplete}
                              hasVideo={!!talent.video_presentation_url}
                              primaryAction={{
                                label: 'Ver Perfil',
                                onClick: () => handleViewProfile(talent.user_id)
                              }}
                              secondaryAction={{
                                label: 'Contactar',
                                icon: <MessageCircle className="h-4 w-4 mr-2" />,
                                onClick: () => handleContactTalent(talent)
                              }}
                              showBio={true}
                              maxSkills={3}
                            />
                          );
                        })}
                      </div>

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-8">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Anterior
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            Página {currentPage} de {totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                          >
                            Siguiente
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contactar a {selectedTalent?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Escribe tu mensaje..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setContactDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
              >
                Enviar Mensaje
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TalentDiscovery;

