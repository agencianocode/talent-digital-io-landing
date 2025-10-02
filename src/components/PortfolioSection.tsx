import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
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
  const [showAllPortfolios, setShowAllPortfolios] = useState(false);

  console.log('🎨 PortfolioSection render - portfolios count:', portfolios.length);

  // LinkedIn-style: show only first 3 portfolios by default
  const MAX_INITIAL_PORTFOLIOS = 3;
  const displayedPortfolios = showAllPortfolios 
    ? portfolios 
    : portfolios.slice(0, MAX_INITIAL_PORTFOLIOS);
  const hasMorePortfolios = portfolios.length > MAX_INITIAL_PORTFOLIOS;

  const handleAddPortfolio = () => {
    setEditingPortfolio(undefined);
    setIsModalOpen(true);
  };

  const handleShowAllPortfolios = () => {
    setShowAllPortfolios(true);
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
    <div className="space-y-4 h-full">

      {/* Portfolios List */}
      {portfolios.length === 0 ? (
        <Card className="border-dashed border-2 bg-gradient-to-br from-blue-50/50 to-purple-50/50 h-full">
          <CardContent className="flex flex-col items-center justify-center py-10 h-full">
            <div className="p-4 bg-white rounded-full shadow-sm mb-4">
              <Briefcase className="h-10 w-10 text-blue-500" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              No tienes portfolios agregados
            </h4>
            <p className="text-sm text-gray-600 text-center mb-6 max-w-sm">
              Agrega tus portfolios para mostrar tu trabajo y atraer más oportunidades
            </p>
            <Button onClick={handleAddPortfolio} variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Portfolio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {displayedPortfolios.map((portfolio) => {
            const platformInfo = getPlatformInfo(portfolio.type);
            
            return (
              <div key={portfolio.id} className="relative group border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-1.5 bg-purple-50 rounded-md mt-0.5">
                      {platformInfo.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-semibold text-gray-900 text-sm leading-tight truncate">{portfolio.title}</h4>
                        {portfolio.is_primary && (
                          <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 border-yellow-200">
                            <Star className="h-3 w-3 mr-1" />
                            Principal
                          </Badge>
                        )}
                        <Badge className={platformInfo.color + " text-xs"}>
                          {platformInfo.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{formatUrl(portfolio.url)}</p>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-3 w-3" />
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

                {/* Descripción */}
                {portfolio.description && (
                  <div className="ml-7 mb-3">
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {portfolio.description}
                    </p>
                  </div>
                )}

                {/* Acción */}
                <div className="ml-7">
                  <button
                    onClick={() => window.open(portfolio.url, '_blank')}
                    className="px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors"
                  >
                    Ver Portfolio
                  </button>
                </div>
              </div>
            );
          })}
          
          {/* Show All Portfolios Button (LinkedIn-style) */}
          {hasMorePortfolios && !showAllPortfolios && (
            <div className="text-center py-4">
              <button
                onClick={handleShowAllPortfolios}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-2 mx-auto transition-colors"
              >
                <span>Mostrar todos los portfolios ({portfolios.length})</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
          
          {/* Add More Portfolio Button - Compact */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={handleAddPortfolio}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors group"
            >
              <Plus className="h-4 w-4 group-hover:text-purple-600" />
              <span>Agregar portfolio</span>
            </button>
          </div>
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
