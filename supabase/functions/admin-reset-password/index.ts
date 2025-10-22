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

    const { userEmail } = await req.json();

    if (!userEmail) {
      throw new Error('userEmail is required');
    }

    console.log('Generating password reset link for:', userEmail);

    // Generate password reset link using Admin API
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: userEmail,
    });

    if (error) {
      console.error('Error generating reset link:', error);
      throw error;
    }

    console.log('Password reset link generated successfully');

    // In production, you would send this link via email
    // For now, we'll return it in the response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Password reset link generated successfully',
        resetLink: data.properties?.action_link,
        expiresAt: data.properties?.expires_at
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('Error in admin-reset-password function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: error.message.includes('Unauthorized') ? 403 : 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
