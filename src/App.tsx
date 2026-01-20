
import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { ToastProvider } from '@/contexts/ToastContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { OpportunitiesProvider } from '@/contexts/OpportunitiesContext';
import { MessagingProvider } from '@/contexts/MessagingContext';
import { SupabaseMessagesProvider } from '@/contexts/SupabaseMessagesContext';
import { NavigationFlowProvider } from '@/components/NavigationFlowProvider';
import { ProfileManagerProvider } from '@/contexts/ProfileManagerContext';
import ToastContainer from '@/components/ToastContainer';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import AccessibilityWrapper from '@/components/AccessibilityWrapper';
import AuthErrorBoundary from '@/components/AuthErrorBoundary';
import { usePlatformSettings } from '@/hooks/usePlatformSettings';

// Importar páginas básicas
import Auth from './pages/Auth';

// Importar layouts de dashboard
import DashboardLayout from '@/components/DashboardLayout';
import TalentDashboardLayout from '@/components/TalentDashboardLayout';

// Importar componentes directamente para evitar problemas de lazy loading
import TalentDashboard from './pages/TalentDashboard';
import TalentMyProfile from './pages/TalentMyProfile';
import TalentEditProfile from './pages/TalentEditProfile';
import BusinessDashboard from './pages/BusinessDashboard';
import BusinessTalentProfile from './pages/BusinessTalentProfile';
import TalentOnboarding from './pages/TalentOnboarding';

// Lazy load páginas de talent dashboard
const TalentOpportunities = lazy(() => import('./pages/TalentOpportunities'));
const TalentOpportunitiesSearch = lazy(() => import('./pages/TalentOpportunitiesSearch'));
const ApplicationDetail = lazy(() => import('./pages/ApplicationDetail'));
const TalentMarketplace = lazy(() => import('./pages/TalentMarketplace'));
const TalentMyServices = lazy(() => import('./pages/TalentMyServices'));
const TalentMyPublishingRequests = lazy(() => import('./pages/TalentMyPublishingRequests'));
const SavedOpportunities = lazy(() => import('./pages/SavedOpportunities'));
const OpportunityDetail = lazy(() => import('./pages/OpportunityDetail'));

// Lazy load páginas de business dashboard
const OpportunitiesPage = lazy(() => import('./pages/OpportunitiesPage'));
const NewOpportunityMultiStep = lazy(() => import('./pages/NewOpportunityMultiStep'));
const EditOpportunityMultiStep = lazy(() => import('./pages/EditOpportunityMultiStep'));
const ApplicationsPage = lazy(() => import('./pages/ApplicationsPage'));

const TalentProfilePage = lazy(() => import('./pages/TalentProfilePage'));
const OpportunityApplicants = lazy(() => import('./pages/OpportunityApplicantsNew'));
const TalentDiscovery = lazy(() => import('./pages/TalentDiscovery'));
const PublicTalentProfile = lazy(() => import('./pages/PublicTalentProfile'));
// CompanyDetails removed - redirects to company-profile
const BusinessProfile = lazy(() => import('./pages/BusinessProfile'));
const BusinessMarketplace = lazy(() => import('./pages/BusinessMarketplace'));
const BusinessMyServices = lazy(() => import('./pages/BusinessMyServices'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const BusinessMessagesPage = lazy(() => import('./pages/BusinessMessagesPage'));
const BusinessNotificationsPage = lazy(() => import('./pages/BusinessNotificationsPage'));
const TalentMessagesPage = lazy(() => import('./pages/TalentMessagesPage'));
const TalentNotificationsPage = lazy(() => import('./pages/TalentNotificationsPage'));
const PublicContactRequests = lazy(() => import('./pages/PublicContactRequests'));
const AcademyDashboard = lazy(() => import('./pages/AcademyDashboard'));
const AcceptInvitation = lazy(() => import('./pages/AcceptInvitation'));
const AcceptAcademyInvitation = lazy(() => import('./pages/AcceptAcademyInvitation'));

// Lazy load páginas de registro
const UserTypeSelector = lazy(() => import('./pages/UserTypeSelector'));
const RegisterBusiness = lazy(() => import('./pages/RegisterBusiness'));
const RegisterTalent = lazy(() => import('./pages/RegisterTalent'));
const RegisterAcademy = lazy(() => import('./pages/RegisterAcademy'));
const CompanyOnboarding = lazy(() => import('./pages/CompanyOnboarding'));

// Lazy load páginas de configuración
import ProfileSettings from './pages/settings/ProfileSettings';
const TalentProfileSettings = lazy(() => import('./pages/settings/TalentProfileSettings'));
const CompanySettings = lazy(() => import('./pages/settings/CompanySettings'));
const CompanyProfileWizard = lazy(() => import('./components/wizard/CompanyProfileWizard').then(module => ({ default: module.CompanyProfileWizard })));
const UsersManagement = lazy(() => import('./pages/UsersManagement'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const EmailVerificationPending = lazy(() => import('./pages/EmailVerificationPending'));

// Lazy load página de oportunidades landing
const OpportunitiesLanding = lazy(() => import('./pages/OpportunitiesLanding'));

// Lazy load otras páginas
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const AdminMessagesPage = lazy(() => import('./pages/admin/AdminMessagesPage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const PublicOpportunity = lazy(() => import('./pages/PublicOpportunity'));
const PublicCompany = lazy(() => import('./pages/PublicCompany'));
const PublicAcademyDirectory = lazy(() => import('./pages/PublicAcademyDirectory'));
const AcademyLandingPage = lazy(() => import('./pages/AcademyLandingPage'));
const WelcomePage = lazy(() => import('./pages/WelcomePage'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Testing pages
const TestNotifications = lazy(() => import('./pages/testing/TestNotifications'));

// Platform settings loader component
const PlatformSettingsLoader = ({ children }: { children: React.ReactNode }) => {
  usePlatformSettings();
  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <PlatformSettingsLoader>
        <ProfileManagerProvider>
          <NotificationsProvider>
            <OpportunitiesProvider>
              <SupabaseMessagesProvider>
                <MessagingProvider>
                  <ToastProvider>
                    <BrowserRouter>
                      <NavigationFlowProvider>
                        <AccessibilityWrapper>
                          <div className="min-h-screen bg-background text-foreground">
                            <Routes>
                      <Route path="/" element={
                        <Suspense fallback={<LoadingSkeleton type="card" />}>
                          <UserTypeSelector />
                        </Suspense>
                      } />
                      <Route path="/auth" element={
                        <AuthErrorBoundary>
                          <Suspense fallback={<LoadingSkeleton type="card" />}>
                            <Auth />
                          </Suspense>
                        </AuthErrorBoundary>
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
                      <Route path="/register-academy" element={
                        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div>Loading...</div></div>}>
                          <RegisterAcademy />
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
                      <Route path="/academias" element={
                        <Suspense fallback={<LoadingSkeleton type="card" />}>
                          <AcademyLandingPage />
                        </Suspense>
                      } />

                      {/* Public Talent Profile - Shared Profile Link */}
                      <Route path="/profile/:talentId" element={
                        <Suspense fallback={<LoadingSkeleton type="profile" />}>
                          <PublicTalentProfile />
                        </Suspense>
                      } />

                       {/* Talent Dashboard Routes - With Layout */}
                        <Route path="/talent-dashboard" element={<TalentDashboardLayout />}>
                          <Route index element={<TalentDashboard />} />
                          <Route path="home" element={<TalentDashboard />} />
                          <Route path="profile" element={<TalentMyProfile />} />
                          <Route path="profile/edit" element={<TalentEditProfile />} />
                          <Route path="explore" element={
                            <Suspense fallback={<LoadingSkeleton type="opportunities" />}>
                              <TalentMarketplace />
                            </Suspense>
                          } />
                          <Route path="opportunities" element={
                            <Suspense fallback={<LoadingSkeleton type="opportunities" />}>
                              <TalentOpportunitiesSearch />
                            </Suspense>
                          } />
                          <Route path="applications" element={
                            <Suspense fallback={<LoadingSkeleton type="opportunities" />}>
                              <TalentOpportunities />
                            </Suspense>
                          } />
                          <Route path="applications/:id" element={
                            <Suspense fallback={<LoadingSkeleton type="card" />}>
                              <ApplicationDetail />
                            </Suspense>
                          } />
                          <Route path="marketplace" element={
                            <Suspense fallback={<LoadingSkeleton type="opportunities" />}>
                              <TalentMarketplace />
                            </Suspense>
                          } />
                          <Route path="marketplace/service/:id" element={
                            <Suspense fallback={<LoadingSkeleton type="card" />}>
                              <ServiceDetail />
                            </Suspense>
                          } />
                        <Route path="my-services" element={
                          <Suspense fallback={<LoadingSkeleton type="opportunities" />}>
                            <TalentMyServices />
                          </Suspense>
                        } />
                        <Route path="my-services/:serviceId" element={
                          <Suspense fallback={<LoadingSkeleton type="card" />}>
                            <ServiceDetail />
                          </Suspense>
                        } />
                        <Route path="my-publishing-requests" element={
                          <Suspense fallback={<LoadingSkeleton type="list" />}>
                            <TalentMyPublishingRequests />
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
                          <Route path="settings" element={
                            <Suspense fallback={<LoadingSkeleton type="profile" />}>
                              <TalentProfileSettings />
                            </Suspense>
                          } />
                          <Route path="messages" element={
                            <Suspense fallback={<LoadingSkeleton type="list" />}>
                              <TalentMessagesPage />
                            </Suspense>
                          } />
                          <Route path="messages/:conversationId" element={
                            <Suspense fallback={<LoadingSkeleton type="list" />}>
                              <TalentMessagesPage />
                            </Suspense>
                          } />
                          <Route path="contact-requests" element={
                            <Suspense fallback={<LoadingSkeleton type="list" />}>
                              <PublicContactRequests />
                            </Suspense>
                          } />
                          <Route path="notifications" element={
                            <Suspense fallback={<LoadingSkeleton type="list" />}>
                              <TalentNotificationsPage />
                            </Suspense>
                          } />
                        </Route>

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
                            <EditOpportunityMultiStep />
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
                        <Route path="company-details" element={
                          <Suspense fallback={<LoadingSkeleton type="card" />}>
                            <CompanyProfileWizard />
                          </Suspense>
                        } />
                        <Route path="marketplace" element={
                          <Suspense fallback={<LoadingSkeleton type="list" />}>
                            <BusinessMarketplace />
                          </Suspense>
                        } />
                        <Route path="my-services" element={
                          <Suspense fallback={<LoadingSkeleton type="list" />}>
                            <BusinessMyServices />
                          </Suspense>
                        } />
                        <Route path="my-services/:serviceId" element={
                          <Suspense fallback={<LoadingSkeleton type="card" />}>
                            <ServiceDetail />
                          </Suspense>
                        } />
                        <Route path="marketplace/service/:id" element={
                          <Suspense fallback={<LoadingSkeleton type="card" />}>
                            <ServiceDetail />
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
                        <Route path="company-profile" element={
                          <Suspense fallback={<LoadingSkeleton type="profile" />}>
                            <CompanyProfileWizard />
                          </Suspense>
                        } />
                        <Route path="users" element={
                          <Suspense fallback={<LoadingSkeleton type="list" />}>
                            <UsersManagement />
                          </Suspense>
                        } />
                        <Route path="settings/company" element={
                          <Suspense fallback={<LoadingSkeleton type="profile" />}>
                            <CompanySettings />
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
                      
                      {/* Admin Messages - Full page layout */}
                      <Route path="/admin/messages/:conversationId?" element={
                        <Suspense fallback={<LoadingSkeleton type="list" />}>
                          <AdminMessagesPage />
                        </Suspense>
                      } />

                      {/* Test Notifications */}
                      <Route path="/test-notifications" element={
                        <Suspense fallback={<LoadingSkeleton type="card" />}>
                          <TestNotifications />
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

                      {/* Public Company Profile */}
                      <Route path="/company/:companyId" element={
                        <Suspense fallback={<LoadingSkeleton type="card" />}>
                          <PublicCompany />
                        </Suspense>
                      } />

                      {/* Public Academy Directory */}
                      <Route path="/academy/:slug" element={
                        <Suspense fallback={<LoadingSkeleton type="card" />}>
                          <PublicAcademyDirectory />
                        </Suspense>
                      } />

                      {/* Accept Academy Invitation */}
                      <Route path="/accept-academy-invitation" element={
                        <Suspense fallback={<LoadingSkeleton type="card" />}>
                          <AcceptAcademyInvitation />
                        </Suspense>
                      } />

                      {/* Testing Routes - REMOVED FOR PRODUCTION */}
                      {/* <Route path="/testing/notifications-demo" element={
                        <Suspense fallback={<LoadingSkeleton type="card" />}>
                          <NotificationsDemo />
                        </Suspense>
                      } /> */}

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
            </SupabaseMessagesProvider>
          </OpportunitiesProvider>
        </NotificationsProvider>
      </ProfileManagerProvider>
      </PlatformSettingsLoader>
    </ThemeProvider>
  );
}

export default App;
