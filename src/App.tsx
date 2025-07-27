
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { OpportunitiesProvider } from '@/contexts/OpportunitiesContext';
import { MessagingProvider } from '@/contexts/MessagingContext';
import ToastContainer from '@/components/ToastContainer';
import LoadingSkeleton from '@/components/LoadingSkeleton';

// Importar páginas básicas
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Auth from './pages/Auth';

// Importar layouts de dashboard
import TalentDashboardLayout from '@/components/TalentDashboardLayout';
import DashboardLayout from '@/components/DashboardLayout';

// Lazy load páginas de talent dashboard
const TalentDashboardHome = lazy(() => import('./pages/TalentDashboardHome'));
const TalentOpportunities = lazy(() => import('./pages/TalentOpportunities'));
const TalentMarketplace = lazy(() => import('./pages/TalentMarketplace'));
const SavedOpportunities = lazy(() => import('./pages/SavedOpportunities'));
const OpportunityDetail = lazy(() => import('./pages/OpportunityDetail'));

// Lazy load páginas de business dashboard
const DashboardHome = lazy(() => import('./pages/DashboardHome'));
const OpportunitiesPage = lazy(() => import('./pages/OpportunitiesPage'));
const NewOpportunity = lazy(() => import('./pages/NewOpportunity'));
const ApplicationsPage = lazy(() => import('./pages/ApplicationsPage'));
const TalentSearchPage = lazy(() => import('./pages/TalentSearchPage'));
const TalentProfilePage = lazy(() => import('./pages/TalentProfilePage'));
const UserManagement = lazy(() => import('./pages/settings/UserManagement'));

// Lazy load páginas de registro
const Register = lazy(() => import('./pages/Register'));
const RegisterBusiness = lazy(() => import('./pages/RegisterBusiness'));
const RegisterTalent = lazy(() => import('./pages/RegisterTalent'));

// Lazy load páginas de configuración
const ProfileSettings = lazy(() => import('./pages/settings/ProfileSettings'));
const TalentProfileSettings = lazy(() => import('./pages/settings/TalentProfileSettings'));
const CompanySettings = lazy(() => import('./pages/settings/CompanySettings'));

// Lazy load páginas de landing específicas
const OpportunitiesLanding = lazy(() => import('./pages/OpportunitiesLanding'));
const TalentLanding = lazy(() => import('./pages/TalentLanding'));
const BusinessLanding = lazy(() => import('./pages/BusinessLanding'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));

// Lazy load otras páginas
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const PublicOpportunity = lazy(() => import('./pages/PublicOpportunity'));
const PersonalProfile = lazy(() => import('./pages/PersonalProfile'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SupabaseAuthProvider>
        <NotificationsProvider>
          <OpportunitiesProvider>
            <MessagingProvider>
              <ToastProvider>
                <BrowserRouter>
                  <div className="min-h-screen bg-background text-foreground">
                    <Routes>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/register" element={
                        <Suspense fallback={<LoadingSkeleton type="card" />}>
                          <Register />
                        </Suspense>
                      } />
                      <Route path="/register-business" element={
                        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div>Loading...</div></div>}>
                          <RegisterBusiness />
                        </Suspense>
                      } />
                      <Route path="/register-talent" element={
                        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div>Loading...</div></div>}>
                          <RegisterTalent />
                        </Suspense>
                      } />

                      {/* Landing Pages Específicas */}
                      <Route path="/oportunidades-laborales" element={
                        <Suspense fallback={<LoadingSkeleton type="card" />}>
                          <OpportunitiesLanding />
                        </Suspense>
                      } />
                      <Route path="/para-talento-digital" element={
                        <Suspense fallback={<LoadingSkeleton type="card" />}>
                          <TalentLanding />
                        </Suspense>
                      } />
                      <Route path="/para-negocios" element={
                        <Suspense fallback={<LoadingSkeleton type="card" />}>
                          <BusinessLanding />
                        </Suspense>
                      } />

                      <Route path="/talent-dashboard" element={<TalentDashboardLayout />}>
                        <Route index element={<TalentDashboardHome />} />
                        <Route path="opportunities" element={
                          <Suspense fallback={<LoadingSkeleton type="opportunities" />}>
                            <TalentOpportunities />
                          </Suspense>
                        } />
                        <Route path="marketplace" element={
                          <Suspense fallback={<LoadingSkeleton type="opportunities" />}>
                            <TalentMarketplace />
                          </Suspense>
                        } />
                        <Route path="saved" element={
                          <Suspense fallback={<LoadingSkeleton type="list" />}>
                            <SavedOpportunities />
                          </Suspense>
                        } />
                        <Route path="opportunities/:id" element={
                          <Suspense fallback={<LoadingSkeleton type="card" />}>
                            <OpportunityDetail />
                          </Suspense>
                        } />
                      </Route>

                      {/* Business Dashboard Routes */}
                      <Route path="/business-dashboard" element={<DashboardLayout />}>
                        <Route index element={
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
                        <Route path="opportunities/:id/edit" element={
                          <Suspense fallback={<LoadingSkeleton type="card" />}>
                            <NewOpportunity />
                          </Suspense>
                        } />
                        <Route path="applications" element={
                          <Suspense fallback={<LoadingSkeleton type="list" />}>
                            <ApplicationsPage />
                          </Suspense>
                        } />
                        <Route path="talent" element={
                          <Suspense fallback={<LoadingSkeleton type="list" />}>
                            <TalentSearchPage />
                          </Suspense>
                        } />
                        <Route path="talent-profile/:id" element={
                          <Suspense fallback={<LoadingSkeleton type="profile" />}>
                            <TalentProfilePage />
                          </Suspense>
                        } />
                        <Route path="users" element={
                          <Suspense fallback={<LoadingSkeleton type="table" />}>
                            <UserManagement />
                          </Suspense>
                        } />
                      </Route>

                      {/* Settings Routes */}
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
                      <Route path="/settings/company" element={
                        <Suspense fallback={<LoadingSkeleton type="profile" />}>
                          <CompanySettings />
                        </Suspense>
                      } />

                      {/* Messages */}
                      <Route path="/messages" element={
                        <Suspense fallback={<LoadingSkeleton type="list" />}>
                          <MessagesPage />
                        </Suspense>
                      } />

                      {/* Public Opportunity */}
                      <Route path="/opportunity/:opportunityId" element={
                        <Suspense fallback={<LoadingSkeleton type="card" />}>
                          <PublicOpportunity />
                        </Suspense>
                      } />

                      {/* 404 */}
                      <Route path="/404" element={
                        <Suspense fallback={<LoadingSkeleton type="card" />}>
                          <NotFound />
                        </Suspense>
                      } />
                      <Route path="*" element={<NotFound />} />

                      {/* Personal Profile - moved outside dashboard */}
                      <Route path="/personal-profile" element={
                        <Suspense fallback={<LoadingSkeleton type="profile" />}>
                          <PersonalProfile />
                        </Suspense>
                      } />
                    </Routes>
                    <ToastContainer />
                  </div>
                </BrowserRouter>
              </ToastProvider>
            </MessagingProvider>
          </OpportunitiesProvider>
        </NotificationsProvider>
      </SupabaseAuthProvider>
    </ThemeProvider>
  );
}

export default App;
