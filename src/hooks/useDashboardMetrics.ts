import { useCallback } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardMetrics = () => {
  const { user } = useSupabaseAuth();

  // Business Metrics - Simplified with mock data
  const getBusinessMetrics = useCallback(async () => {
    if (!user?.id) return null;

    // Simplified business metrics with mock data
    const result = {
      totalOpportunities: 15,
      activeOpportunities: 12,
      totalApplications: 45,
      pendingApplications: 12,
      applicationsThisMonth: 18,
      applicationsLastMonth: 22,
      topOpportunities: [
        {
          id: '1',
          title: 'Sales Development Representative',
          applications: 8,
          views: 45
        },
        {
          id: '2', 
          title: 'Digital Marketing Specialist',
          applications: 6,
          views: 32
        }
      ],
      recentApplications: [
        {
          id: '1',
          opportunityTitle: 'Sales Representative',
          applicantName: 'Juan Pérez',
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ]
    };

    return result;
  }, [user]);

  // Talent Metrics - Simplified with mock data
  const getTalentMetrics = useCallback(async () => {
    if (!user?.id) return null;

    // Simplified talent metrics with mock data
    const result = {
      totalApplications: 12,
      acceptedApplications: 5,
      pendingApplications: 3,
      savedOpportunities: 8,
      profileViews: 47,
      profileCompletion: 85,
      recentApplications: [
        {
          id: '1',
          opportunityTitle: 'Sales Development Representative',
          company: 'TechCorp',
          appliedAt: new Date().toISOString(),
          status: 'pending'
        },
        {
          id: '2',
          opportunityTitle: 'Digital Marketing Specialist',
          company: 'MarketPro', 
          appliedAt: new Date(Date.now() - 86400000).toISOString(),
          status: 'accepted'
        }
      ],
      recommendedOpportunities: [
        {
          id: '1',
          title: 'Sales Development Representative',
          company: 'TechCorp',
          salary: '$50,000 - $70,000',
          matchScore: 95
        },
        {
          id: '2',
          title: 'Digital Marketing Specialist',
          company: 'MarketPro',
          salary: '$45,000 - $65,000', 
          matchScore: 88
        }
      ]
    };

    return result;
  }, [user]);

  return {
    getTalentMetrics,
    getBusinessMetrics
  };
};