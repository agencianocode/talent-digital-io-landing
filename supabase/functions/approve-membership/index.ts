import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create client with user's JWT for auth verification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('❌ User auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ User authenticated:', user.id);

    const { memberId, companyId, action } = await req.json();
    console.log('📋 Request params:', { memberId, companyId, action, userId: user.id });

    if (!memberId || !companyId) {
      return new Response(
        JSON.stringify({ error: 'memberId y companyId son requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user is owner or admin of the company using admin client
    const { data: companyData, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('user_id, business_type')
      .eq('id', companyId)
      .single();

    if (companyError) {
      console.error('❌ Company lookup error:', companyError);
      return new Response(
        JSON.stringify({ error: 'Empresa no encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is company owner
    const isOwner = companyData.user_id === user.id;
    
    // Also check if user has admin/owner role in company_user_roles
    const { data: userRole } = await supabaseAdmin
      .from('company_user_roles')
      .select('role')
      .eq('company_id', companyId)
      .eq('user_id', user.id)
      .eq('status', 'accepted')
      .single();

    const isAdmin = userRole?.role === 'admin' || userRole?.role === 'owner';

    console.log('🔐 Permission check:', { isOwner, isAdmin, companyOwnerId: companyData.user_id, userId: user.id });

    if (!isOwner && !isAdmin) {
      console.error('❌ Permission denied');
      return new Response(
        JSON.stringify({ error: 'No tienes permisos para aprobar solicitudes en esta empresa' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current membership status
    const { data: memberData, error: memberError } = await supabaseAdmin
      .from('company_user_roles')
      .select('id, status, company_id, user_id, invited_email')
      .eq('id', memberId)
      .single();

    if (memberError || !memberData) {
      console.error('❌ Member lookup error:', memberError);
      return new Response(
        JSON.stringify({ error: 'Solicitud no encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('📋 Member data:', memberData);

    // Verify membership belongs to this company
    if (memberData.company_id !== companyId) {
      console.error('❌ Membership belongs to different company');
      return new Response(
        JSON.stringify({ error: 'Esta solicitud no pertenece a tu empresa' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already processed
    if (memberData.status === 'accepted' && action === 'approve') {
      return new Response(
        JSON.stringify({ message: 'Esta solicitud ya fue aprobada', alreadyProcessed: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (memberData.status === 'rejected' && action === 'reject') {
      return new Response(
        JSON.stringify({ message: 'Esta solicitud ya fue rechazada', alreadyProcessed: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date().toISOString();
    let updateData: Record<string, any>;

    if (action === 'reject') {
      updateData = { 
        status: 'rejected',
        updated_at: now
      };
    } else {
      // Default to approve
      updateData = { 
        status: 'accepted',
        accepted_at: now,
        updated_at: now
      };
    }

    // Perform the update with admin privileges
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('company_user_roles')
      .update(updateData)
      .eq('id', memberId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Update error:', updateError);
      return new Response(
        JSON.stringify({ error: `Error al actualizar: ${updateError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Successfully updated:', updated);

    // If company is an academy and action is approve, update user role to academy_premium
    if (action !== 'reject' && companyData.business_type === 'academy' && memberData.user_id) {
      console.log('🎓 Company is an Academy - updating user role to academy_premium');
      
      const { error: roleUpdateError } = await supabaseAdmin
        .from('user_roles')
        .update({ role: 'academy_premium' })
        .eq('user_id', memberData.user_id);
      
      if (roleUpdateError) {
        console.error('⚠️ Error updating user role to academy_premium:', roleUpdateError);
      } else {
        console.log('✅ User role updated to academy_premium for user:', memberData.user_id);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: action === 'reject' ? 'Solicitud rechazada' : 'Solicitud aprobada',
        data: updated 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
