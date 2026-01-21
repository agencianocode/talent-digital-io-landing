import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IncompleteUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

// Check if name is a "real" name (not email-derived)
function hasRealName(name: string | null): boolean {
  if (!name) return false;
  if (name.includes('@')) return false;
  const trimmedName = name.trim();
  if (!trimmedName.includes(' ') && /^[a-z0-9]+$/i.test(trimmedName)) return false;
  return true;
}

// Get missing items for a user
function getMissingItems(user: IncompleteUser): string[] {
  const items: string[] = [];
  if (!hasRealName(user.full_name)) {
    items.push('Agregar tu nombre completo');
  }
  if (!user.avatar_url) {
    items.push('Subir una foto de perfil');
  }
  return items;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body for options
    let reminderType: 'first_reminder' | 'second_reminder' | 'initial_batch' = 'first_reminder';
    let hoursAgoMin = 24;
    let hoursAgoMax = 48;
    let sendToExisting = false;

    try {
      const body = await req.json();
      reminderType = body.reminderType || 'first_reminder';
      hoursAgoMin = body.hoursAgoMin || 24;
      hoursAgoMax = body.hoursAgoMax || 48;
      sendToExisting = body.sendToExisting || false;
    } catch {
      // Default values if no body
    }

    console.log(`📧 Starting onboarding reminder job: ${reminderType}`);
    console.log(`⏰ Time window: ${hoursAgoMin}h - ${hoursAgoMax}h ago`);

    // Get all users with incomplete onboarding (talent users only)
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select(`
        user_id,
        full_name,
        avatar_url,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('Error fetching profiles:', usersError);
      throw usersError;
    }

    // Get user emails from auth.users
    const userIds = users?.map(u => u.user_id) || [];
    const { data: authUsers, error: authError } = await supabase.rpc('get_user_emails_by_ids', {
      user_ids: userIds
    });

    if (authError) {
      console.error('Error fetching auth users:', authError);
      throw authError;
    }

    // Create a map for quick lookup
    const authUserMap = new Map(authUsers?.map((u: any) => [u.user_id, u]) || []);

    // Get user roles to filter only talent users
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('role', ['freemium_talent', 'premium_talent', 'talent']);

    if (rolesError) {
      console.error('Error fetching roles:', rolesError);
      throw rolesError;
    }

    const talentUserIds = new Set(userRoles?.map(r => r.user_id) || []);

    // Get already sent reminders
    const { data: sentReminders, error: remindersError } = await supabase
      .from('onboarding_reminder_logs')
      .select('user_id, reminder_type');

    if (remindersError) {
      console.error('Error fetching sent reminders:', remindersError);
      throw remindersError;
    }

    const sentReminderSet = new Set(
      sentReminders?.map(r => `${r.user_id}_${r.reminder_type}`) || []
    );

    // Filter users with incomplete onboarding
    const now = new Date();
    const incompleteUsers: IncompleteUser[] = [];

    for (const profile of users || []) {
      const authUser = authUserMap.get(profile.user_id) as any;
      if (!authUser) continue;

      // Only talent users
      if (!talentUserIds.has(profile.user_id)) continue;

      // Check if onboarding is incomplete
      const hasValidName = hasRealName(profile.full_name);
      const hasAvatar = !!profile.avatar_url || !!authUser.avatar_url;

      if (hasValidName && hasAvatar) continue; // Onboarding complete

      // Check time window (unless sending to existing)
      if (!sendToExisting) {
        const createdAt = new Date(profile.created_at);
        const hoursAgo = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

        if (hoursAgo < hoursAgoMin || hoursAgo > hoursAgoMax) continue;
      }

      // Check if already sent this reminder type
      const reminderKey = `${profile.user_id}_${reminderType}`;
      if (sentReminderSet.has(reminderKey)) continue;

      incompleteUsers.push({
        id: profile.user_id,
        email: authUser.email,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url || authUser.avatar_url,
        created_at: profile.created_at,
      });
    }

    console.log(`👥 Found ${incompleteUsers.length} users with incomplete onboarding to notify`);

    // Send emails via send-notification-email function
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const user of incompleteUsers) {
      try {
        const missingItems = getMissingItems(user);
        const displayName = user.full_name || user.email.split('@')[0];

        // Call send-notification-email edge function
        const { data, error } = await supabase.functions.invoke('send-notification-email', {
          body: {
            to: user.email,
            userName: displayName,
            type: 'complete-profile-reminder',
            title: reminderType === 'second_reminder' 
              ? '⏰ Tu perfil sigue incompleto - ¡No te pierdas las oportunidades!'
              : '✨ ¡Tu perfil está casi listo! Complétalo en 2 minutos',
            message: '',
            missingItems,
            reminderType: reminderType === 'second_reminder' ? 'second' : 'first',
          }
        });

        if (error) {
          throw error;
        }

        console.log(`✅ Email sent to ${user.email}`);

        // Log the sent reminder
        const { error: logError } = await supabase
          .from('onboarding_reminder_logs')
          .insert({
            user_id: user.id,
            email: user.email,
            reminder_type: reminderType,
          });

        if (logError) {
          console.error(`Error logging reminder for ${user.email}:`, logError);
        }

        successCount++;
      } catch (error: any) {
        console.error(`❌ Error sending email to ${user.email}:`, error);
        errors.push(`${user.email}: ${error.message}`);
        errorCount++;
      }
    }

    const summary = {
      reminderType,
      totalFound: incompleteUsers.length,
      successCount,
      errorCount,
      errors: errors.slice(0, 10), // Only first 10 errors
    };

    console.log('📊 Job completed:', summary);

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    console.error('Error in send-onboarding-reminder:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
