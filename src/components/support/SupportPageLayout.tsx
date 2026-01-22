import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Navigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SupportPageLayoutProps {
  title: string;
  children: React.ReactNode;
}

const SupportPageLayout = ({ title, children }: SupportPageLayoutProps) => {
  const { user, profile, isAuthenticated, isLoading } = useSupabaseAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleBackToApp = () => {
    window.location.href = 'https://app.talentodigital.io';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Minimalist Header */}
      <header className="h-14 border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto h-full flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackToApp}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Volver a la app</span>
            </Button>
            <div className="h-6 w-px bg-border hidden sm:block" />
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {profile?.full_name || user?.email}
            </span>
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {getInitials(profile?.full_name || user?.email || 'U')}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};

export default SupportPageLayout;
