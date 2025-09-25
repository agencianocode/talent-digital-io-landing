import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  ExternalLink, 
  Star, 
  Edit, 
  Trash2, 
  Globe, 
  Palette, 
  Code, 
  Briefcase,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PortfolioModal } from './PortfolioModal';
import { usePortfolio } from '@/hooks/usePortfolio';
import { PORTFOLIO_PLATFORMS } from '@/types/profile';
import { toast } from 'sonner';

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  website: <Globe className="h-4 w-4" />,
  behance: <Palette className="h-4 w-4" />,
  dribbble: <Palette className="h-4 w-4" />,
  github: <Code className="h-4 w-4" />,
  other: <Briefcase className="h-4 w-4" />
};

const PLATFORM_COLORS: Record<string, string> = {
  website: 'bg-blue-100 text-blue-800',
  behance: 'bg-purple-100 text-purple-800',
  dribbble: 'bg-pink-100 text-pink-800',
  github: 'bg-gray-100 text-gray-800',
  other: 'bg-gray-100 text-gray-600'
};

export const PortfolioSection: React.FC = () => {
  const { portfolios, deletePortfolio, setPrimaryPortfolio } = usePortfolio();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<string | undefined>();

  const handleAddPortfolio = () => {
    setEditingPortfolio(undefined);
    setIsModalOpen(true);
  };

  const handleEditPortfolio = (portfolioId: string) => {
    setEditingPortfolio(portfolioId);
    setIsModalOpen(true);
  };

  const handleDeletePortfolio = async (portfolioId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este portfolio?')) {
      const success = await deletePortfolio(portfolioId);
      if (success) {
        toast.success('Portfolio eliminado correctamente');
      }
    }
  };

  const handleSetPrimary = async (portfolioId: string) => {
    const success = await setPrimaryPortfolio(portfolioId);
    if (success) {
      toast.success('Portfolio principal actualizado');
    }
  };

  const getPlatformInfo = (type: string) => {
    const platform = PORTFOLIO_PLATFORMS.find(p => p.value === type);
    return {
      label: platform?.label || 'Otro',
      icon: PLATFORM_ICONS[type] || <Briefcase className="h-4 w-4" />,
      color: PLATFORM_COLORS[type] || 'bg-gray-100 text-gray-600'
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

      {/* Portfolios List */}
      {portfolios.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No tienes portfolios agregados
            </h4>
            <p className="text-sm text-gray-600 text-center mb-4">
              Agrega tus portfolios para mostrar tu trabajo y atraer más oportunidades
            </p>
            <Button onClick={handleAddPortfolio}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar tu Primer Portfolio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {portfolios.map((portfolio) => {
            const platformInfo = getPlatformInfo(portfolio.type);
            
            return (
              <Card key={portfolio.id} className="relative group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {platformInfo.icon}
                      <CardTitle className="text-base">{portfolio.title}</CardTitle>
                      {portfolio.is_primary && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Principal
                        </Badge>
                      )}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditPortfolio(portfolio.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        {!portfolio.is_primary && (
                          <DropdownMenuItem onClick={() => handleSetPrimary(portfolio.id)}>
                            <Star className="h-4 w-4 mr-2" />
                            Marcar como Principal
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleDeletePortfolio(portfolio.id)}
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

                    {/* URL */}
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                      <a
                        href={portfolio.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 truncate"
                      >
                        {formatUrl(portfolio.url)}
                      </a>
                    </div>

                    {/* Description */}
                    {portfolio.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {portfolio.description}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(portfolio.url, '_blank')}
                        className="flex-1"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver Portfolio
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
      <PortfolioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        portfolioId={editingPortfolio}
      />
    </div>
  );
};
