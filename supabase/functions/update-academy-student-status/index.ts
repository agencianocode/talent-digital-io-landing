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

    const { studentId, newStatus, graduationDate } = await req.json();

    if (!studentId || !newStatus) {
      throw new Error('studentId and newStatus are required');
    }

    // Validar que el estado sea uno válido
    const validStatuses = ['enrolled', 'graduated', 'inactive', 'paused', 'suspended'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}. Must be one of: ${validStatuses.join(', ')}`);
    }

    console.log('Updating student status:', { studentId, newStatus, graduationDate });

    // Prepare update data
    const updateData: any = { 
      status: newStatus 
    };

    if (graduationDate) {
      updateData.graduation_date = graduationDate;
    } else if (newStatus !== 'graduated') {
      // Si no es graduado, limpiar la fecha de graduación
      updateData.graduation_date = null;
    }

    // Update student status using admin client
    const { data, error } = await supabaseAdmin
      .from('academy_students')
      .update(updateData)
      .eq('id', studentId)
      .select();

    if (error) {
      console.error('Error updating student:', error);
      throw error;
    }

    console.log('Student updated successfully:', data);

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in update-academy-student-status:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

