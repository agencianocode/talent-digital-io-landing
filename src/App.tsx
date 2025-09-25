
import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { ToastProvider } from '@/contexts/ToastContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { OpportunitiesProvider } from '@/contexts/OpportunitiesContext';
import { MessagingProvider } from '@/contexts/MessagingContext';
import { NavigationFlowProvider } from '@/components/NavigationFlowProvider';
import { ProfileManagerProvider } from '@/contexts/ProfileManagerContext';
import ToastContainer from '@/components/ToastContainer';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import AccessibilityWrapper from '@/components/AccessibilityWrapper';
import AuthErrorBoundary from '@/components/AuthErrorBoundary';

// Importar páginas básicas
import LandingPage from './pages/LandingPage';
import Auth from './pages/Auth';

// Importar layouts de dashboard
import DashboardLayout from '@/components/DashboardLayout';

// Importar componentes directamente para evitar problemas de lazy loading
import TalentDashboard from './pages/TalentDashboard';
import TalentMyProfile from './pages/TalentMyProfile';
import BusinessDashboard from './pages/BusinessDashboard';
import BusinessTalentProfile from './pages/BusinessTalentProfile';
import TalentOnboarding from './pages/TalentOnboarding';

// Lazy load páginas de talent dashboard
const TalentOpportunities = lazy(() => import('./pages/TalentOpportunities'));
const TalentOpportunitiesSearch = lazy(() => import('./pages/TalentOpportunitiesSearch'));
const ApplicationDetail = lazy(() => import('./pages/ApplicationDetail'));
const TalentMarketplace = lazy(() => import('./pages/TalentMarketplace'));
const SavedOpportunities = lazy(() => import('./pages/SavedOpportunities'));
const OpportunityDetail = lazy(() => import('./pages/OpportunityDetail'));

// Lazy load páginas de business dashboard
const OpportunitiesPage = lazy(() => import('./pages/OpportunitiesPage'));
const NewOpportunity = lazy(() => import('./pages/NewOpportunity'));
const NewOpportunityMultiStep = lazy(() => import('./pages/NewOpportunityMultiStep'));
const ApplicationsPage = lazy(() => import('./pages/ApplicationsPage'));
const TalentSearchPage = lazy(() => import('./pages/TalentSearchPage'));
const TalentProfilePage = lazy(() => import('./pages/TalentProfilePage'));
const OpportunityApplicants = lazy(() => import('./pages/OpportunityApplicantsNew'));
const TalentDiscovery = lazy(() => import('./pages/TalentDiscovery'));
const PublicTalentProfile = lazy(() => import('./pages/PublicTalentProfile'));
const UserManagement = lazy(() => import('./pages/settings/UserManagement'));
const CompanyDetails = lazy(() => import('./pages/CompanyDetails'));
const BusinessProfile = lazy(() => import('./pages/BusinessProfile'));
const BusinessMarketplace = lazy(() => import('./pages/BusinessMarketplace'));
const BusinessMessagesPage = lazy(() => import('./pages/BusinessMessagesPage'));
const BusinessNotificationsPage = lazy(() => import('./pages/BusinessNotificationsPage'));
const AcademyDashboard = lazy(() => import('./pages/AcademyDashboard'));
const AcceptInvitation = lazy(() => import('./pages/AcceptInvitation'));

// Lazy load páginas de registro
const UserTypeSelector = lazy(() => import('./pages/UserTypeSelector'));
const RegisterBusiness = lazy(() => import('./pages/RegisterBusiness'));
const RegisterTalent = lazy(() => import('./pages/RegisterTalent'));
const CompanyOnboarding = lazy(() => import('./pages/CompanyOnboarding'));

// Lazy load páginas de configuración
import ProfileSettings from './pages/settings/ProfileSettings';
const TalentProfileSettings = lazy(() => import('./pages/settings/TalentProfileSettings'));
const CompanySettings = lazy(() => import('./pages/settings/CompanySettings'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const EmailVerificationPending = lazy(() => import('./pages/EmailVerificationPending'));

// Lazy load páginas de landing específicas
const OpportunitiesLanding = lazy(() => import('./pages/OpportunitiesLanding'));
const TalentLanding = lazy(() => import('./pages/TalentLanding'));
const BusinessLanding = lazy(() => import('./pages/BusinessLanding'));

// Lazy load otras páginas
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const PublicOpportunity = lazy(() => import('./pages/PublicOpportunity'));
const WelcomePage = lazy(() => import('./pages/WelcomePage'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ProfileManagerProvider>
        <NotificationsProvider>
          <OpportunitiesProvider>
            <MessagingProvider>
              <ToastProvider>
                  <BrowserRouter>
                    <NavigationFlowProvider>
                      <AccessibilityWrapper>
                        <div className="min-h-screen bg-background text-foreground">
                          <Routes>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/auth" element={
                        <AuthErrorBoundary>
                          <Suspense fallback={<LoadingSkeleton type="card" />}>
                            <Auth />
                          </Suspense>
                        </AuthErrorBoundary>
                      } />
                      <Route path="/user-selector" element={
                        <Suspense fallback={<LoadingSkeleton type="card" />}>
                          <UserTypeSelector />
                        </Suspense>
                      } />
                      
                      {/* Ruta pública para invitaciones a oportunidades */}
                      <Route path="/opportunity/invite/:id" element={
                        <Suspense fallback={<LoadingSkeleton type="card" />}>
                          <OpportunityDetail />
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
                      <Route path="/company-onboarding" element={
                        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div>Loading...</div></div>}>
                          <CompanyOnboarding />
                        </Suspense>
                      } />
                      <Route path="/talent-onboarding" element={
                        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div>Loading...</div></div>}>
                          <TalentOnboarding />
                        </Suspense>
                      } />
                      <Route path="/email-verification-pending" element={
                        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div>Loading...</div></div>}>
                          <EmailVerificationPending />
                        </Suspense>
                      } />
                      <Route path="/accept-invitation" element={
                        <Suspense fallback={<LoadingSkeleton type="card" />}>
                          <AcceptInvitation />
                        </Suspense>
                      } />
                      
                      {/* Redirects for legacy/duplicate routes */}
                      <Route path="/talent-register" element={<RegisterTalent />} />
                      <Route path="/registro-talento" element={<RegisterTalent />} />

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

                       {/* Talent Dashboard Routes - Modern Layout */}
                        <Route path="/talent-dashboard" element={<TalentDashboard />} />
                        <Route path="/talent-dashboard/home" element={<TalentDashboard />} />
                        <Route path="/talent-dashboard/profile" element={<TalentMyProfile />} />
                        <Route path="/talent-dashboard/explore" element={
                          <Suspense fallback={<LoadingSkeleton type="opportunities" />}>
                            <TalentMarketplace />
                          </Suspense>
                        } />
                        <Route path="/talent-dashboard/opportunities" element={
                          <Suspense fallback={<LoadingSkeleton type="opportunities" />}>
                            <TalentOpportunitiesSearch />
                          </Suspense>
                        } />
                        <Route path="/talent-dashboard/applications" element={
                          <Suspense fallback={<LoadingSkeleton type="opportunities" />}>
                            <TalentOpportunities />
                          </Suspense>
                        } />
                        <Route path="/talent-dashboard/applications/:id" element={
                          <Suspense fallback={<LoadingSkeleton type="card" />}>
                            <ApplicationDetail />
                          </Suspense>
                        } />
                        <Route path="/talent-dashboard/marketplace" element={
                          <Suspense fallback={<LoadingSkeleton type="opportunities" />}>
                            <TalentMarketplace />
                          </Suspense>
                        } />
                        <Route path="/talent-dashboard/saved" element={
                          <Suspense fallback={<LoadingSkeleton type="list" />}>
                            <SavedOpportunities />
                          </Suspense>
                        } />
                        <Route path="/talent-dashboard/opportunities/:id" element={
                          <Suspense fallback={<LoadingSkeleton type="card" />}>
                            <OpportunityDetail />
                          </Suspense>
                        } />
                        <Route path="/talent-dashboard/settings" element={
                          <Suspense fallback={<LoadingSkeleton type="profile" />}>
                            <TalentProfileSettings />
                          </Suspense>
                        } />

                      {/* Welcome Page */}
                      <Route path="/welcome" element={
                        <Suspense fallback={<LoadingSkeleton type="card" />}>
                          <WelcomePage />
                        </Suspense>
                      } />

                      {/* Business Dashboard Routes */}
                      <Route path="/business-dashboard" element={<DashboardLayout />}>
                        <Route index element={
                          <Suspense fallback={<LoadingSkeleton type="card" />}>
                            <BusinessDashboard />
                          </Suspense>
                        } />
                        <Route path="opportunities" element={
                          <Suspense fallback={<LoadingSkeleton type="opportunities" />}>
                            <OpportunitiesPage />
                          </Suspense>
                        } />
                        <Route path="talent-profile/:id" element={
                          <Suspense fallback={<LoadingSkeleton type="card" />}>
                            <BusinessTalentProfile />
                          </Suspense>
                        } />
                        <Route path="opportunities/new" element={
                          <Suspense fallback={<LoadingSkeleton type="card" />}>
                            <NewOpportunityMultiStep />
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
                        <Route path="opportunities/:opportunityId/applicants" element={
                          <Suspense fallback={<LoadingSkeleton type="list" />}>
                            <OpportunityApplicants />
                          </Suspense>
                        } />
                        <Route path="applications/:applicationId" element={
                          <Suspense fallback={<LoadingSkeleton type="card" />}>
                            <ApplicationDetail />
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
                        <Route path="talent-discovery" element={
                          <Suspense fallback={<LoadingSkeleton type="list" />}>
                            <TalentDiscovery />
                          </Suspense>
                        } />
                        <Route path="talent-profile/:talentId" element={
                          <Suspense fallback={<LoadingSkeleton type="card" />}>
                            <PublicTalentProfile />
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
                        <Route path="company-details" element={
                          <Suspense fallback={<LoadingSkeleton type="card" />}>
                            <CompanyDetails />
                          </Suspense>
                        } />
                        <Route path="marketplace" element={
                          <Suspense fallback={<LoadingSkeleton type="list" />}>
                            <BusinessMarketplace />
                          </Suspense>
                        } />
                        <Route path="profile" element={
                          <Suspense fallback={<LoadingSkeleton type="profile" />}>
                            <BusinessProfile />
                          </Suspense>
                        } />
                        <Route path="messages" element={
                          <Suspense fallback={<LoadingSkeleton type="list" />}>
                            <BusinessMessagesPage />
                          </Suspense>
                        } />
                        <Route path="messages/:conversationId" element={
                          <Suspense fallback={<LoadingSkeleton type="list" />}>
                            <BusinessMessagesPage />
                          </Suspense>
                        } />
                        <Route path="notifications" element={
                          <Suspense fallback={<LoadingSkeleton type="list" />}>
                            <BusinessNotificationsPage />
                          </Suspense>
                        } />
                        <Route path="academy" element={
                          <Suspense fallback={<LoadingSkeleton type="card" />}>
                            <AcademyDashboard />
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
                      <Route path="/onboarding" element={
                        <Suspense fallback={<LoadingSkeleton type="profile" />}>
                          <OnboardingPage />
                        </Suspense>
                      } />

                      {/* Admin Panel */}
                      <Route path="/admin" element={
                        <Suspense fallback={<LoadingSkeleton type="card" />}>
                          <AdminPanel />
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
                          </Routes>
                          <ToastContainer />
                        </div>
                      </AccessibilityWrapper>
                    </NavigationFlowProvider>
                  </BrowserRouter>
                </ToastProvider>
              </MessagingProvider>
            </OpportunitiesProvider>
        </NotificationsProvider>
        </ProfileManagerProvider>
    </ThemeProvider>
  );
}

export default App;
