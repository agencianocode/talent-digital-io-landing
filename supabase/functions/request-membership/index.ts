import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
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
    
    // Create admin client with service role key (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header to verify user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's token to verify identity
    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('User verification failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ User verified:', user.id, user.email);

    // Parse request body
    const { companyId, userId, userEmail } = await req.json();

    console.log('📝 Request data:', { companyId, userId, userEmail });

    // Validate that the authenticated user matches the requested userId
    if (user.id !== userId) {
      console.error('User ID mismatch:', { authenticated: user.id, requested: userId });
      return new Response(
        JSON.stringify({ error: 'User ID mismatch' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate required fields
    if (!companyId || !userId) {
      console.error('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: companyId and userId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if company exists
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('id, name, user_id')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      console.error('Company not found:', companyError);
      return new Response(
        JSON.stringify({ error: 'Company not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Company found:', company.name);

    // Check if user already has a membership request
    const { data: existingRequest, error: checkError } = await supabaseAdmin
      .from('company_user_roles')
      .select('id, status')
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing membership:', checkError);
      return new Response(
        JSON.stringify({ error: 'Error checking existing membership' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (existingRequest) {
      if (existingRequest.status === 'accepted') {
        console.log('User already a member');
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Ya eres miembro de esta empresa',
            alreadyMember: true 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else if (existingRequest.status === 'pending') {
        console.log('User already has pending request');
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Ya tienes una solicitud pendiente para esta empresa',
            pendingRequest: true 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Insert membership request using admin client (bypasses RLS)
    console.log('📝 Creating membership request...');
    const { data: membershipData, error: membershipError } = await supabaseAdmin
      .from('company_user_roles')
      .insert({
        user_id: userId,
        company_id: companyId,
        role: 'viewer',
        status: 'pending',
        invited_by: null,
        invited_email: userEmail || user.email
      })
      .select()
      .single();

    if (membershipError) {
      console.error('Error creating membership request:', membershipError);
      return new Response(
        JSON.stringify({ error: 'Error creating membership request', details: membershipError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Membership request created:', membershipData.id);

    // Return success with company info for notification handling
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: membershipData,
        company: {
          id: company.id,
          name: company.name,
          ownerId: company.user_id
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
