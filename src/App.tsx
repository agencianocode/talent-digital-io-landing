import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient } from 'react-query';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TalentMarketplace from './pages/TalentMarketplace';
import BusinessDashboard from './pages/BusinessDashboard';
import TalentDashboard from './pages/TalentDashboard';
import OpportunitiesPage from './pages/OpportunitiesPage';
import NewOpportunityPage from './pages/NewOpportunityPage';
import OpportunityDetailsPage from './pages/OpportunityDetailsPage';
import EditOpportunityPage from './pages/EditOpportunityPage';
import ApplicationsPage from './pages/ApplicationsPage';
import MessagesPage from './pages/MessagesPage';
import DashboardHome from './pages/DashboardHome';
import TalentDashboardHome from './pages/TalentDashboardHome';
import ErrorBoundary from '@/components/ErrorBoundary';
import ToastContainer from '@/components/ToastContainer';
import { ToastProvider } from '@/contexts/ToastContext';
import { MessagingProvider } from '@/contexts/MessagingContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { OpportunitiesProvider } from '@/contexts/OpportunitiesContext';
import { AuthProvider } from '@/contexts/AuthContextEnhanced';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <NotificationsProvider>
            <OpportunitiesProvider>
              <MessagingProvider>
                <ToastProvider>
                  <QueryClient>
                    <div className="min-h-screen bg-background text-foreground">
                      <Routes>
                        <Route path="/" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/talent/marketplace" element={<TalentMarketplace />} />
                        <Route path="/business/dashboard" element={<BusinessDashboard />} />
                        <Route path="/talent/dashboard" element={<TalentDashboard />} />
                        <Route path="/dashboard" element={<BusinessDashboard />} />
                        <Route path="/dashboard/home" element={<DashboardHome />} />
                        <Route path="/talent/home" element={<TalentDashboardHome />} />
                        <Route path="/dashboard/opportunities" element={<OpportunitiesPage />} />
                        <Route path="/dashboard/opportunities/new" element={<NewOpportunityPage />} />
                        <Route path="/dashboard/opportunities/:id" element={<OpportunityDetailsPage />} />
                        <Route path="/dashboard/opportunities/:id/edit" element={<EditOpportunityPage />} />
                        <Route path="/dashboard/opportunities/:id/applications" element={<ApplicationsPage />} />
                        <Route path="/messages" element={<MessagesPage />} />
                        <Route path="*" element={<Navigate to="/" />} />
                      </Routes>
                      <ToastContainer />
                    </div>
                  </QueryClient>
                </ToastProvider>
              </MessagingProvider>
            </OpportunitiesProvider>
          </NotificationsProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
