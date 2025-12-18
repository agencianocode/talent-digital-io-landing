import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Función para escapar caracteres HTML
function escapeHtml(text: string): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Función para limpiar HTML tags y markdown de la descripción
function stripHtml(html: string): string {
  if (!html) return '';
  return String(html)
    .replace(/<[^>]*>/g, '') // Eliminar tags HTML
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Eliminar markdown bold **texto**
    .replace(/\*([^*]+)\*/g, '$1') // Eliminar markdown italic *texto*
    .replace(/__([^_]+)__/g, '$1') // Eliminar markdown bold __texto__
    .replace(/_([^_]+)_/g, '$1') // Eliminar markdown italic _texto_
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Eliminar markdown links [texto](url)
    .replace(/#{1,6}\s+/g, '') // Eliminar markdown headers
    .replace(/`([^`]+)`/g, '$1') // Eliminar markdown code `codigo`
    .replace(/```[\s\S]*?```/g, '') // Eliminar markdown code blocks
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\n+/g, ' ') // Reemplazar saltos de línea con espacios
    .replace(/\s+/g, ' ') // Normalizar espacios múltiples
    .trim();
}

// Función para asegurar URL absoluta
function ensureAbsoluteUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Si es una URL relativa, asumimos que está en Supabase Storage
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  if (url.startsWith('/')) {
    return `${supabaseUrl}${url}`;
  }
  return `${supabaseUrl}/${url}`;
}

Deno.serve(async (req) => {
  // Detectar si es un crawler de redes sociales
  const userAgent = req.headers.get('user-agent') || '';
  const isCrawler = /facebookexternalhit|WhatsApp|Twitterbot|LinkedInBot|Slackbot|SkypeUriPreview|Applebot|Googlebot/i.test(userAgent);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const opportunityId = url.pathname.split('/').pop();

    if (!opportunityId) {
      return new Response('Missing opportunity ID', { status: 400, headers: corsHeaders });
    }

    // Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch opportunity data
    const { data: opportunity, error } = await supabase
      .from('opportunities')
      .select(`
        id,
        title,
        description,
        type,
        location,
        companies (
          name,
          logo_url,
          description
        )
      `)
      .eq('id', opportunityId)
      .eq('status', 'active')
      .maybeSingle();

    if (error || !opportunity) {
      console.error('Error fetching opportunity:', error);
      return new Response('Opportunity not found', { status: 404, headers: corsHeaders });
    }

    const company = opportunity.companies as any;
    const companyName = company?.name || 'Empresa';
    const companyLogo = company?.logo_url || '';
    
    // Limpiar y preparar descripción
    let rawDescription = opportunity.description || 'Nueva oportunidad laboral disponible';
    rawDescription = stripHtml(rawDescription);
    const description = rawDescription.substring(0, 160).trim() || 'Nueva oportunidad laboral disponible';
    
    const appUrl = `https://app.talentodigital.io/opportunity/${opportunityId}`;
    const shareUrl = `https://wyrieetebfzmgffxecpz.supabase.co/functions/v1/opportunity-share/${opportunityId}`;
    
    // Preparar valores escapados
    const escapedTitle = escapeHtml(opportunity.title || 'Oportunidad laboral');
    const escapedCompanyName = escapeHtml(companyName);
    const escapedDescription = escapeHtml(description);
    const ogTitle = `${escapedTitle} - ${escapedCompanyName}`;
    const ogImage = companyLogo ? ensureAbsoluteUrl(companyLogo) : '';

    // Generate HTML with Open Graph and Twitter meta tags
    const html = `<!DOCTYPE html>
<html lang="es" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapedTitle} - ${escapedCompanyName}</title>
  <meta name="description" content="${escapedDescription}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${shareUrl}">
  <meta property="og:title" content="${ogTitle}">
  <meta property="og:description" content="${escapedDescription}">
  ${ogImage ? `<meta property="og:image" content="${ogImage}">` : ''}
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="TalentoDigital">
  <meta property="og:locale" content="es_ES">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${shareUrl}">
  <meta name="twitter:title" content="${ogTitle}">
  <meta name="twitter:description" content="${escapedDescription}">
  ${ogImage ? `<meta name="twitter:image" content="${ogImage}">` : ''}
  
  <!-- WhatsApp -->
  <meta property="og:image:type" content="image/png">
  
  ${!isCrawler ? `<!-- Redirect to SPA - Solo para usuarios normales, no para crawlers -->
  <meta http-equiv="refresh" content="0;url=${appUrl}">` : ''}
  
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .container {
      text-align: center;
      padding: 2rem;
    }
    h1 {
      margin-bottom: 1rem;
    }
    p {
      margin-bottom: 1.5rem;
      opacity: 0.9;
    }
    a {
      display: inline-block;
      padding: 0.75rem 2rem;
      background: white;
      color: #667eea;
      text-decoration: none;
      border-radius: 0.5rem;
      font-weight: 600;
      transition: transform 0.2s;
    }
    a:hover {
      transform: scale(1.05);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${escapedTitle}</h1>
    <p>${escapedCompanyName} • ${opportunity.type || ''} ${opportunity.location ? `• ${escapeHtml(opportunity.location)}` : ''}</p>
    <a href="${appUrl}">Ver oportunidad completa</a>
  </div>
  ${!isCrawler ? `<script>
    // Redirect immediately - Solo para usuarios normales, no para crawlers
    window.location.href = "${appUrl}";
  </script>` : ''}
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error in opportunity-share function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
