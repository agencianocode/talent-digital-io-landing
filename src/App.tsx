
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './pages/Login';
import Register from './pages/Register';
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
import ErrorBoundary from '@/components/ErrorBoundary';
import ToastContainer from '@/components/ToastContainer';
import { ToastProvider } from '@/contexts/ToastContext';
import { MessagingProvider } from '@/contexts/MessagingContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { OpportunitiesProvider } from '@/contexts/OpportunitiesContext';
import { AuthProvider } from '@/contexts/AuthContextEnhanced';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <NotificationsProvider>
              <OpportunitiesProvider>
                <MessagingProvider>
                  <ToastProvider>
                    <div className="min-h-screen bg-background text-foreground">
                      <Routes>
                        <Route path="/" element={<Login />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/talent/marketplace" element={<TalentMarketplace />} />
                        <Route path="/business/dashboard" element={<BusinessDashboard />} />
                        <Route path="/talent/dashboard" element={<TalentDashboard />} />
                        <Route path="/dashboard" element={<BusinessDashboard />} />
                        <Route path="/dashboard/home" element={<DashboardHome />} />
                        <Route path="/talent/home" element={<TalentDashboardHome />} />
                        <Route path="/dashboard/opportunities" element={<OpportunitiesPage />} />
                        <Route path="/dashboard/opportunities/new" element={<NewOpportunity />} />
                        <Route path="/dashboard/opportunities/:id" element={<OpportunityDetail />} />
                        <Route path="/messages" element={<MessagesPage />} />
                        <Route path="/settings/company" element={<CompanySettings />} />
                        <Route path="/settings/profile" element={<ProfileSettings />} />
                        <Route path="/settings/talent-profile" element={<TalentProfileSettings />} />
                        <Route path="/settings/users" element={<UserManagement />} />
                        <Route path="*" element={<Navigate to="/login" />} />
                      </Routes>
                      <ToastContainer />
                    </div>
                  </ToastProvider>
                </MessagingProvider>
              </OpportunitiesProvider>
            </NotificationsProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
