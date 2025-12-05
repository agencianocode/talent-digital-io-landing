import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Permitir múltiples orígenes
const getAllowedOrigin = (origin: string | null) => {
  const allowedOrigins = [
    'https://app.talentodigital.io',
    'https://talentodigital.io',
    'http://localhost:5173',
    'http://localhost:3000'
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    return origin;
  }
  
  return allowedOrigins[0]; // Default
};

const getCorsHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': getAllowedOrigin(origin),
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
});

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
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
    )

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Get the user from the auth header
    const token = authHeader.replace('Bearer ', '')
    const { data: { user: requestingUser }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !requestingUser) {
      throw new Error('Unauthorized')
    }

    // Check if requesting user is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', requestingUser.id)
      .single()

    if (roleError || roleData?.role !== 'admin') {
      throw new Error('Only admins can delete users')
    }

    // Get userId from request body
    const { userId } = await req.json()

    if (!userId) {
      throw new Error('userId is required')
    }

    // Prevent admin from deleting themselves
    if (userId === requestingUser.id) {
      throw new Error('No puedes eliminarte a ti mismo')
    }

    console.log(`Admin ${requestingUser.id} attempting to delete user ${userId}`)

    // Delete user using admin API
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error('Error deleting user:', deleteError)
      throw deleteError
    }

    console.log(`✅ User ${userId} deleted successfully by admin ${requestingUser.id}`)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Usuario eliminado correctamente'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('❌ Error in admin-delete-user function:', error)
    
    // Retornar error más detallado
    const errorMessage = error instanceof Error ? error.message : 'Error al eliminar usuario';
    const errorDetails = {
      error: errorMessage,
      details: error instanceof Error ? error.stack : undefined
    };
    
    return new Response(
      JSON.stringify(errorDetails),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})