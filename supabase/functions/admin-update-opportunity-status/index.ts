import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://app.talentodigital.io',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the requesting user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Request from user:', user.id);

    // Check if requesting user is admin
    const { data: requesterRole, error: roleCheckError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (roleCheckError) throw roleCheckError;
    if (!requesterRole || requesterRole.role !== 'admin') {
      throw new Error('Only admins can update opportunity status');
    }

    // Parse request body
    const { opportunityId, status } = await req.json();
    
    if (!opportunityId || !status) {
      throw new Error('Missing opportunityId or status');
    }

    // Valid statuses
    const validStatuses = ['active', 'paused', 'closed', 'review-required'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    console.log('Updating opportunity:', opportunityId, 'to status:', status);

    // Get current opportunity for audit
    const { data: currentOpportunity } = await supabaseAdmin
      .from('opportunities')
      .select('status, is_active, company_id')
      .eq('id', opportunityId)
      .single();

    if (!currentOpportunity) {
      throw new Error('Opportunity not found');
    }

    // Update opportunity using service role (bypasses RLS)
    const updateData = {
      status: status as any,
      is_active: status === 'active',
      updated_at: new Date().toISOString()
    };

    const { data: updatedOpportunity, error: updateError } = await supabaseAdmin
      .from('opportunities')
      .update(updateData)
      .eq('id', opportunityId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating opportunity:', updateError);
      throw updateError;
    }

    console.log('Opportunity updated successfully:', updatedOpportunity);

    return new Response(
      JSON.stringify({ 
        success: true, 
        opportunity: updatedOpportunity 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error updating opportunity status:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: error.message === 'Unauthorized' || error.message === 'Only admins can update opportunity status' ? 403 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

