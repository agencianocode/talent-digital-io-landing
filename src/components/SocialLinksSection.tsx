import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  const handleAddLink = () => {
    setEditingLink(undefined);
    setIsModalOpen(true);
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
    <div className="space-y-4">

      {/* Social Links List */}
      {socialLinks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="grid grid-cols-3 gap-2 mb-4">
              <Linkedin className="h-8 w-8 text-blue-600" />
              <Twitter className="h-8 w-8 text-blue-400" />
              <Instagram className="h-8 w-8 text-pink-500" />
              <Youtube className="h-8 w-8 text-red-600" />
              <Facebook className="h-8 w-8 text-blue-700" />
              <Github className="h-8 w-8 text-gray-800" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No tienes redes sociales agregadas
            </h4>
            <p className="text-sm text-gray-600 text-center mb-4">
              Agrega tus perfiles sociales para conectar con más oportunidades
            </p>
            <Button onClick={handleAddLink}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar tu Primera Red Social
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {socialLinks.map((link) => {
            const platformInfo = getPlatformInfo(link.platform);
            
            return (
              <Card key={link.id} className="relative group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {platformInfo.icon}
                      </div>
                      <div>
                        <CardTitle className="text-base">{platformInfo.label}</CardTitle>
                        <p className="text-sm text-gray-600 truncate">{formatUrl(link.url)}</p>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
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
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Platform Badge */}
                    <Badge className={platformInfo.color}>
                      {platformInfo.icon}
                      <span className="ml-1">{platformInfo.label}</span>
                    </Badge>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(link.url, '_blank')}
                        className="flex-1"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visitar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
