import { useState } from 'react';
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
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

const TalentTopNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, signOut } = useSupabaseAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const navigationItems = [
    {
      id: 'opportunities',
      label: '🔍 Oportunidades',
      icon: Search,
      path: '/talent-dashboard/opportunities',
      isActive: location.pathname === '/talent-dashboard/opportunities'
    },
    {
      id: 'applications',
      label: '📄 Mis Postulaciones',
      icon: CheckSquare,
      path: '/talent-dashboard/applications',
      isActive: location.pathname === '/talent-dashboard/applications'
    },
    {
      id: 'marketplace',
      label: '🛍 Marketplace de Servicios',
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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => navigate('/talent-dashboard')}
              className="text-xl font-bold text-gray-900 font-['Inter'] hover:text-purple-600 transition-colors cursor-pointer"
            >
              TalentoDigital.io
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={item.isActive ? "default" : "ghost"}
                  className={`flex items-center gap-2 font-['Inter'] ${
                    item.isActive 
                      ? 'bg-purple-600 text-white hover:bg-purple-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  onClick={() => navigate(item.path)}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* Right side - Notifications and Profile */}
          <div className="flex items-center space-x-4">
            {/* Messages */}
            <div className="relative">
              <Button variant="ghost" size="sm" className="p-2">
                <MessageCircle className="w-5 h-5 text-gray-600" />
                <Badge className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs h-5 w-5 flex items-center justify-center">
                  1
                </Badge>
              </Button>
            </div>

            {/* Notifications */}
            <div className="relative">
              <Button variant="ghost" size="sm" className="p-2">
                <Bell className="w-5 h-5 text-gray-600" />
                <Badge className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs h-5 w-5 flex items-center justify-center">
                  3
                </Badge>
              </Button>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <Button
                variant="ghost"
                className="flex items-center gap-2 p-2"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-sm">
                      {profile?.full_name?.charAt(0) || 'T'}
                    </AvatarFallback>
                  </Avatar>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </Button>

              {/* Profile Menu Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={() => {
                      navigate('/talent-dashboard/profile');
                      setIsProfileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-['Inter']"
                  >
                    Mi Perfil
                  </button>
                  <button
                    onClick={() => {
                      navigate('/talent-dashboard/settings');
                      setIsProfileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-['Inter']"
                  >
                    Configuración
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsProfileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-['Inter']"
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
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-gray-600" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={item.isActive ? "default" : "ghost"}
                    className={`flex items-center gap-2 justify-start font-['Inter'] ${
                      item.isActive 
                        ? 'bg-purple-600 text-white hover:bg-purple-700' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default TalentTopNavigation;
