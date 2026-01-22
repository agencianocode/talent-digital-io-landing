import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  CheckSquare, 
  Store, 
  MessageCircle, 
  Bell, 
  HelpCircle,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { useSupabaseAuth, isPremiumRole } from '@/contexts/SupabaseAuthContext';
import { useProfileData } from '@/hooks/useProfileData';
import { useSupabaseMessages } from '@/contexts/SupabaseMessagesContext';
import { useNotifications } from '@/hooks/useNotifications';
import PremiumBadge from '@/components/PremiumBadge';
import HelpFeedbackModal from '@/components/HelpFeedbackModal';

const TalentTopNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, signOut, userRole } = useSupabaseAuth();
  const isPremium = isPremiumRole(userRole);
  const { userProfile, refreshProfile } = useProfileData();
  const { unreadCount: unreadMessagesCount } = useSupabaseMessages();
  const { unreadCount: unreadNotificationsCount } = useNotifications(); // Talent doesn't filter by company
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      console.log('🔄 TalentTopNavigation: Profile update detected, refreshing...');
      refreshProfile();
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [refreshProfile]);

  console.log('🖼️ TalentTopNavigation - Avatar URL:', {
    userProfileAvatarUrl: userProfile?.avatar_url,
    userProfileFullName: userProfile?.full_name,
    profileFullName: profile?.full_name
  });

  const navigationItems = [
    {
      id: 'opportunities',
      label: 'Oportunidades',
      icon: Search,
      path: '/talent-dashboard/opportunities',
      isActive: location.pathname === '/talent-dashboard/opportunities'
    },
    {
      id: 'applications',
      label: 'Mis Postulaciones',
      icon: CheckSquare,
      path: '/talent-dashboard/applications',
      isActive: location.pathname === '/talent-dashboard/applications'
    },
    {
      id: 'marketplace',
      label: 'Marketplace de Servicios',
      icon: Store,
      path: '/talent-dashboard/marketplace',
      isActive: location.pathname === '/talent-dashboard/marketplace'
    }
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="bg-card border-b sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => navigate('/talent-dashboard')}
              className="text-base sm:text-xl font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
            >
              TalentoDigital.io
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2 xl:space-x-4">
          {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={item.isActive ? "default" : "ghost"}
                  size="sm"
                  className={`flex items-center gap-2 ${
                    item.isActive 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                      : 'text-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  onClick={() => navigate(item.path)}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden xl:inline">{item.label}</span>
                </Button>
              );
            })}
          </nav>

          {/* Right side - Notifications and Profile */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Messages */}
            <div className="relative hidden sm:block">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2"
                onClick={() => navigate('/talent-dashboard/messages')}
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                {unreadMessagesCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0">
                    {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Notifications */}
            <div className="relative hidden sm:block">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2"
                onClick={() => navigate('/talent-dashboard/notifications')}
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                {unreadNotificationsCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0">
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Help Button */}
            <div className="relative hidden sm:block">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2"
                onClick={() => setIsHelpModalOpen(true)}
                title="Soporte y feedback"
              >
                <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              </Button>
            </div>

            {/* Profile Dropdown */}
            <div className="relative hidden sm:block">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                  <Avatar className="w-7 h-7 sm:w-8 sm:h-8">
                    <AvatarImage 
                      src={
                        userProfile?.avatar_url && !userProfile.avatar_url.startsWith('blob:')
                          ? userProfile.avatar_url
                          : undefined
                      } 
                    />
                    <AvatarFallback className="text-xs sm:text-sm">
                      {userProfile?.full_name?.charAt(0) || profile?.full_name?.charAt(0) || 'T'}
                    </AvatarFallback>
                  </Avatar>
                {isPremium && <PremiumBadge variant="icon-only" className="ml-1" showAnimation={false} />}
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
              </Button>

              {/* Profile Menu Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg border z-50">
                  <button
                    onClick={() => {
                      navigate('/talent-dashboard/profile');
                      setIsProfileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                  >
                    Mi Perfil
                  </button>
                  <button
                    onClick={() => {
                      navigate('/talent-dashboard/settings');
                      setIsProfileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                  >
                    Configuración
                  </button>
                  <hr className="my-1 border-border" />
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsProfileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-1.5 sm:p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Menu className="w-5 h-5 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t py-3">
            <nav className="flex flex-col space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={item.isActive ? "default" : "ghost"}
                    className={`flex items-center gap-2 justify-start mobile-nav-item ${
                      item.isActive 
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                        : 'text-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    onClick={() => {
                      navigate(item.path);
                      setIsMenuOpen(false);
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                );
              })}
              
              {/* Mobile-only items */}
              <div className="pt-2 mt-2 border-t space-y-1">
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 justify-start mobile-nav-item text-foreground hover:bg-muted hover:text-foreground relative"
                  onClick={() => {
                    navigate('/talent-dashboard/messages');
                    setIsMenuOpen(false);
                  }}
                >
                  <MessageCircle className="w-4 h-4" />
                  Mensajes
                  {unreadMessagesCount > 0 && (
                    <Badge className="ml-auto bg-primary text-primary-foreground text-xs">
                      {unreadMessagesCount}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 justify-start mobile-nav-item text-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => {
                    navigate('/talent-dashboard/notifications');
                    setIsMenuOpen(false);
                  }}
                >
                  <Bell className="w-4 h-4" />
                  Notificaciones
                  {unreadNotificationsCount > 0 && (
                    <Badge className="ml-auto bg-primary text-primary-foreground text-xs">
                      {unreadNotificationsCount}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 justify-start mobile-nav-item text-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => {
                    setIsHelpModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                >
                  <HelpCircle className="w-4 h-4" />
                  Soporte y feedback
                </Button>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 justify-start mobile-nav-item text-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => {
                    navigate('/talent-dashboard/profile');
                    setIsMenuOpen(false);
                  }}
                >
                  <Avatar className="w-4 h-4">
                    <AvatarImage src={userProfile?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {userProfile?.full_name?.charAt(0) || 'T'}
                    </AvatarFallback>
                  </Avatar>
                  Mi Perfil
                </Button>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 justify-start mobile-nav-item text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                >
                  Cerrar Sesión
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Help & Feedback Modal */}
      <HelpFeedbackModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
    </header>
  );
};

export default TalentTopNavigation;
