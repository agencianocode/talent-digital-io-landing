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
    // Get the authenticated user from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    // Create a client with the user's token to verify authentication
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get the authenticated user
    const { data: { user: requestingUser }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !requestingUser) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { userId, email } = await req.json();

    if (!userId && !email) {
      throw new Error('userId or email is required');
    }

    let user;
    let getUserError;

    if (email) {
      console.log(`Searching for user by email: ${email.substring(0, 3)}***`);
      
      // Paginate through users to find the email
      let found = false;
      let page = 1;
      const perPage = 1000;
      const maxPages = 10;
      
      while (!found && page <= maxPages) {
        console.log(`Searching page ${page}...`);
        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
          page,
          perPage
        });
        
        if (error) {
          console.error('Error listing users:', error);
          throw error;
        }
        
        user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
        
        if (user) {
          console.log(`User found on page ${page}`);
          found = true;
          break;
        }
        
        if (users.length < perPage) {
          console.log('Reached end of users list');
          break;
        }
        
        page++;
      }
      
      if (!user) {
        console.log(`User not found with email: ${email.substring(0, 3)}***`);
        throw new Error('User not found with that email');
      }
    } else {
      // Get user by ID
      const response = await supabaseAdmin.auth.admin.getUserById(userId);
      user = response.data.user;
      getUserError = response.error;
      
      if (getUserError) {
        throw getUserError;
      }
    }

    const actualUserId = user.id;

    // Permission check: Verify the requesting user has permission to view this profile
    // Rules:
    // 1. User can view their own profile
    // 2. Business users can view talent profiles (for talent discovery)
    // 3. Admins can view any profile
    // 4. Users in the same company can view each other's profiles

    const isOwnProfile = requestingUser.id === actualUserId;
    
    // Get requesting user's role
    const { data: requestingUserRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', requestingUser.id)
      .maybeSingle();
    
    const requestingRole = requestingUserRole?.role || 
                          requestingUser.user_metadata?.user_type || 
                          requestingUser.user_metadata?.original_user_type || 
                          'freemium_talent';
    
    const isAdmin = requestingRole === 'admin';
    
    // Check if requesting user is a business user
    const isBusinessUser = requestingRole === 'freemium_business' || 
                          requestingRole === 'premium_business' || 
                          requestingRole === 'academy_premium' ||
                          requestingRole === 'business';
    
    // Get target user's role to check if they're a talent
    const { data: targetUserRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', actualUserId)
      .maybeSingle();
    
    const targetRole = targetUserRole?.role || 
                      user.user_metadata?.user_type || 
                      user.user_metadata?.original_user_type || 
                      'freemium_talent';
    
    const isTargetTalent = targetRole === 'freemium_talent' || 
                          targetRole === 'premium_talent' || 
                          targetRole === 'talent' ||
                          targetRole === 'academy_premium';
    
    // Check if users are in the same company
    const { data: sharedCompanies } = await supabaseAdmin
      .from('company_user_roles')
      .select('company_id')
      .eq('user_id', requestingUser.id)
      .eq('status', 'accepted');
    
    const requestingCompanyIds = sharedCompanies?.map(c => c.company_id) || [];
    
    let isSameCompany = false;
    if (requestingCompanyIds.length > 0) {
      const { data: targetCompanies } = await supabaseAdmin
        .from('company_user_roles')
        .select('company_id')
        .eq('user_id', actualUserId)
        .eq('status', 'accepted')
        .in('company_id', requestingCompanyIds);
      
      isSameCompany = (targetCompanies?.length || 0) > 0;
    }

    // Permission check
    const hasPermission = isOwnProfile || 
                         isAdmin || 
                         (isBusinessUser && isTargetTalent) || 
                         isSameCompany;

    if (!hasPermission) {
      console.log('❌ Permission denied:', {
        requestingUserId: requestingUser.id,
        targetUserId: actualUserId,
        requestingRole,
        targetRole,
        isOwnProfile,
        isAdmin,
        isBusinessUser,
        isTargetTalent,
        isSameCompany
      });
      return new Response(
        JSON.stringify({ error: 'No tienes permisos para ver este perfil' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Permission granted:', {
      requestingUserId: requestingUser.id,
      targetUserId: actualUserId,
      requestingRole,
      targetRole,
      reason: isOwnProfile ? 'own_profile' : 
              isAdmin ? 'admin' : 
              (isBusinessUser && isTargetTalent) ? 'business_viewing_talent' : 
              isSameCompany ? 'same_company' : 'unknown'
    });

    // Get profile data
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', actualUserId)
      .maybeSingle();

    // Get user role
    const { data: role, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', actualUserId)
      .maybeSingle();

    // Get companies
    const { data: companies, error: companiesError } = await supabaseAdmin
      .from('company_user_roles')
      .select(`
        id,
        role,
        created_at,
        companies (
          id,
          name
        )
      `)
      .eq('user_id', actualUserId)
      .eq('status', 'accepted');

    // Determine user role: prefer role from user_roles table, fallback to metadata, then default
    let userRole = role?.role;
    
    // If no role in user_roles, try to infer from metadata
    if (!userRole) {
      const metadataUserType = user?.user_metadata?.user_type || user?.user_metadata?.original_user_type;
      const hasCompanies = (companies?.length || 0) > 0;
      
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

    // Get avatar_url with fallback to user_metadata, filter out blob URLs
    const rawAvatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.profile_photo_url || null;
    const filteredAvatarUrl = rawAvatarUrl && !rawAvatarUrl.startsWith('blob:') ? rawAvatarUrl : null;

    const userDetails = {
      user_id: actualUserId,
      id: actualUserId,
      email: user?.email || '',
      full_name: profile?.full_name || user?.user_metadata?.full_name || 'Sin nombre',
      phone: profile?.phone || null,
      avatar_url: filteredAvatarUrl,
      role: userRole,
      created_at: profile?.created_at || user?.created_at || new Date().toISOString(),
      updated_at: profile?.updated_at || new Date().toISOString(),
      last_sign_in_at: user?.last_sign_in_at || null,
      email_confirmed_at: user?.email_confirmed_at || null,
      companies: companies?.map(c => ({
        id: c.companies.id,
        name: c.companies.name,
        role: c.role,
        joined_at: c.created_at
      })) || [],
      profile_completion: profile?.profile_completeness || 0,
      is_active: !user?.banned_until,
      country: profile?.country || null
    };

    return new Response(
      JSON.stringify(userDetails),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-user-details:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});