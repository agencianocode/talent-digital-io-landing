import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/user-selector" element={<UserSelector />} />
          <Route path="/company-search" element={<CompanySearch />} />
          <Route path="/company-profile" element={<CompanyProfile />} />
          <Route path="/personal-profile" element={<PersonalProfile />} />
          <Route path="/company-onboarding" element={<CompanyOnboarding />} />
          <Route path="/user-profile" element={<UserProfile />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/business-dashboard" element={<BusinessDashboard />} />
          <Route path="/talent-register" element={<TalentRegister />} />
          <Route path="/talent-dashboard" element={<TalentDashboard />} />
          
          {/* Dashboard Routes with Layout */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="opportunities" element={<OpportunitiesPage />} />
            <Route path="opportunities/new" element={<NewOpportunity />} />
            <Route path="opportunities/:id" element={<OpportunityDetail />} />
            <Route path="talent" element={<TalentSearchPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
