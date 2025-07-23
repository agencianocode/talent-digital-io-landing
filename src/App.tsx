
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
import ProtectedRoute from '@/components/ProtectedRoute';

// Load critical pages immediately
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import Auth from './pages/Auth';
import TalentDashboardLayout from '@/components/TalentDashboardLayout';
import DashboardLayout from '@/components/DashboardLayout';

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
const TalentOpportunities = lazy(() => import('./pages/TalentOpportunities'));
const TalentExplore = lazy(() => import('./pages/TalentExplore'));
const CompanySettings = lazy(() => import('./pages/settings/CompanySettings'));
const ProfileSettings = lazy(() => import('./pages/settings/ProfileSettings'));
const TalentProfileSettings = lazy(() => import('./pages/settings/TalentProfileSettings'));
const UserManagement = lazy(() => import('./pages/settings/UserManagement'));
const TalentSearchPage = lazy(() => import('./pages/TalentSearchPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const RegisterBusiness = lazy(() => import('./pages/RegisterBusiness'));
const RegisterTalent = lazy(() => import('./pages/RegisterTalent'));
const SavedOpportunities = lazy(() => import('./pages/SavedOpportunities'));

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
                        {/* Public Routes */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/login" element={<Login />} />
                        
                        {/* Registration Routes */}
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
                        
                        {/* Business Dashboard Routes */}
                        <Route path="/dashboard" element={
                          <ProtectedRoute requiredUserType="business">
                            <DashboardLayout />
                          </ProtectedRoute>
                        }>
                          <Route index element={
                            <Suspense fallback={<LoadingSkeleton type="card" />}>
                              <DashboardHome />
                            </Suspense>
                          } />
                          <Route path="home" element={
                            <Suspense fallback={<LoadingSkeleton type="card" />}>
                              <DashboardHome />
                            </Suspense>
                          } />
                          <Route path="opportunities" element={
                            <Suspense fallback={<LoadingSkeleton type="opportunities" />}>
                              <OpportunitiesPage />
                            </Suspense>
                          } />
                          <Route path="opportunities/new" element={
                            <Suspense fallback={<LoadingSkeleton type="card" />}>
                              <NewOpportunity />
                            </Suspense>
                          } />
                          <Route path="opportunities/:id" element={
                            <Suspense fallback={<LoadingSkeleton type="card" />}>
                              <OpportunityDetail />
                            </Suspense>
                          } />
                        </Route>

                        {/* Talent Dashboard Routes */}
                        <Route path="/talent-dashboard" element={
                          <ProtectedRoute requiredUserType="talent">
                            <TalentDashboardLayout />
                          </ProtectedRoute>
                        }>
                          <Route index element={
                            <Suspense fallback={<LoadingSkeleton type="card" />}>
                              <TalentDashboardHome />
                            </Suspense>
                          } />
                          <Route path="opportunities" element={
                            <Suspense fallback={<LoadingSkeleton type="opportunities" />}>
                              <TalentOpportunities />
                            </Suspense>
                          } />
                          <Route path="explore" element={
                            <Suspense fallback={<LoadingSkeleton type="list" />}>
                              <TalentMarketplace />
                            </Suspense>
                          } />
                          <Route path="saved" element={
                            <Suspense fallback={<LoadingSkeleton type="list" />}>
                              <SavedOpportunities />
                            </Suspense>
                          } />
                          <Route path="marketplace" element={
                            <Suspense fallback={<LoadingSkeleton type="opportunities" />}>
                              <TalentMarketplace />
                            </Suspense>
                          } />
                        </Route>

                        {/* Legacy Routes - Redirect to new structure */}
                        <Route path="/business/dashboard" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/talent/dashboard" element={<Navigate to="/talent-dashboard" replace />} />
                        <Route path="/talent/home" element={<Navigate to="/talent-dashboard" replace />} />
                        <Route path="/talent/marketplace" element={<Navigate to="/talent-dashboard/marketplace" replace />} />
                        <Route path="/talent/search" element={
                          <Suspense fallback={<LoadingSkeleton type="talent" />}>
                            <TalentSearchPage />
                          </Suspense>
                        } />
                        
                        {/* Messages */}
                        <Route path="/messages" element={
                          <ProtectedRoute>
                            <Suspense fallback={<LoadingSkeleton type="list" />}>
                              <MessagesPage />
                            </Suspense>
                          </ProtectedRoute>
                        } />
                        
                        {/* Settings Routes */}
                        <Route path="/settings/company" element={
                          <ProtectedRoute requiredUserType="business">
                            <Suspense fallback={<LoadingSkeleton type="profile" />}>
                              <CompanySettings />
                            </Suspense>
                          </ProtectedRoute>
                        } />
                        <Route path="/settings/profile" element={
                          <ProtectedRoute>
                            <Suspense fallback={<LoadingSkeleton type="profile" />}>
                              <ProfileSettings />
                            </Suspense>
                          </ProtectedRoute>
                        } />
                        <Route path="/settings/talent-profile" element={
                          <ProtectedRoute requiredUserType="talent">
                            <Suspense fallback={<LoadingSkeleton type="profile" />}>
                              <TalentProfileSettings />
                            </Suspense>
                          </ProtectedRoute>
                        } />
                        <Route path="/settings/users" element={
                          <ProtectedRoute requiredUserType="admin">
                            <Suspense fallback={<LoadingSkeleton type="table" />}>
                              <UserManagement />
                            </Suspense>
                          </ProtectedRoute>
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
