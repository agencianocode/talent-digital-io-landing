// Admin - Get Marketplace Service Detail
// Fetches a single marketplace service with related profile data. Admin-only.
// Uses service role key and enforces admin check via user_roles.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://app.talentodigital.io',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    global: { headers: { Authorization: req.headers.get('Authorization')! } },
  });

  try {
    const { data: body } = await req.json().then((d) => ({ data: d })).catch(() => ({ data: {} }));
    const serviceId = body?.serviceId as string | undefined;
    if (!serviceId) {
      return new Response(JSON.stringify({ error: 'serviceId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Verify user and admin role
    const { data: authUser, error: userErr } = await supabase.auth.getUser();
    if (userErr || !authUser?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', authUser.user.id)
      .maybeSingle();

    if (!roleRow || roleRow.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Fetch service
    const { data: service, error: svcErr } = await supabase
      .from('marketplace_services')
      .select('*')
      .eq('id', serviceId)
      .maybeSingle();

    if (svcErr || !service) {
      return new Response(JSON.stringify({ error: 'Service not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('user_id', service.user_id)
      .maybeSingle();

    // Shape response to match Admin UI expectations
    const detail = {
      id: service.id,
      title: service.title,
      description: service.description,
      category: service.category,
      price: Number(service.price ?? 0),
      currency: service.currency ?? 'USD',
      delivery_time: service.delivery_time ?? '-',
      location: service.location ?? '-',
      is_active: service.status === 'active',
      status: service.status,
      created_at: service.created_at,
      updated_at: service.updated_at,
      user_id: service.user_id,
      company_id: null,
      company_name: null,
      company_logo: null,
      user_name: profile?.full_name ?? 'Usuario',
      user_avatar: profile?.avatar_url ?? null,
      views_count: service.views_count ?? 0,
      orders_count: service.requests_count ?? 0,
      rating: Number(service.rating ?? 0),
      reviews_count: Number(service.reviews_count ?? 0),
      priority: 'medium', // not in schema; default for admin UI
      admin_notes: null,
      tags: service.tags ?? [],
      portfolio_url: service.portfolio_url ?? null,
      demo_url: service.demo_url ?? null,
    };

    return new Response(JSON.stringify(detail), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (e) {
    console.error('admin-get-marketplace-service error', e);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});