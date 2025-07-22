
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './pages/Login';
import Register from './pages/Register';
import CompanySearch from './pages/CompanySearch';
import CompanyProfile from './pages/CompanyProfile';
import PersonalProfile from './pages/PersonalProfile';
import TalentMarketplace from './pages/TalentMarketplace';
import BusinessDashboard from './pages/BusinessDashboard';
import TalentDashboard from './pages/TalentDashboard';
import OpportunitiesPage from './pages/OpportunitiesPage';
import NewOpportunity from './pages/NewOpportunity';
import OpportunityDetail from './pages/OpportunityDetail';
import MessagesPage from './pages/MessagesPage';
import DashboardHome from './pages/DashboardHome';
import TalentDashboardHome from './pages/TalentDashboardHome';
import CompanySettings from './pages/settings/CompanySettings';
import ProfileSettings from './pages/settings/ProfileSettings';
import TalentProfileSettings from './pages/settings/TalentProfileSettings';
import UserManagement from './pages/settings/UserManagement';
import TalentSearchPage from './pages/TalentSearchPage';
import NotFound from './pages/NotFound';
import ErrorBoundary from '@/components/ErrorBoundary';
import ToastContainer from '@/components/ToastContainer';
import { ToastProvider } from '@/contexts/ToastContext';
import { MessagingProvider } from '@/contexts/MessagingContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { OpportunitiesProvider } from '@/contexts/OpportunitiesContext';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import Auth from './pages/Auth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SupabaseAuthProvider>
            <NotificationsProvider>
              <OpportunitiesProvider>
                <MessagingProvider>
                  <ToastProvider>
                    <div className="min-h-screen bg-background text-foreground">
                      <Routes>
                        {/* Auth Routes */}
                        <Route path="/" element={<Login />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        
                        {/* Onboarding Routes */}
                        <Route path="/company-search" element={<CompanySearch />} />
                        <Route path="/company-profile" element={<CompanyProfile />} />
                        <Route path="/personal-profile" element={<PersonalProfile />} />
                        
                        {/* Main App Routes */}
                        <Route path="/talent/marketplace" element={<TalentMarketplace />} />
                        <Route path="/talent/search" element={<TalentSearchPage />} />
                        <Route path="/business/dashboard" element={<BusinessDashboard />} />
                        <Route path="/talent/dashboard" element={<TalentDashboard />} />
                        
                        {/* Dashboard Routes */}
                        <Route path="/dashboard" element={<BusinessDashboard />} />
                        <Route path="/dashboard/home" element={<DashboardHome />} />
                        <Route path="/talent/home" element={<TalentDashboardHome />} />
                        
                        {/* Opportunities Routes */}
                        <Route path="/dashboard/opportunities" element={<OpportunitiesPage />} />
                        <Route path="/dashboard/opportunities/new" element={<NewOpportunity />} />
                        <Route path="/dashboard/opportunities/:id" element={<OpportunityDetail />} />
                        
                        {/* Messages */}
                        <Route path="/messages" element={<MessagesPage />} />
                        
                        {/* Settings Routes */}
                        <Route path="/settings/company" element={<CompanySettings />} />
                        <Route path="/settings/profile" element={<ProfileSettings />} />
                        <Route path="/settings/talent-profile" element={<TalentProfileSettings />} />
                        <Route path="/settings/users" element={<UserManagement />} />
                        
                        {/* 404 */}
                        <Route path="/404" element={<NotFound />} />
                        <Route path="*" element={<Navigate to="/404" replace />} />
                      </Routes>
                      <ToastContainer />
                    </div>
                  </ToastProvider>
                </MessagingProvider>
              </OpportunitiesProvider>
            </NotificationsProvider>
          </SupabaseAuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
