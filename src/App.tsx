
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContextEnhanced";
import { OpportunitiesProvider } from "@/contexts/OpportunitiesContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { MessagingProvider } from "@/contexts/MessagingContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserSelector from "./pages/UserSelector";
import CompanySearch from "./pages/CompanySearch";
import CompanyProfile from "./pages/CompanyProfile";
import PersonalProfile from "./pages/PersonalProfile";
import CompanyOnboarding from "./pages/CompanyOnboarding";
import UserProfile from "./pages/UserProfile";
import Welcome from "./pages/Welcome";
import BusinessDashboard from "./pages/BusinessDashboard";
import TalentRegister from "./pages/TalentRegister";
import TalentDashboard from "./pages/TalentDashboard";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import OpportunitiesPage from "./pages/OpportunitiesPage";
import TalentSearchPage from "./pages/TalentSearchPage";
import ServicesPage from "./pages/ServicesPage";
import OpportunityDetail from "./pages/OpportunityDetail";
import NewOpportunity from "./pages/NewOpportunity";
import ProfilePage from "./pages/ProfilePage";
import JobCategories from "./pages/JobCategories";
import TalentDashboardLayout from "./components/TalentDashboardLayout";
import TalentDashboardHome from "./pages/TalentDashboardHome";
import TalentOpportunities from "./pages/TalentOpportunities";
import TalentExplore from "./pages/TalentExplore";
import TalentMarketplace from "./pages/TalentMarketplace";
import TalentProfilePage from "./pages/TalentProfilePage";
import NotFound from "./pages/NotFound";
import MessagesPage from "./pages/MessagesPage";
import SettingsLayout from "./components/SettingsLayout";
import CompanySettings from "./pages/settings/CompanySettings";
import UserManagement from "./pages/settings/UserManagement";
import ProfileSettings from "./pages/settings/ProfileSettings";
import TalentProfileSettings from "./pages/settings/TalentProfileSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <OpportunitiesProvider>
        <NotificationsProvider>
          <MessagingProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/user-selector" element={<UserSelector />} />
                  <Route path="/job-categories" element={<JobCategories />} />
                  
                  {/* Business Flow */}
                  <Route path="/company-search" element={<CompanySearch />} />
                  <Route path="/company-profile" element={<CompanyProfile />} />
                  <Route path="/personal-profile" element={<PersonalProfile />} />
                  <Route path="/company-onboarding" element={<CompanyOnboarding />} />
                  <Route path="/user-profile" element={<UserProfile />} />
                  <Route path="/welcome" element={<Welcome />} />
                  <Route path="/business-dashboard" element={<BusinessDashboard />} />
                  
                  {/* Talent Flow */}
                  <Route path="/talent-register" element={<TalentRegister />} />
                  <Route path="/talent-dashboard" element={<TalentDashboard />} />
                  
                  {/* Protected Business Dashboard Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute requiredUserType="business">
                      <DashboardLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<DashboardHome />} />
                    <Route path="opportunities" element={<OpportunitiesPage />} />
                    <Route path="opportunities/new" element={<NewOpportunity />} />
                    <Route path="opportunities/:id" element={<OpportunityDetail />} />
                    <Route path="talent" element={<TalentSearchPage />} />
                    <Route path="services" element={<ServicesPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                  </Route>
                  
                  {/* Protected Talent Dashboard Routes */}
                  <Route path="/talent-dashboard" element={
                    <ProtectedRoute requiredUserType="talent">
                      <TalentDashboardLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<TalentDashboardHome />} />
                    <Route path="opportunities" element={<TalentOpportunities />} />
                    <Route path="explore" element={<TalentExplore />} />
                    <Route path="marketplace" element={<TalentMarketplace />} />
                  </Route>
                  
                  {/* Settings Routes */}
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <SettingsLayout />
                    </ProtectedRoute>
                  }>
                    <Route path="company" element={<CompanySettings />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="profile" element={<ProfileSettings />} />
                    <Route path="talent-profile" element={<TalentProfileSettings />} />
                  </Route>
                  
                  {/* Public Talent Routes */}
                  <Route path="/talent/marketplace" element={<TalentMarketplace />} />
                  
                  {/* Talent Profile Routes */}
                  <Route path="/talent-profile/:id" element={<TalentProfilePage />} />
                  <Route path="/opportunities/:id" element={<OpportunityDetail />} />
                  
                  {/* Messages Route */}
                  <Route path="/messages" element={
                    <ProtectedRoute>
                      <MessagesPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/messages/:conversationId" element={
                    <ProtectedRoute>
                      <MessagesPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Catch-all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </MessagingProvider>
        </NotificationsProvider>
      </OpportunitiesProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
