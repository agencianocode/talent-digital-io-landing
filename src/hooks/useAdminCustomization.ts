import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AdminCustomization {
  id: string;
  platform_name: string;
  platform_logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  welcome_message: string | null;
  platform_description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  support_url: string | null;
  show_stats_cards: boolean;
  show_charts: boolean;
  show_activity_feed: boolean;
  show_quick_actions: boolean;
  show_registration_links: boolean;
  enable_marketplace: boolean;
  enable_academy_features: boolean;
  enable_notifications: boolean;
  enable_chat: boolean;
}

export const useAdminCustomization = () => {
  const [customization, setCustomization] = useState<AdminCustomization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadCustomization = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_customization')
        .select('*')
        .single();

      if (error) throw error;
      setCustomization(data as any);
    } catch (error) {
      console.error('Error loading customization:', error);
      toast.error('Error al cargar la personalización');
    } finally {
      setLoading(false);
    }
  };

  const updateCustomization = async (updates: Partial<AdminCustomization>) => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('admin_customization')
        .update(updates as any)
        .eq('id', '00000000-0000-0000-0000-000000000001');

      if (error) throw error;

      setCustomization(prev => prev ? { ...prev, ...updates } as AdminCustomization : null);
      toast.success('Personalización actualizada correctamente');
      return true;
    } catch (error) {
      console.error('Error updating customization:', error);
      toast.error('Error al actualizar la personalización');
      return false;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadCustomization();
  }, []);

  return {
    customization,
    loading,
    saving,
    updateCustomization,
    reload: loadCustomization
  };
};
