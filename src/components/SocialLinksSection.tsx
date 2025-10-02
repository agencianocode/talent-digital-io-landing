import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink,
  MoreVertical,
  Linkedin,
  Twitter,
  Instagram,
  Youtube,
  Facebook,
  Github,
  MessageCircle,
  Mail
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SocialLinksModal } from '@/components/SocialLinksModal';
import { useSocialLinks } from '@/hooks/useSocialLinks';
import { SOCIAL_PLATFORMS } from '@/types/profile';
import { toast } from 'sonner';

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  linkedin: <Linkedin className="h-4 w-4" />,
  twitter: <Twitter className="h-4 w-4" />,
  instagram: <Instagram className="h-4 w-4" />,
  youtube: <Youtube className="h-4 w-4" />,
  facebook: <Facebook className="h-4 w-4" />,
  github: <Github className="h-4 w-4" />,
  whatsapp: <MessageCircle className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  other: <ExternalLink className="h-4 w-4" />
};

const PLATFORM_COLORS: Record<string, string> = {
  linkedin: 'bg-blue-100 text-blue-800',
  twitter: 'bg-blue-100 text-blue-600',
  instagram: 'bg-pink-100 text-pink-600',
  youtube: 'bg-red-100 text-red-600',
  facebook: 'bg-blue-100 text-blue-700',
  github: 'bg-gray-100 text-gray-800',
  whatsapp: 'bg-green-100 text-green-600',
  email: 'bg-gray-100 text-gray-600',
  other: 'bg-gray-100 text-gray-600'
};

export const SocialLinksSection: React.FC = () => {
  const { socialLinks, deleteSocialLink } = useSocialLinks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<string | undefined>();
  const [showAllSocialLinks, setShowAllSocialLinks] = useState(false);

  console.log('🎨 SocialLinksSection render - socialLinks count:', socialLinks.length);

  // LinkedIn-style: show only first 6 social links by default (2x3 grid)
  const MAX_INITIAL_SOCIAL_LINKS = 6;
  const displayedSocialLinks = showAllSocialLinks 
    ? socialLinks 
    : socialLinks.slice(0, MAX_INITIAL_SOCIAL_LINKS);
  const hasMoreSocialLinks = socialLinks.length > MAX_INITIAL_SOCIAL_LINKS;

  const handleAddLink = () => {
    setEditingLink(undefined);
    setIsModalOpen(true);
  };

  const handleShowAllSocialLinks = () => {
    setShowAllSocialLinks(true);
  };

  const handleEditLink = (linkId: string) => {
    setEditingLink(linkId);
    setIsModalOpen(true);
  };

  const handleDeleteLink = async (linkId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este enlace?')) {
      const success = await deleteSocialLink(linkId);
      if (success) {
        toast.success('Enlace eliminado correctamente');
      }
    }
  };

  const getPlatformInfo = (platform: string) => {
    const platformData = SOCIAL_PLATFORMS.find(p => p.value === platform);
    return {
      label: platformData?.label || 'Otro',
      icon: PLATFORM_ICONS[platform] || <ExternalLink className="h-4 w-4" />,
      color: PLATFORM_COLORS[platform] || 'bg-gray-100 text-gray-600'
    };
  };

  const formatUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  };

  return (
    <div className="space-y-4 h-full">

      {/* Social Links List */}
      {socialLinks.length === 0 ? (
        <Card className="border-dashed border-2 bg-gradient-to-br from-orange-50/50 to-amber-50/50 h-full">
          <CardContent className="flex flex-col items-center justify-center py-10 h-full">
            <div className="flex gap-2 mb-4">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Linkedin className="h-6 w-6 text-blue-600" />
              </div>
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Twitter className="h-6 w-6 text-blue-400" />
              </div>
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Instagram className="h-6 w-6 text-pink-500" />
              </div>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              No tienes redes sociales agregadas
            </h4>
            <p className="text-sm text-gray-600 text-center mb-6 max-w-sm">
              Agrega tus perfiles sociales para conectar con más oportunidades
            </p>
            <Button onClick={handleAddLink} variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Red Social
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {displayedSocialLinks.map((link) => {
            const platformInfo = getPlatformInfo(link.platform);
            
            return (
              <div key={link.id} className="relative group flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-1.5 bg-white rounded-md shadow-sm">
                    {platformInfo.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{platformInfo.label}</h4>
                    <p className="text-xs text-gray-500 truncate">{formatUrl(link.url)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.open(link.url, '_blank')}
                    className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                  >
                    Visitar
                  </button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditLink(link.id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteLink(link.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
          
          {/* Show All Social Links Button (LinkedIn-style) */}
          {hasMoreSocialLinks && !showAllSocialLinks && (
            <div className="text-center py-3">
              <button
                onClick={handleShowAllSocialLinks}
                className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center gap-1 mx-auto transition-colors hover:underline"
              >
                <span>Mostrar todas las redes sociales ({socialLinks.length})</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
          
          {/* Add More Social Links Button - Compact */}
          {socialLinks.length < 9 && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <button
                onClick={handleAddLink}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors group"
              >
                <Plus className="h-4 w-4 group-hover:text-orange-600" />
                <span>Agregar red social</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <SocialLinksModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        linkId={editingLink}
      />
    </div>
  );
};
