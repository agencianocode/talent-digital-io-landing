import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
      const { data: { users: pageUsers }, error: authError } = 
        await supabaseAdmin.auth.admin.listUsers({
          page,
          perPage
        });

      if (authError) {
        console.error('Auth error on page', page, ':', authError);
        throw authError;
      }
      
      if (!pageUsers || pageUsers.length === 0) break;
      
      allAuthUsers = [...allAuthUsers, ...pageUsers];
      console.log(`Fetched page ${page}: ${pageUsers.length} users`);
      
      // If page has fewer users than perPage, it's the last page
      if (pageUsers.length < perPage) break;
      
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

    // Get all talent profiles (for country data)
    const { data: talentProfiles, error: talentError } = await supabaseAdmin
      .from('talent_profiles')
      .select('user_id, country');

    if (talentError) {
      console.error('Talent profiles error:', talentError);
    }

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

    // Get company user roles (for admin/owner/viewer detection)
    const { data: companyRolesData, error: companyRolesError } = await supabaseAdmin
      .from('company_user_roles')
      .select('user_id, role')
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

    // Combine all data
    const allUsers = allAuthUsers.map(user => {
      const profile = profiles?.find(p => p.user_id === user.id);
      const talentProfile = talentProfiles?.find(tp => tp.user_id === user.id);
      const role = roles?.find(r => r.user_id === user.id);
      const companies_count = companyCountsMap.get(user.id) || 0;

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

      // Extract name from multiple sources with better fallback
      const extractName = () => {
        // 1. Profile full_name (if not empty)
        if (profile?.full_name && profile.full_name.trim() !== '') {
          return profile.full_name;
        }
        // 2. User metadata full_name
        if (user.user_metadata?.full_name && user.user_metadata.full_name.trim() !== '') {
          return user.user_metadata.full_name;
        }
        // 3. User metadata name (Google auth sometimes uses this)
        if (user.user_metadata?.name && user.user_metadata.name.trim() !== '') {
          return user.user_metadata.name;
        }
        // 4. Combine first_name and last_name from metadata
        const firstName = user.user_metadata?.first_name || '';
        const lastName = user.user_metadata?.last_name || '';
        if (firstName || lastName) {
          return `${firstName} ${lastName}`.trim();
        }
        // 5. No name found
        return null;
      };

      const fullName = extractName();

      return {
        id: user.id,
        email: user.email,
        full_name: fullName || 'Sin nombre',
        avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || null,
        role: userRole,
        created_at: profile?.created_at || user.created_at,
        updated_at: profile?.updated_at || user.updated_at,
        last_sign_in_at: user.last_sign_in_at,
        email_confirmed_at: user.email_confirmed_at,
        is_active: !user.banned_until,
        country: profile?.country || talentProfile?.country || null,
        companies_count,
        company_roles: companyRoles,
        is_company_admin: isCompanyAdmin,
        has_companies: hasCompanies
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
