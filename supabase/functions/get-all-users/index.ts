import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('Fetching all users from auth with pagination...');

    // Get ALL users from auth.users with pagination
    let allAuthUsers: any[] = [];
    let page = 1;
    const perPage = 1000; // Maximum allowed by Supabase

    while (true) {
      const response = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage
      });

      if (response.error) {
        console.error('Auth error on page', page, ':', response.error);
        throw response.error;
      }

      const pageUsers = response.data?.users || [];
      
      if (!pageUsers || pageUsers.length === 0) {
        console.log(`No users found on page ${page}, stopping pagination`);
        break;
      }
      
      allAuthUsers = [...allAuthUsers, ...pageUsers];
      console.log(`Fetched page ${page}: ${pageUsers.length} users (Total so far: ${allAuthUsers.length})`);
      
      // If page has fewer users than perPage, it's the last page
      if (pageUsers.length < perPage) {
        console.log(`Reached last page (got ${pageUsers.length} < ${perPage})`);
        break;
      }
      
      page++;
    }

    console.log(`Total auth users fetched: ${allAuthUsers.length}`);

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.error('Profiles error:', profilesError);
    }

    // Debug: Count profiles with avatars
    const profilesWithAvatars = profiles?.filter(p => p.avatar_url) || [];
    console.log(`DEBUG: Total profiles: ${profiles?.length || 0}, Profiles with avatars: ${profilesWithAvatars.length}`);

    // Get all talent profiles (for country data and completeness calculation)
    const { data: talentProfiles, error: talentError } = await supabaseAdmin
      .from('talent_profiles')
      .select('user_id, country, city, primary_category_id, title, experience_level, skills, bio');

    if (talentError) {
      console.error('Talent profiles error:', talentError);
    }

    // Get all talent education records
    const { data: educationData, error: educationError } = await supabaseAdmin
      .from('talent_education')
      .select('user_id');

    if (educationError) {
      console.error('Education error:', educationError);
    }

    // Build set of users with education
    const usersWithEducation = new Set<string>(
      (educationData || []).map(e => e.user_id)
    );

    // Get all user roles
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('*');

    if (rolesError) {
      console.error('Roles error:', rolesError);
    }

    // Get company counts for each user
    const { data: companyCounts, error: companyError } = await supabaseAdmin
      .from('company_user_roles')
      .select('user_id')
      .eq('status', 'accepted');

    if (companyError) {
      console.error('Company counts error:', companyError);
    }

    // Get company user roles with company details (for admin/owner/viewer detection and primary company)
    const { data: companyRolesData, error: companyRolesError } = await supabaseAdmin
      .from('company_user_roles')
      .select('user_id, role, company_id, companies(id, name, status, business_type)')
      .eq('status', 'accepted');

    if (companyRolesError) {
      console.error('Company roles error:', companyRolesError);
    }

    // Build company counts map
    const companyCountsMap = new Map<string, number>();
    companyCounts?.forEach(c => {
      const count = companyCountsMap.get(c.user_id) || 0;
      companyCountsMap.set(c.user_id, count + 1);
    });
    
    // Build user company info map (for contextual role display)
    const userCompanyInfoMap = new Map<string, { 
      company_role: string; 
      primary_company_name: string;
      primary_company_id: string;
      is_premium_company: boolean;
    }>();
    
    companyRolesData?.forEach(cr => {
      if (!cr.user_id) return;
      const existing = userCompanyInfoMap.get(cr.user_id);
      const company = cr.companies as any;
      const isPremium = company?.status === 'premium';
      
      // Role priority: owner > admin > viewer
      const rolePriority: Record<string, number> = { owner: 3, admin: 2, viewer: 1 };
      const currentPriority = rolePriority[cr.role] || 0;
      const existingPriority = existing ? (rolePriority[existing.company_role] || 0) : -1;
      
      if (!existing || currentPriority > existingPriority) {
        userCompanyInfoMap.set(cr.user_id, {
          company_role: cr.role,
          primary_company_name: company?.name || 'Empresa',
          primary_company_id: cr.company_id,
          is_premium_company: isPremium
        });
      }
    });

    // Combine all data
    const allUsers = allAuthUsers.map(user => {
      const profile = profiles?.find(p => p.user_id === user.id);
      const talentProfile = talentProfiles?.find(tp => tp.user_id === user.id);
      const role = roles?.find(r => r.user_id === user.id);
      const companies_count = companyCountsMap.get(user.id) || 0;

      // Debug specific user
      if (user.email === 'isebas15cr@gmail.com') {
        console.log('DEBUG isebas15cr@gmail.com:', {
          user_id: user.id,
          profile_found: !!profile,
          profile_user_id: profile?.user_id,
          profile_avatar: profile?.avatar_url,
          metadata_avatar: user.user_metadata?.avatar_url,
          metadata_picture: user.user_metadata?.picture
        });
      }

      // Get company roles for this user
      const userCompanyRoles = companyRolesData?.filter(cr => cr.user_id === user.id) || [];
      const companyRoles = userCompanyRoles.map(cr => cr.role);
      const isCompanyAdmin = companyRoles.some(r => r === 'owner' || r === 'admin');
      const hasCompanies = companies_count > 0;

      // Determine user role: prefer role from user_roles table, fallback to metadata, then default
      let userRole = role?.role;
      
      // If no role in user_roles, try to infer from metadata
      if (!userRole) {
        const metadataUserType = user.user_metadata?.user_type || user.user_metadata?.original_user_type;
        
        // Normalize old roles to new format
        if (metadataUserType === 'talent' || metadataUserType === 'freemium_talent') {
          userRole = 'freemium_talent';
        } else if (metadataUserType === 'business' || metadataUserType === 'freemium_business') {
          userRole = 'freemium_business';
        } else if (metadataUserType === 'academy_premium') {
          userRole = 'academy_premium';
        } else if (hasCompanies) {
          // If user has companies, likely a business user
          userRole = 'freemium_business';
        } else {
          // Default to freemium_talent instead of old 'talent'
          userRole = 'freemium_talent';
        }
      } else {
        // Normalize old roles if they exist
        if (userRole === 'talent') {
          userRole = 'freemium_talent';
        } else if (userRole === 'business') {
          userRole = 'freemium_business';
        }
      }

      // Helper to extract readable name from email
      const extractNameFromEmail = (email: string): string => {
        if (!email) return 'Sin nombre';
        const prefix = email.split('@')[0];
        // Replace common separators with spaces
        const nameParts = prefix.split(/[._-]+/);
        // Capitalize each part and remove trailing numbers
        const cleanedParts = nameParts
          .map(part => {
            // Remove trailing numbers from each part
            const cleanPart = part.replace(/\d+$/, '');
            if (!cleanPart) return null;
            return cleanPart.charAt(0).toUpperCase() + cleanPart.slice(1).toLowerCase();
          })
          .filter(Boolean);
        
        return cleanedParts.length > 0 ? cleanedParts.join(' ') : 'Sin nombre';
      };

      // Extract name from multiple sources with better fallback
      const extractName = () => {
        const emailPrefix = user.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
        
        // 1. Profile full_name es la fuente principal (datos actualizados por el usuario)
        if (profile?.full_name && profile.full_name.trim() !== '') {
          const nameWords = profile.full_name.trim().split(/\s+/).filter((w: string) => w.length > 0);
          const cleanName = profile.full_name.toLowerCase().replace(/[^a-z0-9]/g, '');
          
          // Nombre válido si: no "sin nombre", y tiene 2+ palabras O es diferente del email
          if (profile.full_name.toLowerCase() !== 'sin nombre' &&
              (nameWords.length >= 2 || cleanName !== emailPrefix)) {
            return profile.full_name;
          }
        }
        
        // 2. Priorizar metadata full_name (viene de registro o Google auth)
        if (user.user_metadata?.full_name && user.user_metadata.full_name.trim() !== '') {
          return user.user_metadata.full_name;
        }
        
        // 3. Combinar first_name y last_name de metadata
        const firstName = user.user_metadata?.first_name || '';
        const lastName = user.user_metadata?.last_name || '';
        if (firstName || lastName) {
          return `${firstName} ${lastName}`.trim();
        }
        
        // 4. User metadata name (Google auth sometimes uses this)
        if (user.user_metadata?.name && user.user_metadata.name.trim() !== '') {
          return user.user_metadata.name;
        }
        
        // 5. Fallback: Extraer nombre legible del email
        return extractNameFromEmail(user.email);
      };

      // Extract avatar from multiple sources
      const extractAvatar = () => {
        // 1. Profile avatar_url es la fuente principal
        if (profile?.avatar_url && profile.avatar_url.trim() !== '') {
          return profile.avatar_url;
        }
        
        // 2. User metadata avatar_url (Google auth)
        if (user.user_metadata?.avatar_url && user.user_metadata.avatar_url.trim() !== '') {
          return user.user_metadata.avatar_url;
        }
        
        // 3. User metadata picture (otra variante de Google auth)
        if (user.user_metadata?.picture && user.user_metadata.picture.trim() !== '') {
          return user.user_metadata.picture;
        }
        
        return null;
      };

      const fullName = extractName();
      const avatarUrl = extractAvatar();
      
      // Check if user has completed onboarding (has real name and avatar)
      const emailPrefix = user.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
      const nameWords = (profile?.full_name || '').trim().split(/\s+/).filter((w: string) => w.length > 0);
      const cleanName = (profile?.full_name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      
      // Nombre válido si: no vacío, no "sin nombre", y tiene 2+ palabras O es diferente del email
      const hasRealName = profile?.full_name && 
        profile.full_name.trim() !== '' && 
        profile.full_name.toLowerCase() !== 'sin nombre' &&
        (nameWords.length >= 2 || cleanName !== emailPrefix);
      const hasAvatar = !!(profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture);
      const hasTalentProfile = !!talentProfile;
      const hasCompletedOnboarding = hasRealName && hasAvatar && (userRole.includes('business') || hasTalentProfile);

      // Calculate profile completeness based on 10 criteria (10% each)
      const calculateProfileCompleteness = (): number => {
        let score = 0;
        
        // 1. Profile Picture (10%)
        if (hasAvatar) score += 10;
        
        // 2. Full Name (10%)
        if (hasRealName) score += 10;
        
        // 3. Country (10%)
        if (profile?.country || talentProfile?.country) score += 10;
        
        // 4. City (10%)
        if (talentProfile?.city) score += 10;
        
        // 5. Primary Category (10%)
        if (talentProfile?.primary_category_id) score += 10;
        
        // 6. Professional Title (10%)
        if (talentProfile?.title) score += 10;
        
        // 7. Experience Level - valid values only (10%)
        const validExperienceLevels = ['0-1', '1-3', '3-6', '6+'];
        if (talentProfile?.experience_level && validExperienceLevels.includes(talentProfile.experience_level)) {
          score += 10;
        }
        
        // 8. Skills - min 3 (10%)
        if (Array.isArray(talentProfile?.skills) && talentProfile.skills.length >= 3) {
          score += 10;
        }
        
        // 9. Bio - min 50 chars (10%)
        if (talentProfile?.bio && talentProfile.bio.length >= 50) {
          score += 10;
        }
        
        // 10. Academic Education - min 1 record (10%)
        if (usersWithEducation.has(user.id)) {
          score += 10;
        }
        
        return score;
      };

      const profile_completeness = calculateProfileCompleteness();

      // Get contextual company info
      const companyInfo = userCompanyInfoMap.get(user.id);

      return {
        id: user.id,
        email: user.email,
        full_name: fullName,
        avatar_url: avatarUrl,
        role: userRole,
        created_at: profile?.created_at || user.created_at,
        updated_at: profile?.updated_at || user.updated_at,
        last_sign_in_at: user.last_sign_in_at,
        last_activity: profile?.last_activity || null,
        email_confirmed_at: user.email_confirmed_at,
        is_active: !user.banned_until,
        country: profile?.country || talentProfile?.country || null,
        companies_count,
        company_roles: companyRoles,
        is_company_admin: isCompanyAdmin,
        has_companies: hasCompanies,
        has_completed_onboarding: hasCompletedOnboarding,
        profile_completeness,
        // New fields for contextual role display
        primary_company_role: companyInfo?.company_role || null,
        primary_company_name: companyInfo?.primary_company_name || null,
        primary_company_id: companyInfo?.primary_company_id || null,
        is_premium_company: companyInfo?.is_premium_company || false
      };
    });

    console.log(`Returning ${allUsers.length} users`);

    return new Response(
      JSON.stringify({ 
        users: allUsers,
        total: allUsers.length,
        pages_fetched: page
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-all-users:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
