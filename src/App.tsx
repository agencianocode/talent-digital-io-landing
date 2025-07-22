
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from '@/components/ErrorBoundary';
import ToastContainer from '@/components/ToastContainer';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { ToastProvider } from '@/contexts/ToastContext';
import { MessagingProvider } from '@/contexts/MessagingContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { OpportunitiesProvider } from '@/contexts/OpportunitiesContext';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';

// Load critical pages immediately
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import Auth from './pages/Auth';

// Lazy load non-critical pages
const Register = lazy(() => import('./pages/Register'));
const CompanySearch = lazy(() => import('./pages/CompanySearch'));
const CompanyProfile = lazy(() => import('./pages/CompanyProfile'));
const PersonalProfile = lazy(() => import('./pages/PersonalProfile'));
const TalentMarketplace = lazy(() => import('./pages/TalentMarketplace'));
const BusinessDashboard = lazy(() => import('./pages/BusinessDashboard'));
const TalentDashboard = lazy(() => import('./pages/TalentDashboard'));
const OpportunitiesPage = lazy(() => import('./pages/OpportunitiesPage'));
const NewOpportunity = lazy(() => import('./pages/NewOpportunity'));
const OpportunityDetail = lazy(() => import('./pages/OpportunityDetail'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const DashboardHome = lazy(() => import('./pages/DashboardHome'));
const TalentDashboardHome = lazy(() => import('./pages/TalentDashboardHome'));
const CompanySettings = lazy(() => import('./pages/settings/CompanySettings'));
const ProfileSettings = lazy(() => import('./pages/settings/ProfileSettings'));
const TalentProfileSettings = lazy(() => import('./pages/settings/TalentProfileSettings'));
const UserManagement = lazy(() => import('./pages/settings/UserManagement'));
const TalentSearchPage = lazy(() => import('./pages/TalentSearchPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const RegisterBusiness = lazy(() => import('./pages/RegisterBusiness'));
const RegisterTalent = lazy(() => import('./pages/RegisterTalent'));
const JobCategories = lazy(() => import('./pages/JobCategories'));

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
                        {/* Auth Routes - Critical pages loaded immediately */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/login" element={<Login />} />
                        
                        {/* Lazy loaded routes */}
                        <Route path="/register" element={
                          <Suspense fallback={<LoadingSkeleton type="card" />}>
                            <Register />
                          </Suspense>
                        } />
                        <Route path="/register-business" element={
                          <Suspense fallback={<LoadingSkeleton type="card" />}>
                            <RegisterBusiness />
                          </Suspense>
                        } />
                        <Route path="/register-talent" element={
                          <Suspense fallback={<LoadingSkeleton type="card" />}>
                            <RegisterTalent />
                          </Suspense>
                        } />
                        <Route path="/job-categories" element={
                          <Suspense fallback={<LoadingSkeleton type="list" />}>
                            <JobCategories />
                          </Suspense>
                        } />
                        
                        {/* Onboarding Routes */}
                        <Route path="/company-search" element={
                          <Suspense fallback={<LoadingSkeleton type="list" />}>
                            <CompanySearch />
                          </Suspense>
                        } />
                        <Route path="/company-profile" element={
                          <Suspense fallback={<LoadingSkeleton type="profile" />}>
                            <CompanyProfile />
                          </Suspense>
                        } />
                        <Route path="/personal-profile" element={
                          <Suspense fallback={<LoadingSkeleton type="profile" />}>
                            <PersonalProfile />
                          </Suspense>
                        } />
                        
                        {/* Main App Routes */}
                        <Route path="/talent/marketplace" element={
                          <Suspense fallback={<LoadingSkeleton type="opportunities" />}>
                            <TalentMarketplace />
                          </Suspense>
                        } />
                        <Route path="/talent/search" element={
                          <Suspense fallback={<LoadingSkeleton type="talent" />}>
                            <TalentSearchPage />
                          </Suspense>
                        } />
                        <Route path="/business/dashboard" element={
                          <Suspense fallback={<LoadingSkeleton type="opportunities" />}>
                            <BusinessDashboard />
                          </Suspense>
                        } />
                        <Route path="/talent/dashboard" element={
                          <Suspense fallback={<LoadingSkeleton type="opportunities" />}>
                            <TalentDashboard />
                          </Suspense>
                        } />
                        
                        {/* Dashboard Routes */}
                        <Route path="/dashboard" element={
                          <Suspense fallback={<LoadingSkeleton type="opportunities" />}>
                            <BusinessDashboard />
                          </Suspense>
                        } />
                        <Route path="/talent-dashboard" element={
                          <Suspense fallback={<LoadingSkeleton type="opportunities" />}>
                            <TalentDashboard />
                          </Suspense>
                        } />
                        <Route path="/dashboard/home" element={
                          <Suspense fallback={<LoadingSkeleton type="card" />}>
                            <DashboardHome />
                          </Suspense>
                        } />
                        <Route path="/talent/home" element={
                          <Suspense fallback={<LoadingSkeleton type="card" />}>
                            <TalentDashboardHome />
                          </Suspense>
                        } />
                        
                        {/* Opportunities Routes */}
                        <Route path="/dashboard/opportunities" element={
                          <Suspense fallback={<LoadingSkeleton type="opportunities" />}>
                            <OpportunitiesPage />
                          </Suspense>
                        } />
                        <Route path="/dashboard/opportunities/new" element={
                          <Suspense fallback={<LoadingSkeleton type="card" />}>
                            <NewOpportunity />
                          </Suspense>
                        } />
                        <Route path="/dashboard/opportunities/:id" element={
                          <Suspense fallback={<LoadingSkeleton type="card" />}>
                            <OpportunityDetail />
                          </Suspense>
                        } />
                        
                        {/* Messages */}
                        <Route path="/messages" element={
                          <Suspense fallback={<LoadingSkeleton type="list" />}>
                            <MessagesPage />
                          </Suspense>
                        } />
                        
                        {/* Settings Routes */}
                        <Route path="/settings/company" element={
                          <Suspense fallback={<LoadingSkeleton type="profile" />}>
                            <CompanySettings />
                          </Suspense>
                        } />
                        <Route path="/settings/profile" element={
                          <Suspense fallback={<LoadingSkeleton type="profile" />}>
                            <ProfileSettings />
                          </Suspense>
                        } />
                        <Route path="/settings/talent-profile" element={
                          <Suspense fallback={<LoadingSkeleton type="profile" />}>
                            <TalentProfileSettings />
                          </Suspense>
                        } />
                        <Route path="/settings/users" element={
                          <Suspense fallback={<LoadingSkeleton type="table" />}>
                            <UserManagement />
                          </Suspense>
                        } />
                        
                        {/* 404 */}
                        <Route path="/404" element={
                          <Suspense fallback={<LoadingSkeleton type="card" />}>
                            <NotFound />
                          </Suspense>
                        } />
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
