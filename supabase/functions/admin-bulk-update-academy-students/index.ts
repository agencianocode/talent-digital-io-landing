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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify the caller is an admin
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: userRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (userRole?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - admin only' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { academyId, enablePremium } = await req.json();

    if (!academyId) {
      return new Response(
        JSON.stringify({ error: 'academyId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (typeof enablePremium !== 'boolean') {
      return new Response(
        JSON.stringify({ error: 'enablePremium must be a boolean' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing academy students premium update:', { academyId, enablePremium });

    // Verify the academy exists
    const { data: academy, error: academyError } = await supabaseAdmin
      .from('companies')
      .select('id, name, business_type, students_premium_enabled')
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
      return new Response(
        JSON.stringify({ error: 'La empresa no es una academia' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all students from the academy (enrolled and graduated)
    const { data: students, error: studentsError } = await supabaseAdmin
      .from('academy_students')
      .select('id, student_email, status')
      .eq('academy_id', academyId)
      .in('status', ['enrolled', 'graduated', 'active']);

    if (studentsError) {
      console.error('Error fetching students:', studentsError);
      return new Response(
        JSON.stringify({ error: 'Error al obtener estudiantes' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${students?.length || 0} students to process`);

    let studentsUpdated = 0;
    let studentsSkipped = 0;
    const errors: string[] = [];

    const newRole = enablePremium ? 'premium_talent' : 'freemium_talent';

    // Process each student
    for (const student of students || []) {
      try {
        // Find the user by email
        const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
          filter: `email.eq.${student.student_email}`
        });

        if (usersError || !users || users.length === 0) {
          console.log(`User not found for email: ${student.student_email}`);
          studentsSkipped++;
          continue;
        }

        const studentUser = users[0];

        // Get current role
        const { data: currentRole } = await supabaseAdmin
          .from('user_roles')
          .select('role')
          .eq('user_id', studentUser.id)
          .single();

        // Skip if already has admin role or the same role
        if (currentRole?.role === 'admin') {
          console.log(`Skipping admin user: ${student.student_email}`);
          studentsSkipped++;
          continue;
        }

        if (currentRole?.role === newRole) {
          console.log(`User already has ${newRole}: ${student.student_email}`);
          studentsSkipped++;
          continue;
        }

        // Only update talent roles
        if (currentRole?.role && !currentRole.role.includes('talent')) {
          console.log(`Skipping non-talent user (${currentRole.role}): ${student.student_email}`);
          studentsSkipped++;
          continue;
        }

        // Update role
        const { error: updateError } = await supabaseAdmin
          .from('user_roles')
          .upsert({
            user_id: studentUser.id,
            role: newRole
          }, { onConflict: 'user_id' });

        if (updateError) {
          console.error(`Error updating role for ${student.student_email}:`, updateError);
          errors.push(`${student.student_email}: ${updateError.message}`);
          continue;
        }

        // Log the change
        await supabaseAdmin
          .from('role_change_audit')
          .insert({
            user_id: studentUser.id,
            changed_by: user.id,
            old_role: currentRole?.role || null,
            new_role: newRole,
            reason: enablePremium 
              ? `Academia "${academy.name}" activó premium para estudiantes`
              : `Academia "${academy.name}" desactivó premium para estudiantes`
          });

        studentsUpdated++;
        console.log(`Updated ${student.student_email} to ${newRole}`);

      } catch (err) {
        console.error(`Error processing student ${student.student_email}:`, err);
        errors.push(`${student.student_email}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    // Update the academy's students_premium_enabled flag
    const { error: updateAcademyError } = await supabaseAdmin
      .from('companies')
      .update({ 
        students_premium_enabled: enablePremium,
        updated_at: new Date().toISOString()
      })
      .eq('id', academyId);

    if (updateAcademyError) {
      console.error('Error updating academy flag:', updateAcademyError);
    }

    console.log('Academy students premium update complete:', {
      studentsUpdated,
      studentsSkipped,
      errors: errors.length
    });

    return new Response(
      JSON.stringify({
        success: true,
        studentsUpdated,
        studentsSkipped,
        totalStudents: students?.length || 0,
        enablePremium,
        errors: errors.length > 0 ? errors : undefined
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in admin-bulk-update-academy-students:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
