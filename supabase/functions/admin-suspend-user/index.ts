import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://app.talentodigital.io',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Verify the request is from an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (userRole?.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    const { userId, suspend } = await req.json();

    if (!userId) {
      throw new Error('userId is required');
    }

    console.log(`${suspend ? 'Suspending' : 'Reactivating'} user:`, userId);

    // Use Supabase Admin API to update user
    const { data, error } = await supabase.auth.admin.updateUserById(
      userId,
      { 
        ban_duration: suspend ? '876000h' : 'none' // 100 years = effectively banned
      }
    );

    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }

    console.log(`User ${suspend ? 'suspended' : 'reactivated'} successfully:`, userId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `User ${suspend ? 'suspended' : 'reactivated'} successfully`,
        user: data.user
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('Error in admin-suspend-user function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: error.message.includes('Unauthorized') ? 403 : 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
