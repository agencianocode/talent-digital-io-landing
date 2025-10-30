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

    console.log('Fetching all users from auth...');

    // Get all users from auth.users
    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
      console.error('Auth error:', authError);
      throw authError;
    }

    console.log(`Found ${users?.length || 0} auth users`);

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

    // Build company counts map
    const companyCountsMap = new Map<string, number>();
    companyCounts?.forEach(c => {
      const count = companyCountsMap.get(c.user_id) || 0;
      companyCountsMap.set(c.user_id, count + 1);
    });

    // Combine all data
    const allUsers = users?.map(user => {
      const profile = profiles?.find(p => p.user_id === user.id);
      const talentProfile = talentProfiles?.find(tp => tp.user_id === user.id);
      const role = roles?.find(r => r.user_id === user.id);
      const companies_count = companyCountsMap.get(user.id) || 0;

      return {
        id: user.id,
        email: user.email,
        full_name: profile?.full_name || user.user_metadata?.full_name || 'Sin nombre',
        avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || null,
        role: role?.role || 'talent',
        created_at: profile?.created_at || user.created_at,
        updated_at: profile?.updated_at || user.updated_at,
        last_sign_in_at: user.last_sign_in_at,
        email_confirmed_at: user.email_confirmed_at,
        is_active: !user.banned_until,
        country: profile?.country || talentProfile?.country || null,
        companies_count
      };
    }) || [];

    console.log(`Returning ${allUsers.length} users`);

    return new Response(
      JSON.stringify({ users: allUsers }),
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