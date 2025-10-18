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

    const { userId, email } = await req.json();

    if (!userId && !email) {
      throw new Error('userId or email is required');
    }

    let user;
    let authError;

    if (email) {
      // Get user by email
      const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
      if (error) throw error;
      
      user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      if (!user) {
        throw new Error('User not found with that email');
      }
    } else {
      // Get user by ID
      const response = await supabaseAdmin.auth.admin.getUserById(userId);
      user = response.data.user;
      authError = response.error;
      
      if (authError) {
        throw authError;
      }
    }

    const actualUserId = user.id;

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

    const userDetails = {
      user_id: actualUserId,
      id: actualUserId,
      email: user?.email || '',
      full_name: profile?.full_name || user?.user_metadata?.full_name || 'Sin nombre',
      phone: profile?.phone || null,
      avatar_url: profile?.avatar_url || null,
      role: role?.role || 'talent',
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