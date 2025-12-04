import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePlatformSettings = () => {
  useEffect(() => {
    const loadAndApplySettings = async () => {
      try {
        const { data } = await supabase
          .from('admin_settings')
          .select('key, value')
          .eq('category', 'system')
          .in('key', ['platform_favicon_url', 'platform_name']);

        if (data) {
          data.forEach(setting => {
            if (setting.key === 'platform_favicon_url' && setting.value) {
              applyFavicon(setting.value);
            }
            if (setting.key === 'platform_name' && setting.value) {
              document.title = setting.value;
            }
          });
        }
      } catch (error) {
        console.error('Error loading platform settings:', error);
      }
    };

    loadAndApplySettings();
  }, []);
};

const applyFavicon = (url: string) => {
  if (!url) return;
  
  // Remove existing favicon links
  const existingLinks = document.querySelectorAll("link[rel*='icon']");
  existingLinks.forEach(link => link.remove());
  
  // Create new favicon link
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = url.endsWith('.ico') ? 'image/x-icon' : 'image/png';
  link.href = url;
  document.head.appendChild(link);
};
