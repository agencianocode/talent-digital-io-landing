import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, academyId } = await req.json();

    if (!userId || !academyId) {
      return new Response(
        JSON.stringify({ error: 'userId and academyId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing academy student role upgrade:', { userId, academyId });

    // Verify that the academy exists and is of type 'academy'
    const { data: academy, error: academyError } = await supabaseAdmin
      .from('companies')
      .select('id, name, business_type')
      .eq('id', academyId)
      .single();

    if (academyError || !academy) {
      console.error('Academy not found:', academyError);
      return new Response(
        JSON.stringify({ error: 'Academia no encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (academy.business_type !== 'academy') {
      console.log('Company is not an academy:', academy.business_type);
      return new Response(
        JSON.stringify({ error: 'La empresa no es una academia', upgraded: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify that the user is enrolled in this academy
    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (!user?.email) {
      return new Response(
        JSON.stringify({ error: 'Usuario no encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: enrollment, error: enrollmentError } = await supabaseAdmin
      .from('academy_students')
      .select('id, status')
      .eq('academy_id', academyId)
      .eq('student_email', user.email)
      .maybeSingle();

    if (enrollmentError) {
      console.error('Error checking enrollment:', enrollmentError);
    }

    if (!enrollment) {
      console.log('User is not enrolled in this academy');
      return new Response(
        JSON.stringify({ error: 'Usuario no está inscrito en esta academia', upgraded: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check current role
    const { data: currentRole, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (roleError) {
      console.error('Error fetching current role:', roleError);
      return new Response(
        JSON.stringify({ error: 'Error al obtener rol actual' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Only upgrade if user is freemium_talent
    if (currentRole?.role !== 'freemium_talent') {
      console.log('User already has role:', currentRole?.role, '- no upgrade needed');
      return new Response(
        JSON.stringify({ 
          success: true, 
          upgraded: false, 
          message: 'Usuario ya tiene un rol premium o diferente',
          currentRole: currentRole?.role 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upgrade to premium_talent
    const { error: updateError } = await supabaseAdmin
      .from('user_roles')
      .update({ role: 'premium_talent' })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating role:', updateError);
      return new Response(
        JSON.stringify({ error: 'Error al actualizar rol' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log the change in audit table
    await supabaseAdmin
      .from('role_change_audit')
      .insert({
        user_id: userId,
        changed_by: null, // System-triggered change
        old_role: 'freemium_talent',
        new_role: 'premium_talent',
        reason: `Auto-upgrade: Estudiante inscrito en academia "${academy.name}"`
      });

    console.log('Successfully upgraded user to premium_talent');

    return new Response(
      JSON.stringify({ 
        success: true, 
        upgraded: true,
        message: 'Usuario actualizado a premium_talent',
        academyName: academy.name
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in upgrade-academy-student-role:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
